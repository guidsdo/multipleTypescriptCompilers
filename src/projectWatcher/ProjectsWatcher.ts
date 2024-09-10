import moment from "moment";
import cluster, { Worker } from "node:cluster";

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
    private projectWorkers = new Map<Worker, WorkerInfo>();
    private globalState: ProjectState;

    constructor(private watchMode: boolean) {
        cluster.addListener("message", this.handleWorkerMessage);
        this.globalState = "COMPILING";
    }

    addWorker(projectSettings: ProjectSettings) {
        debugLog("Creating project compiler for", projectSettings.path);

        const workerInfo: WorkerInfo = { projectSettings, projectState: { lastResult: "", projectState: "COMPLETE" } };

        this.projectWorkers.set(cluster.fork({ projectSettings: JSON.stringify(projectSettings) }), workerInfo);
    }

    startCompilations() {
        if (this.watchMode) logMessage(COMPILER_STARTUP);

        const workerInstruction: Instruction = "START";
        for (const [worker] of this.projectWorkers) {
            worker.send(workerInstruction);
        }
    }

    private handleWorkerMessage = (worker: Worker, stateUpdate: StateUpdate) => {
        debugLog(`Worker ${worker.id} says: `, stateUpdate.projectState);
        this.projectWorkers.get(worker)!.projectState = stateUpdate;

        // A project let us know it's compiling. If that's not the case yet, we switch to it
        if (stateUpdate.projectState === "COMPILING" && this.globalState !== "COMPILING") {
            if (this.watchMode) logMessage(COMPILER_BUILDING);

            this.globalState = "COMPILING";
            return debugLog("Global state now: COMPILING");
        }

        // ProjectState from here on is [COMPLETE]
        if (this.globalState !== "COMPILING") {
            // We didn't know that we were apparently [COMPILING]? Let's pretend we did :)
            if (this.watchMode) logMessage(COMPILER_BUILDING);

            this.globalState = "COMPILING";
            debugLog("Global state now: COMPILING");
        }

        const lastResults = this.getLastResults();
        process.stdout.write(this.getLastResults());
        if (this.watchMode) logMessage(COMPILER_DONE);
        this.globalState = "COMPLETE";

        // If could be that another project is still running, so then switch to compiling again
        if (this.getMostActiveWorkerState() === "COMPILING") {
            if (this.watchMode) logMessage(COMPILER_BUILDING);
            this.globalState = "COMPILING";
        }

        debugLog("Global state now: ", this.globalState);

        // If we're not in watch mode and no project indicated it's still compiling, we can exit
        if (!this.watchMode && this.globalState === "COMPLETE") {
            debugLog("Nothing is compiling and not in watch mode, so exit.");
            process.exit(lastResults.length ? 1 : 0);
        }
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
        this.projectWorkers.forEach(({ projectState }) => projectState.lastResult && results.push(projectState.lastResult));
        return results.join("\n");
    }
}

function getTimestamp() {
    return moment().format("HH:mm:ss");
}

function logMessage(message: string) {
    process.stdout.write(`${getTimestamp()} - ${message}\n`);
}
