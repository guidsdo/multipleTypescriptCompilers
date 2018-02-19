"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sh = require("shelljs");
const debugTools_1 = require("../helpers/debugTools");
const debugTools_2 = require("../helpers/debugTools");
const TslintRunner_1 = require("../tslint/TslintRunner");
class Project {
    constructor(args, compilingCb, compiledCb, doneCb) {
        this.resultBuffer = [];
        this.lastResult = "";
        this.tslintRunner = null;
        this.parseCommandOutput = (data) => {
            if (!this.resultBuffer) {
                this.resultBuffer = [];
            }
            if (data.match(/Compilation complete\. Watching for file changes/)) {
                debugTools_2.debugLog("Compilation was complete, now printing everything");
                this.lastResult = this.resultBuffer.join("\n");
                this.resultBuffer = null;
                this.compiledCb();
                if (this.tslintRunner) {
                    this.tslintRunner.startLinting();
                    this.compilingCb();
                }
            }
            else if (data.match(/File change detected. Starting incremental compilation/)) {
                if (this.tslintRunner)
                    this.tslintRunner.stopLinting();
                this.compilingCb();
            }
            else {
                this.resultBuffer.push(data);
            }
        };
        this.args = args;
        this.compilingCb = compilingCb;
        this.compiledCb = compiledCb;
        this.doneCb = doneCb;
        if (this.args.tslint !== undefined) {
            this.tslintRunner = new TslintRunner_1.TslintRunner(this.args.tslint, this.compiledCb);
        }
    }
    startCompiling() {
        const { compiler, watch, path } = this.args;
        const compileCommand = `${compiler} ${watch ? "-w" : ""} -p ${path}`;
        debugTools_2.debugLog("Executing following command", compileCommand);
        const execOptions = { async: true, silent: !debugTools_1.DEBUG_MODE };
        const child = sh.exec(compileCommand, execOptions);
        child.stdout.on("data", this.parseCommandOutput);
        child.stdout.on("end", () => this.doneCb(this));
    }
    getLastResult() {
        const result = [this.lastResult];
        if (this.tslintRunner && !this.tslintRunner.isRunning) {
            const tslintResult = this.tslintRunner.getResult();
            if (tslintResult)
                result.push(this.tslintRunner.getResult());
        }
        return result.join("\n");
    }
    isCompiling() {
        return !!this.resultBuffer;
    }
    equals(otherProjectPath) {
        return this.args.path.toLocaleLowerCase() === otherProjectPath.toLocaleLowerCase();
    }
}
exports.Project = Project;
