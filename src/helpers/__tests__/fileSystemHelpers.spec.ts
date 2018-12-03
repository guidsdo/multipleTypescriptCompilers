import * as sh from "shelljs";

import { canAccessPath, findNodeModuleExecutable } from "../fileSystemHelpers";

const TEST_FOLDER_NODE_MODULES_PRESENT = "test_setup/folder_node_modules_present";
const TEST_FOLDER_NODE_MODULES_MISSING = "test_setup/folder_node_modules_missing";

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
            expect(() => findNodeModuleExecutable(TEST_FOLDER_NODE_MODULES_MISSING, "tsc")).toThrowError();
        });
    });

    describe("canAccessPath", () => {
        it("does nothing when path can be accessed", () => {
            expect(() => canAccessPath(".")).toBeTruthy();
        });

        it("throws an error when path cannot be accessed", () => {
            expect(() => canAccessPath("fake_path")).toThrow("ENOENT: no such file or directory, access 'fake_path'");
        });
    });
});
