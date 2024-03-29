/// <reference types="node" />
/**
 * A particular console/logging class for Armor's CLI.
 *
 * - By default, uses some fancy symbols
 * - Writes to `STDERR`, generally.
 * - In "JSON mode", `STDERR` is squelched. Use {@linkcode Console.json} to write the JSON.
 *
 * DO NOT extend this to do anything other than what it already does. Download a library or something.
 */
export class CliConsole {
    /**
     * @type {Record<keyof typeof symbols,keyof Extract<import('@colors/colors').Color, 'string'>>}
     */
    static symbolToColor: Record<keyof typeof symbols, keyof Extract<import('@colors/colors').Color, 'string'>>;
    /**
     *
     * @param {ConsoleOpts} opts
     */
    constructor({ jsonMode, useSymbols, useColor }?: ConsoleOpts);
    /**
     * Wraps a message string in breathtaking fanciness
     *
     * Returns `undefined` if `msg` is `undefined`.
     * @param {string} [msg] - Message to decorate, if anything
     * @param {keyof typeof CliConsole['symbolToColor']} [symbol] - Symbol to use
     * @returns {string|undefined}
     */
    decorate(msg?: string | undefined, symbol?: "info" | "success" | "warning" | "error" | undefined): string | undefined;
    /**
     * Writes to `STDOUT`.  Must be stringifyable.
     *
     * You probably don't want to call this more than once before exiting (since that will output invalid JSON).
     * @param {import('type-fest').JsonValue} value
     */
    json(value: import('type-fest').JsonValue): void;
    /**
     * General logging function.
     * @param {string} [message]
     * @param {...any} args
     */
    log(message?: string | undefined, ...args: any[]): void;
    /**
     * A "success" message
     * @param {string} [message]
     * @param {...any} args
     */
    ok(message?: string | undefined, ...args: any[]): void;
    /**
     * Alias for {@linkcode Console.log}
     * @param {string} [message]
     * @param {...any} args
     */
    debug(message?: string | undefined, ...args: any[]): void;
    /**
     * Wraps {@link console.dir}
     * @param {any} item
     * @param {import('util').InspectOptions} [opts]
     */
    dump(item: any, opts?: import("util").InspectOptions | undefined): void;
    /**
     * An "info" message
     * @param {string} [message]
     * @param {...any} args
     */
    info(message?: string | undefined, ...args: any[]): void;
    /**
     * A "warning" message
     * @param {string} [message]
     * @param {...any} args
     */
    warn(message?: string | undefined, ...args: any[]): void;
    /**
     * An "error" message
     * @param {string} [message]
     * @param {...any} args
     */
    error(message?: string | undefined, ...args: any[]): void;
    #private;
}
/**
 * Options for {@linkcode CliConsole}.
 *
 * @typedef ConsoleOpts
 * @property {boolean} [jsonMode] - If _truthy_, supress all output except JSON (use {@linkcode CliConsole#json}), which writes to `STDOUT`.
 * @property {boolean} [useSymbols] - If _falsy_, do not use fancy symbols.
 * @property {boolean} [useColor] - If _falsy_, do not use color output. If _truthy_, forces color output. By default, checks terminal/TTY for support via pkg `supports-color`. Ignored if `useSymbols` is `false`.
 * @see https://npm.im/supports-color
 */
export const console: CliConsole;
export { symbols };
/**
 * Options for {@linkcode CliConsole }.
 */
export type ConsoleOpts = {
    /**
     * - If _truthy_, supress all output except JSON (use {@linkcode CliConsolejson }), which writes to `STDOUT`.
     */
    jsonMode?: boolean | undefined;
    /**
     * - If _falsy_, do not use fancy symbols.
     */
    useSymbols?: boolean | undefined;
    /**
     * - If _falsy_, do not use color output. If _truthy_, forces color output. By default, checks terminal/TTY for support via pkg `supports-color`. Ignored if `useSymbols` is `false`.
     */
    useColor?: boolean | undefined;
};
import symbols from 'log-symbols';
//# sourceMappingURL=console.d.ts.map