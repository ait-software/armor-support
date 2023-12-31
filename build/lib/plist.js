"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBinaryPlist = exports.createBinaryPlist = exports.updatePlistFile = exports.createPlist = exports.parsePlist = exports.parsePlistFile = void 0;
const plist_1 = __importDefault(require("plist"));
const bplist_creator_1 = __importDefault(require("bplist-creator"));
const bplist_parser_1 = __importDefault(require("bplist-parser"));
const fs_1 = __importDefault(require("./fs"));
const logger_1 = __importDefault(require("./logger"));
const lodash_1 = __importDefault(require("lodash"));
const BPLIST_IDENTIFIER = {
    BUFFER: Buffer.from('bplist00'),
    TEXT: 'bplist00',
};
const PLIST_IDENTIFIER = {
    BUFFER: Buffer.from('<'),
    TEXT: '<',
};
// XML Plist library helper
async function parseXmlPlistFile(plistFilename) {
    let xmlContent = await fs_1.default.readFile(plistFilename, 'utf8');
    return plist_1.default.parse(xmlContent);
}
/**
 * Parses a file in xml or binary format of plist
 * @param {string} plist The plist file path
 * @param {boolean} mustExist If set to false, this method will return an empty object when the file doesn't exist
 * @param {boolean} quiet If set to false, the plist path will be logged in debug level
 * @returns {Promise<any>} parsed plist JS Object
 */
async function parsePlistFile(plist, mustExist = true, quiet = true) {
    // handle nonexistant file
    if (!(await fs_1.default.exists(plist))) {
        if (mustExist) {
            logger_1.default.errorAndThrow(`Plist file doesn't exist: '${plist}'`);
        }
        else {
            logger_1.default.debug(`Plist file '${plist}' does not exist. Returning an empty plist.`);
            return {};
        }
    }
    let obj = {};
    let type = 'binary';
    try {
        obj = await bplist_parser_1.default.parseFile(plist);
        if (obj.length) {
            obj = obj[0];
        }
        else {
            throw new Error(`Binary file '${plist}'' appears to be empty`);
        }
    }
    catch (ign) {
        try {
            obj = await parseXmlPlistFile(plist);
            type = 'xml';
        }
        catch (err) {
            logger_1.default.errorAndThrow(`Could not parse plist file '${plist}' as XML: ${err.message}`);
        }
    }
    if (!quiet) {
        logger_1.default.debug(`Parsed plist file '${plist}' as ${type}`);
    }
    return obj;
}
exports.parsePlistFile = parsePlistFile;
/**
 * Updates a plist file with the given fields
 * @param {string} plist The plist file path
 * @param {Object} updatedFields The updated fields-value pairs
 * @param {boolean} binary If set to false, the file will be created as a xml plist
 * @param {boolean} mustExist If set to false, this method will update an empty plist
 * @param {boolean} quiet If set to false, the plist path will be logged in debug level
 */
async function updatePlistFile(plist, updatedFields, binary = true, mustExist = true, quiet = true) {
    let obj;
    try {
        obj = await parsePlistFile(plist, mustExist);
    }
    catch (err) {
        logger_1.default.errorAndThrow(`Could not update plist: ${err.message}`);
    }
    lodash_1.default.extend(obj, updatedFields);
    let newPlist = binary ? (0, bplist_creator_1.default)(obj) : plist_1.default.build(obj);
    try {
        await fs_1.default.writeFile(plist, newPlist);
    }
    catch (err) {
        logger_1.default.errorAndThrow(`Could not save plist: ${err.message}`);
    }
    if (!quiet) {
        logger_1.default.debug(`Wrote plist file '${plist}'`);
    }
}
exports.updatePlistFile = updatePlistFile;
/**
 * Creates a binary plist Buffer from an object
 * @param {Object} data The object to be turned into a binary plist
 * @returns {Buffer} plist in the form of a binary buffer
 */
function createBinaryPlist(data) {
    return (0, bplist_creator_1.default)(data);
}
exports.createBinaryPlist = createBinaryPlist;
/**
 * Parses a Buffer into an Object
 * @param {Buffer} data The beffer of a binary plist
 */
function parseBinaryPlist(data) {
    return bplist_parser_1.default.parseBuffer(data);
}
exports.parseBinaryPlist = parseBinaryPlist;
function getXmlPlist(data) {
    if (lodash_1.default.isString(data) && data.startsWith(PLIST_IDENTIFIER.TEXT)) {
        return data;
    }
    if (lodash_1.default.isBuffer(data) &&
        PLIST_IDENTIFIER.BUFFER.compare(data, 0, PLIST_IDENTIFIER.BUFFER.length) === 0) {
        return data.toString();
    }
    return null;
}
function getBinaryPlist(data) {
    if (lodash_1.default.isString(data) && data.startsWith(BPLIST_IDENTIFIER.TEXT)) {
        return Buffer.from(data);
    }
    if (lodash_1.default.isBuffer(data) &&
        BPLIST_IDENTIFIER.BUFFER.compare(data, 0, BPLIST_IDENTIFIER.BUFFER.length) === 0) {
        return data;
    }
    return null;
}
/**
 * Creates a plist from an object
 * @param {Object} object The JS object to be turned into a plist
 * @param {boolean} binary Set it to true for a binary plist
 * @returns {string|Buffer} returns a buffer or a string in respect to the binary parameter
 */
function createPlist(object, binary = false) {
    if (binary) {
        return createBinaryPlist(object);
    }
    else {
        return plist_1.default.build(object);
    }
}
exports.createPlist = createPlist;
/**
 * Parses an buffer or a string to a JS object a plist from an object
 * @param {string|Buffer} data The plist in the form of string or Buffer
 * @returns {Object} parsed plist JS Object
 * @throws Will throw an error if the plist type is unknown
 */
function parsePlist(data) {
    let textPlist = getXmlPlist(data);
    if (textPlist) {
        return plist_1.default.parse(textPlist);
    }
    let binaryPlist = getBinaryPlist(data);
    if (binaryPlist) {
        return parseBinaryPlist(binaryPlist)[0];
    }
    throw new Error(`Unknown type of plist, data: ${data.toString()}`);
}
exports.parsePlist = parsePlist;
//# sourceMappingURL=plist.js.map