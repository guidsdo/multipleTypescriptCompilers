import * as moment from "moment";
import { debugLog } from "./debugTools";
import { Project } from "./Project";

const projects: Project[] = [];
type logType = "COMPILING" | "COMPLETE";
let lastLog: logType = "COMPILING";

function getTimestamp() {
    return moment().format("HH:mm:ss");
}

function isAProjectCompiling() {
    return projects.find(project => project.isCompiling());
}

export function projectCompilationStart() {
    if (lastLog === "COMPLETE") {
        logStatus("COMPILING");
    }
}

export function projectCompilationComplete() {
    const result = projects
        .map(projectCompiler => {
            return projectCompiler.getLastResult();
        })
        .join("");

    console.log(result);
    logStatus("COMPLETE");

    if (isAProjectCompiling()) {
        logStatus("COMPILING");
    }
}

export function addProject(project: string, tscCommand: string) {
    debugLog("Creating project compiler for:", project);
    const newProjectCompiler = new Project(project, tscCommand, projectCompilationStart, projectCompilationComplete);
    projects.push(newProjectCompiler);
}

export function startCompilations() {
    projects.forEach(project => project.createAndWatchCompilation());
}

function logStatus(type: logType) {
    if (type === "COMPILING") {
        console.log(`${getTimestamp()} - File change detected. Starting incremental compilation...`);
    } else if (type === "COMPLETE") {
        console.log(`${getTimestamp()} - Compilation complete. Watching for file changes.`);
    }
    lastLog = type;
}
