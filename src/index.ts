import { debug } from "util";
import { ChildProcess } from "child_process";
import * as colors from "colors";
import * as commander from "commander";
import * as sh from "shelljs";

/**
 * This is a CLI tool that allows multiple typescript compilers to run at the same time.
 * Per new compilation, this tool also prints the result of the other compilations so you
 * don't lose the error's in tools like visual studio code.
 */

let DEBUG_MODE = false;

class ProjectCompiler {
    private resultBuffer: string[] = [];
    private lastResult = "";
    private configPath: string;
    private compileCommand: string;
    private compiledCb: () => void;

    constructor(configPath: string, compileCommand: string, compiledCb: () => void) {
        this.configPath = configPath;
        this.compileCommand = `${compileCommand} ${this.configPath}`;
        this.compiledCb = compiledCb;
    }

    createAndWatchCompilation() {
        debugLog("Executing following command", this.compileCommand);

        const execOptions = { async: true, silent: !DEBUG_MODE };

        const child = sh.exec(this.compileCommand, execOptions) as ChildProcess;

        child.stdout.on("data", (data: string) => {
            this.resultBuffer.push(data);

            if (data.match(/Compilation complete\. Watching for file changes/)) {
                debugLog("Compilation was complete, now printing everything");
                this.lastResult = this.resultBuffer.join("\n");
                this.compiledCb();
            }
        });
    }

    getLastResult() {
        return this.lastResult;
    }
}

commander.option("-d --debug").arguments("<tsc location> [tsconfigs...]").action(onInputReceive).parse(process.argv);

function onInputReceive(tscPath: string, tsConfigs: string[]) {
    DEBUG_MODE = commander.debug;
    debugLog("Debug mode is active");

    debugLog('Checking if tsc path ends with "tsc"', tscPath);
    if (!tscPath.endsWith("tsc")) {
        console.error(colors.red("No typescript compiler given, do normal please.."));
        process.exit(1);
    }

    debugLog("Checking if there are typescript folders", tsConfigs);
    if (!tsConfigs.length) {
        console.error(colors.red("No tsconfigs given, do normal please.."));
        process.exit(1);
    }

    const tscCommand = `${tscPath} -w -p`;
    debugLog("Setting tsc command to", tscCommand);

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
        debugLog("Creating project compiler for", tsConfig);
        const newProjectCompiler = new ProjectCompiler(tsConfig, tscCommand, logAllResults);
        projectCompilers.push(newProjectCompiler);
        newProjectCompiler.createAndWatchCompilation();
    });
}

function debugLog(message: string, argument?: any) {
    if (DEBUG_MODE) {
        argument = argument || "";
        console.log(message, argument);
        console.log();
    }
}
