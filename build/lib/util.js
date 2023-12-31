"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLockFileGuard = exports.shellParse = exports.uuidV5 = exports.uuidV4 = exports.uuidV3 = exports.uuidV1 = exports.toInMemoryBase64 = exports.KiB = exports.MiB = exports.GiB = exports.pluralize = exports.jsonStringify = exports.unleakString = exports.quote = exports.coerceVersion = exports.compareVersions = exports.isSameDestination = exports.W3C_WEB_ELEMENT_IDENTIFIER = exports.isSubPath = exports.toReadableSizeString = exports.filterObject = exports.unwrapElement = exports.wrapElement = exports.safeJsonParse = exports.multiResolve = exports.cancellableDelay = exports.localIp = exports.escapeSpecialChars = exports.escapeSpace = exports.hasValue = exports.hasContent = void 0;
const bluebird_1 = __importDefault(require("bluebird"));
const lodash_1 = __importDefault(require("lodash"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("./fs"));
const semver_1 = __importDefault(require("semver"));
const shell_quote_1 = require("shell-quote");
Object.defineProperty(exports, "shellParse", { enumerable: true, get: function () { return shell_quote_1.parse; } });
const pluralize_1 = __importDefault(require("pluralize"));
const stream_1 = __importDefault(require("stream"));
const base64_stream_1 = require("base64-stream");
const uuid_1 = require("uuid");
Object.defineProperty(exports, "uuidV1", { enumerable: true, get: function () { return uuid_1.v1; } });
Object.defineProperty(exports, "uuidV3", { enumerable: true, get: function () { return uuid_1.v3; } });
Object.defineProperty(exports, "uuidV4", { enumerable: true, get: function () { return uuid_1.v4; } });
Object.defineProperty(exports, "uuidV5", { enumerable: true, get: function () { return uuid_1.v5; } });
const lockfile_1 = __importDefault(require("lockfile"));
const W3C_WEB_ELEMENT_IDENTIFIER = 'element-6066-11e4-a52e-4f735466cecf';
exports.W3C_WEB_ELEMENT_IDENTIFIER = W3C_WEB_ELEMENT_IDENTIFIER;
const KiB = 1024;
exports.KiB = KiB;
const MiB = KiB * 1024;
exports.MiB = MiB;
const GiB = MiB * 1024;
exports.GiB = GiB;
/**
 * @template {string} T
 * @param {T} val
 * @returns {val is NonEmptyString<T>}
 */
function hasContent(val) {
    return lodash_1.default.isString(val) && val !== '';
}
exports.hasContent = hasContent;
/**
 * return true if the the value is not `undefined`, `null`, or `NaN`.
 *
 * XXX: `NaN` is not expressible in TypeScript.
 * @template T
 * @param {T} val
 * @returns {val is NonNullable<T>}
 */
function hasValue(val) {
    // avoid incorrectly evaluating `0` as false
    if (lodash_1.default.isNumber(val)) {
        return !lodash_1.default.isNaN(val);
    }
    return !lodash_1.default.isUndefined(val) && !lodash_1.default.isNull(val);
}
exports.hasValue = hasValue;
// escape spaces in string, for commandline calls
function escapeSpace(str) {
    return str.split(/ /).join('\\ ');
}
exports.escapeSpace = escapeSpace;
function escapeSpecialChars(str, quoteEscape) {
    if (typeof str !== 'string') {
        return str;
    }
    if (typeof quoteEscape === 'undefined') {
        quoteEscape = false;
    }
    str = str
        .replace(/[\\]/g, '\\\\')
        .replace(/[\/]/g, '\\/') // eslint-disable-line no-useless-escape
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t')
        .replace(/[\"]/g, '\\"') // eslint-disable-line no-useless-escape
        .replace(/\\'/g, "\\'");
    if (quoteEscape) {
        let re = new RegExp(quoteEscape, 'g');
        str = str.replace(re, `\\${quoteEscape}`);
    }
    return str;
}
exports.escapeSpecialChars = escapeSpecialChars;
function localIp() {
    let ip = lodash_1.default.chain(os_1.default.networkInterfaces())
        .values()
        .flatten()
        // @ts-ignore this filter works fine
        .filter(({ family, internal }) => family === 'IPv4' && internal === false)
        .map('address')
        .first()
        .value();
    return ip;
}
exports.localIp = localIp;
/*
 * Creates a promise that is cancellable, and will timeout
 * after `ms` delay
 */
function cancellableDelay(ms) {
    let timer;
    let resolve;
    let reject;
    const delay = new bluebird_1.default.Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
        timer = setTimeout(function () {
            resolve();
        }, ms);
    });
    // override Bluebird's `cancel`, which does not work when using `await` on
    // a promise, since `resolve`/`reject` are never called
    delay.cancel = function () {
        clearTimeout(timer);
        reject(new bluebird_1.default.CancellationError());
    };
    return delay;
}
exports.cancellableDelay = cancellableDelay;
function multiResolve(roots, ...args) {
    return roots.map((root) => path_1.default.resolve(root, ...args));
}
exports.multiResolve = multiResolve;
/*
 * Parses an object if possible. Otherwise returns the object without parsing.
 */
function safeJsonParse(obj) {
    try {
        return JSON.parse(obj);
    }
    catch (ign) {
        // ignore: this is not json parsable
        return obj;
    }
}
exports.safeJsonParse = safeJsonParse;
/**
 * Stringifies the object passed in, converting Buffers into Strings for better
 * display. This mimics JSON.stringify (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
 * except the `replacer` argument can only be a function.
 *
 * @param {any} obj - the object to be serialized
 * @param {((key:any, value:any) => any)?} replacer - function to transform the properties added to the
 *                               serialized object
 * @param {number|string|undefined} space - used to insert white space into the output JSON
 *                                 string for readability purposes. Defaults to 2
 * @returns {string} - the JSON object serialized as a string
 */
function jsonStringify(obj, replacer = null, space = 2) {
    // if no replacer is passed, or it is not a function, just use a pass-through
    const replacerFunc = lodash_1.default.isFunction(replacer) ? replacer : (k, v) => v;
    // Buffers cannot be serialized in a readable way
    const bufferToJSON = Buffer.prototype.toJSON;
    delete Buffer.prototype.toJSON;
    try {
        return JSON.stringify(obj, (key, value) => {
            const updatedValue = Buffer.isBuffer(value) ? value.toString('utf8') : value;
            return replacerFunc(key, updatedValue);
        }, space);
    }
    finally {
        // restore the function, so as to not break further serialization
        Buffer.prototype.toJSON = bufferToJSON;
    }
}
exports.jsonStringify = jsonStringify;
/**
 * Removes the wrapper from element, if it exists.
 *   { ELEMENT: 4 } becomes 4
 *   { element-6066-11e4-a52e-4f735466cecf: 5 } becomes 5
 * @param {import('armor-types').Element|string} el
 * @returns {string}
 */
function unwrapElement(el) {
    for (const propName of [W3C_WEB_ELEMENT_IDENTIFIER, 'ELEMENT']) {
        if (lodash_1.default.has(el, propName)) {
            return el[propName];
        }
    }
    return /** @type {string} */ (el);
}
exports.unwrapElement = unwrapElement;
/**
 *
 * @param {string} elementId
 * @returns {import('armor-types').Element}
 */
function wrapElement(elementId) {
    return {
        ELEMENT: elementId,
        [W3C_WEB_ELEMENT_IDENTIFIER]: elementId,
    };
}
exports.wrapElement = wrapElement;
/*
 * Returns object consisting of all properties in the original element
 * which were truthy given the predicate.
 * If the predicate is
 *   * missing - it will remove all properties whose values are `undefined`
 *   * a scalar - it will test all properties' values against that value
 *   * a function - it will pass each value and the original object into the function
 */
function filterObject(obj, predicate) {
    let newObj = lodash_1.default.clone(obj);
    if (lodash_1.default.isUndefined(predicate)) {
        // remove any element from the object whose value is undefined
        predicate = (v) => !lodash_1.default.isUndefined(v);
    }
    else if (!lodash_1.default.isFunction(predicate)) {
        // make predicate into a function
        const valuePredicate = predicate;
        predicate = (v) => v === valuePredicate;
    }
    for (const key of Object.keys(obj)) {
        if (!predicate(obj[key], obj)) {
            delete newObj[key];
        }
    }
    return newObj;
}
exports.filterObject = filterObject;
/**
 * Converts number of bytes to a readable size string.
 *
 * @param {number|string} bytes - The actual number of bytes.
 * @returns {string} The actual string representation, for example
 *                   '1.00 KB' for '1024 B'
 * @throws {Error} If bytes count cannot be converted to an integer or
 *                 if it is less than zero.
 */
function toReadableSizeString(bytes) {
    const intBytes = parseInt(String(bytes), 10);
    if (isNaN(intBytes) || intBytes < 0) {
        throw new Error(`Cannot convert '${bytes}' to a readable size format`);
    }
    if (intBytes >= GiB) {
        return `${(intBytes / (GiB * 1.0)).toFixed(2)} GB`;
    }
    else if (intBytes >= MiB) {
        return `${(intBytes / (MiB * 1.0)).toFixed(2)} MB`;
    }
    else if (intBytes >= KiB) {
        return `${(intBytes / (KiB * 1.0)).toFixed(2)} KB`;
    }
    return `${intBytes} B`;
}
exports.toReadableSizeString = toReadableSizeString;
/**
 * Checks whether the given path is a subpath of the
 * particular root folder. Both paths can include .. and . specifiers
 *
 * @param {string} originalPath The absolute file/folder path
 * @param {string} root The absolute root folder path
 * @param {?boolean} forcePosix Set it to true if paths must be interpreted in POSIX format
 * @returns {boolean} true if the given original path is the subpath of the root folder
 * @throws {Error} if any of the given paths is not absolute
 */
function isSubPath(originalPath, root, forcePosix = null) {
    const pathObj = forcePosix ? path_1.default.posix : path_1.default;
    for (const p of [originalPath, root]) {
        if (!pathObj.isAbsolute(p)) {
            throw new Error(`'${p}' is expected to be an absolute path`);
        }
    }
    const normalizedRoot = pathObj.normalize(root);
    const normalizedPath = pathObj.normalize(originalPath);
    return normalizedPath.startsWith(normalizedRoot);
}
exports.isSubPath = isSubPath;
/**
 * Checks whether the given paths are pointing to the same file system
 * destination.
 *
 * @param {string} path1 - Absolute or relative path to a file/folder
 * @param {string} path2 - Absolute or relative path to a file/folder
 * @param {...string} pathN - Zero or more absolute or relative paths to files/folders
 * @returns {Promise<boolean>} true if all paths are pointing to the same file system item
 */
async function isSameDestination(path1, path2, ...pathN) {
    const allPaths = [path1, path2, ...pathN];
    if (!(await bluebird_1.default.reduce(allPaths, async (a, b) => a && (await fs_1.default.exists(b)), true))) {
        return false;
    }
    const areAllItemsEqual = (arr) => !!arr.reduce((a, b) => (a === b ? a : NaN));
    if (areAllItemsEqual(allPaths)) {
        return true;
    }
    let mapCb = async (x) => (await fs_1.default.stat(x, {
        bigint: true,
    })).ino;
    return areAllItemsEqual(await bluebird_1.default.map(allPaths, mapCb));
}
exports.isSameDestination = isSameDestination;
/**
 * Coerces the given number/string to a valid version string
 *
 * @template {boolean} [Strict=true]
 * @param {string} ver - Version string to coerce
 * @param {Strict} [strict] - If `true` then an exception will be thrown
 * if `ver` cannot be coerced
 * @returns {Strict extends true ? string : string|null} Coerced version number or null if the string cannot be
 * coerced and strict mode is disabled
 * @throws {Error} if strict mode is enabled and `ver` cannot be coerced
 */
function coerceVersion(ver, strict = /** @type {Strict} */ (true)) {
    const result = semver_1.default.valid(semver_1.default.coerce(`${ver}`));
    if (strict && !result) {
        throw new Error(`'${ver}' cannot be coerced to a valid version number`);
    }
    return /** @type {Strict extends true ? string : string?} */ (result);
}
exports.coerceVersion = coerceVersion;
const SUPPORTED_OPERATORS = ['==', '!=', '>', '<', '>=', '<=', '='];
/**
 * Compares two version strings
 *
 * @param {string} ver1 - The first version number to compare. Should be a valid
 * version number supported by semver parser.
 * @param {string} ver2 - The second version number to compare. Should be a valid
 * version number supported by semver parser.
 * @param {string} operator - One of supported version number operators:
 * ==, !=, >, <, <=, >=, =
 * @returns {boolean} true or false depending on the actual comparison result
 * @throws {Error} if an unsupported operator is supplied or any of the supplied
 * version strings cannot be coerced
 */
function compareVersions(ver1, operator, ver2) {
    if (!SUPPORTED_OPERATORS.includes(operator)) {
        throw new Error(`The '${operator}' comparison operator is not supported. ` +
            `Only '${JSON.stringify(SUPPORTED_OPERATORS)}' operators are supported`);
    }
    const semverOperator = ['==', '!='].includes(operator) ? '=' : operator;
    const result = semver_1.default.satisfies(coerceVersion(ver1), `${semverOperator}${coerceVersion(ver2)}`);
    return operator === '!=' ? !result : result;
}
exports.compareVersions = compareVersions;
/**
 * Add appropriate quotes to command arguments. See https://github.com/substack/node-shell-quote
 * for more details
 *
 * @param {string|string[]} args - The arguments that will be parsed
 * @returns {string} - The arguments, quoted
 */
function quote(args) {
    return (0, shell_quote_1.quote)(lodash_1.default.castArray(args));
}
exports.quote = quote;
/**
 * This function is necessary to workaround unexpected memory leaks
 * caused by NodeJS string interning
 * behavior described in https://bugs.chromium.org/p/v8/issues/detail?id=2869
 *
 * @param {*} s - The string to unleak
 * @return {string} Either the unleaked string or the original object converted to string
 */
function unleakString(s) {
    return ` ${s}`.substr(1);
}
exports.unleakString = unleakString;
/**
 * @typedef PluralizeOptions
 * @property {boolean} [inclusive=false] - Whether to prefix with the number (e.g., 3 ducks)
 */
/**
 * Get the form of a word appropriate to the count
 *
 * @param {string} word - The word to pluralize
 * @param {number} count - How many of the word exist
 * @param {PluralizeOptions|boolean} options - options for word pluralization,
 *   or a boolean indicating the options.inclusive property
 * @returns {string} The word pluralized according to the number
 */
function pluralize(word, count, options = {}) {
    let inclusive = false;
    if (lodash_1.default.isBoolean(options)) {
        // if passed in as a boolean
        inclusive = options;
    }
    else if (lodash_1.default.isBoolean(options?.inclusive)) {
        // if passed in as an options hash
        inclusive = options.inclusive;
    }
    return (0, pluralize_1.default)(word, count, inclusive);
}
exports.pluralize = pluralize;
/**
 * @typedef EncodingOptions
 * @property {number} [maxSize=1073741824] The maximum size of
 * the resulting buffer in bytes. This is set to 1GB by default, because
 * Armor limits the maximum HTTP body size to 1GB. Also, the NodeJS heap
 * size must be enough to keep the resulting object (usually this size is
 * limited to 1.4 GB)
 */
/**
 * Converts contents of a local file to an in-memory base-64 encoded buffer.
 * The operation is memory-usage friendly and should be used while encoding
 * large files to base64
 *
 * @param {string} srcPath The full path to the file being encoded
 * @param {EncodingOptions} opts
 * @returns {Promise<Buffer>} base64-encoded content of the source file as memory buffer
 * @throws {Error} if there was an error while reading the source file
 * or the source file is too
 */
async function toInMemoryBase64(srcPath, opts = {}) {
    if (!(await fs_1.default.exists(srcPath)) || (await fs_1.default.stat(srcPath)).isDirectory()) {
        throw new Error(`No such file: ${srcPath}`);
    }
    const { maxSize = 1 * GiB } = opts;
    const resultBuffers = [];
    let resultBuffersSize = 0;
    const resultWriteStream = new stream_1.default.Writable({
        write: (buffer, encoding, next) => {
            resultBuffers.push(buffer);
            resultBuffersSize += buffer.length;
            if (maxSize > 0 && resultBuffersSize > maxSize) {
                resultWriteStream.emit('error', new Error(`The size of the resulting ` +
                    `buffer must not be greater than ${toReadableSizeString(maxSize)}`));
            }
            next();
        },
    });
    const readerStream = fs_1.default.createReadStream(srcPath);
    const base64EncoderStream = new base64_stream_1.Base64Encode();
    const resultWriteStreamPromise = new bluebird_1.default((resolve, reject) => {
        resultWriteStream.once('error', (e) => {
            readerStream.unpipe(base64EncoderStream);
            base64EncoderStream.unpipe(resultWriteStream);
            readerStream.destroy();
            reject(e);
        });
        resultWriteStream.once('finish', resolve);
    });
    const readStreamPromise = new bluebird_1.default((resolve, reject) => {
        readerStream.once('close', resolve);
        readerStream.once('error', (e) => reject(new Error(`Failed to read '${srcPath}': ${e.message}`)));
    });
    readerStream.pipe(base64EncoderStream);
    base64EncoderStream.pipe(resultWriteStream);
    await bluebird_1.default.all([readStreamPromise, resultWriteStreamPromise]);
    return Buffer.concat(resultBuffers);
}
exports.toInMemoryBase64 = toInMemoryBase64;
/**
 * @typedef LockFileOptions
 * @property {number} [timeout=120] The max time in seconds to wait for the lock
 * @property {boolean} [tryRecovery=false] Whether to try lock recovery if
 * the first attempt to acquire it timed out.
 */
/**
 * Create an async function which, when called, will not proceed until a certain file is no
 * longer present on the system. This allows for preventing concurrent behavior across processes
 * using a known lockfile path.
 *
 * @template T
 * @param {string} lockFile The full path to the file used for the lock
 * @param {LockFileOptions} opts
 * @returns async function that takes another async function defining the locked
 * behavior
 */
function getLockFileGuard(lockFile, opts = {}) {
    const { timeout = 120, tryRecovery = false } = opts;
    const lock = /** @type {(lockfile: string, opts: import('lockfile').Options)=>B<void>} */ (bluebird_1.default.promisify(lockfile_1.default.lock));
    const check = bluebird_1.default.promisify(lockfile_1.default.check);
    const unlock = bluebird_1.default.promisify(lockfile_1.default.unlock);
    /**
     * @param {(...args: any[]) => T} behavior
     * @returns {Promise<T>}
     */
    const guard = async (behavior) => {
        let triedRecovery = false;
        do {
            try {
                // if the lockfile doesn't exist, lock it synchronously to make sure no other call
                // on the same spin of the event loop can also initiate a lock. If the lockfile does exist
                // then just use the regular async 'lock' method which will wait on the lock.
                if (lockfile_1.default.checkSync(lockFile)) {
                    await lock(lockFile, { wait: timeout * 1000 });
                }
                else {
                    lockfile_1.default.lockSync(lockFile);
                }
                break;
            }
            catch (e) {
                if (lodash_1.default.includes(e.message, 'EEXIST') && tryRecovery && !triedRecovery) {
                    // There could be cases where a process has been forcefully terminated
                    // without a chance to clean up pending locks: https://github.com/npm/lockfile/issues/26
                    lockfile_1.default.unlockSync(lockFile);
                    triedRecovery = true;
                    continue;
                }
                throw new Error(`Could not acquire lock on '${lockFile}' after ${timeout}s. ` +
                    `Original error: ${e.message}`);
            }
            // eslint-disable-next-line no-constant-condition
        } while (true);
        try {
            return await behavior();
        }
        finally {
            // whether the behavior succeeded or not, get rid of the lock
            await unlock(lockFile);
        }
    };
    guard.check = async () => await check(lockFile);
    return guard;
}
exports.getLockFileGuard = getLockFileGuard;
/**
 * A `string` which is never `''`.
 *
 * @template {string} T
 * @typedef {T extends '' ? never : T} NonEmptyString
 */
//# sourceMappingURL=util.js.map