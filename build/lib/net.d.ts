/**
 * Common options for {@linkcode uploadFile } and {@linkcode downloadFile }.
 */
export type NetOptions = {
    /**
     * - Whether to log the actual download performance
     * (e.g. timings and speed)
     */
    isMetered?: boolean | undefined;
    /**
     * - Authentication credentials
     */
    auth?: AuthCredentials | undefined;
};
/**
 * Specific options for {@linkcode downloadFile }.
 */
export type DownloadOptions = {
    /**
     * - The actual request timeout in milliseconds; defaults to {@linkcode DEFAULT_TIMEOUT_MS }
     */
    timeout?: number | undefined;
    /**
     * - Request headers mapping
     */
    headers?: Record<string, any> | undefined;
};
/**
 * Basic auth credentials; used by {@linkcode NetOptions }.
 */
export type AuthCredentials = {
    /**
     * - Non-empty user name
     */
    user: string;
    /**
     * - Non-empty password
     */
    pass: string;
};
/**
 * This type is used in {@linkcode uploadFile } if the remote location uses the `ftp` protocol, and distinguishes the type from {@linkcode HttpUploadOptions }.
 */
export type NotHttpUploadOptions = {
    headers: never;
    method: never;
    timeout: never;
    fileFieldName: never;
    formFields: never;
};
/**
 * Specific options for {@linkcode uploadFile } if the remote location uses the `http(s)` protocol
 */
export type HttpUploadOptions = {
    /**
     * - Additional request headers mapping
     */
    headers?: import("armor-types").HTTPHeaders | undefined;
    /**
     * - The HTTP method used for file upload
     */
    method?: import("axios").Method | undefined;
    /**
     * - The actual request timeout in milliseconds; defaults to {@linkcode DEFAULT_TIMEOUT_MS }
     */
    timeout?: number | undefined;
    /**
     * - The name of the form field containing the file
     * content to be uploaded. Any falsy value make the request to use non-multipart upload
     */
    fileFieldName?: string | undefined;
    /**
     * - The additional form fields
     * to be included into the upload request. This property is only considered if
     * `fileFieldName` is set
     */
    formFields?: Record<string, any> | [string, any][] | undefined;
};
/**
 * Uploads the given file to a remote location. HTTP(S) and FTP
 * protocols are supported.
 *
 * @param {string} localPath - The path to a file on the local storage.
 * @param {string} remoteUri - The remote URI to upload the file to.
 * @param {(HttpUploadOptions|NotHttpUploadOptions) & NetOptions} [uploadOptions]
 * @returns {Promise<void>}
 */
export function uploadFile(localPath: string, remoteUri: string, uploadOptions?: ((HttpUploadOptions | NotHttpUploadOptions) & NetOptions) | undefined): Promise<void>;
/**
 * Downloads the given file via HTTP(S)
 *
 * @param {string} remoteUrl - The remote url
 * @param {string} dstPath - The local path to download the file to
 * @param {DownloadOptions & NetOptions} [downloadOptions]
 * @throws {Error} If download operation fails
 */
export function downloadFile(remoteUrl: string, dstPath: string, downloadOptions?: (DownloadOptions & NetOptions) | undefined): Promise<void>;
//# sourceMappingURL=net.d.ts.map