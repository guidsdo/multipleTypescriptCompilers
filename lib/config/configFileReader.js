"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const debugTools_1 = require("../helpers/debugTools");
const fileSystemHelpers_1 = require("../helpers/fileSystemHelpers");
const typeCheckHelpers_1 = require("../helpers/typeCheckHelpers");
const TscFormatter_1 = require("../tslint/TscFormatter");
const DEFAULT_CONFIG_NAME = "mtsc.json";
function findMtscConfig(path) {
    if (typeCheckHelpers_1.isValidString(path)) {
        debugTools_1.debugLog("Trying to open mtsc config", path);
        fileSystemHelpers_1.canAccessPath(path);
        return JSON.parse(fs.readFileSync(path, "utf8"));
    }
    try {
        debugTools_1.debugLog("Trying to find default mtsc config", path);
        fileSystemHelpers_1.canAccessPath(DEFAULT_CONFIG_NAME);
        return JSON.parse(fs.readFileSync(DEFAULT_CONFIG_NAME, "utf8"));
    }
    catch (_a) {
        debugTools_1.debugLog("Cannot find", DEFAULT_CONFIG_NAME);
    }
    return null;
}
exports.findMtscConfig = findMtscConfig;
function validateMtscConfig(config) {
    debugTools_1.debugLog("Validating mtsc config...");
    if (typeof config !== "object") {
        throw new Error("Config isn't an object");
    }
    if (config.debug && !typeCheckHelpers_1.isValidBoolean(config.debug)) {
        throw new Error("Debug isn't a boolean");
    }
    if (config.watch && !typeCheckHelpers_1.isValidBoolean(config.watch)) {
        throw new Error("Watch isn't a boolean");
    }
    if (config.compiler && !typeCheckHelpers_1.isValidString(config.compiler)) {
        throw new Error("Compiler isn't a string");
    }
    if (config.tslint)
        validateTslintConfig(config.tslint);
    if (typeCheckHelpers_1.isValidBoolean(config.tslintAlwaysShowAsWarning))
        TscFormatter_1.TscFormatter.alwaysShowRuleFailuresAsWarnings = config.tslintAlwaysShowAsWarning;
    if (typeCheckHelpers_1.isValidArray(config.projects)) {
        config.projects.forEach(validateProjectConfig);
    }
    else {
        throw new Error("Projects isn't an array");
    }
    debugTools_1.debugLog("Mtsc config is valid!");
}
exports.validateMtscConfig = validateMtscConfig;
function validateProjectConfig(projectConfig) {
    if (typeCheckHelpers_1.isValidString(projectConfig)) {
        return;
    }
    if (!typeCheckHelpers_1.isValidObject(projectConfig)) {
        throw new Error("Project config is neither a valid object or a string");
    }
    if (!typeCheckHelpers_1.isValidString(projectConfig.path)) {
        throw new Error("Path is invalid");
    }
    if (projectConfig.compiler && !typeCheckHelpers_1.isValidString(projectConfig.compiler)) {
        throw new Error("Project compiler is invalid");
    }
    if (projectConfig.watch && !typeCheckHelpers_1.isValidBoolean(projectConfig.watch)) {
        throw new Error("Project watch is invalid");
    }
    if (projectConfig.tslint)
        validateTslintConfig(projectConfig.tslint);
}
function validateTslintConfig(tslintConfig) {
    if (typeCheckHelpers_1.isValidString(tslintConfig) || typeCheckHelpers_1.isValidBoolean(tslintConfig)) {
        return;
    }
    if (!typeCheckHelpers_1.isValidObject(tslintConfig)) {
        throw new Error("Tslint config is neither a valid object, boolean or a string");
    }
    if (tslintConfig.autofix && !typeCheckHelpers_1.isValidBoolean(tslintConfig.autofix)) {
        throw new Error("Tslint: autofix is invalid");
    }
    if (tslintConfig.rulesFile && !typeCheckHelpers_1.isValidString(tslintConfig.rulesFile)) {
        throw new Error("Tslint: rules file is invalid");
    }
    if (tslintConfig.tsconfig && !typeCheckHelpers_1.isValidString(tslintConfig.tsconfig)) {
        throw new Error("Tslint: tsconfig is invalid");
    }
}
exports.validateTslintConfig = validateTslintConfig;
