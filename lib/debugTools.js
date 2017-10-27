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
    this.DEBUG_MODE = debug;
    debugLog("Debug mode is active");
}
exports.setDebugMode = setDebugMode;
