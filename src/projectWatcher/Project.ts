import * as sh from "shelljs";
import { ChildProcess } from "child_process";

import { debugLog } from "../helpers/debugTools";

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
};

export class Project {
    private projectSettings: ProjectSettings;
    private resultBuffer: string[] | null = null;
    private lastResult = "";
    private reportState: (stateUpdate: StateUpdate) => void;

    constructor(args: ProjectSettings, reportState: (stateUpdate: StateUpdate) => void) {
        this.projectSettings = args;
        this.reportState = reportState;
    }

    processInstruction = (instruction: Instruction) => {
        if (instruction === "START") this.startCompiling();
    };

    private sendStateUpdate(state: ProjectState) {
        this.reportState({ lastResult: this.lastResult, projectState: state });
    }

    private startCompiling() {
        const compileCommand = createCompileCommand(this.projectSettings);

        debugLog("Tsc: executing following command", compileCommand);
        const child = sh.exec(compileCommand, SH_EXECOPTIONS) as ChildProcess;

        child.stdout?.on("data", this.parseCommandOutput);
        child.stdout?.on("end", this.processCompilationComplete);
    }

    private parseCommandOutput = (data: string) => {
        if (data.match(TSC_COMPILATION_COMPLETE)) {
            this.processCompilationComplete();
            return;
        }

        // No result buffer? Then don't forget to report that we have started
        if (!this.resultBuffer) {
            this.lastResult = "";
            this.resultBuffer = [];
            this.sendStateUpdate("COMPILING");
        }

        if (data) {
            // Ignore the start compiling message, the ProjectsWatcher will write this only if needed.
            if (data.match(TSC_COMPILATION_STARTED)) return;

            this.resultBuffer.push(data);
        }
    };

    private processCompilationComplete = () => {
        // Can't proces a complete compilation if there was no message
        if (!this.resultBuffer) return;

        this.flushResultBuffer();
        this.sendStateUpdate("COMPLETE");
    };

    private flushResultBuffer() {
        this.lastResult = this.resultBuffer!.join("");
        this.resultBuffer = null;
    }
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
