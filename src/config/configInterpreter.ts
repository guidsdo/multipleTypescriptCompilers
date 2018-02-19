import { debugLog, setDebugMode } from "../helpers/debugTools";
import { findNodeModuleExecutable, findJsonFile } from "../helpers/fileSystemHelpers";
import { isValidString, isValidBoolean, isValidObject } from "../helpers/typeCheckHelpers";
import { ProjectsWatcher } from "../projectWatcher/ProjectsWatcher";
import { ProjectSettings } from "../projectWatcher/Project";
import { MtscConfig, TslintCfgObject, TslintCfg } from "./configSpec";

const TSLINT_CFG = "tslint.json";
const TSC_CFG = "tsconfig.json";

export function initProjectsWatcher(mtscCfg: MtscConfig): ProjectsWatcher {
    setDebugMode(!!mtscCfg.debug);

    const globalTslintCfg = initTslintConfig(mtscCfg.tslint, ".", { rulesFile: "", autofix: false, enabled: false });
    const projectsWatcher = new ProjectsWatcher();
    mtscCfg.projects.forEach(stringOrCfg => {
        let projectCfg = isValidString(stringOrCfg) ? { path: stringOrCfg } : stringOrCfg;
        projectCfg.watch = isValidBoolean(projectCfg.watch) ? projectCfg.watch : !!mtscCfg.watch;

        if (!isValidString(projectCfg.compiler)) {
            projectCfg.compiler = isValidString(mtscCfg.compiler)
                ? mtscCfg.compiler
                : findNodeModuleExecutable(projectCfg.path, "tsc");
        }

        debugLog(
            `Adding project:\nPath: ${projectCfg.path}\nwatch: ${!!projectCfg.watch}\nCompiler: ${projectCfg.compiler}`
        );

        const tscProjectSettings: ProjectSettings = {
            watch: projectCfg.watch,
            path: projectCfg.path,
            compiler: projectCfg.compiler
        };

        initTslintConfig(projectCfg.tslint, tscProjectSettings.path, globalTslintCfg);

        projectsWatcher.addProject(tscProjectSettings);
    });

    return projectsWatcher;
}

function initTslintConfig(
    tslintCfg: TslintCfg | undefined,
    path: string,
    defaultCfg: TslintCfgObject,
    project?: boolean
) {
    let newTslintCfg: TslintCfg = defaultCfg;

    if (tslintCfg === undefined) {
        return newTslintCfg;
    }

    // Beyond this point, tslint is enabled or explicitely disabled
    newTslintCfg.enabled = true;

    if (isValidString(tslintCfg)) {
        newTslintCfg.rulesFile = findJsonFile(path + tslintCfg, TSLINT_CFG);
    } else if (isValidBoolean(tslintCfg)) {
        newTslintCfg.enabled = isValidBoolean(tslintCfg);
        try {
            newTslintCfg.rulesFile = findJsonFile(path, TSLINT_CFG);
        } catch {}
    } else if (isValidObject(tslintCfg)) {
        newTslintCfg.autofix = isValidBoolean(tslintCfg.autofix) ? tslintCfg.autofix : newTslintCfg.autofix;
        newTslintCfg.enabled = isValidBoolean(tslintCfg.enabled) ? tslintCfg.enabled : newTslintCfg.enabled;

        if (isValidString(tslintCfg.rulesFile)) {
            newTslintCfg.rulesFile = findJsonFile(path + tslintCfg.rulesFile, TSLINT_CFG);
        } else if (!newTslintCfg.rulesFile) {
            try {
                newTslintCfg.rulesFile = findJsonFile(path, TSLINT_CFG);
            } catch {}
        }

        if (tslintCfg.tsconfig && isValidString(tslintCfg.tsconfig)) {
            // Search given
            findJsonFile(path + tslintCfg.tsconfig, TSC_CFG);
        } else if (project) {
            // This will use the project tsconfig of given and otherwise search for one in the same folder
            findJsonFile(path, TSC_CFG);
        }
    }
    return newTslintCfg;
}
