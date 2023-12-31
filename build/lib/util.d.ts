/**
 * @template {string} T
 * @param {T} val
 * @returns {val is NonEmptyString<T>}
 */
export function hasContent<T extends string>(val: T): val is NonEmptyString<T>;
export type PluralizeOptions = {
    /**
     * - Whether to prefix with the number (e.g., 3 ducks)
     */
    inclusive?: boolean | undefined;
};
export type EncodingOptions = {
    /**
     * The maximum size of
     * the resulting buffer in bytes. This is set to 1GB by default, because
     * Armor limits the maximum HTTP body size to 1GB. Also, the NodeJS heap
     * size must be enough to keep the resulting object (usually this size is
     * limited to 1.4 GB)
     */
    maxSize?: number | undefined;
};
export type LockFileOptions = {
    /**
     * The max time in seconds to wait for the lock
     */
    timeout?: number | undefined;
    /**
     * Whether to try lock recovery if
     * the first attempt to acquire it timed out.
     */
    tryRecovery?: boolean | undefined;
};
/**
 * A `string` which is never `''`.
 */
export type NonEmptyString<T extends string> = T extends '' ? never : T;
/**
 * return true if the the value is not `undefined`, `null`, or `NaN`.
 *
 * XXX: `NaN` is not expressible in TypeScript.
 * @template T
 * @param {T} val
 * @returns {val is NonNullable<T>}
 */
export function hasValue<T>(val: T): val is NonNullable<T>;
export function escapeSpace(str: any): any;
export function escapeSpecialChars(str: any, quoteEscape: any): any;
export function localIp(): any;
export function cancellableDelay(ms: any): any;
export function multiResolve(roots: any, ...args: any[]): any;
export function safeJsonParse(obj: any): any;
/**
 *
 * @param {string} elementId
 * @returns {import('armor-types').Element}
 */
export function wrapElement(elementId: string): import('armor-types').Element;
/**
 * Removes the wrapper from element, if it exists.
 *   { ELEMENT: 4 } becomes 4
 *   { element-6066-11e4-a52e-4f735466cecf: 5 } becomes 5
 * @param {import('armor-types').Element|string} el
 * @returns {string}
 */
export function unwrapElement(el: import('armor-types').Element | string): string;
export function filterObject(obj: any, predicate: any): any;
/**
 * Converts number of bytes to a readable size string.
 *
 * @param {number|string} bytes - The actual number of bytes.
 * @returns {string} The actual string representation, for example
 *                   '1.00 KB' for '1024 B'
 * @throws {Error} If bytes count cannot be converted to an integer or
 *                 if it is less than zero.
 */
export function toReadableSizeString(bytes: number | string): string;
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
export function isSubPath(originalPath: string, root: string, forcePosix?: boolean | null): boolean;
export const W3C_WEB_ELEMENT_IDENTIFIER: "element-6066-11e4-a52e-4f735466cecf";
/**
 * Checks whether the given paths are pointing to the same file system
 * destination.
 *
 * @param {string} path1 - Absolute or relative path to a file/folder
 * @param {string} path2 - Absolute or relative path to a file/folder
 * @param {...string} pathN - Zero or more absolute or relative paths to files/folders
 * @returns {Promise<boolean>} true if all paths are pointing to the same file system item
 */
export function isSameDestination(path1: string, path2: string, ...pathN: string[]): Promise<boolean>;
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
export function compareVersions(ver1: string, operator: string, ver2: string): boolean;
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
export function coerceVersion<Strict extends boolean = true>(ver: string, strict?: Strict | undefined): Strict extends true ? string : string | null;
/**
 * Add appropriate quotes to command arguments. See https://github.com/substack/node-shell-quote
 * for more details
 *
 * @param {string|string[]} args - The arguments that will be parsed
 * @returns {string} - The arguments, quoted
 */
export function quote(args: string | string[]): string;
/**
 * This function is necessary to workaround unexpected memory leaks
 * caused by NodeJS string interning
 * behavior described in https://bugs.chromium.org/p/v8/issues/detail?id=2869
 *
 * @param {*} s - The string to unleak
 * @return {string} Either the unleaked string or the original object converted to string
 */
export function unleakString(s: any): string;
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
export function jsonStringify(obj: any, replacer?: ((key: any, value: any) => any) | null, space?: number | string | undefined): string;
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
export function pluralize(word: string, count: number, options?: PluralizeOptions | boolean): string;
export const GiB: number;
export const MiB: number;
export const KiB: 1024;
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
export function toInMemoryBase64(srcPath: string, opts?: EncodingOptions): Promise<Buffer>;
import { v1 as uuidV1 } from 'uuid';
import { v3 as uuidV3 } from 'uuid';
import { v4 as uuidV4 } from 'uuid';
import { v5 as uuidV5 } from 'uuid';
import { parse as shellParse } from 'shell-quote';
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
export function getLockFileGuard<T>(lockFile: string, opts?: LockFileOptions): {
    (behavior: (...args: any[]) => T): Promise<T>;
    check(): Promise<any>;
};
export { uuidV1, uuidV3, uuidV4, uuidV5, shellParse };
//# sourceMappingURL=util.d.ts.map