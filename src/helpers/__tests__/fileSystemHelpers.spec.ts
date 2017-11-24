import { canAccessPath, findNodeModuleExecutable } from "../fileSystemHelpers";

describe("findNodeModuleExecutable", () => {
    it("finds the node module", () => {
        expect(findNodeModuleExecutable("test_setup/folder_node_modules_present", "tsc")).toMatch(
            /test_setup\/folder_node_modules_present\/node_modules\/.bin\/tsc$/
        );
    });

    it("throws an error when path cannot be accessed", () => {
        expect(() => findNodeModuleExecutable("test_setup/folder_node_modules_missing", "tsc")).toThrowError();
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
