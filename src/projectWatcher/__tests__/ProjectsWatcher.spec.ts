import { ClusterMockManager } from "../__mocks__/ClusterMockManager";
import { StdoutSpy } from "../__mocks__/StdoutSpy";

const clusterMock = new ClusterMockManager();
jest.mock("node:cluster", () => clusterMock);

// Just always let the time be 00:00:00 for testing
jest.mock("moment", () => () => ({ format: () => "00:00:00" }));

import { ProjectsWatcher } from "../ProjectsWatcher";
import { ProjectState } from "../Project";

describe("ProjectsWatcher", () => {
    const stdoutSpy = new StdoutSpy();
    let projectsWatcher: ProjectsWatcher;

    beforeEach(() => {
        projectsWatcher = new ProjectsWatcher(true);
    });

    afterEach(() => {
        clusterMock.reset();
        stdoutSpy.reset();
    });

    describe("constructor", () => {
        it("adds a message listener to the cluster", () => {
            expect(clusterMock.eventListeners["message"].length).toBe(1);
        });

        it("logs that compilation has been startec", () => {
            stdoutSpy.expect("00:00:00 - Starting compilation in watch mode...\n");
        });
    });

    describe("addWorker", () => {
        it("instantiates a new cluster worker without changing the arguments", () => {
            const projectSettings = { property: "value" };

            projectsWatcher.addWorker(projectSettings as any);

            expect(clusterMock.createdForks.size).toBe(1);
            expect(clusterMock.createdForks.get(0)!.projectSettings).toEqual(projectSettings);
            expect(clusterMock.createdForks.get(0)!.receivedInstructions).toEqual([]);
        });
    });

    describe("startCompilations", () => {
        it("sends every worker the 'START' instruction", () => {
            projectsWatcher.addWorker({} as any);
            projectsWatcher.addWorker({} as any);
            projectsWatcher.addWorker({} as any);

            projectsWatcher.startCompilations();

            expect(clusterMock.createdForks.size).toBe(3);
            expect(clusterMock.createdForks.get(0)!.receivedInstructions).toEqual(["START"]);
            expect(clusterMock.createdForks.get(1)!.receivedInstructions).toEqual(["START"]);
            expect(clusterMock.createdForks.get(2)!.receivedInstructions).toEqual(["START"]);
        });
    });

    describe("when multiple projects have been added", () => {
        beforeEach(() => {
            projectsWatcher.addWorker({} as any);
            projectsWatcher.addWorker({} as any);
            projectsWatcher.addWorker({} as any);
            projectsWatcher.addWorker({} as any);
        });

        it("logs the correct results if multiple projects say they're 'COMPLETE'", () => {
            mockWorkerMessage(0, { lastResult: "Project 0", projectState: "COMPLETE" });
            mockWorkerMessage(1, { lastResult: "Project 1", projectState: "COMPLETE" });

            stdoutSpy.expect("00:00:00 - Starting compilation in watch mode...\n");
            stdoutSpy.expect("Project 0");
            stdoutSpy.expect("00:00:00 - Compilation complete. Watching for file changes.\n");
            stdoutSpy.expect("00:00:00 - File change detected. Starting incremental compilation...\n");
            stdoutSpy.expect("Project 0", "Project 1");
            stdoutSpy.expect("00:00:00 - Compilation complete. Watching for file changes.\n");
            stdoutSpy.expectNthTimes();
        });

        it("logs the result when a project says 'COMPILING'", () => {
            mockWorkerMessage(0, { lastResult: "", projectState: "COMPILING" });
            mockWorkerMessage(0, { lastResult: "Project 0", projectState: "COMPLETE" });

            stdoutSpy.expect("00:00:00 - Starting compilation in watch mode...\n");
            stdoutSpy.expect("Project 0");
            stdoutSpy.expect("00:00:00 - Compilation complete. Watching for file changes.\n");
            stdoutSpy.expectNthTimes();
        });

        it("logs the result when a project says 'COMPILING' for the second time", () => {
            mockWorkerMessage(0, { lastResult: "", projectState: "COMPILING" });
            mockWorkerMessage(0, { lastResult: "Project 0 First result", projectState: "COMPLETE" });
            mockWorkerMessage(0, { lastResult: "", projectState: "COMPILING" });
            mockWorkerMessage(0, { lastResult: "Project 0 Second result", projectState: "COMPLETE" });

            stdoutSpy.expect("00:00:00 - Starting compilation in watch mode...\n");
            stdoutSpy.expect("Project 0 First result");
            stdoutSpy.expect("00:00:00 - Compilation complete. Watching for file changes.\n");
            stdoutSpy.expect("00:00:00 - File change detected. Starting incremental compilation...\n");
            stdoutSpy.expect("Project 0 Second result");
            stdoutSpy.expect("00:00:00 - Compilation complete. Watching for file changes.\n");
            stdoutSpy.expectNthTimes();
        });

        it("logs the intermediate result when a project says 'COMPILING' for the second time", () => {
            mockWorkerMessage(0, { lastResult: "", projectState: "COMPILING" });
            mockWorkerMessage(0, { lastResult: "Project 0 Result", projectState: "COMPLETE" });
            mockWorkerMessage(0, { lastResult: "Project 0 Result", projectState: "COMPILING" });
            mockWorkerMessage(0, { lastResult: "Project 0 Result\nProject 0 Extra Result", projectState: "COMPLETE" });

            stdoutSpy.expect("00:00:00 - Starting compilation in watch mode...\n");
            stdoutSpy.expect("Project 0 Result");
            stdoutSpy.expect("00:00:00 - Compilation complete. Watching for file changes.\n");
            stdoutSpy.expect("00:00:00 - File change detected. Starting incremental compilation...\n");
            stdoutSpy.expect("Project 0 Result", "Project 0 Extra Result");
            stdoutSpy.expect("00:00:00 - Compilation complete. Watching for file changes.\n");
            stdoutSpy.expectNthTimes();
        });

        it("logs the intermediate result of projects that are compiling when a project says 'COMPLETE'", () => {
            mockWorkerMessage(0, { lastResult: "", projectState: "COMPILING" });
            mockWorkerMessage(0, { lastResult: "Project 0", projectState: "COMPLETE" });
            mockWorkerMessage(0, { lastResult: "Project 0", projectState: "COMPILING" });
            mockWorkerMessage(1, { lastResult: "", projectState: "COMPILING" });
            mockWorkerMessage(1, { lastResult: "Project 1", projectState: "COMPLETE" });

            stdoutSpy.expect("00:00:00 - Starting compilation in watch mode...\n");
            stdoutSpy.expect("Project 0");
            stdoutSpy.expect("00:00:00 - Compilation complete. Watching for file changes.\n");
            stdoutSpy.expect("00:00:00 - File change detected. Starting incremental compilation...\n");
            stdoutSpy.expect("Project 0", "Project 1");
            stdoutSpy.expect("00:00:00 - Compilation complete. Watching for file changes.\n");
            stdoutSpy.expect("00:00:00 - File change detected. Starting incremental compilation...\n");
            stdoutSpy.expectNthTimes();
        });
    });
});

function mockWorkerMessage(workerId: number, message: { lastResult: string; projectState: ProjectState }) {
    clusterMock.createdForks.get(workerId)!.sendMessageToCluster(message);
}
