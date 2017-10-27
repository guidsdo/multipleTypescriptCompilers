export let DEBUG_MODE = false;

export function debugLog(message: string, argument?: any) {
    if (DEBUG_MODE) {
        argument = argument || "";
        message = argument ? `${message};` : message;
        console.log(message, argument);
        console.log();
    }
}

export function setDebugMode(debug: boolean) {
    this.DEBUG_MODE = debug;
    debugLog("Debug mode is active");
}
