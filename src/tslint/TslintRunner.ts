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

        for (let i = 0; i < files.length && this.running; i++) {
            const file = files[i];
            const fileContents = program.getSourceFile(file)!.getFullText();
            linter.lint(file, fileContents, configuration);
        }

        if (this.running) {
            // Only show results if linting is completely done.
            this.running = false;
            this.result = linter.getResult().output;
        }
        this.doneCb();
    }

    stopLinting() {
        if (this.running) {
            debugLog("Tslint aborted");
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
