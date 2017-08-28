"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("colors");
const commander = require("commander");
const debugTools_1 = require("./debugTools");
const ProjectWatcher_1 = require("./ProjectWatcher");
/**
 * This is a CLI tool that allows multiple typescript compilers to run at the same time.
 * Per new compilation, this tool also prints the result of the other compilations so you
 * don't lose the error's in tools like visual studio code.
 */
commander.option("-d --debug").arguments("<tsc location> [tsconfigs...]").action(onInputReceive).parse(process.argv);
function onInputReceive(tscPath, projects) {
    debugTools_1.setDebugMode(commander.debug);
    debugTools_1.debugLog('Checking if tsc path ends with "tsc"', tscPath);
    if (!tscPath.endsWith("tsc")) {
        console.error(colors.red("No typescript compiler given, do normal please.."));
        process.exit(1);
    }
    debugTools_1.debugLog("Checking if there are typescript folders", projects);
    if (!projects.length) {
        console.error(colors.red("No tsconfigs given, do normal please.."));
        process.exit(1);
    }
    const tscCommand = `${tscPath} -w -p`;
    debugTools_1.debugLog("Setting tsc command to", tscCommand);
    projects.forEach(project => ProjectWatcher_1.addProject(project, tscCommand));
    ProjectWatcher_1.startCompilations();
}
