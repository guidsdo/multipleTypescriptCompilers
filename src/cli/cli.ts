import * as commander from "commander";
import { findMtscConfig } from "../config/configFileReader";
import { initProjectsWatcher } from "../config/configInterpreter";
import { MtscConfig } from "../config/configSpec";
import { debugLog, setDebugMode } from "../helpers/debugTools";
import { findNodeModuleExecutable } from "../helpers/fileSystemHelpers";
import { isValidBoolean, isValidString } from "../helpers/typeCheckHelpers";

commander
    .usage("[options] [projects/tsconfigs...]")
    .option("-d, --debug")
    .option("-c, --config [path_to_config]", "Path to mtsc config")
    .option("-w, --watch", "Watch the given projects (default false)")
    .option("-t, --tsc [path_to_tsc]", "Path to compiler for all projects (will search in exec dir if not given)")
    .parse(process.argv);

setDebugMode(!!commander.debug);

const mtscConfig: MtscConfig = findMtscConfig(commander.config) || { projects: [] };

mtscConfig.debug = commander.debug || mtscConfig.debug;
setDebugMode(!!mtscConfig.debug);

debugLog("Checking if config is given or autodetect", commander.config);
debugLog("Any options given in CLI will overwrite the config");

debugLog("Checking if global compiler is given", commander.tsc);
if (commander.tsc && isValidString(commander.tsc)) {
    debugLog("Global compiler set to", commander.tsc);
    mtscConfig.compiler = commander.tsc;
} else if (commander.tsc && isValidBoolean(commander.tsc)) {
    debugLog("Compiler command is boolean (true), so now searching for tsc executable");

    mtscConfig.compiler = findNodeModuleExecutable(".", "tsc");

    debugLog("Compiler command set to", mtscConfig.compiler);
} else if (commander.tsc) {
    debugLog("Invalid tsc option given", commander.tsc);
    throw new Error("Invalid tsc option given");
}

if (commander.watch) {
    debugLog("Global watch set to", commander.watch);
    mtscConfig.watch = commander.watch;
}

debugLog("Checking if there are project folders or tsconfigs given", commander.args);
if (!commander.args.length && !mtscConfig.projects.length) {
    debugLog("No tsconfig arguments given, will use current dir");
    commander.args.push(".");
}

commander.args.forEach(path => {
    mtscConfig.projects.push({ path });
});

initProjectsWatcher(mtscConfig).startCompilations();
