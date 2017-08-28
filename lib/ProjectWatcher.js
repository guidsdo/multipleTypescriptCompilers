"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const debugTools_1 = require("./debugTools");
const Project_1 = require("./Project");
const projects = [];
let lastLog = "COMPILING";
function getTimestamp() {
    return moment().format("HH:mm:ss");
}
function isAProjectCompiling() {
    return projects.find(project => project.isCompiling());
}
function projectCompilationStart() {
    if (lastLog === "COMPLETE") {
        logStatus("COMPILING");
    }
}
exports.projectCompilationStart = projectCompilationStart;
function projectCompilationComplete() {
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
exports.projectCompilationComplete = projectCompilationComplete;
function addProject(project, tscCommand) {
    debugTools_1.debugLog("Creating project compiler for:", project);
    const newProjectCompiler = new Project_1.Project(project, tscCommand, projectCompilationStart, projectCompilationComplete);
    projects.push(newProjectCompiler);
}
exports.addProject = addProject;
function startCompilations() {
    projects.forEach(project => project.createAndWatchCompilation());
}
exports.startCompilations = startCompilations;
function logStatus(type) {
    if (type === "COMPILING") {
        console.log(`${getTimestamp()} - File change detected. Starting incremental compilation.`);
    }
    else if (type === "COMPLETE") {
        console.log(`${getTimestamp()} - Compilation complete. Watching for file changes.`);
    }
    lastLog = type;
}
