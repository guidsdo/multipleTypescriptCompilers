"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEBUG_MODE = false;
function debugLog(message, argument) {
    if (exports.DEBUG_MODE) {
        argument = argument || "";
        message = argument ? `${message};` : message;
        console.log(message, argument);
        console.log();
    }
}
exports.debugLog = debugLog;
function setDebugMode(debug) {
    if (exports.DEBUG_MODE === !!debug) {
        return;
    }
    debugLog("Debug mode is", !!debug);
    exports.DEBUG_MODE = debug;
}
exports.setDebugMode = setDebugMode;
