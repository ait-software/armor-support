/**
 * Relative path to directory containing any Armor internal files
 * XXX: this is duplicated in `armor/lib/constants.js`.
 */
export const CACHE_DIR_RELATIVE_PATH: string;
/**
 * Relative path to lockfile used when installing an extension via `armor`
 */
export const INSTALL_LOCKFILE_RELATIVE_PATH: string;
/**
 * XXX: This should probably be a singleton, but it isn't.  Maybe this module should just export functions?
 */
export class NPM {
    /**
     * Returns path to "install" lockfile
     * @private
     * @param {string} cwd
     */
    private _getInstallLockfilePath;
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
    exec(cmd: string, args: string[], opts: ExecOpts, execOpts?: Omit<import("ait-process").AITProcessExecOptions, "cwd"> | undefined): Promise<import("ait-process").AITProcessExecStringResult & {
        json?: any;
    }>;
    /**
     * @param {string} cwd
     * @param {string} pkg
     * @returns {Promise<string?>}
     */
    getLatestVersion(cwd: string, pkg: string): Promise<string | null>;
    /**
     * @param {string} cwd
     * @param {string} pkg
     * @param {string} curVersion
     * @returns {Promise<string?>}
     */
    getLatestSafeUpgradeVersion(cwd: string, pkg: string, curVersion: string): Promise<string | null>;
    /**
     * Runs `npm ls`, optionally for a particular package.
     * @param {string} cwd
     * @param {string} [pkg]
     */
    list(cwd: string, pkg?: string | undefined): Promise<any>;
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
    getLatestSafeUpgradeFromVersions(curVersion: string, allVersions: Array<string>): string | null;
    /**
     * Installs a package w/ `npm`
     * @param {string} cwd
     * @param {string} pkgName
     * @param {InstallPackageOpts} opts
     * @returns {Promise<NpmInstallReceipt>}
     */
    installPackage(cwd: string, pkgName: string, { pkgVer, installType }?: InstallPackageOpts): Promise<NpmInstallReceipt>;
    /**
     * @param {string} cwd
     * @param {string} pkg
     */
    uninstallPackage(cwd: string, pkg: string): Promise<void>;
}
export const npm: NPM;
/**
 * Options for {@link NPM.installPackage }
 */
export type InstallPackageOpts = {
    /**
     * - whether to install from a local path or from npm
     */
    installType?: import("type-fest").LiteralUnion<"local", string> | undefined;
    /**
     * - the version of the package to install
     */
    pkgVer?: string | undefined;
};
/**
 * Options for {@link NPM.exec }
 */
export type ExecOpts = {
    /**
     * - Current working directory
     */
    cwd: string;
    /**
     * - If `true`, supply `--json` flag to npm and resolve w/ parsed JSON
     */
    json?: boolean | undefined;
    /**
     * - Path to lockfile to use
     */
    lockFile?: string | undefined;
};
export type AITProcessExecOptions = import('ait-process').AITProcessExecOptions;
export type NpmInstallReceipt = {
    /**
     * - Path to installed package
     */
    installPath: string;
    /**
     * - Package data
     */
    pkg: import('type-fest').PackageJson;
};
//# sourceMappingURL=npm.d.ts.map