"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sh = require("shelljs");
const debugTools_1 = require("./debugTools");
class Project {
    constructor(config, compilingCb, compiledCb, doneCb) {
        this.resultBuffer = [];
        this.lastResult = "";
        this.parseCommandOutput = (data) => {
            if (!this.resultBuffer) {
                this.resultBuffer = [];
            }
            if (data.match(/Compilation complete\. Watching for file changes/)) {
                debugTools_1.debugLog("Compilation was complete, now printing everything");
                this.lastResult = this.resultBuffer.join("\n");
                this.resultBuffer = null;
                this.compiledCb();
            }
            else if (data.match(/File change detected. Starting incremental compilation/)) {
                this.compilingCb();
            }
            else {
                this.resultBuffer.push(data);
            }
        };
        this.config = config;
        this.compilingCb = compilingCb;
        this.compiledCb = compiledCb;
        this.doneCb = doneCb;
    }
    startCompiling() {
        const { compilerPath, watch, projectPath } = this.config;
        const compileCommand = `${compilerPath} ${watch ? "-w" : ""} -p ${projectPath}`;
        debugTools_1.debugLog("Executing following command", compileCommand);
        const execOptions = { async: true, silent: !debugTools_1.DEBUG_MODE };
        const child = sh.exec(compileCommand, execOptions);
        child.stdout.on("data", this.parseCommandOutput);
        child.stdout.on("end", () => this.doneCb(this));
    }
    getLastResult() {
        return this.lastResult;
    }
    isCompiling() {
        return !!this.resultBuffer;
    }
}
exports.Project = Project;
