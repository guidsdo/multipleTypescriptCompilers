import { ChildProcess } from "child_process";
import * as colors from "colors";
import * as commander from "commander";
import * as moment from "moment";
import * as sh from "shelljs";
import { debugLog, setDebugMode } from "./debugTools";
import { addProject, projectCompilationComplete, projectCompilationStart, startCompilations } from "./ProjectWatcher";

/**
 * This is a CLI tool that allows multiple typescript compilers to run at the same time.
 * Per new compilation, this tool also prints the result of the other compilations so you
 * don't lose the error's in tools like visual studio code.
 */

commander.option("-d --debug").arguments("<tsc location> [tsconfigs...]").action(onInputReceive).parse(process.argv);

function onInputReceive(tscPath: string, projects: string[]) {
    setDebugMode(commander.debug);

    debugLog('Checking if tsc path ends with "tsc"', tscPath);
    if (!tscPath.endsWith("tsc")) {
        console.error(colors.red("No typescript compiler given, do normal please.."));
        process.exit(1);
    }

    debugLog("Checking if there are typescript folders", projects);
    if (!projects.length) {
        console.error(colors.red("No tsconfigs given, do normal please.."));
        process.exit(1);
    }

    const tscCommand = `${tscPath} -w -p`;
    debugLog("Setting tsc command to", tscCommand);

    projects.forEach(project => addProject(project, tscCommand));
    startCompilations();
}
