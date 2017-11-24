"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fileSystemHelpers_1 = require("../fileSystemHelpers");
describe("findNodeModuleExecutable", () => {
    it("finds the node module", () => {
        expect(fileSystemHelpers_1.findNodeModuleExecutable("test_setup/folder_node_modules_present", "tsc")).toMatch(/test_setup\/folder_node_modules_present\/node_modules\/.bin\/tsc$/);
    });
    it("throws an error when path cannot be accessed", () => {
        expect(() => fileSystemHelpers_1.findNodeModuleExecutable("test_setup/folder_node_modules_missing", "tsc")).toThrowError();
    });
});
describe("canAccessPath", () => {
    it("does nothing when path can be accessed", () => {
        expect(() => fileSystemHelpers_1.canAccessPath(".")).toBeTruthy();
    });
    it("throws an error when path cannot be accessed", () => {
        expect(() => fileSystemHelpers_1.canAccessPath("fake_path")).toThrow("ENOENT: no such file or directory, access 'fake_path'");
    });
});
