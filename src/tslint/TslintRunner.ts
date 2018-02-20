import { Linter, Configuration } from "tslint";
import { Formatter } from "./TscFormatter";

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

        if (!this.running) {
            // If aborted, showing results isn't desired.
            return;
        }

        this.running = false;
        this.result = linter.getResult().output;
        this.doneCb();
    }

    stopLinting() {
        this.running = false;
    }

    getResult() {
        return this.result;
    }

    isRunning() {
        return this.running;
    }
}
