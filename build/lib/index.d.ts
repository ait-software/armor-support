/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="klaw" />
import * as tempDir from './tempdir';
import * as system from './system';
import * as util from './util';
import { fs } from './fs';
import * as net from './net';
import * as plist from './plist';
import { mkdirp } from './mkdirp';
import * as logger from './logging';
import * as process from './process';
import * as zip from './zip';
import * as imageUtil from './image-util';
import * as mjpeg from './mjpeg';
import * as node from './node';
import * as timing from './timing';
import * as env from './env';
import * as console from './console';
export { npm } from './npm';
declare const cancellableDelay: typeof util.cancellableDelay;
export { tempDir, system, util, fs, cancellableDelay, plist, mkdirp, logger, process, zip, imageUtil, net, mjpeg, node, timing, env, console, };
declare const _default: {
    tempDir: typeof tempDir;
    system: typeof system;
    util: typeof util;
    fs: {
        hasAccess(path: import("fs").PathLike): Promise<boolean>;
        isExecutable(path: import("fs").PathLike): Promise<boolean>;
        exists(path: import("fs").PathLike): Promise<boolean>;
        rimraf(filepath: import("fs").PathLike): Promise<void>;
        rimrafSync(filepath: import("fs").PathLike): void;
        mkdir(filepath: string | Buffer | URL, opts?: import("fs").MakeDirectoryOptions | undefined): Promise<string | undefined>;
        copyFile(source: string, destination: string, opts?: import("ncp").Options | undefined): Promise<void>;
        md5(filePath: import("fs").PathLike): Promise<string>;
        mv: (from: string, to: string, opts?: import("mv").Options | undefined) => B<void>;
        which: typeof import("which");
        glob: (pattern: string, opts?: import("glob").GlobOptions | undefined) => B<string[]>;
        sanitizeName: typeof import("sanitize-filename");
        hash(filePath: import("fs").PathLike, algorithm?: string | undefined): Promise<string>;
        walk(dir: string, opts?: import("klaw").Options | undefined): import("klaw").Walker;
        mkdirp(dir: import("fs").PathLike): Promise<string | undefined>;
        walkDir(dir: string, recursive: boolean, callback: import("./fs").WalkDirCallback): Promise<string | null>;
        readPackageJsonFrom(dir: string, opts?: {}): import("read-pkg").NormalizedPackageJson;
        findRoot(dir: string): string;
        access: typeof import("fs/promises").access;
        appendFile: typeof import("fs/promises").appendFile;
        chmod: typeof import("fs/promises").chmod;
        close: any;
        constants: typeof import("fs").constants;
        createWriteStream: typeof import("fs").createWriteStream;
        createReadStream: typeof import("fs").createReadStream;
        lstat: typeof import("fs/promises").lstat;
        open: (path: import("fs").PathLike, flags: import("fs").OpenMode, mode?: import("fs").Mode | undefined) => Promise<number>;
        openFile: typeof import("fs/promises").open;
        readdir: typeof import("fs/promises").readdir;
        read: import("./fs").ReadFn<NodeJS.ArrayBufferView>;
        readFile: typeof import("fs/promises").readFile;
        readlink: typeof import("fs/promises").readlink;
        realpath: typeof import("fs/promises").realpath;
        rename: typeof import("fs/promises").rename;
        stat: typeof import("fs/promises").stat;
        symlink: typeof import("fs/promises").symlink;
        unlink: typeof import("fs/promises").unlink;
        write: any;
        writeFile: typeof import("fs/promises").writeFile;
        F_OK: number;
        R_OK: number;
        W_OK: number;
        X_OK: number;
    };
    cancellableDelay: typeof util.cancellableDelay;
    plist: typeof plist;
    mkdirp: (dir: import("fs").PathLike) => Promise<string | undefined>;
    logger: typeof logger;
    process: typeof process;
    zip: typeof zip;
    imageUtil: typeof imageUtil;
    net: typeof net;
    mjpeg: typeof mjpeg;
    node: typeof node;
    timing: typeof timing;
    env: typeof env;
    console: typeof console;
};
export default _default;
export type { ConsoleOpts } from './console';
export type { ReadFn, WalkDirCallback } from './fs';
export type { NetOptions, DownloadOptions, AuthCredentials, NotHttpUploadOptions, HttpUploadOptions, } from './net';
export type { InstallPackageOpts, ExecOpts, NpmInstallReceipt } from './npm';
export type { Affixes, OpenedAffixes } from './tempdir';
export type { PluralizeOptions, EncodingOptions, LockFileOptions, NonEmptyString } from './util';
export type { ExtractAllOptions, ZipEntry, ZipOptions, ZipCompressionOptions, ZipSourceOptions, } from './zip';
export type { SecureValuePreprocessingRule } from './log-internal';
//# sourceMappingURL=index.d.ts.map