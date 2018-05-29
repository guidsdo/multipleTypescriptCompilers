import * as commander from "commander";
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
    .option("-l, --lint [path_to_tslintrules]", "Path to tslint rules for all projects (will search if not given)")
    .option("--noEmit", "Do not emit outputs")
    .option("--tslintAlwaysShowAsWarning", "Always show tslint output as warning")
    .parse(process.argv);

setDebugMode(!!commander.debug);

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

debugLog("Checking if global tslint rules is given", commander.lint);
if (commander.lint && isValidString(commander.lint)) {
    debugLog("Global tslint rules set to", commander.lint);
    mtscConfig.tslint = commander.lint;
} else if (commander.lint && isValidBoolean(commander.lint)) {
    debugLog("Tslint rules is true");
    mtscConfig.tslint = commander.lint;
} else if (commander.lint) {
    debugLog("Invalid lint option given", commander.lint);
    throw new Error("Invalid lint option given");
}

if (commander.noEmit) {
    debugLog("Global noEmit set to", commander.noEmit);
    mtscConfig.noEmit = commander.noEmit;
}

if (commander.tslintAlwaysShowAsWarning) {
    debugLog("Global tslintAlwaysShowAsWarning set to", commander.tslintAlwaysShowAsWarning);
    mtscConfig.tslintAlwaysShowAsWarning = commander.tslintAlwaysShowAsWarning;
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
