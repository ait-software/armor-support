export default SECURE_VALUES_PREPROCESSOR;
export type SecureValuePreprocessingRule = {
    /**
     * The parsed pattern which is going to be used for replacement
     */
    pattern: RegExp;
    /**
     * The replacer value to use. By default
     * equals to `DEFAULT_SECURE_REPLACER`
     */
    replacer?: string | undefined;
};
export const SECURE_VALUES_PREPROCESSOR: SecureValuesPreprocessor;
export class SecureValuesPreprocessor {
    _rules: any[];
    /**
     * @returns {Array<SecureValuePreprocessingRule>} The list of successfully
     * parsed preprocessing rules
     */
    get rules(): SecureValuePreprocessingRule[];
    /**
     * Parses single rule from the given JSON file
     *
     * @param {string|import('armor-types').LogFilter} rule The rule might either be represented as a single string
     * or a configuration object
     * @throws {Error} If there was an error while parsing the rule
     * @returns {SecureValuePreprocessingRule} The parsed rule
     */
    parseRule(rule: string | import('armor-types').LogFilter): SecureValuePreprocessingRule;
    /**
     * Loads rules from the given JSON file
     *
     * @param {string|string[]|import('armor-types').LogFiltersConfig} source The full path to the JSON file containing secure
     * values replacement rules or the rules themselves represented as an array
     * @throws {Error} If the format of the source file is invalid or
     * it does not exist
     * @returns {Promise<string[]>} The list of issues found while parsing each rule.
     * An empty list is returned if no rule parsing issues were found
     */
    loadRules(source: string | string[] | import('armor-types').LogFiltersConfig): Promise<string[]>;
    /**
     * Performs secure values replacement inside the given string
     * according to the previously loaded rules. No replacement is made
     * if there are no rules or the given value is not a string
     *
     * @param {string} str The string to make replacements in
     * @returns {string} The string with replacements made
     */
    preprocess(str: string): string;
}
//# sourceMappingURL=log-internal.d.ts.map