"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const debugTools_1 = require("../helpers/debugTools");
const Project_1 = require("./Project");
class ProjectsWatcher {
    constructor() {
        this.lastLog = "COMPILING";
        this.projects = [];
        this.projectCompilationStart = () => {
            if (this.lastLog === "COMPLETE") {
                this.logStatus("COMPILING");
            }
        };
        this.projectCompilationComplete = () => {
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
        this.projectCompilationFinal = (project) => {
            this.projectCompilationComplete();
            this.projects.splice(this.projects.indexOf(project), 1);
            if (!this.projects.length) {
                this.logStatus("FINAL");
            }
        };
    }
    addProject(projectArgs) {
        if (this.findProject(projectArgs.path)) {
            debugTools_1.debugLog("Ignored duplicate project", projectArgs.path);
            return;
        }
        debugTools_1.debugLog("Creating project compiler for", projectArgs.path);
        const newProjectCompiler = new Project_1.Project(projectArgs, this.projectCompilationStart, this.projectCompilationComplete, this.projectCompilationFinal);
        this.projects.push(newProjectCompiler);
    }
    startCompilations() {
        this.projects.forEach(project => project.startCompiling());
    }
    findProject(path) {
        return this.projects.find(project => project.equals(path)) || null;
    }
    getTimestamp() {
        return moment().format("HH:mm:ss");
    }
    isAProjectCompiling() {
        return this.projects.find(project => project.isCompiling());
    }
    logStatus(type) {
        if (type === "COMPILING") {
            console.log(`${this.getTimestamp()} - File change detected. Starting incremental compilation...`);
        }
        else if (type === "COMPLETE") {
            console.log(`${this.getTimestamp()} - Compilation complete. Watching for file changes.`);
        }
        else {
            console.log(`${this.getTimestamp()} - Done compiling all projects.`);
        }
        this.lastLog = type;
    }
}
exports.ProjectsWatcher = ProjectsWatcher;
