"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveManifestPath = exports.resolveArmorHome = exports.readPackageInDir = exports.findArmorDependencyPackage = exports.hasArmorDependency = exports.MANIFEST_RELATIVE_PATH = exports.MANIFEST_BASENAME = exports.DEFAULT_ARMOR_HOME = void 0;
// @ts-check
const lodash_1 = __importDefault(require("lodash"));
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const read_pkg_1 = __importDefault(require("read-pkg"));
const npm_1 = require("./npm");
/**
 * Path to the default `ARMOR_HOME` dir (`~/.armor`).
 * @type {string}
 */
exports.DEFAULT_ARMOR_HOME = path_1.default.resolve((0, os_1.homedir)(), '.armor');
/**
 * Basename of extension manifest file.
 * @type {string}
 */
exports.MANIFEST_BASENAME = 'extensions.yaml';
/**
 * Relative path to extension manifest file from `ARMOR_HOME`.
 * @type {string}
 */
exports.MANIFEST_RELATIVE_PATH = path_1.default.join('node_modules', '.cache', 'armor', exports.MANIFEST_BASENAME);
const OLD_VERSION_REGEX = /^[01]/;
/**
 * Resolves `true` if an `armor` dependency can be found somewhere in the given `cwd`.
 *
 * @param {string} cwd
 * @returns {Promise<boolean>}
 */
async function hasArmorDependency(cwd) {
    return Boolean(await (0, exports.findArmorDependencyPackage)(cwd));
}
exports.hasArmorDependency = hasArmorDependency;
/**
 * Given `cwd`, use `npm` to find the closest package _or workspace root_, and return the path if the root depends upon `armor`.
 *
 * Looks at `dependencies` and `devDependencies` for `armor`.
 */
exports.findArmorDependencyPackage = lodash_1.default.memoize(
/**
 * @param {string} [cwd]
 * @returns {Promise<string|undefined>}
 */
async (cwd = process.cwd()) => {
    /**
     * Tries to read `package.json` in `cwd` and resolves the identity if it depends on `armor`;
     * otherwise resolves `undefined`.
     * @param {string} cwd
     * @returns {Promise<string|undefined>}
     */
    const readPkg = async (cwd) => {
        /** @type {string|undefined} */
        let pkgPath;
        try {
            const pkg = await (0, exports.readPackageInDir)(cwd);
            const version = pkg?.dependencies?.armor ??
                pkg?.devDependencies?.armor ??
                pkg?.peerDependencies?.armor;
            pkgPath = version && !OLD_VERSION_REGEX.test(String(version)) ? cwd : undefined;
        }
        catch { }
        return pkgPath;
    };
    cwd = path_1.default.resolve(cwd);
    /** @type {string} */
    let pkgDir;
    try {
        const { json: list } = await npm_1.npm.exec('list', ['--long', '--json'], { cwd });
        ({ path: pkgDir } = list);
        if (pkgDir !== cwd) {
            pkgDir = pkgDir ?? cwd;
        }
    }
    catch {
        pkgDir = cwd;
    }
    return await readPkg(pkgDir);
});
/**
 * Read a `package.json` in dir `cwd`.  If none found, return `undefined`.
 */
exports.readPackageInDir = lodash_1.default.memoize(
/**
 *
 * @param {string} cwd - Directory ostensibly having a `package.json`
 */
async function _readPackageInDir(cwd) {
    return await (0, read_pkg_1.default)({ cwd, normalize: true });
});
/**
 * Determines location of Armor's "home" dir
 *
 * - If `ARMOR_HOME` is set in the environment, use that
 * - If we find a `package.json` in or above `cwd` and it has an `armor` dependency, use that.
 *
 * All returned paths will be absolute.
 */
exports.resolveArmorHome = lodash_1.default.memoize(
/**
 * @param {string} [cwd] - Current working directory.  _Must_ be absolute, if specified.
 * @returns {Promise<string>}
 */
async function _resolveArmorHome(cwd = process.cwd()) {
    if (!path_1.default.isAbsolute(cwd)) {
        throw new TypeError('`cwd` parameter must be an absolute path');
    }
    if (process.env.ARMOR_HOME) {
        return path_1.default.resolve(cwd, process.env.ARMOR_HOME);
    }
    const pkgPath = await (0, exports.findArmorDependencyPackage)(cwd);
    if (pkgPath) {
        return pkgPath;
    }
    return exports.DEFAULT_ARMOR_HOME;
});
/**
 * Figure out manifest path based on `armorHome`.
 *
 * The assumption is that, if `armorHome` has been provided, it was resolved via {@link resolveArmorHome `resolveArmorHome()`}!  If unsure,
 * don't pass a parameter and let `resolveArmorHome()` handle it.
 */
exports.resolveManifestPath = lodash_1.default.memoize(
/**
 * @param {string} [armorHome] - Armor home directory
 * @returns {Promise<string>}
 */
async function _resolveManifestPath(armorHome) {
    // can you "await" in a default parameter? is that a good idea?
    armorHome = armorHome ?? (await (0, exports.resolveArmorHome)());
    return path_1.default.join(armorHome, exports.MANIFEST_RELATIVE_PATH);
});
//# sourceMappingURL=env.js.map