"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = exports.uploadFile = void 0;
const lodash_1 = __importDefault(require("lodash"));
const fs_1 = __importDefault(require("./fs"));
const bluebird_1 = __importDefault(require("bluebird"));
const util_1 = require("./util");
const logger_1 = __importDefault(require("./logger"));
const jsftp_1 = __importDefault(require("jsftp"));
const timing_1 = __importDefault(require("./timing"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const DEFAULT_TIMEOUT_MS = 4 * 60 * 1000;
/**
 * Type guard for param to {@linkcode toAxiosAuth}
 * @param {any} value
 * @returns {value is AuthCredentials | import('axios').AxiosBasicCredentials}
 */
function isAxiosAuth(value) {
    return lodash_1.default.isPlainObject(value);
}
/**
 * Converts {@linkcode AuthCredentials} to credentials understood by {@linkcode axios}.
 * @param {AuthCredentials | import('axios').AxiosBasicCredentials} [auth]
 * @returns {import('axios').AxiosBasicCredentials?}
 */
function toAxiosAuth(auth) {
    if (!isAxiosAuth(auth)) {
        return null;
    }
    const axiosAuth = {
        username: 'username' in auth ? auth.username : auth.user,
        password: 'password' in auth ? auth.password : auth.pass,
    };
    return axiosAuth.username && axiosAuth.password ? axiosAuth : null;
}
/**
 * @param {NodeJS.ReadableStream} localFileStream
 * @param {URL} parsedUri
 * @param {HttpUploadOptions & NetOptions} [uploadOptions]
 */
async function uploadFileToHttp(localFileStream, parsedUri, uploadOptions = /** @type {HttpUploadOptions & NetOptions} */ ({})) {
    const { method = 'POST', timeout = DEFAULT_TIMEOUT_MS, headers, auth, fileFieldName = 'file', formFields, } = uploadOptions;
    const { href } = parsedUri;
    /** @type {import('axios').AxiosRequestConfig} */
    const requestOpts = {
        url: href,
        method,
        timeout,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    };
    const axiosAuth = toAxiosAuth(auth);
    if (axiosAuth) {
        requestOpts.auth = axiosAuth;
    }
    if (fileFieldName) {
        const form = new form_data_1.default();
        if (formFields) {
            let pairs = [];
            if (lodash_1.default.isArray(formFields)) {
                pairs = formFields;
            }
            else if (lodash_1.default.isPlainObject(formFields)) {
                pairs = lodash_1.default.toPairs(formFields);
            }
            for (const [key, value] of pairs) {
                if (lodash_1.default.toLower(key) !== lodash_1.default.toLower(fileFieldName)) {
                    form.append(key, value);
                }
            }
        }
        form.append(fileFieldName, localFileStream); // AWS S3 POST upload requires this to be the last field
        requestOpts.headers = {
            ...(lodash_1.default.isPlainObject(headers) ? headers : {}),
            ...form.getHeaders(),
        };
        requestOpts.data = form;
    }
    else {
        if (lodash_1.default.isPlainObject(headers)) {
            // @ts-ignore
            requestOpts.headers = headers;
        }
        requestOpts.data = localFileStream;
    }
    logger_1.default.debug(`Performing ${method} to ${href} with options (excluding data): ` +
        JSON.stringify(lodash_1.default.omit(requestOpts, ['data'])));
    const { status, statusText } = await (0, axios_1.default)(requestOpts);
    logger_1.default.info(`Server response: ${status} ${statusText}`);
}
/**
 * @param {string | Buffer | NodeJS.ReadableStream} localFileStream
 * @param {URL} parsedUri
 * @param {NotHttpUploadOptions & NetOptions} [uploadOptions]
 */
async function uploadFileToFtp(localFileStream, parsedUri, uploadOptions = /** @type {NotHttpUploadOptions & NetOptions} */ ({})) {
    const { auth } = uploadOptions;
    const { hostname, port, protocol, pathname } = parsedUri;
    const ftpOpts = {
        host: hostname,
        port: !lodash_1.default.isUndefined(port) ? lodash_1.default.parseInt(port) : 21,
    };
    if (auth?.user && auth?.pass) {
        ftpOpts.user = auth.user;
        ftpOpts.pass = auth.pass;
    }
    logger_1.default.debug(`${protocol} upload options: ${JSON.stringify(ftpOpts)}`);
    return await new bluebird_1.default((resolve, reject) => {
        new jsftp_1.default(ftpOpts).put(localFileStream, pathname, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
/**
 * Returns `true` if params are valid for {@linkcode uploadFileToHttp}.
 * @param {any} opts
 * @param {URL} url
 * @returns {opts is HttpUploadOptions & NetOptions}
 */
function isHttpUploadOptions(opts, url) {
    try {
        const { protocol } = url;
        return protocol === 'http:' || protocol === 'https:';
    }
    catch {
        return false;
    }
}
/**
 * Returns `true` if params are valid for {@linkcode uploadFileToFtp}.
 * @param {any} opts
 * @param {URL} url
 * @returns {opts is NotHttpUploadOptions & NetOptions}
 */
function isNotHttpUploadOptions(opts, url) {
    try {
        const { protocol } = url;
        return protocol === 'ftp:';
    }
    catch {
        return false;
    }
}
/**
 * Uploads the given file to a remote location. HTTP(S) and FTP
 * protocols are supported.
 *
 * @param {string} localPath - The path to a file on the local storage.
 * @param {string} remoteUri - The remote URI to upload the file to.
 * @param {(HttpUploadOptions|NotHttpUploadOptions) & NetOptions} [uploadOptions]
 * @returns {Promise<void>}
 */
async function uploadFile(localPath, remoteUri, uploadOptions = /** @type {(HttpUploadOptions|NotHttpUploadOptions) & NetOptions} */ ({})) {
    if (!(await fs_1.default.exists(localPath))) {
        throw new Error(`'${localPath}' does not exists or is not accessible`);
    }
    const { isMetered = true } = uploadOptions;
    const url = new URL(remoteUri);
    const { size } = await fs_1.default.stat(localPath);
    if (isMetered) {
        logger_1.default.info(`Uploading '${localPath}' of ${(0, util_1.toReadableSizeString)(size)} size to '${remoteUri}'`);
    }
    const timer = new timing_1.default().start();
    if (isHttpUploadOptions(uploadOptions, url)) {
        if (!uploadOptions.fileFieldName) {
            uploadOptions.headers = {
                ...(lodash_1.default.isPlainObject(uploadOptions.headers) ? uploadOptions.headers : {}),
                'Content-Length': size,
            };
        }
        await uploadFileToHttp(fs_1.default.createReadStream(localPath), url, uploadOptions);
    }
    else if (isNotHttpUploadOptions(uploadOptions, url)) {
        await uploadFileToFtp(fs_1.default.createReadStream(localPath), url, uploadOptions);
    }
    else {
        throw new Error(`Cannot upload the file at '${localPath}' to '${remoteUri}'. ` +
            `Unsupported remote protocol '${url.protocol}'. ` +
            `Only http/https and ftp/ftps protocols are supported.`);
    }
    if (isMetered) {
        logger_1.default.info(`Uploaded '${localPath}' of ${(0, util_1.toReadableSizeString)(size)} size in ` +
            `${timer.getDuration().asSeconds.toFixed(3)}s`);
    }
}
exports.uploadFile = uploadFile;
/**
 * Downloads the given file via HTTP(S)
 *
 * @param {string} remoteUrl - The remote url
 * @param {string} dstPath - The local path to download the file to
 * @param {DownloadOptions & NetOptions} [downloadOptions]
 * @throws {Error} If download operation fails
 */
async function downloadFile(remoteUrl, dstPath, downloadOptions = /** @type {DownloadOptions & NetOptions} */ ({})) {
    const { isMetered = true, auth, timeout = DEFAULT_TIMEOUT_MS, headers } = downloadOptions;
    /**
     * @type {import('axios').AxiosRequestConfig}
     */
    const requestOpts = {
        url: remoteUrl,
        responseType: 'stream',
        timeout,
    };
    const axiosAuth = toAxiosAuth(auth);
    if (axiosAuth) {
        requestOpts.auth = axiosAuth;
    }
    if (lodash_1.default.isPlainObject(headers)) {
        requestOpts.headers = headers;
    }
    const timer = new timing_1.default().start();
    let responseLength;
    try {
        const writer = fs_1.default.createWriteStream(dstPath);
        const { data: responseStream, headers: responseHeaders } = await (0, axios_1.default)(requestOpts);
        responseLength = parseInt(responseHeaders['content-length'] || '0', 10);
        responseStream.pipe(writer);
        await new bluebird_1.default((resolve, reject) => {
            responseStream.once('error', reject);
            writer.once('finish', resolve);
            writer.once('error', (e) => {
                responseStream.unpipe(writer);
                reject(e);
            });
        });
    }
    catch (err) {
        throw new Error(`Cannot download the file from ${remoteUrl}: ${err.message}`);
    }
    const { size } = await fs_1.default.stat(dstPath);
    if (responseLength && size !== responseLength) {
        await fs_1.default.rimraf(dstPath);
        throw new Error(`The size of the file downloaded from ${remoteUrl} (${size} bytes) ` +
            `differs from the one in Content-Length response header (${responseLength} bytes)`);
    }
    if (isMetered) {
        const secondsElapsed = timer.getDuration().asSeconds;
        logger_1.default.debug(`${remoteUrl} (${(0, util_1.toReadableSizeString)(size)}) ` +
            `has been downloaded to '${dstPath}' in ${secondsElapsed.toFixed(3)}s`);
        if (secondsElapsed >= 2) {
            const bytesPerSec = Math.floor(size / secondsElapsed);
            logger_1.default.debug(`Approximate download speed: ${(0, util_1.toReadableSizeString)(bytesPerSec)}/s`);
        }
    }
}
exports.downloadFile = downloadFile;
/**
 * Common options for {@linkcode uploadFile} and {@linkcode downloadFile}.
 * @typedef NetOptions
 * @property {boolean} [isMetered=true] - Whether to log the actual download performance
 * (e.g. timings and speed)
 * @property {AuthCredentials} [auth] - Authentication credentials
 */
/**
 * Specific options for {@linkcode downloadFile}.
 * @typedef DownloadOptions
 * @property {number} [timeout] - The actual request timeout in milliseconds; defaults to {@linkcode DEFAULT_TIMEOUT_MS}
 * @property {Record<string,any>} [headers] - Request headers mapping
 */
/**
 * Basic auth credentials; used by {@linkcode NetOptions}.
 * @typedef AuthCredentials
 * @property {string} user - Non-empty user name
 * @property {string} pass - Non-empty password
 */
/**
 * This type is used in {@linkcode uploadFile} if the remote location uses the `ftp` protocol, and distinguishes the type from {@linkcode HttpUploadOptions}.
 * @typedef NotHttpUploadOptions
 * @property {never} headers
 * @property {never} method
 * @property {never} timeout
 * @property {never} fileFieldName
 * @property {never} formFields
 */
/**
 * Specific options for {@linkcode uploadFile} if the remote location uses the `http(s)` protocol
 * @typedef HttpUploadOptions
 * @property {import('armor-types').HTTPHeaders} [headers] - Additional request headers mapping
 * @property {import('axios').Method} [method='POST'] - The HTTP method used for file upload
 * @property {number} [timeout] - The actual request timeout in milliseconds; defaults to {@linkcode DEFAULT_TIMEOUT_MS}
 * @property {string} [fileFieldName='file'] - The name of the form field containing the file
 * content to be uploaded. Any falsy value make the request to use non-multipart upload
 * @property {Record<string, any> | [string, any][]} [formFields] - The additional form fields
 * to be included into the upload request. This property is only considered if
 * `fileFieldName` is set
 */
//# sourceMappingURL=net.js.map