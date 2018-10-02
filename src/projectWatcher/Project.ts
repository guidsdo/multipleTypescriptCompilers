import * as sh from "shelljs";
import { ChildProcess } from "child_process";

import { debugLog } from "../helpers/debugTools";
import { TslintSettings, TslintRunner } from "../tslint/TslintRunner";

const TSC_COMPILATION_COMPLETE = /(?:Compilation complete\.|Found \d+ errors?\.) Watching for file changes/;
const TSC_COMPILATION_STARTED = /File change detected. Starting incremental compilation|Starting compilation in watch mode.../;
export const TSC_ERRORS_FOUND = /^([^\s].*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(error)\s+(TS\d+)\s*:\s*(.*)$/gm;

export type ProjectSettings = {
    watch: boolean;
    path: string;
    compiler: string;
    noEmit?: boolean;
    tslint?: TslintSettings;
};

export class Project {
    private args: ProjectSettings;
    private resultBuffer: string[] | null = [];
    private lastResult = "";
    private compilingCb: () => void;
    private compiledCb: (p: Project) => void;
    private tslintRunner: TslintRunner | null = null;

    constructor(args: ProjectSettings, compilingCb: () => void, compiledCb: (p: Project) => void) {
        this.args = args;
        this.compilingCb = compilingCb;
        this.compiledCb = compiledCb;

        if (this.args.tslint !== undefined) {
            this.tslintRunner = new TslintRunner(this.args.tslint, this.tsLintDoneCb);
        }
    }

    startCompiling() {
        const { compiler, watch, path, noEmit } = this.args;
        const compileCommand = [
            compiler,
            watch ? "-w" : "",
            "--pretty false",
            "--preserveWatchOutput",
            noEmit === true ? "--noEmit" : "",
            `-p ${path}`
        ]
            .filter(value => !!value)
            .join(" ");

        debugLog("Tsc: executing following command", compileCommand);

        const execOptions = { async: true, silent: true };

        const child = sh.exec(compileCommand, execOptions) as ChildProcess;

        child.stdout.on("data", this.parseCommandOutput);
        child.stdout.on("end", () => {
            debugLog("Tsc: done with compiling for", this.args.path);
            this.setLastResult();
            if (this.tslintRunner) this.tslintRunner.startLinting();
            else this.compiledCb(this);
        });
    }

    private parseCommandOutput = (data: string) => {
        if (!this.resultBuffer) this.resultBuffer = [];

        if (data.match(TSC_COMPILATION_COMPLETE)) {
            debugLog("Tsc: complete and printing everything for", this.args.path);
            this.setLastResult();
            this.compiledCb(this);

            if (this.tslintRunner) {
                this.compilingCb();
                this.tslintRunner.startLinting();
            }
        } else if (data.match(TSC_COMPILATION_STARTED)) {
            // Push empty result for old tsc compatibility
            this.resultBuffer.push("");
            debugLog("Tsc: starting compilation for", this.args.path);

            if (this.tslintRunner) this.tslintRunner.terminate();
            this.compilingCb();
        } else if (data) {
            // Show 'Starting compilation in watch mode...' for old tsc clients
            if (!this.resultBuffer.length) {
                this.compilingCb();
                debugLog("Tsc: starting compilation for", this.args.path);
            }

            this.resultBuffer.push(data);
        }
    };

    setLastResult() {
        this.lastResult = this.resultBuffer!.join("");
        this.resultBuffer = null;
    }

    getLastResult() {
        const result = [];
        if (this.lastResult) result.push(this.lastResult);
        if (this.tslintRunner) {
            const tslintResult = this.tslintRunner.getLastResult();
            if (tslintResult) result.push(tslintResult);
        }

        return result.join("\n");
    }

    tsLintDoneCb = () => {
        if (!this.resultBuffer) this.compiledCb(this);
    };

    isCompiling() {
        return !!this.resultBuffer || (this.tslintRunner ? this.tslintRunner.isRunning() : false);
    }

    equals(otherProjectPath: string) {
        return this.args.path.toLocaleLowerCase() === otherProjectPath.toLocaleLowerCase();
    }
}
