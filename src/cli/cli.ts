import * as cluster from "cluster";
import * as commander from "commander";

// Touch all the files from the main index, otherwise workers can't access all the necessary file
import "..";

import { findMtscConfig, validateMtscConfig } from "../config/configFileReader";
import { initProjectsWatcher } from "../config/configInterpreter";
import { MtscConfig } from "../config/configSpec";
import { debugLog, setDebugMode } from "../helpers/debugTools";
import { findNodeModuleExecutable } from "../helpers/fileSystemHelpers";
import { isValidBoolean, isValidString } from "../helpers/typeCheckHelpers";

commander
    .usage("[options] [projects/tsconfigs...]")
    .option("-d, --debug", "Add way too much logging")
    .option("-c, --config [path_to_config]", "Path to mtsc config")
    .option("-w, --watch", "Watch the given projects (default false)")
    .option("-p, --preserveWatchOutput", "Don't throw away watch output (default true in debug mode)")
    .option("-t, --tsc [path_to_tsc]", "Path to compiler for all projects (will search in exec dir if not given)")
    .option("--noEmit", "Do not emit outputs")
    .parse(process.argv);

setDebugMode(!!commander.debug);

function initProjectWatcherFromCli() {
    const foundConfig = findMtscConfig(commander.config);
    const mtscConfig: MtscConfig = foundConfig || { projects: [] };

    mtscConfig.debug = commander.debug || mtscConfig.debug;
    setDebugMode(!!mtscConfig.debug);

    if (foundConfig) validateMtscConfig(foundConfig);

    debugLog("Checking if config is given or autodetect", commander.config);
    debugLog("Any options given in CLI will overwrite the config");

    debugLog("Checking if global compiler is given", commander.tsc);
    if (commander.tsc && isValidString(commander.tsc)) {
        debugLog("Global compiler set to", commander.tsc);
        mtscConfig.compiler = commander.tsc;
    } else if (commander.tsc && isValidBoolean(commander.tsc)) {
        debugLog("Compiler command is true, so now searching for tsc executable");

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

    if (commander.noEmit) {
        debugLog("Global noEmit set to", commander.noEmit);
        mtscConfig.noEmit = commander.noEmit;
    }

    debugLog("Checking if there are project folders or tsconfigs given", commander.args);
    if (!commander.args.length && !mtscConfig.projects.length && !mtscConfig.useYarnWorkspaces) {
        debugLog("No tsconfig arguments given, will use current dir");
        commander.args.push(".");
    }

    commander.args.forEach(path => {
        mtscConfig.projects.push({ path });
    });

    return initProjectsWatcher(mtscConfig);
}

if (cluster.isMaster) {
    initProjectWatcherFromCli().startCompilations();
}
