"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.killProcess = exports.getProcessIds = void 0;
const ait_process_1 = require("ait-process");
/*
 * Exit Status for pgrep and pkill (`man pkill`)
 *  0. One or more processes matched the criteria.
 *  1. No processes matched.
 *  2. Syntax error in the command line.
 *  3. Fatal error: out of memory etc.
 */
async function getProcessIds(appName) {
    let pids;
    try {
        let { stdout } = await (0, ait_process_1.exec)('pgrep', ['-x', appName]);
        pids = stdout
            .trim()
            .split('\n')
            .map((pid) => parseInt(pid, 10));
    }
    catch (err) {
        if (parseInt(err.code, 10) !== 1) {
            throw new Error(`Error getting process ids for app '${appName}': ${err.message}`);
        }
        pids = [];
    }
    return pids;
}
exports.getProcessIds = getProcessIds;
async function killProcess(appName, force = false) {
    let pids = await getProcessIds(appName);
    if (pids.length === 0) {
        // the process is not running
        return;
    }
    try {
        let args = force ? ['-9'] : [];
        args.push('-x', appName);
        await (0, ait_process_1.exec)('pkill', args);
    }
    catch (err) {
        if (parseInt(err.code, 10) !== 1) {
            throw new Error(`Error killing app '${appName}' with pkill: ${err.message}`);
        }
    }
}
exports.killProcess = killProcess;
//# sourceMappingURL=process.js.map