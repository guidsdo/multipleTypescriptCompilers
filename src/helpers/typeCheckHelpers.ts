/**
 * Returns if variable is a non-empty string
 * @param variable the to be tested variable
 */
export function isValidString(variable: any): variable is string {
    return !!variable && typeof variable === "string";
}

/**
 * Returns if variable is an array with contents
 * @param variable the to be tested variable
 */
export function isValidArray(variable: any): variable is any[] {
    return !!variable && Array.isArray(variable) && variable.length > 0;
}

/**
 * Returns if variable is an object with properties
 * @param variable the to be tested variable
 */
export function isValidObject(variable: any): variable is Object {
    return !!variable && typeof variable === "object" && Object.getOwnPropertyNames(variable).length > 0 && !isValidArray(variable);
}

/**
 * Returns if variable is a boolean
 * @param variable the to be tested variable
 */
export function isValidBoolean(variable: any): variable is boolean {
    return typeof variable === "boolean";
}
