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
    private result = "";
    private doneCb: () => void;

    private tslintCfg: string;
    private tsconfig: string;
    private autofix = false;

    constructor(tslintArgs: TslintSettings, doneCb: () => void) {
        this.tslintCfg = tslintArgs.rulesFile;
        this.tsconfig = tslintArgs.tsconfigPath;
        this.doneCb = doneCb;
    }

    startLinting() {
        debugLog("Starting tslint with options", {
            tslintCfg: this.tslintCfg,
            tsconfig: this.tsconfig,
            autofix: this.autofix
        });

        this.result = "";
        this.startLintingWhenNotRunning();
    }

    terminate() {
        if (this.running) {
            debugLog("Tslint: Aborting...");
        }
        this.terminated = true;
    }

    getResult() {
        return this.result;
    }

    isRunning() {
        return this.running;
    }

    private startLintingWhenNotRunning = () => {
        // Make sure to wait until tslint is really done before firing a new tslint task
        if (this.running) setImmediate(this.startLintingWhenNotRunning);
        else {
            this.terminated = false;
            this.lintFilesAsync();
        }
    };

    private lintFilesAsync() {
        const program = Linter.createProgram(this.tsconfig);
        const linter = new Linter({ fix: this.autofix, formatter: Formatter }, program);
        const files = Linter.getFileNames(program);
        const configuration = Configuration.findConfiguration(this.tslintCfg).results;

        const lintInEventLoop = (linter: Linter, files: string[]) => {
            const file = files.shift()!;
            const fileContents = program.getSourceFile(file)!.getFullText();
            linter.lint(file, fileContents, configuration);

            if (files.length && !this.terminated) setImmediate(lintInEventLoop, linter, files);
            else {
                this.running = false;

                if (this.terminated) debugLog("Tslint: Aborted.");
                else {
                    this.result = linter.getResult().output;
                    this.doneCb();
                }
            }
        };

        this.running = true;
        lintInEventLoop(linter, files);
    }
}
