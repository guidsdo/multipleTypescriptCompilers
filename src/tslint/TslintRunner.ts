import { Linter, Configuration } from "tslint";
import { Formatter } from "./TscFormatter";
import { debugLog } from "../helpers/debugTools";

export type TslintSettings = {
    rulesFile: string;
    tsconfigPath: string;
    autoFix: boolean;
};

export class TslintRunner {
    private running = false;
    private terminated = false;
    private lastResult = "";
    private doneCb: () => void;

    private tslintCfg: string;
    private tsconfig: string;
    private autofix = false;

    constructor(tslintArgs: TslintSettings, doneCb: () => void) {
        this.tslintCfg = tslintArgs.rulesFile;
        this.tsconfig = tslintArgs.tsconfigPath;
        this.autofix = tslintArgs.autoFix;
        this.doneCb = doneCb;
    }

    startLinting() {
        debugLog("Tslint: Starting with options", {
            tslintCfg: this.tslintCfg,
            tsconfig: this.tsconfig,
            autofix: this.autofix
        });

        this.startLintingWhenPossible();
    }

    abort() {
        if (this.running) debugLog("Tslint: Aborting", this.tsconfig);

        this.terminated = true;
    }

    getLastResult() {
        return this.lastResult ? `${this.lastResult}\n` : "";
    }

    isRunning() {
        return this.running;
    }

    private startLintingWhenPossible = () => {
        // Make sure to wait until tslint is really done before firing a new tslint task
        if (this.running) {
            this.lastResult = "";
            setImmediate(this.startLintingWhenPossible);
        } else {
            this.terminated = false;
            this.lintFilesAsync();
        }
    };

    private lintFilesAsync() {
        const program = Linter.createProgram(this.tsconfig);
        const linter = new Linter({ fix: this.autofix, formatter: Formatter }, program);
        const files = Linter.getFileNames(program);
        const configuration = Configuration.findConfiguration(this.tslintCfg).results;

        const lintInEventLoop = (remainingFiles: string[]) => {
            const file = remainingFiles.shift()!;
            const fileContents = program.getSourceFile(file)!.getFullText();
            linter.lint(file, fileContents, configuration);

            if (remainingFiles.length && !this.terminated) {
                setImmediate(lintInEventLoop, remainingFiles);
            } else {
                this.running = false;

                if (this.terminated) {
                    debugLog("Tslint: Aborted", this.tsconfig);
                } else {
                    this.lastResult = linter.getResult().output;
                    debugLog("Tslint: Done", this.tsconfig);
                    this.doneCb();
                }
            }
        };

        this.running = true;
        lintInEventLoop(files);
    }
}
