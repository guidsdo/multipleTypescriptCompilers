"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debugTools_1 = require("../helpers/debugTools");
const fileSystemHelpers_1 = require("../helpers/fileSystemHelpers");
const typeCheckHelpers_1 = require("../helpers/typeCheckHelpers");
const ProjectsWatcher_1 = require("../projectWatcher/ProjectsWatcher");
const TSLINT_CFG = "tslint.json";
const TSC_CFG = "tsconfig.json";
function initProjectsWatcher(mtscCfg) {
    debugTools_1.setDebugMode(!!mtscCfg.debug);
    const globalTslintCfg = initTslintConfig(mtscCfg.tslint, ".", { rulesFile: "", autofix: false, enabled: false });
    const projectsWatcher = new ProjectsWatcher_1.ProjectsWatcher();
    mtscCfg.projects.forEach(stringOrCfg => {
        let projectCfg = typeCheckHelpers_1.isValidString(stringOrCfg) ? { path: stringOrCfg } : stringOrCfg;
        projectCfg.watch = typeCheckHelpers_1.isValidBoolean(projectCfg.watch) ? projectCfg.watch : !!mtscCfg.watch;
        if (!typeCheckHelpers_1.isValidString(projectCfg.compiler)) {
            projectCfg.compiler = typeCheckHelpers_1.isValidString(mtscCfg.compiler)
                ? mtscCfg.compiler
                : fileSystemHelpers_1.findNodeModuleExecutable(projectCfg.path, "tsc");
        }
        debugTools_1.debugLog(`Adding project:\nPath: ${projectCfg.path}\nwatch: ${!!projectCfg.watch}\nCompiler: ${projectCfg.compiler}`);
        const tscProjectSettings = {
            watch: projectCfg.watch,
            path: projectCfg.path,
            compiler: projectCfg.compiler
        };
        initTslintConfig(projectCfg.tslint, tscProjectSettings.path, globalTslintCfg);
        projectsWatcher.addProject(tscProjectSettings);
    });
    return projectsWatcher;
}
exports.initProjectsWatcher = initProjectsWatcher;
function initTslintConfig(tslintCfg, path, defaultCfg, project) {
    let newTslintCfg = defaultCfg;
    if (tslintCfg === undefined) {
        return newTslintCfg;
    }
    // Beyond this point, tslint is enabled or explicitely disabled
    newTslintCfg.enabled = true;
    if (typeCheckHelpers_1.isValidString(tslintCfg)) {
        newTslintCfg.rulesFile = fileSystemHelpers_1.findJsonFile(path + tslintCfg, TSLINT_CFG);
    }
    else if (typeCheckHelpers_1.isValidBoolean(tslintCfg)) {
        newTslintCfg.enabled = typeCheckHelpers_1.isValidBoolean(tslintCfg);
        try {
            newTslintCfg.rulesFile = fileSystemHelpers_1.findJsonFile(path, TSLINT_CFG);
        }
        catch (_a) { }
    }
    else if (typeCheckHelpers_1.isValidObject(tslintCfg)) {
        newTslintCfg.autofix = typeCheckHelpers_1.isValidBoolean(tslintCfg.autofix) ? tslintCfg.autofix : newTslintCfg.autofix;
        newTslintCfg.enabled = typeCheckHelpers_1.isValidBoolean(tslintCfg.enabled) ? tslintCfg.enabled : newTslintCfg.enabled;
        if (typeCheckHelpers_1.isValidString(tslintCfg.rulesFile)) {
            newTslintCfg.rulesFile = fileSystemHelpers_1.findJsonFile(path + tslintCfg.rulesFile, TSLINT_CFG);
        }
        else if (!newTslintCfg.rulesFile) {
            try {
                newTslintCfg.rulesFile = fileSystemHelpers_1.findJsonFile(path, TSLINT_CFG);
            }
            catch (_b) { }
        }
        if (tslintCfg.tsconfig && typeCheckHelpers_1.isValidString(tslintCfg.tsconfig)) {
            // Search given
            fileSystemHelpers_1.findJsonFile(path + tslintCfg.tsconfig, TSC_CFG);
        }
        else if (project) {
            // This will use the project tsconfig of given and otherwise search for one in the same folder
            fileSystemHelpers_1.findJsonFile(path, TSC_CFG);
        }
    }
    return newTslintCfg;
}
