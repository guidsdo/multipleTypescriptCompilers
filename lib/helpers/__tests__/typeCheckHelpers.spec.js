"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeCheckHelpers_1 = require("../../helpers/typeCheckHelpers");
describe("typeCheckHelpers", () => {
    describe("isValidArray", () => {
        it("returns true if given a filled array", () => {
            expect(typeCheckHelpers_1.isValidArray(["some text"])).toBe(true);
        });
        it("returns false if given an empty array", () => {
            expect(typeCheckHelpers_1.isValidArray([])).toBe(false);
        });
        it("returns false if given a string", () => {
            expect(typeCheckHelpers_1.isValidArray("some text")).toBe(false);
        });
        it("returns false if given an object", () => {
            expect(typeCheckHelpers_1.isValidArray({ prop: "value" })).toBe(false);
        });
    });
    describe("isValidString", () => {
        it("returns true if given a string", () => {
            expect(typeCheckHelpers_1.isValidString("some text")).toBe(true);
        });
        it("returns false if given an empty string", () => {
            expect(typeCheckHelpers_1.isValidString("")).toBe(false);
        });
        it("returns false if given an array", () => {
            expect(typeCheckHelpers_1.isValidString(["some text"])).toBe(false);
        });
        it("returns false if given an object", () => {
            expect(typeCheckHelpers_1.isValidString({ prop: "value" })).toBe(false);
        });
    });
    describe("isValidObject", () => {
        it("returns true if given an object with properties", () => {
            expect(typeCheckHelpers_1.isValidObject({ prop: "value" })).toBe(true);
        });
        it("returns false if given an empty string", () => {
            expect(typeCheckHelpers_1.isValidObject("")).toBe(false);
        });
        it("returns false if given an array", () => {
            expect(typeCheckHelpers_1.isValidObject(["some text"])).toBe(false);
        });
        it("returns false if given an empty object", () => {
            expect(typeCheckHelpers_1.isValidObject({})).toBe(false);
        });
    });
});
