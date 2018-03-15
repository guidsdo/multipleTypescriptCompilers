import { debugLog, setDebugMode, DEBUG_MODE } from "../helpers/debugTools";
import { findNodeModuleExecutable, findJsonFile, getProjectDir } from "../helpers/fileSystemHelpers";
import { isValidString, isValidBoolean, isValidObject } from "../helpers/typeCheckHelpers";
import { ProjectsWatcher } from "../projectWatcher/ProjectsWatcher";
import { ProjectSettings } from "../projectWatcher/Project";
import { MtscConfig, TslintCfgObject, TslintCfg } from "./configSpec";
import { TslintSettings } from "../tslint/TslintRunner";

const TSLINT_CFG = "tslint.json";
type GlobalTslint = { autofix: boolean; rulesFile?: string; enabled?: boolean };

export function initProjectsWatcher(mtscCfg: MtscConfig): ProjectsWatcher {
    setDebugMode(!!mtscCfg.debug);

    const globalTslintCfg = initGlobalTslintCfg(mtscCfg.tslint);
    const projectsWatcher = new ProjectsWatcher();

    if (!isValidBoolean(mtscCfg.preserveWatchOutput)) mtscCfg.preserveWatchOutput = DEBUG_MODE;

    for (let stringOrCfg of mtscCfg.projects) {
        let projectCfg = isValidString(stringOrCfg) ? { path: stringOrCfg } : stringOrCfg;
        projectCfg.watch = isValidBoolean(projectCfg.watch) ? projectCfg.watch : !!mtscCfg.watch;

        if (!isValidString(projectCfg.compiler)) {
            projectCfg.compiler = isValidString(mtscCfg.compiler)
                ? mtscCfg.compiler
                : findNodeModuleExecutable(projectCfg.path, "tsc");
        }

        if (!isValidBoolean(projectCfg.noEmit)) projectCfg.noEmit = mtscCfg.noEmit;

        debugLog(
            `Adding project:\nPath: ${projectCfg.path}\nwatch: ${!!projectCfg.watch}\nCompiler: ${projectCfg.compiler}`
        );

        const tslintCfg = getTslintSettings(globalTslintCfg, projectCfg.path, projectCfg.tslint);
        debugLog("Setting the following tslint rules", tslintCfg);

        const projectSettings: ProjectSettings = {
            preserveWatchOutput: mtscCfg.preserveWatchOutput,
            watch: projectCfg.watch,
            path: projectCfg.path,
            compiler: projectCfg.compiler,
            noEmit: projectCfg.noEmit,
            tslint: tslintCfg
        };
        projectsWatcher.addProject(projectSettings);
    }

    return projectsWatcher;
}

function initGlobalTslintCfg(tslint?: string | boolean | TslintCfgObject): GlobalTslint {
    const result: GlobalTslint = { autofix: false };
    if (tslint === undefined) {
        // Do nothing
    } else if (isValidString(tslint)) {
        result.rulesFile = tslint;
        result.enabled = true;
    } else if (isValidBoolean(tslint)) {
        result.enabled = tslint;
        try {
            findJsonFile(".", TSLINT_CFG);
        } catch {
            // No tslint found? Let's hope each project has one, otherwise we should error
        }
    } else if (isValidObject(tslint)) {
        result.autofix = isValidBoolean(tslint.autofix) ? tslint.autofix : false;
        result.enabled = isValidBoolean(tslint.enabled) ? tslint.enabled : undefined;
        result.rulesFile = isValidString(tslint.rulesFile) ? tslint.rulesFile : undefined;
    }
    debugLog("Done initiating global tslint cfg", result);
    return result;
}

function getTslintSettings(globalCfg: GlobalTslint, path: string, config?: TslintCfg): TslintSettings | undefined {
    const projectDir = getProjectDir(path);
    if ((globalCfg.enabled && config === undefined) || (isValidBoolean(config) && config)) {
        return {
            autoFix: getTslintAutofix(globalCfg),
            rulesFile: getTslint(globalCfg, projectDir),
            tsconfigPath: getTsConfig(path)
        };
    }

    if (globalCfg.enabled !== false && isValidString(config)) {
        return {
            autoFix: getTslintAutofix(globalCfg),
            rulesFile: getTslint(globalCfg, projectDir, config),
            tsconfigPath: getTsConfig(path)
        };
    } else if (globalCfg.enabled !== false && isValidObject(config) && (config as TslintCfgObject).enabled !== false) {
        const validCfg: TslintCfgObject & { tsconfig?: string } = config as any;
        return {
            autoFix: getTslintAutofix(globalCfg, validCfg.autofix),
            rulesFile: getTslint(globalCfg, projectDir, validCfg.rulesFile),
            tsconfigPath: getTsConfig(path, validCfg.tsconfig)
        };
    }
    return undefined;
}

function getTsConfig(path: string, tsconfig?: string) {
    const TSC_CFG = "tsconfig.json";
    debugLog("Tslint: Looking for tsconfig in path", path);
    if (isValidString(tsconfig)) {
        return findJsonFile(path, tsconfig);
    }
    return findJsonFile(path, TSC_CFG);
}

function getTslint(defaultCfg: GlobalTslint, path: string, tslint?: string) {
    debugLog("Tslint: Looking for tslint in path", path);
    let result;
    if (isValidString(tslint)) result = findJsonFile(path, tslint);
    else if (isValidString(defaultCfg.rulesFile)) result = defaultCfg.rulesFile;
    else result = findJsonFile(path, TSLINT_CFG);

    debugLog("Tslint: Found this tslint", result);
    return result;
}

function getTslintAutofix(defaultCfg: GlobalTslint, autofix?: boolean) {
    if (isValidBoolean(autofix)) return autofix;

    return defaultCfg.autofix;
}
