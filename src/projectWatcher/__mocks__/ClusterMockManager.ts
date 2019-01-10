import { ProjectSettings, Instruction, StateUpdate } from "../Project";

class WorkerMock {
    started = false;
    receivedInstructions: Instruction[] = [];

    constructor(
        public projectSettings: ProjectSettings,
        private clusterMessageCb: (worker: WorkerMock, stateUpdate: StateUpdate) => void
    ) {}

    send(instruction: Instruction) {
        if (instruction !== "START") throw new Error(`Invalid worker instruction '${instruction}'`);

        this.started = true;
        this.receivedInstructions.push(instruction);
    }

    sendMessageToCluster(stateUpdate: StateUpdate) {
        this.clusterMessageCb(this, stateUpdate);
    }
}

export class ClusterMockManager {
    eventListeners: { [event: string]: ((...args: any[]) => void)[] } = {};
    createdForks = new Map<number, WorkerMock>();

    addListener(event: string, listener: () => void) {
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        this.eventListeners[event].push(listener);
    }

    fork(args: string) {
        const parsedInput: { projectSettings: ProjectSettings } = JSON.parse(args);

        const worker = new WorkerMock(parsedInput.projectSettings, this.passWorkerMessageToListeners);
        this.createdForks.set(this.createdForks.size, worker);
        return worker;
    }

    passWorkerMessageToListeners = (worker: WorkerMock, stateUpdate: StateUpdate) => {
        this.eventListeners["message"].forEach(listener => listener(worker, stateUpdate));
    };

    reset() {
        this.createdForks = new Map();
        this.eventListeners = {};
    }
}
