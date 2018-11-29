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

        this.projectWorkers.set(cluster.fork({ projectSettings: JSON.stringify(projectSettings) }), workerInfo);
    }

    startCompilations() {
        const workerInstruction: Instruction = "START";
        for (const [worker] of this.projectWorkers) {
            worker.send(workerInstruction);
        }
    }

    handleWorkerMessage = (worker: cluster.Worker, stateUpdate: StateUpdate) => {
        debugLog(`Worker ${worker.id} says: `, stateUpdate.projectState);
        this.projectWorkers.get(worker)!.projectState = stateUpdate;

        debugLog("Global state currently..", this.globalState);

        if (stateUpdate.projectState === "COMPILING") {
            if (this.globalState !== "COMPILING") logMessage(COMPILER_BUILDING);

            this.globalState = "COMPILING";
            debugLog("Global state now: COMPILING");
            return;
        }

        if (stateUpdate.projectState === "COMPLETE") {
            process.stdout.write(this.getLastResults());

            logMessage(COMPILER_DONE);
        }

        const newGlobalState = this.getMostActiveWorkerState();
        if (newGlobalState === "COMPILING") {
            logMessage(COMPILER_BUILDING);
        }

        this.globalState = newGlobalState;
        debugLog("Global state now: ", newGlobalState);
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
    console.log(`${getTimestamp()} - ${message}`);
}
