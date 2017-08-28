import { ChildProcess } from "child_process";
import * as sh from "shelljs";
import { DEBUG_MODE, debugLog } from "./debugTools";

export class Project {
    private resultBuffer: string[] = [];
    private lastResult = "";
    private configPath: string;
    private compileCommand: string;
    private compilingCb: () => void;
    private compiledCb: () => void;

    constructor(configPath: string, compileCommand: string, compilingCb: () => void, compiledCb: () => void) {
        this.configPath = configPath;
        this.compileCommand = `${compileCommand} ${this.configPath}`;
        this.compilingCb = compilingCb;
        this.compiledCb = compiledCb;
    }

    createAndWatchCompilation() {
        debugLog("Executing following command", this.compileCommand);

        const execOptions = { async: true, silent: !DEBUG_MODE };

        const child = sh.exec(this.compileCommand, execOptions) as ChildProcess;

        child.stdout.on("data", this.parseCommandOutput);
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
