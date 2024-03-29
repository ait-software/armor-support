"use strict";
// @ts-check
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.npm = exports.NPM = exports.INSTALL_LOCKFILE_RELATIVE_PATH = exports.CACHE_DIR_RELATIVE_PATH = void 0;
const path_1 = __importDefault(require("path"));
const semver_1 = __importDefault(require("semver"));
const env_1 = require("./env");
const ait_process_1 = require("ait-process");
const fs_1 = require("./fs");
const util = __importStar(require("./util"));
const system = __importStar(require("./system"));
const resolve_from_1 = __importDefault(require("resolve-from"));
/**
 * Relative path to directory containing any Armor internal files
 * XXX: this is duplicated in `armor/lib/constants.js`.
 */
exports.CACHE_DIR_RELATIVE_PATH = path_1.default.join('node_modules', '.cache', 'armor');
/**
 * Relative path to lockfile used when installing an extension via `armor`
 */
exports.INSTALL_LOCKFILE_RELATIVE_PATH = path_1.default.join(exports.CACHE_DIR_RELATIVE_PATH, '.install.lock');
/**
 * XXX: This should probably be a singleton, but it isn't.  Maybe this module should just export functions?
 */
class NPM {
    /**
     * Returns path to "install" lockfile
     * @private
     * @param {string} cwd
     */
    _getInstallLockfilePath(cwd) {
        return path_1.default.join(cwd, exports.INSTALL_LOCKFILE_RELATIVE_PATH);
    }
    /**
     * Execute `npm` with given args.
     *
     * If the process exits with a nonzero code, the contents of `STDOUT` and `STDERR` will be in the
     * `message` of any rejected error.
     * @param {string} cmd
     * @param {string[]} args
     * @param {ExecOpts} opts
     * @param {Omit<AITProcessExecOptions, 'cwd'>} [execOpts]
     */
    async exec(cmd, args, opts, execOpts = {}) {
        let { cwd, json, lockFile } = opts;
        // make sure we perform the current operation in cwd
        /** @type {AITProcessExecOptions} */
        const aitProcessExecOpts = { ...execOpts, cwd };
        args.unshift(cmd);
        if (json) {
            args.push('--json');
        }
        const npmCmd = system.isWindows() ? 'npm.cmd' : 'npm';
        let runner = async () => await (0, ait_process_1.exec)(npmCmd, args, aitProcessExecOpts);
        if (lockFile) {
            const acquireLock = util.getLockFileGuard(lockFile);
            const _runner = runner;
            runner = async () => await acquireLock(_runner);
        }
        /** @type {import('ait-process').AITProcessExecStringResult & {json?: any}} */
        let ret;
        try {
            const { stdout, stderr, code } = await runner();
            ret = { stdout, stderr, code };
            // if possible, parse NPM's json output. During NPM install 3rd-party
            // packages can write to stdout, so sometimes the json output can't be
            // guaranteed to be parseable
            try {
                ret.json = JSON.parse(stdout);
            }
            catch (ign) { }
        }
        catch (e) {
            const { stdout = '', stderr = '', code = null, } = /** @type {import('ait-process').AITProcessExecError} */ (e);
            const err = new Error(`npm command '${args.join(' ')}' failed with code ${code}.\n\nSTDOUT:\n${stdout.trim()}\n\nSTDERR:\n${stderr.trim()}`);
            throw err;
        }
        return ret;
    }
    /**
     * @param {string} cwd
     * @param {string} pkg
     * @returns {Promise<string?>}
     */
    async getLatestVersion(cwd, pkg) {
        try {
            return ((await this.exec('view', [pkg, 'dist-tags'], {
                json: true,
                cwd,
            })).json?.latest ?? null);
        }
        catch (err) {
            if (!err?.message.includes('E404')) {
                throw err;
            }
            return null;
        }
    }
    /**
     * @param {string} cwd
     * @param {string} pkg
     * @param {string} curVersion
     * @returns {Promise<string?>}
     */
    async getLatestSafeUpgradeVersion(cwd, pkg, curVersion) {
        try {
            const allVersions = (await this.exec('view', [pkg, 'versions'], {
                json: true,
                cwd,
            })).json;
            return this.getLatestSafeUpgradeFromVersions(curVersion, allVersions);
        }
        catch (err) {
            if (!err?.message.includes('E404')) {
                throw err;
            }
            return null;
        }
    }
    /**
     * Runs `npm ls`, optionally for a particular package.
     * @param {string} cwd
     * @param {string} [pkg]
     */
    async list(cwd, pkg) {
        return (await this.exec('list', pkg ? [pkg] : [], { cwd, json: true })).json;
    }
    /**
     * Given a current version and a list of all versions for a package, return the version which is
     * the highest safely-upgradable version (meaning not crossing any major revision boundaries, and
     * not including any alpha/beta/rc versions)
     *
     * @param {string} curVersion - the current version of a package
     * @param {Array<string>} allVersions - a list of version strings
     *
     * @return {string|null} - the highest safely-upgradable version, or null if there isn't one
     */
    getLatestSafeUpgradeFromVersions(curVersion, allVersions) {
        let safeUpgradeVer = null;
        const curSemver = semver_1.default.parse(curVersion) ?? semver_1.default.parse(semver_1.default.coerce(curVersion));
        if (curSemver === null) {
            throw new Error(`Could not parse current version '${curVersion}'`);
        }
        for (const testVer of allVersions) {
            const testSemver = semver_1.default.parse(testVer) ?? semver_1.default.parse(semver_1.default.coerce(testVer));
            if (testSemver === null) {
                continue;
            }
            // if the test version is a prerelease, ignore it
            if (testSemver.prerelease.length > 0) {
                continue;
            }
            // if the current version is later than the test version, skip this test version
            if (curSemver.compare(testSemver) === 1) {
                continue;
            }
            // if the test version is newer, but crosses a major revision boundary, also skip it
            if (testSemver.major > curSemver.major) {
                continue;
            }
            // otherwise this version is safe to upgrade to. But there might be multiple ones of this
            // kind, so keep iterating and keeping the highest
            if (safeUpgradeVer === null || testSemver.compare(safeUpgradeVer) === 1) {
                safeUpgradeVer = testSemver;
            }
        }
        if (safeUpgradeVer) {
            safeUpgradeVer = safeUpgradeVer.format();
        }
        return safeUpgradeVer;
    }
    /**
     * Installs a package w/ `npm`
     * @param {string} cwd
     * @param {string} pkgName
     * @param {InstallPackageOpts} opts
     * @returns {Promise<NpmInstallReceipt>}
     */
    async installPackage(cwd, pkgName, { pkgVer, installType } = {}) {
        /** @type {any} */
        let dummyPkgJson;
        const dummyPkgPath = path_1.default.join(cwd, 'package.json');
        try {
            dummyPkgJson = JSON.parse(await fs_1.fs.readFile(dummyPkgPath, 'utf8'));
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                dummyPkgJson = {};
                await fs_1.fs.writeFile(dummyPkgPath, JSON.stringify(dummyPkgJson, null, 2), 'utf8');
            }
            else {
                throw err;
            }
        }
        const installOpts = ['--save-dev'];
        if (!(await (0, env_1.hasArmorDependency)(cwd))) {
            if (process.env.ARMOR_OMIT_PEER_DEPS) {
                installOpts.push('--omit=peer');
            }
            installOpts.push('--save-exact', '--global-style', '--no-package-lock');
        }
        const cmd = installType === 'local' ? 'link' : 'install';
        const res = await this.exec(cmd, [...installOpts, pkgVer ? `${pkgName}@${pkgVer}` : pkgName], {
            cwd,
            json: true,
            lockFile: this._getInstallLockfilePath(cwd),
        });
        if (res.json) {
            // we parsed a valid json response, so if we got an error here, return that
            // message straightaway
            if (res.json.error) {
                throw new Error(res.json.error);
            }
        }
        // Now read package data from the installed package to return, and make sure
        // everything got installed ok. Remember, pkgName might end up with a / in it due to an npm
        // org, so if so, that will get correctly exploded into multiple directories, by path.resolve here
        // (even on Windows!)
        const pkgJsonPath = (0, resolve_from_1.default)(cwd, `${pkgName}/package.json`);
        try {
            const pkgJson = await fs_1.fs.readFile(pkgJsonPath, 'utf8');
            const pkg = JSON.parse(pkgJson);
            return { installPath: path_1.default.dirname(pkgJsonPath), pkg };
        }
        catch {
            throw new Error('The package was not downloaded correctly; its package.json ' +
                'did not exist or was unreadable. We looked for it at ' +
                pkgJsonPath);
        }
    }
    /**
     * @param {string} cwd
     * @param {string} pkg
     */
    async uninstallPackage(cwd, pkg) {
        await this.exec('uninstall', [pkg], {
            cwd,
            lockFile: this._getInstallLockfilePath(cwd),
        });
    }
}
exports.NPM = NPM;
exports.npm = new NPM();
/**
 * Options for {@link NPM.installPackage}
 * @typedef InstallPackageOpts
 * @property {import('type-fest').LiteralUnion<'local', string>} [installType] - whether to install from a local path or from npm
 * @property {string} [pkgVer] - the version of the package to install
 */
/**
 * Options for {@link NPM.exec}
 * @typedef ExecOpts
 * @property {string} cwd - Current working directory
 * @property {boolean} [json] - If `true`, supply `--json` flag to npm and resolve w/ parsed JSON
 * @property {string} [lockFile] - Path to lockfile to use
 */
/**
 * @typedef {import('ait-process').AITProcessExecOptions} AITProcessExecOptions
 */
/**
 * @typedef NpmInstallReceipt
 * @property {string} installPath - Path to installed package
 * @property {import('type-fest').PackageJson} pkg - Package data
 */
//# sourceMappingURL=npm.js.map