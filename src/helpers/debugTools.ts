export let DEBUG_MODE = false;

export function debugLog(message: string, argument?: any) {
    if (DEBUG_MODE) {
        const arg = argument || "";
        const msg = argument ? `${message};` : message;
        console.log(msg, arg);
        console.log();
    }
}

export function setDebugMode(debug: boolean) {
    if (DEBUG_MODE === !!debug) {
        return;
    }

    debugLog("Debug mode is", !!debug);
    DEBUG_MODE = debug;
}
