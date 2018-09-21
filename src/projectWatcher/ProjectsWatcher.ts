import * as moment from "moment";
import { debugLog } from "../helpers/debugTools";
import { Project, ProjectSettings, TSC_ERRORS_FOUND } from "./Project";

type logType = "COMPILING" | "COMPLETE" | "IDLE";

export class ProjectsWatcher {
    private finalOutput = "";
    private lastLog: logType = "IDLE";
    private projects: Project[] = [];

    constructor(private watch: boolean) {}

    addProject(projectArgs: ProjectSettings) {
        if (this.findProject(projectArgs.path)) {
            debugLog("Ignored duplicate project", projectArgs.path);
            return;
        }

        debugLog("Creating project compiler for", projectArgs.path);
        const newProjectCompiler = new Project(
            projectArgs,
            this.projectCompilationStart,
            this.projectCompilationComplete
        );
        this.projects.push(newProjectCompiler);
    }

    startCompilations() {
        this.projects.forEach(project => project.startCompiling());
    }

    private projectCompilationStart = () => {
        if (this.lastLog === "IDLE" || this.lastLog === "COMPLETE") {
            this.logStatus("COMPILING");
        }
    };

    private projectCompilationComplete = (project: Project) => {
        if (!this.watch) {
            this.projectCompilationFinal(project);
            return;
        }

        const result = this.projects
            .map(projectCompiler => {
                return projectCompiler.getLastResult();
            })
            .join("\n");

        console.log(result);
        this.logStatus("COMPLETE");

        if (this.isAProjectCompiling()) {
            this.logStatus("COMPILING");
        }
    };

    private projectCompilationFinal(project: Project) {
        const lastResult = project.getLastResult();
        console.log(lastResult + "\n");
        this.projects.splice(this.projects.indexOf(project), 1);
        this.finalOutput += "\n" + lastResult;

        if (!this.projects.length) {
            this.logStatus("IDLE");
        }
    }

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
        let message;
        if (type === "COMPILING" && this.lastLog === "IDLE") {
            message = "Starting compilation in watch mode...";
        } else if (type === "COMPILING") {
            message = "File change detected. Starting incremental compilation...";
        } else if (type === "COMPLETE") {
            message = "Compilation complete. Watching for file changes.";
        } else {
            const foundErrors = this.finalOutput.match(TSC_ERRORS_FOUND);
            if (foundErrors) {
                message = `Done compiling all projects with ${foundErrors.length} error(s) (see above).`;
                console.log(`${this.getTimestamp()} - ${message}`);
                process.exit(1);
            }

            message = `Done compiling all projects without errors.`;
        }
        console.log(`${this.getTimestamp()} - ${message}`);
        this.lastLog = type;
    }
}
