import * as sh from "shelljs";
import { ChildProcess } from "child_process";

import { debugLog } from "../helpers/debugTools";
import { TslintSettings, TslintRunner } from "../tslint/TslintRunner";

const SH_EXECOPTIONS: sh.ExecOptions = { async: true, silent: true };
const TSC_COMPILATION_COMPLETE = /(?:Compilation complete\.|Found \d+ errors?\.) Watching for file changes/;
const TSC_COMPILATION_STARTED = /File change detected. Starting incremental compilation|Starting compilation in watch mode.../;

export const TSC_ERRORS_FOUND = /^([^\s].*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(error)\s+(TS\d+)\s*:\s*(.*)$/gm;

export type Instruction = "START";
export type ProjectState = "COMPILING" | "COMPLETE";
export type StateUpdate = { lastResult: string; projectState: ProjectState };

export type ProjectSettings = {
    watch: boolean;
    path: string;
    compiler: string;
    noEmit?: boolean;
    tslint?: TslintSettings;
};

export class Project {
    private projectSettings: ProjectSettings;
    private resultBuffer: string[] | null = [];
    private lastResult = "";
    private reportState: (stateUpdate: StateUpdate) => void;
    private tslintRunner: TslintRunner | null = null;

    constructor(args: ProjectSettings, reportState: (stateUpdate: StateUpdate) => void) {
        this.projectSettings = args;
        this.reportState = reportState;

        if (this.projectSettings.tslint !== undefined) {
            this.tslintRunner = new TslintRunner(this.projectSettings.tslint, this.tsLintDoneCb);
        }
    }

    processInstruction = (instruction: Instruction) => {
        if (instruction === "START") this.startCompiling();
    };

    sendStateUpdate(state: ProjectState) {
        this.reportState({ lastResult: this.lastResult, projectState: state });
    }

    private startCompiling() {
        const compileCommand = createCompileCommand(this.projectSettings);

        debugLog("Tsc: executing following command", compileCommand);
        const child = sh.exec(compileCommand, SH_EXECOPTIONS) as ChildProcess;

        child.stdout.on("data", this.parseCommandOutput);
        child.stdout.on("end", () => {
            this.flushResultBuffer();

            // End only occurs if the proces isn't in watch mode, so linting must be called manually after a compilation
            if (this.tslintRunner) this.tslintRunner.startLinting();
            else this.sendStateUpdate("COMPLETE");
        });
    }

    private parseCommandOutput = (data: string) => {
        // No result buffer? Then don't forget to report that we have started
        if (!this.resultBuffer) {
            this.sendStateUpdate("COMPILING");
            this.resultBuffer = [];
        }

        if (data.match(TSC_COMPILATION_COMPLETE)) {
            this.flushResultBuffer();
            this.sendStateUpdate("COMPLETE");

            if (this.tslintRunner) {
                this.sendStateUpdate("COMPILING");
                this.tslintRunner.startLinting();
            }
        } else if (data) {
            if (this.tslintRunner) {
                console.log("DIT VERPEST HET: ", JSON.stringify(data));
                this.tslintRunner.abort();
            }

            // Ignore the start compiling message, the ProjectsWatcher will write this only if needed.
            if (data.match(TSC_COMPILATION_STARTED)) return;

            this.resultBuffer.push(data);
        }
    };

    private flushResultBuffer() {
        this.lastResult = this.resultBuffer!.join("");
        this.resultBuffer = null;
    }

    private tsLintDoneCb = () => {
        // Only report that we're done if tsc isn't running. Otherwise the tslint data might be irrelevant.
        if (!this.resultBuffer && this.tslintRunner) {
            const tslintResult = this.tslintRunner.getLastResult();
            if (tslintResult) this.lastResult += `\n${tslintResult}`;

            this.sendStateUpdate("COMPLETE");
        }
    };
}

function createCompileCommand(projectSettings: ProjectSettings) {
    const { compiler, watch, path, noEmit } = projectSettings;

    const commandAndFlags = [
        compiler,
        watch ? "-w" : "",
        "--pretty false",
        "--preserveWatchOutput",
        noEmit === true ? "--noEmit" : "",
        `-p ${path}`
    ];

    return commandAndFlags.filter(value => !!value).join(" ");
}
