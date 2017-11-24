"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debugTools_1 = require("../helpers/debugTools");
const fileSystemHelpers_1 = require("../helpers/fileSystemHelpers");
const typeCheckHelpers_1 = require("../helpers/typeCheckHelpers");
const index_1 = require("../index");
const ProjectsWatcher_1 = require("../projectWatcher/ProjectsWatcher");
function initProjectsWatcher(mtscCfg) {
    debugTools_1.setDebugMode(!!mtscCfg.debug);
    const projectsWatcher = new ProjectsWatcher_1.ProjectsWatcher();
    mtscCfg.projects.forEach(stringOrCfg => {
        let projectCfg = { path: "" };
        if (typeCheckHelpers_1.isValidString(stringOrCfg)) {
            projectCfg.path = stringOrCfg;
        }
        else {
            projectCfg = stringOrCfg;
        }
        if (typeCheckHelpers_1.isValidString(mtscCfg.compiler)) {
            projectCfg.compiler = mtscCfg.compiler;
        }
        else if (!typeCheckHelpers_1.isValidString(projectCfg.compiler)) {
            projectCfg.compiler = fileSystemHelpers_1.findNodeModuleExecutable(projectCfg.path, "tsc");
        }
        projectCfg.watch = index_1.isValidBoolean(projectCfg.watch) ? projectCfg.watch : !!mtscCfg.watch;
        debugTools_1.debugLog(`Adding project:\nPath: ${projectCfg.path}\nwatch: ${!!projectCfg.watch}\nCompiler: ${projectCfg.compiler}`);
        projectsWatcher.addProject({
            watch: projectCfg.watch,
            path: projectCfg.path,
            compiler: projectCfg.compiler
        });
    });
    return projectsWatcher;
}
exports.initProjectsWatcher = initProjectsWatcher;
