import { ChildProcess } from "child_process";
import * as sh from "shelljs";
import { DEBUG_MODE } from "../helpers/debugTools";
import { debugLog } from "../helpers/debugTools";

export type ProjectArgs = {
    watch: boolean;
    path: string;
    compiler: string;
};

export class Project {
    private args: ProjectArgs;
    private resultBuffer: string[] | null = [];
    private lastResult = "";
    private compilingCb: () => void;
    private compiledCb: () => void;
    private doneCb: (p: Project) => void;

    constructor(args: ProjectArgs, compilingCb: () => void, compiledCb: () => void, doneCb: (p: Project) => void) {
        this.args = args;
        this.compilingCb = compilingCb;
        this.compiledCb = compiledCb;
        this.doneCb = doneCb;
    }

    startCompiling() {
        const { compiler, watch, path } = this.args;
        const compileCommand = `${compiler} ${watch ? "-w" : ""} -p ${path}`;

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

    equals(otherProjectPath: string) {
        return this.args.path.toLocaleLowerCase() === otherProjectPath.toLocaleLowerCase();
    }
}
