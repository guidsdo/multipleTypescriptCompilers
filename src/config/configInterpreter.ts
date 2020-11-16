import { debugLog, setDebugMode } from "../helpers/debugTools";
import { findNodeModuleExecutable } from "../helpers/fileSystemHelpers";
import { isValidString, isValidBoolean } from "../helpers/typeCheckHelpers";
import { ProjectsWatcher } from "../projectWatcher/ProjectsWatcher";
import { ProjectSettings } from "../projectWatcher/Project";
import { MtscConfig } from "./configSpec";
import { getYarnWorkspaces } from "../helpers/yarnHelpers";

export function initProjectsWatcher(mtscCfg: MtscConfig): ProjectsWatcher {
    setDebugMode(!!mtscCfg.debug);

    if (!isValidBoolean(mtscCfg.watch)) mtscCfg.watch = false;

    const projectsWatcher = new ProjectsWatcher();

    if (mtscCfg.useYarnWorkspaces) getYarnWorkspaces().forEach(workspace => mtscCfg.projects.push(workspace));

    const normalisedProjects = mtscCfg.projects.map(project => (isValidString(project) ? { path: project } : project));
    const uniqueProjects = normalisedProjects.reduce(
        (projects, project) => (projects.find(p => p.path === project.path) ? projects : [...projects, project]),
        new Array() as typeof normalisedProjects
    );

    for (const projectCfg of uniqueProjects) {
        if (!isValidString(projectCfg.compiler)) {
            projectCfg.compiler = isValidString(mtscCfg.compiler) ? mtscCfg.compiler : findNodeModuleExecutable(projectCfg.path, "tsc");
        }

        if (!isValidBoolean(projectCfg.noEmit)) projectCfg.noEmit = mtscCfg.noEmit;

        debugLog(`Adding project:\nPath: ${projectCfg.path}\nwatch: ${!!mtscCfg.watch}\nCompiler: ${projectCfg.compiler}`);

        const projectSettings: ProjectSettings = {
            watch: mtscCfg.watch,
            path: projectCfg.path,
            compiler: projectCfg.compiler,
            noEmit: projectCfg.noEmit
        };
        projectsWatcher.addWorker(projectSettings);
    }

    return projectsWatcher;
}
