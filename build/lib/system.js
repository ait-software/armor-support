"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.macOsxVersion = exports.arch = exports.isOSWin64 = exports.isLinux = exports.isMac = exports.isWindows = void 0;
const ait_process_1 = require("ait-process");
const lodash_1 = __importDefault(require("lodash"));
const os_1 = __importDefault(require("os"));
const VERSION_PATTERN = /^(\d+\.\d+)/m;
function isWindows() {
    return os_1.default.type() === 'Windows_NT';
}
exports.isWindows = isWindows;
function isMac() {
    return os_1.default.type() === 'Darwin';
}
exports.isMac = isMac;
function isLinux() {
    return !isWindows() && !isMac();
}
exports.isLinux = isLinux;
function isOSWin64() {
    return process.arch === 'x64' || lodash_1.default.has(process.env, 'PROCESSOR_ARCHITEW6432');
}
exports.isOSWin64 = isOSWin64;
async function arch() {
    if (isLinux() || isMac()) {
        let { stdout } = await (0, ait_process_1.exec)('uname', ['-m']);
        return stdout.trim() === 'i686' ? '32' : '64';
    }
    else if (isWindows()) {
        let is64 = this.isOSWin64();
        return is64 ? '64' : '32';
    }
}
exports.arch = arch;
async function macOsxVersion() {
    let stdout;
    try {
        stdout = (await (0, ait_process_1.exec)('sw_vers', ['-productVersion'])).stdout.trim();
    }
    catch (err) {
        throw new Error(`Could not detect Mac OS X Version: ${err}`);
    }
    const versionMatch = VERSION_PATTERN.exec(stdout);
    if (!versionMatch) {
        throw new Error(`Could not detect Mac OS X Version from sw_vers output: '${stdout}'`);
    }
    return versionMatch[1];
}
exports.macOsxVersion = macOsxVersion;
//# sourceMappingURL=system.js.map