"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debugTools_1 = require("../helpers/debugTools");
const fileSystemHelpers_1 = require("../helpers/fileSystemHelpers");
const typeCheckHelpers_1 = require("../helpers/typeCheckHelpers");
const ProjectsWatcher_1 = require("../projectWatcher/ProjectsWatcher");
function initProjectsWatcher(mtscCfg) {
    debugTools_1.setDebugMode(!!mtscCfg.debug);
    const globalTslintCfg = initGlobalTslintCfg(mtscCfg.tslint);
    const projectsWatcher = new ProjectsWatcher_1.ProjectsWatcher();
    for (let stringOrCfg of mtscCfg.projects) {
        let projectCfg = typeCheckHelpers_1.isValidString(stringOrCfg) ? { path: stringOrCfg } : stringOrCfg;
        projectCfg.watch = typeCheckHelpers_1.isValidBoolean(projectCfg.watch) ? projectCfg.watch : !!mtscCfg.watch;
        if (!typeCheckHelpers_1.isValidString(projectCfg.compiler)) {
            projectCfg.compiler = typeCheckHelpers_1.isValidString(mtscCfg.compiler)
                ? mtscCfg.compiler
                : fileSystemHelpers_1.findNodeModuleExecutable(projectCfg.path, "tsc");
        }
        debugTools_1.debugLog(`Adding project:\nPath: ${projectCfg.path}\nwatch: ${!!projectCfg.watch}\nCompiler: ${projectCfg.compiler}`);
        const tslintCfg = getTslintSettings(globalTslintCfg, projectCfg.path, projectCfg.tslint);
        debugTools_1.debugLog("Setting the following tslint rules", tslintCfg);
        const projectSettings = {
            watch: projectCfg.watch,
            path: projectCfg.path,
            compiler: projectCfg.compiler,
            tslint: tslintCfg
        };
        projectsWatcher.addProject(projectSettings);
    }
    return projectsWatcher;
}
exports.initProjectsWatcher = initProjectsWatcher;
function initGlobalTslintCfg(tslint) {
    const result = { autofix: false };
    if (tslint === undefined) {
        // Do nothing
    }
    else if (typeCheckHelpers_1.isValidString(tslint)) {
        result.rulesFile = tslint;
        result.enabled = true;
    }
    else if (typeCheckHelpers_1.isValidBoolean(tslint)) {
        result.enabled = tslint;
        try {
            fileSystemHelpers_1.findJsonFile(".", TSLINT_CFG);
        }
        catch (_a) {
            // No tslint found? Let's hope each project has one, otherwise we should error
        }
    }
    else if (typeCheckHelpers_1.isValidObject(tslint)) {
        result.autofix = typeCheckHelpers_1.isValidBoolean(tslint.autofix) ? tslint.autofix : false;
        result.enabled = typeCheckHelpers_1.isValidBoolean(tslint.enabled) ? tslint.enabled : undefined;
        result.rulesFile = typeCheckHelpers_1.isValidString(tslint.rulesFile) ? tslint.rulesFile : undefined;
    }
    debugTools_1.debugLog("Done initiating global tslint cfg", result);
    return result;
}
function getTslintSettings(globalCfg, path, config) {
    const projectDir = fileSystemHelpers_1.getProjectDir(path);
    if ((globalCfg.enabled && config === undefined) || (typeCheckHelpers_1.isValidBoolean(config) && config)) {
        return {
            autoFix: getTslintAutofix(globalCfg),
            rulesFile: getTslint(globalCfg, projectDir),
            tsconfigPath: getTsConfig(path)
        };
    }
    if (globalCfg.enabled !== false && typeCheckHelpers_1.isValidString(config)) {
        return {
            autoFix: getTslintAutofix(globalCfg),
            rulesFile: getTslint(globalCfg, projectDir, config),
            tsconfigPath: getTsConfig(path)
        };
    }
    else if (globalCfg.enabled !== false && typeCheckHelpers_1.isValidObject(config) && config.enabled !== false) {
        const validCfg = config;
        return {
            autoFix: getTslintAutofix(globalCfg, validCfg.autofix),
            rulesFile: getTslint(globalCfg, projectDir, validCfg.rulesFile),
            tsconfigPath: getTsConfig(path, validCfg.tsconfig)
        };
    }
    return undefined;
}
function getTsConfig(path, tsconfig) {
    const TSC_CFG = "tsconfig.json";
    debugTools_1.debugLog("Tslint: Looking for tsconfig in path", path);
    if (typeCheckHelpers_1.isValidString(tsconfig)) {
        return fileSystemHelpers_1.findJsonFile(path, tsconfig);
    }
    return fileSystemHelpers_1.findJsonFile(path, TSC_CFG);
}
const TSLINT_CFG = "tslint.json";
function getTslint(defaultCfg, path, tslint) {
    debugTools_1.debugLog("Tslint: Looking for tslint in path", path);
    let result;
    if (typeCheckHelpers_1.isValidString(tslint))
        result = fileSystemHelpers_1.findJsonFile(path, tslint);
    else if (typeCheckHelpers_1.isValidString(defaultCfg.rulesFile))
        result = defaultCfg.rulesFile;
    else
        result = fileSystemHelpers_1.findJsonFile(path, TSLINT_CFG);
    debugTools_1.debugLog("Tslint: Found this tslint", result);
    return result;
}
function getTslintAutofix(defaultCfg, autofix) {
    if (typeCheckHelpers_1.isValidBoolean(autofix))
        return autofix;
    return defaultCfg.autofix;
}
