import cluster from "node:cluster";
import { ProjectSettings, Project } from "./Project";

export * from "./Project";
export * from "./ProjectsWatcher";

if (cluster.isWorker) {
    const projectSettings: ProjectSettings = JSON.parse(process.env.projectSettings!);
    const project = new Project(projectSettings, state => process.send!(state));

    process.on("message", project.processInstruction);
}
