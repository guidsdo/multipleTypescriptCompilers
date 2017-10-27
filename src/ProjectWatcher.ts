import * as moment from "moment";
import { debugLog } from "./debugTools";
import { Project } from "./Project";

type logType = "COMPILING" | "COMPLETE";

export class ProjectWatcher {
    private lastLog: logType = "COMPILING";
    private projects: Project[] = [];

    addProject(project: string, tscCommand: string) {
        debugLog("Creating project compiler for:", project);
        const newProjectCompiler = new Project(
            project,
            tscCommand,
            this.projectCompilationStart,
            this.projectCompilationComplete
        );
        this.projects.push(newProjectCompiler);
    }

    startCompilations() {
        this.projects.forEach(project => project.createAndWatchCompilation());
    }

    private getTimestamp() {
        return moment().format("HH:mm:ss");
    }

    private isAProjectCompiling() {
        return this.projects.find(project => project.isCompiling());
    }

    private projectCompilationStart() {
        if (this.lastLog === "COMPLETE") {
            this.logStatus("COMPILING");
        }
    }

    private projectCompilationComplete() {
        const result = this.projects
            .map(projectCompiler => {
                return projectCompiler.getLastResult();
            })
            .join("");

        console.log(result);
        this.logStatus("COMPLETE");

        if (this.isAProjectCompiling()) {
            this.logStatus("COMPILING");
        }
    }

    private logStatus(type: logType) {
        if (type === "COMPILING") {
            console.log(`${this.getTimestamp()} - File change detected. Starting incremental compilation...`);
        } else if (type === "COMPLETE") {
            console.log(`${this.getTimestamp()} - Compilation complete. Watching for file changes.`);
        }
        this.lastLog = type;
    }
}
