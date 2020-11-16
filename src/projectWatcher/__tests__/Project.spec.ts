import { ExecMockManager } from "../__mocks__/ExecMockManager";

const execMock = new ExecMockManager();
jest.mock("shelljs", () => ({ exec: execMock.fn }));

import { Project, StateUpdate, Instruction } from "../Project";

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

    it("doesn't start if 'processInstruction' is called with something other than 'START'", () => {
        const project = createProject({ compiler: "compiler", path: "path" });

        project.processInstruction("SOMETHINGELSE" as Instruction);

        expect(execMock.calls.length).toBe(0);
    });

    describe("when configured", () => {
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

            it("reports 'COMPILING' state when the compiler returns an empty message", () => {
                execMock.eventListeners["data"]("");

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
});

function createProject(args: {
    watch?: boolean;
    path?: string;
    compiler?: string;
    noEmit?: boolean;
    reportState?: (stateUpdate: StateUpdate) => void;
}) {
    return new Project({ compiler: args.compiler || "", path: args.path || "", watch: !!args.watch }, args.reportState || emptyCb);
}
