import * as node_fs from "fs";
import * as node_path from "path";
import { debugLog } from "./debugTools";

export function findNodeModuleExecutable(path: string, moduleName: string) {
    const nodeModulePath = getNodeModulesPath(path);
    const executable = node_path.resolve(nodeModulePath, ".bin", moduleName);
    canExecutePath(executable);
    return executable;
}

function getNodeModulesPath(path: string) {
    const nodeModulesPath = node_path.resolve(getProjectDir(path), "node_modules");
    canAccessPath(nodeModulesPath);
    return nodeModulesPath;
}

function getProjectDir(path: string) {
    canAccessPath(path);
    const pathInfo = node_fs.lstatSync(path);

    debugLog("Deciding what project dir is of", path);
    const projectDir = pathInfo.isDirectory() ? path : node_path.parse(path).dir;

    debugLog("Project dir", projectDir);
    canAccessPath(projectDir);
    return projectDir;
}

export function canAccessPath(path: string) {
    debugLog(`Checking if ${path} exists and can be accessed`);
    node_fs.accessSync(path, node_fs.constants.F_OK & node_fs.constants.R_OK);
}

function canExecutePath(path: string) {
    debugLog(`Checking if ${path} exists and can be executed`);
    node_fs.accessSync(path, node_fs.constants.F_OK & node_fs.constants.X_OK);
}

const runnerOriginPath = node_path.resolve(".") + "/";

export function getRelativePath(absolutePath: string) {
    return absolutePath.startsWith(runnerOriginPath)
        ? absolutePath.substr(runnerOriginPath.length)
        : node_path.resolve(absolutePath).substr(runnerOriginPath.length);
}
