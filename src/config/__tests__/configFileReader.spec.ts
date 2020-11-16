import * as fs from "fs";
import { findMtscConfig, validateMtscConfig, validateProjectConfig } from "../configFileReader";

describe("configReader", () => {
    const mtscConfig = "test_setup/mtsc_configs/mtsc_config.json";
    const defaultContent = "// File will be overwritten by tests";

    afterAll(() => {
        fs.writeFileSync(mtscConfig, defaultContent, "utf8");
    });

    describe("findMtscConfig", () => {
        it("returns the contents of given mtsc config", () => {
            const configContents = { Houi: "nee" };
            fs.writeFileSync(mtscConfig, JSON.stringify({ Houi: "nee" }), "utf8");

            expect(findMtscConfig(mtscConfig)).toEqual(configContents);
        });

        it("returns nothing when default config isn't found", () => {
            expect(findMtscConfig()).toBeFalsy();
        });
    });

    describe("validateMtscConfig", () => {
        it("throws if config isn't an object", () => {
            const configContents = "abc" as any;

            expect(() => validateMtscConfig(configContents)).toThrow("Config isn't an object");
        });

        it("throws if config.debug isn't a boolean", () => {
            expect(() => validateMtscConfig({ debug: 4 } as any)).toThrow("Config.Debug isn't a valid Boolean. The given value is: 4");
        });

        it("throws if config.watch isn't a boolean", () => {
            expect(() => validateMtscConfig({ watch: 4 } as any)).toThrow("Config.watch isn't a valid Boolean. The given value is: 4");
        });

        it("throws if config.noEmit isn't a boolean", () => {
            expect(() => validateMtscConfig({ noEmit: 4 } as any)).toThrow("Config.noEmit isn't a valid Boolean. The given value is: 4");
        });

        it("throws if config.compiler isn't a string", () => {
            expect(() => validateMtscConfig({ compiler: 4 } as any)).toThrow("Config.compiler isn't a valid String. The given value is: 4");
        });

        it("validates the project configs", () => {
            const configContents = { projects: [4] } as any;

            expect(() => validateMtscConfig(configContents)).toThrow("Project config is neither a valid object or a string");
        });
    });

    describe("validateProjectConfig", () => {
        it("allows the config to be a string", () => {
            const configContents = "abc";

            validateProjectConfig(configContents);
        });

        it("throws if config isn't a string nor an object", () => {
            const configContents = 3 as any;

            expect(() => validateProjectConfig(configContents)).toThrow("Project config is neither a valid object or a string");
        });

        it("throws if config.path isn't set", () => {
            const configContents = { "just some property": false } as any;

            expect(() => validateProjectConfig(configContents)).toThrow(
                "ProjectConfig.path isn't a valid String. The given value is: undefined"
            );
        });

        it("throws if config.path isn't a string", () => {
            const configContents = { path: 4 } as any;

            expect(() => validateProjectConfig(configContents)).toThrow("ProjectConfig.path isn't a valid String. The given value is: 4");
        });

        it("throws if config.compiler isn't a string", () => {
            const configContents = { path: "path", compiler: 4 } as any;

            expect(() => validateProjectConfig(configContents)).toThrow(
                "ProjectConfig.compiler isn't a valid String. The given value is: 4"
            );
        });

        it("throws if config.noEmit isn't a boolean", () => {
            const configContents = { path: "path", noEmit: 4 } as any;

            expect(() => validateProjectConfig(configContents)).toThrow(
                "ProjectConfig.noEmit isn't a valid Boolean. The given value is: 4"
            );
        });
    });
});
