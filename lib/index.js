"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const debugTools_1 = require("./debugTools");
const packageFinder_1 = require("./packageFinder");
const ProjectsWatcher_1 = require("./ProjectsWatcher");
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
debugTools_1.setDebugMode(commander.debug);
debugTools_1.debugLog("Checking if global compiler is given", commander.compiler);
if (commander.compiler && typeof commander.compiler === "boolean") {
    debugTools_1.debugLog("Compiler command is boolean (true), so now searching for tsc executable");
    commander.compiler = packageFinder_1.findNodeModule(".", "tsc");
    debugTools_1.debugLog("Compiler command set to", commander.compiler);
}
debugTools_1.debugLog("Checking if there are project folders or tsconfigs given", commander.args);
if (!commander.args.length) {
    debugTools_1.debugLog("No tsconfig arguments given, will use current dir");
    commander.args.push(".");
}
const projectWatcher = new ProjectsWatcher_1.ProjectsWatcher();
const addedProjects = [];
commander.args.forEach(project => {
    if (addedProjects.indexOf(project) >= 0) {
        debugTools_1.debugLog("Ignored duplicate project", project);
        return;
    }
    projectWatcher.addProject({
        watch: !!commander.watch,
        projectPath: project,
        compilerPath: commander.compiler || packageFinder_1.findNodeModule(project, "tsc")
    });
});
projectWatcher.startCompilations();
