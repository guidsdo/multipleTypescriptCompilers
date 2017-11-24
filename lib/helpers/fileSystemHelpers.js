"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs = require("fs");
const node_path = require("path");
const debugTools_1 = require("./debugTools");
function findNodeModuleExecutable(path, moduleName) {
    const nodeModulePath = getNodeModulesPath(path);
    const executable = node_path.resolve(nodeModulePath, ".bin", moduleName);
    canExecutePath(executable);
    return executable;
}
exports.findNodeModuleExecutable = findNodeModuleExecutable;
function getNodeModulesPath(path) {
    const nodeModulesPath = node_path.resolve(getProjectDir(path), "node_modules");
    canAccessPath(nodeModulesPath);
    return nodeModulesPath;
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
function canAccessPath(path) {
    debugTools_1.debugLog(`Checking if ${path} exists and can be accessed`);
    node_fs.accessSync(path, node_fs.constants.F_OK & node_fs.constants.R_OK);
}
exports.canAccessPath = canAccessPath;
function canExecutePath(path) {
    debugTools_1.debugLog(`Checking if ${path} exists and can be executed`);
    node_fs.accessSync(path, node_fs.constants.F_OK & node_fs.constants.X_OK);
}
