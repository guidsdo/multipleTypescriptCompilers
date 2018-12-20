import { debugLog, setDebugMode } from "../debugTools";

describe("debugTools", () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(global.console, "log");
    });

    describe("debugLog", () => {
        it("doesn't log stuff by default", () => {
            debugLog("Message", "Extra arg");

            expect(consoleSpy).toBeCalledTimes(0);
        });

        it("logs when 'setDebugMode` has been called with 'true'", () => {
            setDebugMode(true);
            debugLog("Message");

            expect(consoleSpy).toBeCalledWith("Message", "");
        });

        it("places a ';' between the message and the argument", () => {
            setDebugMode(true);
            debugLog("Message", "argument");

            expect(consoleSpy).toBeCalledWith("Message;", "argument");
        });
    });
});
