import { TslintRunnerMock } from "../../tslint/__mocks__/TslintRunnerMock";
import { ExecMockManager } from "../__mocks__/ExecMockManager";

let tslintRunnerMock: TslintRunnerMock;
jest.mock("../../tslint/TslintRunner", () => ({
    TslintRunner: function(tslintArgs: TslintSettings, doneCb: () => void) {
        tslintRunnerMock = new TslintRunnerMock(tslintArgs, doneCb);
        return tslintRunnerMock;
    }
}));

const execMock = new ExecMockManager();
jest.mock("shelljs", () => ({ exec: execMock.fn }));

import { TslintSettings } from "../../tslint/TslintRunner";
import { Project, StateUpdate } from "../Project";

const emptyCb = () => {
    /* Empty */
};

describe("Project", () => {
    let reportedStates: StateUpdate[];
    let reportState: (stateUpdate: StateUpdate) => void;

    beforeEach(() => {
        execMock.reset();

        reportedStates = [];
        reportState = (stateUpdate: StateUpdate) => reportedStates.push(stateUpdate);
    });

    it("instantiates a new tslint runner if tslint settings are passed", () => {
        const tslintSettings = { some: "TslintSettings" } as any;

        createProject({ tslintSettings });

        expect(tslintRunnerMock.calls).toStrictEqual(["constructor"]);
        expect(tslintRunnerMock.tslintArgs).toBe(tslintSettings);
    });

    it("starts with a correct compiler command if all options are given", () => {
        const project = createProject({ compiler: "compiler", watch: true, path: "path", noEmit: true });

        project.processInstruction("START");

        expect(execMock.calls[0]["command"]).toBe("compiler -w --pretty false --preserveWatchOutput -p path");
    });

    it("starts with a correct compiler command if only the necessary options are given", () => {
        const project = createProject({ compiler: "compiler", path: "path" });

        project.processInstruction("START");

        expect(execMock.calls[0].command).toBe("compiler --pretty false --preserveWatchOutput -p path");
    });

    describe("when configured without tslint", () => {
        beforeEach(() => {
            const project = createProject({ compiler: "compiler", path: "path", reportState });
            project.processInstruction("START");
        });

        describe("and has been instructed to start", () => {
            it("reports 'COMPILING' state when the compiler returns any message", () => {
                execMock.eventListeners["data"]("Wow, something has happened!");

                expect(reportedStates.length).toBe(1);
                expect(reportedStates[0].lastResult).toBe("");
                expect(reportedStates[0].projectState).toBe("COMPILING");
            });

            it("reports 'COMPILING' state only once", () => {
                execMock.eventListeners["data"]("Wow, something has happened!");
                execMock.eventListeners["data"]("Wow, something has happened again!");
                execMock.eventListeners["data"]("Wow, something has happened again!");

                expect(reportedStates.length).toBe(1);
                expect(reportedStates[0].lastResult).toBe("");
                expect(reportedStates[0].projectState).toBe("COMPILING");
            });

            it("reports 'COMPLETE' state and the correct messages when compilation has been ended", () => {
                execMock.eventListeners["data"]("Message 1[BREAK]");
                execMock.eventListeners["data"]("Message 2[BREAK]");

                execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");

                expect(reportedStates.length).toBe(2);
                expect(reportedStates[1].lastResult).toBe("Message 1[BREAK]Message 2[BREAK]");
                expect(reportedStates[1].projectState).toBe("COMPLETE");
            });

            it("reports 'COMPLETE' state and the correct messages only once if no new compilation has been started", () => {
                execMock.eventListeners["data"]("Message 1[BREAK]");
                execMock.eventListeners["data"]("Message 2[BREAK]");

                execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");
                execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");
                execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");

                expect(reportedStates.length).toBe(2);
                expect(reportedStates[1].lastResult).toBe("Message 1[BREAK]Message 2[BREAK]");
                expect(reportedStates[1].projectState).toBe("COMPLETE");
            });

            it("reports 'COMPLETE' state without the special start message", () => {
                execMock.eventListeners["data"]("Starting compilation in watch mode...[BREAK]");
                execMock.eventListeners["data"]("Message 1[BREAK]");
                execMock.eventListeners["data"]("Message 2[BREAK]");

                execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");

                expect(reportedStates.length).toBe(2);
                expect(reportedStates[1].lastResult).toBe("Message 1[BREAK]Message 2[BREAK]");
                expect(reportedStates[1].projectState).toBe("COMPLETE");
            });
        });

        describe("and it already compiled once", () => {
            beforeEach(() => {
                execMock.eventListeners["data"]("Starting compilation in watch mode...[BREAK]");
                execMock.eventListeners["data"]("Message 1[BREAK]");
                execMock.eventListeners["data"]("Message 2[BREAK]");
                execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");

                reportedStates = [];
            });

            it("reports 'COMPILING' state when the compiler returns any message", () => {
                execMock.eventListeners["data"]("Message 3[BREAK]");
                execMock.eventListeners["data"]("Message 4[BREAK]");

                expect(reportedStates).toStrictEqual([{ lastResult: "", projectState: "COMPILING" }]);
            });

            it("reports 'COMPLETE' state when the compiler returns the special message with the new result", () => {
                execMock.eventListeners["data"]("Message 3[BREAK]");
                execMock.eventListeners["data"]("Message 4[BREAK]");
                execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");

                expect(reportedStates.length).toBe(2);
                expect(reportedStates[1].lastResult).toBe("Message 3[BREAK]Message 4[BREAK]");
                expect(reportedStates[1].projectState).toBe("COMPLETE");
            });
        });
    });

    describe("with tslint settings", () => {
        beforeEach(() => {
            const tslintSettings = { some: "TslintSettings" } as any;

            const project = createProject({ compiler: "compiler", path: "path", reportState, tslintSettings });
            project.processInstruction("START");
        });

        it("won't call any TslintRunner method before reporting state 'COMPLETE'", () => {
            execMock.eventListeners["data"]("Message 1[BREAK]");
            execMock.eventListeners["data"]("Message 2[BREAK]");

            expect(reportedStates.length).toBe(1);
            expect(tslintRunnerMock.calls).toStrictEqual(["constructor"]);
        });

        it("starts tslint after state 'COMPLETE' and reports 'COMPILING' again", () => {
            execMock.eventListeners["data"]("TscMsg");
            execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");

            expect(tslintRunnerMock.calls).toStrictEqual(["constructor", "startLinting"]);
            expect(reportedStates[2]).toStrictEqual({ lastResult: "TscMsg", projectState: "COMPILING" });
        });

        it("reports 'COMPILING' and keeps the tsc messages while linting", () => {
            execMock.eventListeners["data"]("TscMsg");
            execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");

            tslintRunnerMock._setLastResult("LintMsg");

            expect(tslintRunnerMock.calls).toStrictEqual(["constructor", "startLinting"]);
            expect(reportedStates).toStrictEqual([
                { lastResult: "", projectState: "COMPILING" },
                { lastResult: "TscMsg", projectState: "COMPLETE" },
                { lastResult: "TscMsg", projectState: "COMPILING" }
            ]);
        });

        it("reports 'COMPLETE' and the found lint messages", () => {
            execMock.eventListeners["data"]("TscMsg");
            execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");

            tslintRunnerMock._setLastResult("LintMsg");
            tslintRunnerMock._fireDoneCb();

            expect(tslintRunnerMock.calls).toStrictEqual(["constructor", "startLinting", "getLastResult"]);
            expect(reportedStates).toStrictEqual([
                { lastResult: "", projectState: "COMPILING" },
                { lastResult: "TscMsg", projectState: "COMPLETE" },
                { lastResult: "TscMsg", projectState: "COMPILING" },
                { lastResult: "TscMsg\nLintMsg", projectState: "COMPLETE" }
            ]);
        });

        it("reports 'COMPILING' without the last tslint result when recompiling tsc", () => {
            execMock.eventListeners["data"]("TscMsg");
            execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");

            tslintRunnerMock._setLastResult("LintMsg");
            tslintRunnerMock._fireDoneCb();
            execMock.eventListeners["data"]("Message 2");

            expect(reportedStates).toStrictEqual([
                { lastResult: "", projectState: "COMPILING" },
                { lastResult: "TscMsg", projectState: "COMPLETE" },
                { lastResult: "TscMsg", projectState: "COMPILING" },
                { lastResult: "TscMsg\nLintMsg", projectState: "COMPLETE" },
                { lastResult: "", projectState: "COMPILING" }
            ]);
        });

        it("aborts tslintRunner if new tsc messages come up in the meantime", () => {
            execMock.eventListeners["data"]("TscMsg");
            execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");

            tslintRunnerMock._setLastResult("LintMsg");
            execMock.eventListeners["data"]("Message 2");
            tslintRunnerMock._fireDoneCb();

            expect(tslintRunnerMock.calls).toStrictEqual(["constructor", "startLinting", "abort"]);
            expect(reportedStates).toStrictEqual([
                { lastResult: "", projectState: "COMPILING" },
                { lastResult: "TscMsg", projectState: "COMPLETE" },
                { lastResult: "TscMsg", projectState: "COMPILING" },
                { lastResult: "TscMsg", projectState: "COMPLETE" },
                { lastResult: "", projectState: "COMPILING" }
            ]);
        });

        it("ignores any new messages coming from tslint when compilation has started", () => {
            execMock.eventListeners["data"]("TscMsg");
            execMock.eventListeners["data"]("Compilation complete. Watching for file changes.");

            execMock.eventListeners["data"]("Message 2");
            tslintRunnerMock._setLastResult("LintMsg");
            tslintRunnerMock._fireDoneCb();

            expect(tslintRunnerMock.calls).toStrictEqual(["constructor", "startLinting", "abort"]);
            expect(reportedStates).toStrictEqual([
                { lastResult: "", projectState: "COMPILING" },
                { lastResult: "TscMsg", projectState: "COMPLETE" },
                { lastResult: "TscMsg", projectState: "COMPILING" },
                { lastResult: "TscMsg", projectState: "COMPLETE" },
                { lastResult: "", projectState: "COMPILING" }
            ]);
        });
    });
});

function createProject(args: {
    watch?: boolean;
    path?: string;
    compiler?: string;
    noEmit?: boolean;
    tslintSettings?: TslintSettings;
    reportState?: (stateUpdate: StateUpdate) => void;
}) {
    return new Project(
        { compiler: args.compiler || "", path: args.path || "", watch: !!args.watch, tslint: args.tslintSettings },
        args.reportState || emptyCb
    );
}
