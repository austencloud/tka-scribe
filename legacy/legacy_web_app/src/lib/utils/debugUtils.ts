// src/lib/utils/debugUtils.ts
const DEBUG_ENABLED = true;

export function debugLog(component: string, message: string, data?: any): void {
	if (DEBUG_ENABLED) {
		const logMsg = `[${component}] ${message}`;
		if (data !== undefined) {
			console.log(logMsg, data);
		} else {
			console.log(logMsg);
		}
	}
}
