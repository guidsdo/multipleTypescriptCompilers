import { ChildProcess } from "child_process";
import * as colors from "colors";
import * as commander from "commander";
import * as moment from "moment";
import * as sh from "shelljs";
import { debugLog, setDebugMode } from "./debugTools";
import { findNodeModule } from "./packageFinder";
import { ProjectsWatcher } from "./ProjectsWatcher";

/**
 * This is a CLI tool that allows multiple typescript compilers to run at the same time.
 * Per new compilation, this tool also prints the result of the other compilations so you
 * don't lose the error's in tools like visual studio code.
 */

commander
    .usage("[options] [projects/tsconfigs...]")
    .option("-d, --debug")
    .option("-w, --watch", "Watch the given projects (default false)")
    .option("-c, --compiler [path_to_tsc]", "Path to compiler for all projects (will search in exec dir if not given)")
    .parse(process.argv);

setDebugMode(commander.debug);

debugLog("Checking if global compiler is given", commander.compiler);
if (commander.compiler && typeof commander.compiler === "boolean") {
    debugLog("Compiler command is boolean (true), so now searching for tsc executable");
    commander.compiler = findNodeModule(".", "tsc");
    debugLog("Compiler command set to", commander.compiler);
}

debugLog("Checking if there are project folders or tsconfigs given", commander.args);
if (!commander.args.length) {
    debugLog("No tsconfig arguments given, will use current dir");
    commander.args.push(".");
}

const projectWatcher = new ProjectsWatcher();

const addedProjects: string[] = [];
commander.args.forEach(project => {
    if (addedProjects.indexOf(project) >= 0) {
        debugLog("Ignored duplicate project", project);
        return;
    }

    projectWatcher.addProject({
        watch: !!commander.watch,
        projectPath: project,
        compilerPath: commander.compiler || findNodeModule(project, "tsc")
    });
});

projectWatcher.startCompilations();
