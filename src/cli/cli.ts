import * as cluster from "cluster";
import { Command } from "commander";

// Touch all the files from the main index, otherwise workers can't access all the necessary file
import "..";

import { findMtscConfig, validateMtscConfig } from "../config/configFileReader";
import { initProjectsWatcher } from "../config/configInterpreter";
import { MtscConfig } from "../config/configSpec";
import { debugLog, setDebugMode } from "../helpers/debugTools";
import { findNodeModuleExecutable } from "../helpers/fileSystemHelpers";
import { isValidBoolean, isValidString } from "../helpers/typeCheckHelpers";

const program = new Command();
program
    .usage("[options] [projects/tsconfigs...]")
    .usage("[options] [projects/tsconfigs...]")
    .option("-d, --debug", "Add way too much logging")
    .option("-c, --config [path_to_config]", "Path to mtsc config")
    .option("-w, --watch", "Watch the given projects (default false)")
    .option("-p, --preserveWatchOutput", "Don't throw away watch output (default true in debug mode)")
    .option("-t, --tsc [path_to_tsc]", "Path to compiler for all projects (will search in exec dir if not given)")
    .option("--noEmit", "Do not emit outputs")
    .parse(process.argv);

const options = program.opts();

setDebugMode(!!options.debug);

function initProjectWatcherFromCli() {
    const foundConfig = findMtscConfig(options.config);
    const mtscConfig: MtscConfig = foundConfig || { projects: [] };

    mtscConfig.debug = options.debug || mtscConfig.debug;
    setDebugMode(!!mtscConfig.debug);

    if (foundConfig) validateMtscConfig(foundConfig);

    debugLog("Checking if config is given or autodetect", options.config);
    debugLog("Any options given in CLI will overwrite the config");

    debugLog("Checking if global compiler is given", options.tsc);
    if (options.tsc && isValidString(options.tsc)) {
        debugLog("Global compiler set to", options.tsc);
        mtscConfig.compiler = options.tsc;
    } else if (options.tsc && isValidBoolean(options.tsc)) {
        debugLog("Compiler command is true, so now searching for tsc executable");

        mtscConfig.compiler = findNodeModuleExecutable(".", "tsc");

        debugLog("Compiler command set to", mtscConfig.compiler);
    } else if (options.tsc) {
        debugLog("Invalid tsc option given", options.tsc);
        throw new Error("Invalid tsc option given");
    }

    if (options.watch) {
        debugLog("Global watch set to", options.watch);
        mtscConfig.watch = options.watch;
    }

    if (options.noEmit) {
        debugLog("Global noEmit set to", options.noEmit);
        mtscConfig.noEmit = options.noEmit;
    }

    debugLog("Checking if there are project folders or tsconfigs given", options.args);
    if (!options.args.length && !mtscConfig.projects.length && !mtscConfig.useYarnWorkspaces) {
        debugLog("No tsconfig arguments given, will use current dir");
        options.args.push(".");
    }

    program.args.forEach(path => {
        mtscConfig.projects.push({ path });
    });

    return initProjectsWatcher(mtscConfig);
}

if (cluster.isMaster) {
    initProjectWatcherFromCli().startCompilations();
}
