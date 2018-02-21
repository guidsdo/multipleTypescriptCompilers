"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sh = require("shelljs");
const debugTools_1 = require("../helpers/debugTools");
const debugTools_2 = require("../helpers/debugTools");
const TslintRunner_1 = require("../tslint/TslintRunner");
const DISALLOWED_DEBUG_CHARS = /\u001bc|\x1Bc/g;
const TSC_COMPILATION_COMPLETE = /Compilation complete\. Watching for file changes/;
const TSC_COMPILATION_STARTED = /File change detected. Starting incremental compilation|Starting compilation in watch mode.../;
class Project {
    constructor(args, compilingCb, compiledCb, doneCb) {
        this.resultBuffer = [];
        this.lastResult = "";
        this.tslintRunner = null;
        this.parseCommandOutput = (data) => {
            if (!this.resultBuffer) {
                this.resultBuffer = [];
            }
            data = debugTools_1.DEBUG_MODE ? data.replace(DISALLOWED_DEBUG_CHARS, "") : data;
            if (data.match(TSC_COMPILATION_COMPLETE)) {
                debugTools_2.debugLog("Compilation was complete, now printing everything");
                this.lastResult = this.resultBuffer.join("\n");
                this.resultBuffer = null;
                this.compiledCb();
                if (this.tslintRunner) {
                    this.compilingCb();
                    this.tslintRunner.startLinting();
                }
            }
            else if (data.match(TSC_COMPILATION_STARTED)) {
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
        const execOptions = { async: true, silent: true };
        const child = sh.exec(compileCommand, execOptions);
        child.stdout.on("data", this.parseCommandOutput);
        child.stdout.on("end", () => this.doneCb(this));
    }
    getLastResult() {
        const result = [];
        if (this.lastResult)
            result.push(this.lastResult);
        if (this.tslintRunner && !this.tslintRunner.isRunning()) {
            const tslintResult = this.tslintRunner.getResult();
            if (tslintResult)
                result.push(this.tslintRunner.getResult());
        }
        return result.join("\n");
    }
    isCompiling() {
        return !!this.resultBuffer || (this.tslintRunner ? this.tslintRunner.isRunning() : false);
    }
    equals(otherProjectPath) {
        return this.args.path.toLocaleLowerCase() === otherProjectPath.toLocaleLowerCase();
    }
}
exports.Project = Project;
