import { ChildProcess } from "child_process";
import * as colors from "colors";
import * as commander from "commander";
import * as sh from "shelljs";

/**
 * This is a CLI tool that allows multiple typescript compilers to run at the same time.
 * Per new compilation, this tool also prints the result of the other compilations so you
 * don't lose the error's in tools like visual studio code.
 */

class ProjectCompiler {
    private resultBuffer: string[] = [];
    private lastResult = "";
    private configPath: string;
    private compileCommand: string;
    private compiledCb: () => void;

    constructor(configPath: string, compileCommand: string, compiledCb: () => void) {
        this.configPath = configPath;
        this.compileCommand = compileCommand;
        this.compiledCb = compiledCb;
    }

    createAndWatchCompilation() {
        const child = sh.exec(this.compileCommand, { async: true, silent: true }) as ChildProcess;
        child.stdout.on("data", (data: string) => {
            this.resultBuffer.push(data);
            if (data.match(/Compilation complete\. Watching for file changes/)) {
                this.lastResult = this.resultBuffer.join("\n");
                this.compiledCb();
            }
        });
    }

    getLastResult() {
        return this.lastResult;
    }
}

commander.arguments("<tsc location> [tsconfigs...]").action(onInputReceive).parse(process.argv);

function onInputReceive(tscPath: string, tsConfigs: string[]) {
    if (!tscPath.endsWith("tsc")) {
        console.error(colors.red("No typescript compiler given, do normal please.."));
        process.exit(1);
    } else if (!tsConfigs.length) {
        console.error(colors.red("No tsconfigs given, do normal please.."));
        process.exit(1);
    }

    const tscCommand = `${tscPath} -w`;

    const projectCompilers: ProjectCompiler[] = [];

    const logAllResults = () => {
        const result = projectCompilers
            .map(projectCompiler => {
                return projectCompiler.getLastResult();
            })
            .join();
        console.log(result);
    };

    tsConfigs.forEach(tsConfig => {
        const newProjectCompiler = new ProjectCompiler(tsConfig, tscCommand, logAllResults);
        projectCompilers.push(newProjectCompiler);
        newProjectCompiler.createAndWatchCompilation();
    });
}
