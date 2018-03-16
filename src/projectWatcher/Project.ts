import { ChildProcess } from "child_process";
import * as sh from "shelljs";
import { debugLog } from "../helpers/debugTools";
import { TslintSettings, TslintRunner } from "../tslint/TslintRunner";

const DISALLOWED_DEBUG_CHARS = /\u001bc|\x1Bc|\033c/g;
const TSC_COMPILATION_COMPLETE = /Compilation complete\. Watching for file changes/;
const TSC_COMPILATION_STARTED = /File change detected. Starting incremental compilation|Starting compilation in watch mode.../;

export type ProjectSettings = {
    watch: boolean;
    path: string;
    compiler: string;
    preserveWatchOutput: boolean;
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
        const compileCommand = [compiler, watch ? "-w" : "", noEmit === true ? "--noEmit" : "", `-p ${path}`].join(" ");

        debugLog("Executing following command", compileCommand);

        const execOptions = { async: true, silent: true };

        const child = sh.exec(compileCommand, execOptions) as ChildProcess;

        child.stdout.on("data", this.parseCommandOutput);
        child.stdout.on("end", () => {
            this.setLastResult();
            this.tslintRunner ? this.tslintRunner.startLinting() : this.compiledCb(this);
        });
    }

    private parseCommandOutput = (data: string) => {
        if (!this.resultBuffer) this.resultBuffer = [];
        if (this.args.preserveWatchOutput) data = data.replace(DISALLOWED_DEBUG_CHARS, "");

        if (data.match(TSC_COMPILATION_COMPLETE)) {
            debugLog("Compilation was complete, now printing everything");
            this.setLastResult();
            this.compiledCb(this);

            if (this.tslintRunner) {
                this.compilingCb();
                this.tslintRunner.startLinting();
            }
        } else if (data.match(TSC_COMPILATION_STARTED)) {
            // Push empty result for old tsc compatibility
            this.resultBuffer.push("");

            if (this.tslintRunner) this.tslintRunner.terminate();
            this.compilingCb();
        } else if (data) {
            // Show 'Starting compilation in watch mode...' for old tsc clients
            if (!this.resultBuffer.length) this.compilingCb();

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
        if (this.tslintRunner && !this.tslintRunner.isRunning()) {
            const tslintResult = this.tslintRunner.getResult();
            if (tslintResult) result.push(this.tslintRunner.getResult());
        }

        return result.join("\n");
    }

    tsLintDoneCb = () => {
        this.compiledCb(this);
    };

    isCompiling() {
        return !!this.resultBuffer || (this.tslintRunner ? this.tslintRunner!.isRunning() : false);
    }

    equals(otherProjectPath: string) {
        return this.args.path.toLocaleLowerCase() === otherProjectPath.toLocaleLowerCase();
    }
}
