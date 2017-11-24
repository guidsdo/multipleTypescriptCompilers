"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
/**
 * Returns if variable is a non-empty string
 * @param variable the to be tested variable
 */
function isValidString(variable) {
    return !!variable && util_1.isString(variable);
}
exports.isValidString = isValidString;
/**
 * Returns if variable is an array with contents
 * @param variable the to be tested variable
 */
function isValidArray(variable) {
    return !!variable && util_1.isArray(variable) && variable.length > 0;
}
exports.isValidArray = isValidArray;
/**
 * Returns if variable is an object with properties
 * @param variable the to be tested variable
 */
function isValidObject(variable) {
    return (!!variable && util_1.isObject(variable) && Object.getOwnPropertyNames(variable).length > 0 && !isValidArray(variable));
}
exports.isValidObject = isValidObject;
/**
 * Returns if variable is a boolean
 * @param variable the to be tested variable
 */
function isValidBoolean(variable) {
    return util_1.isBoolean(variable) && typeof variable === "boolean";
}
exports.isValidBoolean = isValidBoolean;
