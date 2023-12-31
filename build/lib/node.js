"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuleRootSync = exports.deepFreeze = exports.getObjectId = exports.getObjectSize = exports.requirePackage = void 0;
const system_1 = require("./system");
const logger_1 = __importDefault(require("./logger"));
const lodash_1 = __importDefault(require("lodash"));
const ait_process_1 = require("ait-process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const ECMA_SIZES = Object.freeze({
    STRING: 2,
    BOOLEAN: 4,
    NUMBER: 8,
});
/**
 * Internal utility to link global package to local context
 *
 * @param {string} packageName - name of the package to link
 * @throws {Error} If the command fails
 */
async function linkGlobalPackage(packageName) {
    try {
        logger_1.default.debug(`Linking package '${packageName}'`);
        const cmd = (0, system_1.isWindows)() ? 'npm.cmd' : 'npm';
        await (0, ait_process_1.exec)(cmd, ['link', packageName], { timeout: 20000 });
    }
    catch (err) {
        const msg = `Unable to load package '${packageName}', linking failed: ${err.message}`;
        logger_1.default.debug(msg);
        if (err.stderr) {
            // log the stderr if there, but do not add to thrown error as it is
            // _very_ verbose
            logger_1.default.debug(err.stderr);
        }
        throw new Error(msg);
    }
}
/**
 * Utility function to extend node functionality, allowing us to require
 * modules that are installed globally. If the package cannot be required,
 * this will attempt to link the package and then re-require it
 *
 * @param {string} packageName - the name of the package to be required
 * @returns {Promise<unknown>} - the package object
 * @throws {Error} If the package is not found locally or globally
 */
async function requirePackage(packageName) {
    // first, get it in the normal way (see https://nodejs.org/api/modules.html#modules_all_together)
    try {
        logger_1.default.debug(`Loading local package '${packageName}'`);
        return require(packageName);
    }
    catch (err) {
        logger_1.default.debug(`Failed to load local package '${packageName}': ${err.message}`);
    }
    // second, get it from where it ought to be in the global node_modules
    try {
        const globalPackageName = path_1.default.resolve(process.env.npm_config_prefix ?? '', 'lib', 'node_modules', packageName);
        logger_1.default.debug(`Loading global package '${globalPackageName}'`);
        return require(globalPackageName);
    }
    catch (err) {
        logger_1.default.debug(`Failed to load global package '${packageName}': ${err.message}`);
    }
    // third, link the file and get locally
    try {
        await linkGlobalPackage(packageName);
        logger_1.default.debug(`Retrying load of linked package '${packageName}'`);
        return require(packageName);
    }
    catch (err) {
        logger_1.default.errorAndThrow(`Unable to load package '${packageName}': ${err.message}`);
    }
}
exports.requirePackage = requirePackage;
function extractAllProperties(obj) {
    const stringProperties = [];
    for (const prop in obj) {
        stringProperties.push(prop);
    }
    if (lodash_1.default.isFunction(Object.getOwnPropertySymbols)) {
        stringProperties.push(...Object.getOwnPropertySymbols(obj));
    }
    return stringProperties;
}
function _getSizeOfObject(seen, object) {
    if (lodash_1.default.isNil(object)) {
        return 0;
    }
    let bytes = 0;
    const properties = extractAllProperties(object);
    for (const key of properties) {
        // Do not recalculate circular references
        if (typeof object[key] === 'object' && !lodash_1.default.isNil(object[key])) {
            if (seen.has(object[key])) {
                continue;
            }
            seen.add(object[key]);
        }
        bytes += getCalculator(seen)(key);
        try {
            bytes += getCalculator(seen)(object[key]);
        }
        catch (ex) {
            if (ex instanceof RangeError) {
                // circular reference detected, final result might be incorrect
                // let's be nice and not throw an exception
                bytes = 0;
            }
        }
    }
    return bytes;
}
function getCalculator(seen) {
    return function calculator(obj) {
        if (lodash_1.default.isBuffer(obj)) {
            return obj.length;
        }
        switch (typeof obj) {
            case 'string':
                return obj.length * ECMA_SIZES.STRING;
            case 'boolean':
                return ECMA_SIZES.BOOLEAN;
            case 'number':
                return ECMA_SIZES.NUMBER;
            case 'symbol':
                return lodash_1.default.isFunction(Symbol.keyFor) && Symbol.keyFor(obj)
                    ? /** @type {string} */ (Symbol.keyFor(obj)).length * ECMA_SIZES.STRING
                    : (obj.toString().length - 8) * ECMA_SIZES.STRING;
            case 'object':
                return lodash_1.default.isArray(obj)
                    ? obj.map(getCalculator(seen)).reduce((acc, curr) => acc + curr, 0)
                    : _getSizeOfObject(seen, obj);
            default:
                return 0;
        }
    };
}
/**
 * Calculate the in-depth size in memory of the provided object.
 * The original implementation is borrowed from https://github.com/miktam/sizeof.
 *
 * @param {*} obj An object whose size should be calculated
 * @returns {number} Object size in bytes.
 */
function getObjectSize(obj) {
    return getCalculator(new WeakSet())(obj);
}
exports.getObjectSize = getObjectSize;
const OBJECTS_MAPPING = new WeakMap();
/**
 * Calculates a unique object identifier
 *
 * @param {object} object Any valid ECMA object
 * @returns {string} A uuidV4 string that uniquely identifies given object
 */
function getObjectId(object) {
    if (!OBJECTS_MAPPING.has(object)) {
        OBJECTS_MAPPING.set(object, (0, uuid_1.v4)());
    }
    return OBJECTS_MAPPING.get(object);
}
exports.getObjectId = getObjectId;
/**
 * Perform deep freeze of the given object (e. g.
 * all nested objects also become immutable).
 * If the passed object is of a plain type
 * then no change is done and the same object
 * is returned.
 * ! This function changes the given object,
 * so it becomes immutable.
 *
 * @param {*} object Any valid ECMA object
 * @returns {*} The same object that was passed to the
 * function after it was made immutable.
 */
function deepFreeze(object) {
    let propNames;
    try {
        propNames = Object.getOwnPropertyNames(object);
    }
    catch (ign) {
        return object;
    }
    for (const name of propNames) {
        const value = object[name];
        if (value && typeof value === 'object') {
            deepFreeze(value);
        }
    }
    return Object.freeze(object);
}
exports.deepFreeze = deepFreeze;
/**
 * Tries to synchronously detect the absolute path to the folder
 * where the given `moduleName` is located.
 *
 * @param {string} moduleName The name of the module as it is written in package.json
 * @param {string} filePath Full path to any of files that `moduleName` contains. Use
 * `__filename` to find the root of the module where this helper is called.
 * @returns {string?} Full path to the module root
 */
function getModuleRootSync(moduleName, filePath) {
    let currentDir = path_1.default.dirname(path_1.default.resolve(filePath));
    let isAtFsRoot = false;
    while (!isAtFsRoot) {
        const manifestPath = path_1.default.join(currentDir, 'package.json');
        try {
            if (fs_1.default.existsSync(manifestPath) &&
                JSON.parse(fs_1.default.readFileSync(manifestPath, 'utf8')).name === moduleName) {
                return currentDir;
            }
        }
        catch (ign) { }
        currentDir = path_1.default.dirname(currentDir);
        isAtFsRoot = currentDir.length <= path_1.default.dirname(currentDir).length;
    }
    return null;
}
exports.getModuleRootSync = getModuleRootSync;
//# sourceMappingURL=node.js.map