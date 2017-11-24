import * as fs from "fs";
import { findMtscConfig, validateMtscConfig } from "../configFileReader";

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
        it("validates if mtsc config is an object", () => {
            const configContents = "bla bla" as any;

            expect(() => validateMtscConfig(configContents)).toThrow("Config isn't an object");
        });

        it("validates if compiler is a string or null", () => {
            expect(() => validateMtscConfig({ compiler: 4 } as any)).toThrow("Compiler isn't a string");

            expect(validateMtscConfig({ projects: ["."] } as any)).toBeFalsy();
        });

        it("validates if projects content is not an empty object", () => {
            expect(() => validateMtscConfig({ projects: [{}] } as any)).toThrow(
                "Project config is neither a valid object or a string"
            );

            expect(validateMtscConfig({ projects: [{ path: "blabla" }] } as any)).toBeFalsy();
        });

        it("validates if projects content is not an empty string", () => {
            expect(() => validateMtscConfig({ projects: [""] } as any)).toThrow(
                "Project config is neither a valid object or a string"
            );

            expect(validateMtscConfig({ projects: ["path"] } as any)).toBeFalsy();
        });
    });
});
