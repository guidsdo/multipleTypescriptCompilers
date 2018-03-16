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
        this.running = true;

        const program = Linter.createProgram(this.tsconfig);
        const linter = new Linter({ fix: this.autofix, formatter: Formatter }, program);
        const files = Linter.getFileNames(program);
        const configuration = Configuration.findConfiguration(this.tslintCfg).results;

        const lintInEventLoop = (linter: Linter, files: string[]) => {
            const file = files.shift()!;
            const fileContents = program.getSourceFile(file)!.getFullText();
            linter.lint(file, fileContents, configuration);
            if (files.length && this.running) {
                setImmediate(() => lintInEventLoop(linter, files));
            } else {
                if (this.running) {
                    // Only show results if linting is completely done.
                    this.running = false;
                    this.result = linter.getResult().output;
                } else {
                    debugLog("Tslint: Aborted.");
                }
                this.doneCb();
            }
        };

        lintInEventLoop(linter, files);
    }

    stopLinting() {
        if (this.running) {
            debugLog("Tslint: Aborting...");
        }
        this.running = false;
    }

    getResult() {
        return this.result;
    }

    isRunning() {
        return this.running;
    }
}
