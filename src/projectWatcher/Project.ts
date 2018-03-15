import { ChildProcess } from "child_process";
import * as sh from "shelljs";
import { DEBUG_MODE } from "../helpers/debugTools";
import { debugLog } from "../helpers/debugTools";
import { TslintSettings, TslintRunner } from "../tslint/TslintRunner";

const DISALLOWED_DEBUG_CHARS = /\u001bc|\x1Bc/g;
const TSC_COMPILATION_COMPLETE = /Compilation complete\. Watching for file changes/;
const TSC_COMPILATION_STARTED = /File change detected. Starting incremental compilation|Starting compilation in watch mode.../;

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
    private compiledCb: () => void;
    private doneCb: (p: Project) => void;
    private tslintRunner: TslintRunner | null = null;

    constructor(args: ProjectSettings, compilingCb: () => void, compiledCb: () => void, doneCb: (p: Project) => void) {
        this.args = args;
        this.compilingCb = compilingCb;
        this.compiledCb = compiledCb;
        this.doneCb = doneCb;

        if (this.args.tslint !== undefined) {
            this.tslintRunner = new TslintRunner(this.args.tslint, this.compiledCb);
        }
    }

    startCompiling() {
        const { compiler, watch, path, noEmit } = this.args;
        const compileCommand = [compiler, watch ? "-w" : "", noEmit === true ? "--noEmit" : "", `-p ${path}`].join(" ");

        debugLog("Executing following command", compileCommand);

        const execOptions = { async: true, silent: true };

        const child = sh.exec(compileCommand, execOptions) as ChildProcess;

        child.stdout.on("data", this.parseCommandOutput);
        child.stdout.on("end", () => this.doneCb(this));
    }

    private parseCommandOutput = (data: string) => {
        if (!this.resultBuffer) {
            this.resultBuffer = [];
        }

        data = DEBUG_MODE ? data.replace(DISALLOWED_DEBUG_CHARS, "") : data;
        if (data.match(TSC_COMPILATION_COMPLETE)) {
            debugLog("Compilation was complete, now printing everything");
            this.lastResult = this.resultBuffer.join("\n");
            this.resultBuffer = null;
            this.compiledCb();

            if (this.tslintRunner) {
                this.compilingCb();
                this.tslintRunner.startLinting();
            }
        } else if (data.match(TSC_COMPILATION_STARTED)) {
            if (this.tslintRunner) this.tslintRunner.stopLinting();
            this.compilingCb();
        } else {
            this.resultBuffer.push(data);
        }
    };

    getLastResult() {
        const result = [];
        if (this.lastResult) result.push(this.lastResult);
        if (this.tslintRunner && !this.tslintRunner.isRunning()) {
            const tslintResult = this.tslintRunner.getResult();
            if (tslintResult) result.push(this.tslintRunner.getResult());
        }

        return result.join("\n");
    }

    isCompiling() {
        return !!this.resultBuffer || (this.tslintRunner ? this.tslintRunner!.isRunning() : false);
    }

    equals(otherProjectPath: string) {
        return this.args.path.toLocaleLowerCase() === otherProjectPath.toLocaleLowerCase();
    }
}
