import * as fs from "fs";
import { debugLog } from "../helpers/debugTools";
import { canAccessPath } from "../helpers/fileSystemHelpers";
import { isValidArray, isValidBoolean, isValidObject, isValidString } from "../helpers/typeCheckHelpers";
import { MtscConfig, ProjectConfig } from "./configSpec";

const DEFAULT_CONFIG_NAME = "mtsc.json";

export function findMtscConfig(path?: string): MtscConfig | null {
    if (path) {
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
    if (typeof config !== "object") {
        throw new Error("Config isn't an object");
    }

    if (config.debug && !isValidBoolean(config.debug)) {
        throw new Error("Debug isn't a boolean");
    }

    if (config.watch && !isValidBoolean(config.watch)) {
        throw new Error("Watch isn't a boolean");
    }

    if (config.compiler && !isValidString(config.compiler)) {
        throw new Error("Compiler isn't a string");
    }

    if (isValidArray(config.projects)) {
        config.projects.forEach(validateProjectConfig);
    } else {
        throw new Error("Projects isn't an array");
    }
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

    if (projectConfig.watch && !isValidBoolean(projectConfig.watch)) {
        throw new Error("Project watch is invalid");
    }
}
