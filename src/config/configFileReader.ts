import * as fs from "fs";
import { debugLog } from "../helpers/debugTools";
import { canAccessPath, findJsonFile } from "../helpers/fileSystemHelpers";
import { isValidArray, isValidBoolean, isValidObject, isValidString } from "../helpers/typeCheckHelpers";
import { MtscConfig, ProjectConfig, TslintCfg } from "./configSpec";

const DEFAULT_CONFIG_NAME = "mtsc.json";

export function findMtscConfig(path?: string): MtscConfig | null {
    if (isValidString(path)) {
        debugLog("Trying to open mtsc config", path);
        const filePath = findJsonFile(path, DEFAULT_CONFIG_NAME);
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    try {
        debugLog("Trying to find default mtsc config", path);
        canAccessPath(DEFAULT_CONFIG_NAME, true);
        return JSON.parse(fs.readFileSync(DEFAULT_CONFIG_NAME, "utf8"));
    } catch {
        debugLog("Cannot find", DEFAULT_CONFIG_NAME);
    }

    return null;
}

export function validateMtscConfig(config: MtscConfig) {
    debugLog("Validating mtsc config...");

    // tslint:disable-next-line:strict-type-predicates
    if (typeof config !== "object") throw new Error("Config isn't an object");

    assertTypeIfDefined("Config.Debug", config.debug, isValidBoolean);
    assertTypeIfDefined("Config.watch", config.watch, isValidBoolean);
    assertTypeIfDefined("Config.noEmit", config.noEmit, isValidBoolean);
    assertTypeIfDefined("Config.compiler", config.compiler, isValidString);
    assertTypeIfDefined("Config.tslintAlwaysShowAsWarning", config.tslintAlwaysShowAsWarning, isValidBoolean);

    if (config.tslint) validateTslintConfig(config.tslint);

    const yarnWorkspaces = assertTypeIfDefined("Config.useYarnWorkspaces", config.useYarnWorkspaces, isValidBoolean);

    if (yarnWorkspaces) {
        assertTypeIfDefined("Config.projects", config.projects, isValidArray);
        config.projects = config.projects || [];
    } else {
        assertType("Config.projects", config.projects, isValidArray);
    }

    config.projects.forEach(validateProjectConfig);

    debugLog("Mtsc config is valid!");
}

export function validateProjectConfig(projectConfig: ProjectConfig) {
    if (isValidString(projectConfig)) {
        return;
    }

    if (!isValidObject(projectConfig)) {
        throw new Error("Project config is neither a valid object or a string");
    }

    assertType("ProjectConfig.path", projectConfig.path, isValidString);
    assertTypeIfDefined("ProjectConfig.compiler", projectConfig.compiler, isValidString);
    assertTypeIfDefined("ProjectConfig.noEmit", projectConfig.noEmit, isValidBoolean);

    if (projectConfig.tslint) validateTslintConfig(projectConfig.tslint);
}

export function validateTslintConfig(tslintConfig: TslintCfg) {
    if (isValidString(tslintConfig) || isValidBoolean(tslintConfig)) {
        return;
    }

    if (!isValidObject(tslintConfig)) {
        throw new Error("Tslint config is neither a valid object, boolean or a string");
    }

    assertTypeIfDefined("Tslint.autofix", tslintConfig.autofix, isValidBoolean);
    assertTypeIfDefined("Tslint.enabled", tslintConfig.enabled, isValidBoolean);
    assertTypeIfDefined("Tslint.rulesFile", tslintConfig.rulesFile, isValidString);
    assertTypeIfDefined("Tslint.tsconfig", tslintConfig.tsconfig, isValidString);
}

function assertTypeIfDefined<T>(description: string, value: T, match: (value: T) => boolean) {
    if (value !== undefined && value !== null && !match(value)) {
        const matchType = match.name.substr("isValid".length);
        throw new Error(`${description} isn't a valid ${matchType}. The given value is: ${value}`);
    }
    return true;
}

function assertType<T>(description: string, value: T, match: (value: T) => boolean) {
    if (!match(value)) {
        const matchType = match.name.substr("isValid".length);
        throw new Error(`${description} isn't a valid ${matchType}. The given value is: ${value}`);
    }
    return true;
}
