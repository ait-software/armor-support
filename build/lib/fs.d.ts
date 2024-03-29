/// <reference types="node" />
export default fs;
/**
 * The callback function which will be called during the directory walking
 */
export type WalkDirCallback = (itemPath: string, isDirectory: boolean) => boolean | void;
export type glob = typeof import("glob");
export type mv = typeof mv;
export type PathLike = import('fs').PathLike;
export type ReadFn<TBuffer extends NodeJS.ArrayBufferView> = (fd: number, offset?: number | undefined, length?: number | undefined, position?: number | null | undefined) => B<{
    bytesRead: number;
    buffer: TBuffer;
}>;
export namespace fs {
    /**
     * Resolves `true` if `path` is _readable_, which differs from Node.js' default behavior of "can we see it?"
     *
     * On Windows, ACLs are not supported, so this becomes a simple check for existence.
     *
     * This function will never reject.
     * @param {PathLike} path
     * @returns {Promise<boolean>}
     */
    export function hasAccess(path: import("fs").PathLike): Promise<boolean>;
    /**
     * Resolves `true` if `path` is executable; `false` otherwise.
     *
     * On Windows, this function delegates to {@linkcode fs.hasAccess}.
     *
     * This function will never reject.
     * @param {PathLike} path
     * @returns {Promise<boolean>}
     */
    export function isExecutable(path: import("fs").PathLike): Promise<boolean>;
    /**
     * Alias for {@linkcode fs.hasAccess}
     * @param {PathLike} path
     */
    export function exists(path: import("fs").PathLike): Promise<boolean>;
    /**
     * Remove a directory and all its contents, recursively
     * @param {PathLike} filepath
     * @returns Promise<void>
     * @see https://nodejs.org/api/fs.html#fspromisesrmpath-options
     */
    export function rimraf(filepath: import("fs").PathLike): Promise<void>;
    /**
     * Remove a directory and all its contents, recursively in sync
     * @param {PathLike} filepath
     * @returns undefined
     * @see https://nodejs.org/api/fs.html#fsrmsyncpath-options
     */
    export function rimrafSync(filepath: import("fs").PathLike): void;
    /**
     * Like Node.js' `fsPromises.mkdir()`, but will _not_ reject if the directory already exists.
     *
     * @param {string|Buffer|URL} filepath
     * @param {import('fs').MakeDirectoryOptions} [opts]
     * @returns {Promise<string|undefined>}
     * @see https://nodejs.org/api/fs.html#fspromisesmkdirpath-options
     */
    export function mkdir(filepath: string | Buffer | URL, opts?: import("fs").MakeDirectoryOptions | undefined): Promise<string | undefined>;
    /**
     * Copies files _and entire directories_
     * @param {string} source - Source to copy
     * @param {string} destination - Destination to copy to
     * @param {ncp.Options} [opts] - Additional arguments to pass to `ncp`
     * @see https://npm.im/ncp
     * @returns {Promise<void>}
     */
    export function copyFile(source: string, destination: string, opts?: ncp.Options | undefined): Promise<void>;
    /**
     * Create an MD5 hash of a file.
     * @param {PathLike} filePath
     * @returns {Promise<string>}
     */
    export function md5(filePath: import("fs").PathLike): Promise<string>;
    export function mv_1(from: string, to: string, opts?: mv.Options | undefined): B<void>;
    export { mv_1 as mv };
    export { which };
    export function glob(pattern: string, opts?: import("glob").GlobOptions | undefined): B<string[]>;
    export { sanitize as sanitizeName };
    /**
     * Create a hex digest of some file at `filePath`
     * @param {PathLike} filePath
     * @param {string} [algorithm]
     * @returns {Promise<string>}
     */
    export function hash(filePath: import("fs").PathLike, algorithm?: string | undefined): Promise<string>;
    /**
     * Returns an `Walker` instance, which is a readable stream (and thusly an async iterator).
     *
     * @param {string} dir - Dir to start walking at
     * @param {import('klaw').Options} [opts]
     * @returns {import('klaw').Walker}
     * @see https://www.npmjs.com/package/klaw
     */
    export function walk(dir: string, opts?: klaw.Options | undefined): klaw.Walker;
    /**
     * Recursively create a directory.
     * @param {PathLike} dir
     * @returns {Promise<string|undefined>}
     */
    export function mkdirp(dir: import("fs").PathLike): Promise<string | undefined>;
    /**
     * Walks a directory given according to the parameters given. The callback will be invoked with a path joined with the dir parameter
     * @param {string} dir Directory path where we will start walking
     * @param {boolean} recursive Set it to true if you want to continue walking sub directories
     * @param {WalkDirCallback} callback The callback to be called when a new path is found
     * @throws {Error} If the `dir` parameter contains a path to an invalid folder
     * @returns {Promise<string?>} returns the found path or null if the item was not found
     */
    export function walkDir(dir: string, recursive: boolean, callback: WalkDirCallback): Promise<string | null>;
    /**
     * Reads the closest `package.json` file from absolute path `dir`.
     * @param {string} dir - Directory to search from
     * @throws {Error} If there were problems finding or reading a `package.json` file
     */
    export function readPackageJsonFrom(dir: string, opts?: {}): readPkg.NormalizedPackageJson;
    /**
     * Finds the project root directory from `dir`.
     * @param {string} dir - Directory to search from
     * @throws {TypeError} If `dir` is not a nonempty string or relative path
     * @throws {Error} If there were problems finding the project root
     * @returns {string} The closeset parent dir containing `package.json`
     */
    export function findRoot(dir: string): string;
    export let access: typeof fsPromises.access;
    export let appendFile: typeof fsPromises.appendFile;
    export let chmod: typeof fsPromises.chmod;
    export let close: any;
    export { constants };
    export { createWriteStream };
    export { createReadStream };
    export let lstat: typeof fsPromises.lstat;
    export let open: (path: import("fs").PathLike, flags: import("fs").OpenMode, mode?: import("fs").Mode | undefined) => Promise<number>;
    export let openFile: typeof fsPromises.open;
    export let readdir: typeof fsPromises.readdir;
    export function read(fd: number, offset?: number | undefined, length?: number | undefined, position?: number | null | undefined): B<{
        bytesRead: number;
        buffer: TBuffer;
    }>;
    export let readFile: typeof fsPromises.readFile;
    export let readlink: typeof fsPromises.readlink;
    export let realpath: typeof fsPromises.realpath;
    export let rename: typeof fsPromises.rename;
    export let stat: typeof fsPromises.stat;
    export let symlink: typeof fsPromises.symlink;
    export let unlink: typeof fsPromises.unlink;
    export let write: any;
    export let writeFile: typeof fsPromises.writeFile;
    export let F_OK: number;
    export let R_OK: number;
    export let W_OK: number;
    export let X_OK: number;
}
import mv from 'mv';
import ncp from 'ncp';
import which from 'which';
import sanitize from 'sanitize-filename';
import klaw from 'klaw';
import readPkg from 'read-pkg';
import { promises as fsPromises } from 'fs';
import { constants } from 'fs';
import { createWriteStream } from 'fs';
import { createReadStream } from 'fs';
//# sourceMappingURL=fs.d.ts.map