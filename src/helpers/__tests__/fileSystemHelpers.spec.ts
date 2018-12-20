import * as sh from "shelljs";
import * as node_path from "path";

import {
    canAccessPath,
    findNodeModuleExecutable,
    findJsonFile,
    getRelativePath,
    getProjectDir
} from "../fileSystemHelpers";

const TEST_FOLDER_NODE_MODULES_PRESENT = "test_setup/folder_node_modules_present";
const TEST_FOLDER_NODE_MODULES_MISSING = "test_setup/folder_node_modules_missing";

const TEST_FOLDER_TSCONFIG_PRESENT = "test_setup/folder_tsconfig_present";
const TEST_FOLDER_TSCONFIG_MISSING = "test_setup/folder_tsconfig_missing";

describe("fileSystemHelpers", () => {
    describe("findNodeModuleExecutable", () => {
        it("finds the node module", async () => {
            sh.mkdir("-p", `${TEST_FOLDER_NODE_MODULES_PRESENT}/node_modules/.bin`);
            sh.touch(`${TEST_FOLDER_NODE_MODULES_PRESENT}/node_modules/.bin/tsc`);

            expect(findNodeModuleExecutable(TEST_FOLDER_NODE_MODULES_PRESENT, "tsc")).toMatch(
                /test_setup\/folder_node_modules_present\/node_modules\/.bin\/tsc$/
            );
        });

        it("throws an error when path cannot be accessed", () => {
            expect(() => findNodeModuleExecutable(TEST_FOLDER_NODE_MODULES_MISSING, "tsc")).toThrowError(
                "ENOENT: no such file or directory, access 'test_setup/folder_node_modules_missing'"
            );
        });
    });

    describe("canAccessPath", () => {
        it("does nothing when path can be accessed", () => {
            expect(() => canAccessPath(`${TEST_FOLDER_TSCONFIG_MISSING}/tsconfig.json`, false)).toBeTruthy();
        });

        it("throws an error when path cannot be accessed", () => {
            expect(() => canAccessPath("fake_path", false)).toThrow(
                "ENOENT: no such file or directory, access 'fake_path'"
            );
        });

        it("throws an error when directory can be accessed but it should be a file", () => {
            expect(() => canAccessPath(`${TEST_FOLDER_TSCONFIG_MISSING}/tsconfig.json`, true)).toThrowError(
                "Path 'test_setup/folder_tsconfig_missing/tsconfig.json' is not a file"
            );
        });
    });

    describe("findJsonFile", () => {
        it("finds file when given path is a file", () => {
            expect(findJsonFile(`${TEST_FOLDER_TSCONFIG_PRESENT}/tsconfig.json`, "blabla.json")).toContain(
                `${TEST_FOLDER_TSCONFIG_PRESENT}/tsconfig.json`
            );
        });

        it("finds file when given path is a directory", () => {
            expect(findJsonFile(TEST_FOLDER_TSCONFIG_PRESENT, "tsconfig.json")).toContain(
                `${TEST_FOLDER_TSCONFIG_PRESENT}/tsconfig.json`
            );
        });

        it("fails when given path does not exist", () => {
            expect(() => findJsonFile("i/dont/exist", "tsconfig.json")).toThrowError();
        });

        it("fails when given path exists but fallback-file could be found", () => {
            expect(() => findJsonFile(TEST_FOLDER_TSCONFIG_MISSING, "tsconfig.json")).toThrowError();
        });

        it("fails when given path is an existing non-json file", () => {
            expect(() => findJsonFile(`${TEST_FOLDER_TSCONFIG_MISSING}/nonjsonfile`, "tsconfig.json")).toThrowError();
        });
    });

    describe("getRelativePath", () => {
        const runnerOriginPath = node_path.resolve(".") + "/";

        it("returns the relative path if an absolute path is given", () => {
            expect(getRelativePath(runnerOriginPath + TEST_FOLDER_TSCONFIG_PRESENT)).toBe(TEST_FOLDER_TSCONFIG_PRESENT);
        });

        it("returns the relative path if a partly relative path is given", () => {
            expect(getRelativePath("../multipleTypescriptCompilers/" + TEST_FOLDER_TSCONFIG_PRESENT)).toBe(
                TEST_FOLDER_TSCONFIG_PRESENT
            );
        });
    });

    describe("getProjectDir", () => {
        it("returns the path of the project if a file is given", () => {
            expect(getProjectDir(`${TEST_FOLDER_TSCONFIG_PRESENT}/tsconfig.json`)).toBe(TEST_FOLDER_TSCONFIG_PRESENT);
        });

        it("returns the path of the project if a directory is given", () => {
            expect(getProjectDir(TEST_FOLDER_TSCONFIG_PRESENT)).toBe(TEST_FOLDER_TSCONFIG_PRESENT);
        });
    });
});
