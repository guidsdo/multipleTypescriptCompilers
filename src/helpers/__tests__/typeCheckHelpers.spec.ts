import { isValidArray, isValidObject, isValidString } from "../../helpers/typeCheckHelpers";

describe("typeCheckHelpers", () => {
    describe("isValidArray", () => {
        it("returns true if given a filled array", () => {
            expect(isValidArray(["some text"])).toBe(true);
        });

        it("returns false if given an empty array", () => {
            expect(isValidArray([])).toBe(false);
        });

        it("returns false if given a string", () => {
            expect(isValidArray("some text")).toBe(false);
        });

        it("returns false if given an object", () => {
            expect(isValidArray({ prop: "value" })).toBe(false);
        });
    });

    describe("isValidString", () => {
        it("returns true if given a string", () => {
            expect(isValidString("some text")).toBe(true);
        });

        it("returns false if given an empty string", () => {
            expect(isValidString("")).toBe(false);
        });

        it("returns false if given an array", () => {
            expect(isValidString(["some text"])).toBe(false);
        });

        it("returns false if given an object", () => {
            expect(isValidString({ prop: "value" })).toBe(false);
        });
    });

    describe("isValidObject", () => {
        it("returns true if given an object with properties", () => {
            expect(isValidObject({ prop: "value" })).toBe(true);
        });

        it("returns false if given an empty string", () => {
            expect(isValidObject("")).toBe(false);
        });

        it("returns false if given an array", () => {
            expect(isValidObject(["some text"])).toBe(false);
        });

        it("returns false if given an empty object", () => {
            expect(isValidObject({})).toBe(false);
        });
    });
});
