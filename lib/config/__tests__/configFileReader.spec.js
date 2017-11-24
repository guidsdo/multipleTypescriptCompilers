"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const configFileReader_1 = require("../configFileReader");
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
            expect(configFileReader_1.findMtscConfig(mtscConfig)).toEqual(configContents);
        });
        it("returns nothing when default config isn't found", () => {
            expect(configFileReader_1.findMtscConfig()).toBeFalsy();
        });
    });
    describe("validateMtscConfig", () => {
        it("validates if mtsc config is an object", () => {
            const configContents = "bla bla";
            expect(() => configFileReader_1.validateMtscConfig(configContents)).toThrow("Config isn't an object");
        });
        it("validates if compiler is a string or null", () => {
            expect(() => configFileReader_1.validateMtscConfig({ compiler: 4 })).toThrow("Compiler isn't a string");
            expect(configFileReader_1.validateMtscConfig({ projects: ["."] })).toBeFalsy();
        });
        it("validates if projects content is not an empty object", () => {
            expect(() => configFileReader_1.validateMtscConfig({ projects: [{}] })).toThrow("Project config is neither a valid object or a string");
            expect(configFileReader_1.validateMtscConfig({ projects: [{ path: "blabla" }] })).toBeFalsy();
        });
        it("validates if projects content is not an empty string", () => {
            expect(() => configFileReader_1.validateMtscConfig({ projects: [""] })).toThrow("Project config is neither a valid object or a string");
            expect(configFileReader_1.validateMtscConfig({ projects: ["path"] })).toBeFalsy();
        });
    });
});
