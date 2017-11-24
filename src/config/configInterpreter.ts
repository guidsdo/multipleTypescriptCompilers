import { debugLog, setDebugMode } from "../helpers/debugTools";
import { findNodeModuleExecutable } from "../helpers/fileSystemHelpers";
import { isValidString } from "../helpers/typeCheckHelpers";
import { isValidBoolean } from "../index";
import { ProjectsWatcher } from "../projectWatcher/ProjectsWatcher";
import { MtscConfig, ProjectConfig } from "./configSpec";

export function initProjectsWatcher(mtscCfg: MtscConfig): ProjectsWatcher {
    setDebugMode(!!mtscCfg.debug);

    const projectsWatcher = new ProjectsWatcher();
    mtscCfg.projects.forEach(stringOrCfg => {
        let projectCfg: ProjectConfig = { path: "" };

        if (isValidString(stringOrCfg)) {
            projectCfg.path = stringOrCfg;
        } else {
            projectCfg = stringOrCfg;
        }

        if (isValidString(mtscCfg.compiler)) {
            projectCfg.compiler = mtscCfg.compiler;
        } else if (!isValidString(projectCfg.compiler)) {
            projectCfg.compiler = findNodeModuleExecutable(projectCfg.path, "tsc");
        }

        projectCfg.watch = isValidBoolean(projectCfg.watch) ? projectCfg.watch : !!mtscCfg.watch;

        debugLog(
            `Adding project:\nPath: ${projectCfg.path}\nwatch: ${!!projectCfg.watch}\nCompiler: ${projectCfg.compiler}`
        );
        projectsWatcher.addProject({
            watch: projectCfg.watch,
            path: projectCfg.path,
            compiler: projectCfg.compiler
        });
    });

    return projectsWatcher;
}
