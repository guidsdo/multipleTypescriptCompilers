import * as moment from "moment";
import * as cluster from "cluster";

import { debugLog } from "../helpers/debugTools";
import { ProjectSettings, ProjectState, Instruction, StateUpdate } from "./Project";

const COMPILER_STARTUP = "Starting compilation in watch mode...";
const COMPILER_DONE = "Compilation complete. Watching for file changes.";
const COMPILER_BUILDING = "File change detected. Starting incremental compilation...";

type WorkerInfo = {
    projectSettings: ProjectSettings;
    projectState: StateUpdate;
};

export class ProjectsWatcher {
    private projectWorkers = new Map<cluster.Worker, WorkerInfo>();
    private globalState: ProjectState;

    constructor() {
        cluster.addListener("message", this.handleWorkerMessage);
        this.globalState = "COMPILING";
        logMessage(COMPILER_STARTUP);
    }

    addWorker(projectSettings: ProjectSettings) {
        debugLog("Creating project compiler for", projectSettings.path);

        const workerInfo: WorkerInfo = { projectSettings, projectState: { lastResult: "", projectState: "COMPLETE" } };

        this.projectWorkers.set(cluster.fork(JSON.stringify({ projectSettings: projectSettings })), workerInfo);
    }

    startCompilations() {
        const workerInstruction: Instruction = "START";
        for (const [worker] of this.projectWorkers) {
            worker.send(workerInstruction);
        }
    }

    private handleWorkerMessage = (worker: cluster.Worker, stateUpdate: StateUpdate) => {
        debugLog(`Worker ${worker.id} says: `, stateUpdate.projectState);
        this.projectWorkers.get(worker)!.projectState = stateUpdate;

        if (stateUpdate.projectState === "COMPILING") {
            if (this.globalState !== "COMPILING") logMessage(COMPILER_BUILDING);

            this.globalState = "COMPILING";
            debugLog("Global state now: COMPILING");
            return;
        }

        // ProjectState from here on is [COMPLETE]
        if (this.globalState !== "COMPILING") {
            // We didn't know that we were apparently [COMPILING]? Let's pretend we did :)
            logMessage(COMPILER_BUILDING);
            this.globalState = "COMPILING";
            debugLog("Global state now: COMPILING");
        }

        process.stdout.write(this.getLastResults());
        logMessage(COMPILER_DONE);
        this.globalState = "COMPLETE";

        if (this.getMostActiveWorkerState() === "COMPILING") {
            // Some project is still [COMPILING]?
            logMessage(COMPILER_BUILDING);
            this.globalState = "COMPILING";
        }

        debugLog("Global state now: ", this.globalState);
    };

    private getMostActiveWorkerState(): ProjectState {
        for (const [, workerInfo] of this.projectWorkers) {
            const workerState = workerInfo.projectState;
            if (workerState.projectState === "COMPILING") return "COMPILING";
        }

        return "COMPLETE";
    }

    private getLastResults() {
        const results: string[] = [];
        this.projectWorkers.forEach(
            ({ projectState }) => projectState.lastResult && results.push(projectState.lastResult)
        );
        return results.join("\n");
    }
}

function getTimestamp() {
    return moment().format("HH:mm:ss");
}

function logMessage(message: string) {
    process.stdout.write(`${getTimestamp()} - ${message}\n`);
}
