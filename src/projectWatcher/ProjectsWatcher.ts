import * as moment from "moment";
import { debugLog } from "../helpers/debugTools";
import { Project, ProjectArgs } from "./Project";

type logType = "COMPILING" | "COMPLETE" | "FINAL";

export class ProjectsWatcher {
    private lastLog: logType = "COMPILING";
    private projects: Project[] = [];

    addProject(projectArgs: ProjectArgs) {
        if (this.findProject(projectArgs.path)) {
            debugLog("Ignored duplicate project", projectArgs.path);
            return;
        }

        debugLog("Creating project compiler for", projectArgs.path);
        const newProjectCompiler = new Project(
            projectArgs,
            this.projectCompilationStart,
            this.projectCompilationComplete,
            this.projectCompilationFinal
        );
        this.projects.push(newProjectCompiler);
    }

    startCompilations() {
        this.projects.forEach(project => project.startCompiling());
    }

    projectCompilationStart = () => {
        if (this.lastLog === "COMPLETE") {
            this.logStatus("COMPILING");
        }
    };

    projectCompilationComplete = () => {
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
    };

    projectCompilationFinal = (project: Project) => {
        this.projectCompilationComplete();
        this.projects.splice(this.projects.indexOf(project), 1);

        if (!this.projects.length) {
            this.logStatus("FINAL");
        }
    };

    private findProject(path: string): Project | null {
        return this.projects.find(project => project.equals(path)) || null;
    }

    private getTimestamp() {
        return moment().format("HH:mm:ss");
    }

    private isAProjectCompiling() {
        return this.projects.find(project => project.isCompiling());
    }

    private logStatus(type: logType) {
        if (type === "COMPILING") {
            console.log(`${this.getTimestamp()} - File change detected. Starting incremental compilation...`);
        } else if (type === "COMPLETE") {
            console.log(`${this.getTimestamp()} - Compilation complete. Watching for file changes.`);
        } else {
            console.log(`${this.getTimestamp()} - Done compiling all projects.`);
        }
        this.lastLog = type;
    }
}
