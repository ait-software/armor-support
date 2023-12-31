/** @type {import('armor-types').ArmorLoggerLevel[]} */
export const LEVELS: import('armor-types').ArmorLoggerLevel[];
export default log;
export type LoadResult = {
    /**
     * The list of rule parsing issues (one item per rule).
     * Rules with issues are skipped. An empty list is returned if no parsing issues exist.
     */
    issues: string[];
    /**
     * The list of successfully loaded
     * replacement rules. The list could be empty if no rules were loaded.
     */
    rules: import('./log-internal').SecureValuePreprocessingRule[];
};
export type ArmorLoggerPrefix = import('armor-types').ArmorLoggerPrefix;
export type ArmorLogger = import('armor-types').ArmorLogger;
export type ArmorLoggerLevel = import('armor-types').ArmorLoggerLevel;
export const log: import("armor-types").ArmorLogger;
/**
 *
 * @param {import('npmlog').Logger} logger
 */
export function patchLogger(logger: import('npmlog').Logger): void;
/**
 *
 * @param {ArmorLoggerPrefix?} prefix
 * @returns {ArmorLogger}
 */
export function getLogger(prefix?: ArmorLoggerPrefix | null): ArmorLogger;
/**
 * @typedef LoadResult
 * @property {string[]} issues The list of rule parsing issues (one item per rule).
 * Rules with issues are skipped. An empty list is returned if no parsing issues exist.
 * @property {import('./log-internal').SecureValuePreprocessingRule[]} rules The list of successfully loaded
 * replacement rules. The list could be empty if no rules were loaded.
 */
/**
 * Loads the JSON file containing secure values replacement rules.
 * This might be necessary to hide sensitive values that may possibly
 * appear in Armor logs.
 * Each call to this method replaces the previously loaded rules if any existed.
 *
 * @param {string|string[]|import('armor-types').LogFiltersConfig} rulesJsonPath The full path to the JSON file containing
 * the replacement rules. Each rule could either be a string to be replaced
 * or an object with predefined properties.
 * @throws {Error} If the given file cannot be loaded
 * @returns {Promise<LoadResult>}
 */
export function loadSecureValuesPreprocessingRules(rulesJsonPath: string | string[] | import('armor-types').LogFiltersConfig): Promise<LoadResult>;
//# sourceMappingURL=logging.d.ts.map