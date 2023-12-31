"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticDir = exports.openDir = exports.path = exports.open = void 0;
/* This library is originated from temp.js at http://github.com/bruce/node-temp */
const fs_1 = __importDefault(require("./fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const constants_1 = __importDefault(require("constants"));
const logger_1 = __importDefault(require("./logger"));
const RDWR_EXCL = constants_1.default.O_CREAT | constants_1.default.O_TRUNC | constants_1.default.O_RDWR | constants_1.default.O_EXCL;
/**
 * Generate a temporary directory in os.tempdir() or process.env.ARMOR_TMP_DIR.
 * e.g.
 * - No `process.env.ARMOR_TMP_DIR`: `/var/folders/34/2222sh8n27d6rcp7jqlkw8km0000gn/T/xxxxxxxx.yyyy`
 * - With `process.env.ARMOR_TMP_DIR = '/path/to/root'`: `/path/to/root/xxxxxxxx.yyyy`
 *
 * @returns {Promise<string>} A path to the temporary directory
 */
async function tempDir() {
    const now = new Date();
    const filePath = path_1.default.join(process.env.ARMOR_TMP_DIR || os_1.default.tmpdir(), [
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        '-',
        process.pid,
        '-',
        (Math.random() * 0x100000000 + 1).toString(36),
    ].join(''));
    // creates a temp directory using the date and a random string
    await fs_1.default.mkdir(filePath);
    return filePath;
}
/**
 * @typedef Affixes
 * @property {string} [prefix] - prefix of the temp directory name
 * @property {string} [suffix] - suffix of the temp directory name
 */
/**
 * Generate a temporary directory in os.tempdir() or process.env.ARMOR_TMP_DIR
 * with arbitrary prefix/suffix for the directory name.
 *
 * @param {string|Affixes} rawAffixes
 * @param {string} [defaultPrefix]
 * @returns {Promise<string>}  A path to the temporary directory with rawAffixes and defaultPrefix
 */
async function path(rawAffixes, defaultPrefix) {
    const affixes = parseAffixes(rawAffixes, defaultPrefix);
    const name = `${affixes.prefix || ''}${affixes.suffix || ''}`;
    const tempDirectory = await tempDir();
    return path_1.default.join(tempDirectory, name);
}
exports.path = path;
/**
 * @typedef OpenedAffixes
 * @property {string} path - The path to file
 * @property {number} fd - The file descriptor opened
 */
/**
 * Generate a temporary directory in os.tempdir() or process.env.ARMOR_TMP_DIR
 * with arbitrary prefix/suffix for the directory name and return it as open.
 *
 * @param {Affixes} affixes
 * @returns {Promise<OpenedAffixes>}
 */
async function open(affixes) {
    const filePath = await path(affixes, 'f-');
    try {
        let fd = await fs_1.default.open(filePath, RDWR_EXCL, 0o600);
        // opens the file in mode 384
        return { path: filePath, fd };
    }
    catch (err) {
        return logger_1.default.errorAndThrow(err);
    }
}
exports.open = open;
/**
 *
 * Returns prefix/suffix object
 *
 * @param {string|Affixes} rawAffixes
 * @param {string} [defaultPrefix]
 * @returns {Affixes}
 */
function parseAffixes(rawAffixes, defaultPrefix) {
    /** @type {Affixes} */
    let affixes = {};
    if (rawAffixes) {
        switch (typeof rawAffixes) {
            case 'string':
                affixes.prefix = rawAffixes;
                break;
            case 'object':
                affixes = rawAffixes;
                break;
            default:
                throw new Error(`Unknown affix declaration: ${affixes}`);
        }
    }
    else {
        affixes.prefix = defaultPrefix;
    }
    return affixes;
}
const _static = tempDir();
/**
 * Returns a new path to a temporary directory
 *
 * @returns {string} A new tempDir() if tempRootDirectory is not provided
 */
const openDir = tempDir;
exports.openDir = openDir;
/**
 * Returns a path to a temporary directory whcih is defined as static in the same process
 *
 * @returns {Promise<string>} A temp directory path whcih is defined as static in the same process
 */
// eslint-disable-next-line require-await
async function staticDir() {
    return _static;
}
exports.staticDir = staticDir;
//# sourceMappingURL=tempdir.js.map