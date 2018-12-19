import { TslintSettings } from "../TslintRunner";

type Callable = "constructor" | "startLinting" | "abort" | "getLastResult";

export class TslintRunnerMock {
    calls: Callable[] = [];
    tslintArgs: TslintSettings;

    private doneCb: () => void;
    private running = false;
    private lastResult = "";

    constructor(tslintArgs: TslintSettings, doneCb: () => void) {
        this.tslintArgs = tslintArgs;
        this.doneCb = doneCb;
        this.calls.push("constructor");
    }

    startLinting() {
        this.calls.push("startLinting");
        this.lastResult = "";
        this.running = true;
    }

    abort() {
        this.calls.push("abort");
        this.running = false;
    }

    getLastResult() {
        this.calls.push("getLastResult");
        return this.lastResult;
    }

    isRunning() {
        return this.running;
    }

    _fireDoneCb() {
        this.running = false;
        this.doneCb();
    }

    _setLastResult(lastResult: string) {
        this.lastResult = lastResult;
    }
}
