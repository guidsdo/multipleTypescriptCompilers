import * as fs from "fs";
import { debugLog } from "../helpers/debugTools";
import { canAccessPath } from "../helpers/fileSystemHelpers";
import { isValidArray, isValidBoolean, isValidObject, isValidString } from "../helpers/typeCheckHelpers";
import { TscFormatter } from "../tslint/TscFormatter";
import { MtscConfig, ProjectConfig, TslintCfg } from "./configSpec";

const DEFAULT_CONFIG_NAME = "mtsc.json";

export function findMtscConfig(path?: string): MtscConfig | null {
    if (isValidString(path)) {
        debugLog("Trying to open mtsc config", path);
        canAccessPath(path);
        return JSON.parse(fs.readFileSync(path, "utf8"));
    }

    try {
        debugLog("Trying to find default mtsc config", path);
        canAccessPath(DEFAULT_CONFIG_NAME);
        return JSON.parse(fs.readFileSync(DEFAULT_CONFIG_NAME, "utf8"));
    } catch {
        debugLog("Cannot find", DEFAULT_CONFIG_NAME);
    }

    return null;
}

export function validateMtscConfig(config: MtscConfig) {
    debugLog("Validating mtsc config...");

    if (typeof config !== "object") {
        throw new Error("Config isn't an object");
    }

    if (config.debug && !isValidBoolean(config.debug)) {
        throw new Error("Debug isn't a boolean");
    }

    if (config.watch && !isValidBoolean(config.watch)) {
        throw new Error("Watch isn't a boolean");
    }

    if (config.preserveWatchOutput && !isValidBoolean(config.preserveWatchOutput)) {
        throw new Error("PreserveWatchOutput isn't a boolean");
    }

    if (config.compiler && !isValidString(config.compiler)) {
        throw new Error("Compiler isn't a string");
    }

    if (config.noEmit && !isValidBoolean(config.compiler)) {
        throw new Error("NoEmit isn't a valid boolean");
    }

    if (config.tslint) validateTslintConfig(config.tslint);
    if (isValidBoolean(config.tslintAlwaysShowAsWarning))
        TscFormatter.alwaysShowRuleFailuresAsWarnings = config.tslintAlwaysShowAsWarning;

    if (isValidArray(config.projects)) {
        config.projects.forEach(validateProjectConfig);
    } else {
        throw new Error("Projects isn't an array");
    }

    debugLog("Mtsc config is valid!");
}

function validateProjectConfig(projectConfig: ProjectConfig) {
    if (isValidString(projectConfig)) {
        return;
    }

    if (!isValidObject(projectConfig)) {
        throw new Error("Project config is neither a valid object or a string");
    }

    if (!isValidString(projectConfig.path)) {
        throw new Error("Path is invalid");
    }

    if (projectConfig.compiler && !isValidString(projectConfig.compiler)) {
        throw new Error("Project compiler is invalid");
    }

    if (projectConfig.noEmit && !isValidBoolean(projectConfig.compiler)) {
        throw new Error("NoEmit isn't a valid boolean");
    }

    if (projectConfig.tslint) validateTslintConfig(projectConfig.tslint);
}

export function validateTslintConfig(tslintConfig: TslintCfg) {
    if (isValidString(tslintConfig) || isValidBoolean(tslintConfig)) {
        return;
    }

    if (!isValidObject(tslintConfig)) {
        throw new Error("Tslint config is neither a valid object, boolean or a string");
    }

    if (tslintConfig.autofix && !isValidBoolean(tslintConfig.autofix)) {
        throw new Error("Tslint: autofix is invalid");
    }

    if (tslintConfig.rulesFile && !isValidString(tslintConfig.rulesFile)) {
        throw new Error("Tslint: rules file is invalid");
    }

    if (tslintConfig.tsconfig && !isValidString(tslintConfig.tsconfig)) {
        throw new Error("Tslint: tsconfig is invalid");
    }
}
