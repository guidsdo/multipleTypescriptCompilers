"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const configFileReader_1 = require("../config/configFileReader");
const configInterpreter_1 = require("../config/configInterpreter");
const debugTools_1 = require("../helpers/debugTools");
const fileSystemHelpers_1 = require("../helpers/fileSystemHelpers");
const typeCheckHelpers_1 = require("../helpers/typeCheckHelpers");
commander
    .usage("[options] [projects/tsconfigs...]")
    .option("-d, --debug")
    .option("-c, --config [path_to_config]", "Path to mtsc config")
    .option("-w, --watch", "Watch the given projects (default false)")
    .option("-t, --tsc [path_to_tsc]", "Path to compiler for all projects (will search in exec dir if not given)")
    .parse(process.argv);
debugTools_1.setDebugMode(!!commander.debug);
const foundConfig = configFileReader_1.findMtscConfig(commander.config);
const mtscConfig = foundConfig || { projects: [] };
mtscConfig.debug = commander.debug || mtscConfig.debug;
debugTools_1.setDebugMode(!!mtscConfig.debug);
if (foundConfig)
    configFileReader_1.validateMtscConfig(foundConfig);
debugTools_1.debugLog("Checking if config is given or autodetect", commander.config);
debugTools_1.debugLog("Any options given in CLI will overwrite the config");
debugTools_1.debugLog("Checking if global compiler is given", commander.tsc);
if (commander.tsc && typeCheckHelpers_1.isValidString(commander.tsc)) {
    debugTools_1.debugLog("Global compiler set to", commander.tsc);
    mtscConfig.compiler = commander.tsc;
}
else if (commander.tsc && typeCheckHelpers_1.isValidBoolean(commander.tsc)) {
    debugTools_1.debugLog("Compiler command is boolean (true), so now searching for tsc executable");
    mtscConfig.compiler = fileSystemHelpers_1.findNodeModuleExecutable(".", "tsc");
    debugTools_1.debugLog("Compiler command set to", mtscConfig.compiler);
}
else if (commander.tsc) {
    debugTools_1.debugLog("Invalid tsc option given", commander.tsc);
    throw new Error("Invalid tsc option given");
}
if (commander.watch) {
    debugTools_1.debugLog("Global watch set to", commander.watch);
    mtscConfig.watch = commander.watch;
}
debugTools_1.debugLog("Checking if there are project folders or tsconfigs given", commander.args);
if (!commander.args.length && !mtscConfig.projects.length) {
    debugTools_1.debugLog("No tsconfig arguments given, will use current dir");
    commander.args.push(".");
}
commander.args.forEach(path => {
    mtscConfig.projects.push({ path });
});
configInterpreter_1.initProjectsWatcher(mtscConfig).startCompilations();
