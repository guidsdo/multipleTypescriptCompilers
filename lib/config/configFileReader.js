"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const debugTools_1 = require("../helpers/debugTools");
const fileSystemHelpers_1 = require("../helpers/fileSystemHelpers");
const typeCheckHelpers_1 = require("../helpers/typeCheckHelpers");
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
    if (typeCheckHelpers_1.isValidArray(config.projects)) {
        config.projects.forEach(validateProjectConfig);
    }
    else {
        throw new Error("Projects isn't an array");
    }
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
}
