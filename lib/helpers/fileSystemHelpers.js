"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs = require("fs");
const node_path = require("path");
const debugTools_1 = require("./debugTools");
function findJsonFile(path, fallbackFileName) {
    debugTools_1.debugLog("Find json file in [path] [fallbackFilename]", path + " " + fallbackFileName);
    canAccessPath(path);
    const pathInfo = node_fs.lstatSync(path);
    debugTools_1.debugLog("Deciding if given path is a directory", path);
    if (pathInfo.isDirectory()) {
        const jsonPath = getFileOrDirInPath(path, fallbackFileName);
        canAccessPath(jsonPath);
        debugTools_1.debugLog("Found a json file in given path", jsonPath);
        return jsonPath;
    }
    debugTools_1.debugLog("Deciding if given path is a json file", path);
    if (path.endsWith(".json")) {
        canAccessPath(path);
        debugTools_1.debugLog("Found out that given path is a json file", path);
        return path;
    }
    throw new Error(`No valid json file found for "${path}" or file called "${fallbackFileName}" in it. Use --debug for more info.`);
}
exports.findJsonFile = findJsonFile;
function findNodeModuleExecutable(path, moduleName) {
    const nodeModulePath = getFileOrDirInPath(path, "node_modules");
    const executable = node_path.resolve(nodeModulePath, ".bin", moduleName);
    canExecutePath(executable);
    return executable;
}
exports.findNodeModuleExecutable = findNodeModuleExecutable;
function getFileOrDirInPath(path, fileOrDir) {
    const resolvedPath = node_path.resolve(getProjectDir(path), fileOrDir);
    canAccessPath(resolvedPath);
    return resolvedPath;
}
function getProjectDir(path) {
    canAccessPath(path);
    const pathInfo = node_fs.lstatSync(path);
    debugTools_1.debugLog("Deciding what project dir is of", path);
    const projectDir = pathInfo.isDirectory() ? path : node_path.parse(path).dir;
    debugTools_1.debugLog("Project dir", projectDir);
    canAccessPath(projectDir);
    return projectDir;
}
exports.getProjectDir = getProjectDir;
function canAccessPath(path) {
    debugTools_1.debugLog(`Checking if ${path} exists and can be accessed`);
    node_fs.accessSync(path, node_fs.constants.F_OK & node_fs.constants.R_OK);
}
exports.canAccessPath = canAccessPath;
function canExecutePath(path) {
    debugTools_1.debugLog(`Checking if ${path} exists and can be executed`);
    node_fs.accessSync(path, node_fs.constants.F_OK & node_fs.constants.X_OK);
}
const runnerOriginPath = node_path.resolve(".") + "/";
function getRelativePath(absolutePath) {
    return absolutePath.startsWith(runnerOriginPath)
        ? absolutePath.substr(runnerOriginPath.length)
        : node_path.resolve(absolutePath).substr(runnerOriginPath.length);
}
exports.getRelativePath = getRelativePath;
