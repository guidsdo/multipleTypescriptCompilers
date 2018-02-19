"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslint_1 = require("tslint");
const helpers_1 = require("../helpers");
const TscFormatter_1 = require("./TscFormatter");
class TslintRunner {
    constructor(tslintArgs, doneCb) {
        this.running = false;
        this.result = "";
        this.autofix = false;
        this.tslintCfg = helpers_1.findJsonFile(tslintArgs.tslintPath, "tslint.json");
        this.tsconfig = helpers_1.findJsonFile(tslintArgs.tslintPath, "tsconfig.json");
        this.doneCb = doneCb;
    }
    startLinting() {
        this.result = "";
        this.running = true;
        const program = tslint_1.Linter.createProgram(this.tsconfig);
        const linter = new tslint_1.Linter({ fix: this.autofix, formatter: TscFormatter_1.Formatter }, program);
        const files = tslint_1.Linter.getFileNames(program);
        const configuration = tslint_1.Configuration.findConfiguration(this.tslintCfg).results;
        for (let i = 0; i < files.length && this.running; i++) {
            const file = files[i];
            const fileContents = program.getSourceFile(file).getFullText();
            linter.lint(file, fileContents, configuration);
        }
        if (!this.running) {
            // If aborted, showing results isn't desired.
            return;
        }
        this.running = false;
        this.result = linter.getResult().output;
        this.doneCb();
    }
    stopLinting() {
        this.running = false;
    }
    getResult() {
        return this.result;
    }
    isRunning() {
        return this.isRunning;
    }
}
exports.TslintRunner = TslintRunner;
