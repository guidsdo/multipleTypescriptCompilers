import * as sh from "shelljs";

export class ExecMockManager {
    calls: { command: string; options: sh.ExecOptions }[] = [];
    eventListeners: { [event: string]: (message: string) => void } = {};

    fn = (command: string, options: sh.ExecOptions) => {
        this.calls.push({ command, options });
        return {
            stdout: {
                on: (event: string, callback: (message: string) => void) => (this.eventListeners[event] = callback)
            }
        };
    };

    reset() {
        this.calls = [];
        this.eventListeners = {};
    }
}
