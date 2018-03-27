import * as node_fs from "fs";
import * as node_path from "path";
import { debugLog } from "./debugTools";

export function findJsonFile(path: string, fallbackFileName: string) {
    debugLog("Find json file in [path] [fallbackFilename]", `${path} ${fallbackFileName}`);
    canAccessPath(path);
    const pathInfo = node_fs.lstatSync(path);

    debugLog("Deciding if given path is a directory", path);
    if (pathInfo.isDirectory()) {
        const jsonPath = getFileOrDirInPath(path, fallbackFileName);
        canAccessPath(jsonPath);

        debugLog("Found a json file in given path", jsonPath);
        return jsonPath;
    }

    debugLog("Deciding if given path is a json file", path);
    if (path.endsWith(".json")) {
        canAccessPath(path);
        debugLog("Found out that given path is a json file", path);
        return path;
    }

    throw new Error(
        `No valid json file found for "${path}" or file called "${fallbackFileName}" in it. Use --debug for more info.`
    );
}

export function findNodeModuleExecutable(path: string, moduleName: string) {
    const nodeModulePath = getFileOrDirInPath(path, "node_modules");
    const executable = node_path.resolve(nodeModulePath, ".bin", moduleName);
    canExecutePath(executable);
    return executable;
}

function getFileOrDirInPath(path: string, fileOrDir: string) {
    const resolvedPath = node_path.resolve(getProjectDir(path), fileOrDir);
    canAccessPath(resolvedPath);
    return resolvedPath;
}

export function getProjectDir(path: string) {
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
    // tslint:disable-next-line:no-bitwise
    node_fs.accessSync(path, node_fs.constants.F_OK & node_fs.constants.R_OK);
}

function canExecutePath(path: string) {
    debugLog(`Checking if ${path} exists and can be executed`);
    // tslint:disable-next-line:no-bitwise
    node_fs.accessSync(path, node_fs.constants.F_OK & node_fs.constants.X_OK);
}

const runnerOriginPath = node_path.resolve(".") + "/";

export function getRelativePath(absolutePath: string) {
    return absolutePath.startsWith(runnerOriginPath)
        ? absolutePath.substr(runnerOriginPath.length)
        : node_path.resolve(absolutePath).substr(runnerOriginPath.length);
}
