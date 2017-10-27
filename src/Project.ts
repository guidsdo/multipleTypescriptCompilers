import { ChildProcess } from "child_process";
import * as sh from "shelljs";
import { DEBUG_MODE, debugLog } from "./debugTools";

export type ProjectConfig = {
    watch: boolean;
    projectPath: string;
    compilerPath: string;
};

export class Project {
    private config: ProjectConfig;
    private resultBuffer: string[] = [];
    private lastResult = "";
    private compilingCb: () => void;
    private compiledCb: () => void;
    private doneCb: (p: Project) => void;
    private hasEnded: boolean;

    constructor(config: ProjectConfig, compilingCb: () => void, compiledCb: () => void, doneCb: (p: Project) => void) {
        this.config = config;
        this.compilingCb = compilingCb;
        this.compiledCb = compiledCb;
        this.doneCb = doneCb;
    }

    startCompiling() {
        const { compilerPath, watch, projectPath } = this.config;
        const compileCommand = `${compilerPath} ${watch ? "-w" : ""} -p ${projectPath}`;

        debugLog("Executing following command", compileCommand);

        const execOptions = { async: true, silent: !DEBUG_MODE };

        const child = sh.exec(compileCommand, execOptions) as ChildProcess;

        child.stdout.on("data", this.parseCommandOutput);
        child.stdout.on("end", () => this.doneCb(this));
    }

    parseCommandOutput = (data: string) => {
        if (!this.resultBuffer) {
            this.resultBuffer = [];
        }

        if (data.match(/Compilation complete\. Watching for file changes/)) {
            debugLog("Compilation was complete, now printing everything");
            this.lastResult = this.resultBuffer.join("\n");
            this.resultBuffer = null;
            this.compiledCb();
        } else if (data.match(/File change detected. Starting incremental compilation/)) {
            this.compilingCb();
        } else {
            this.resultBuffer.push(data);
        }
    };

    getLastResult() {
        return this.lastResult;
    }

    isCompiling() {
        return !!this.resultBuffer;
    }
}
