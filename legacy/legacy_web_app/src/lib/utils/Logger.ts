export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	NONE = 100
}

export function isProduction(): boolean {
	try {
		if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
			return true;
		}

		if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD === true) {
			return true;
		}

		return false;
	} catch (e) {
		return false;
	}
}

let configInstance: LoggerConfig | null = null;

export class LoggerConfig {
	logLevel: LogLevel;
	enabledModules: Set<string>;

	constructor() {
		this.logLevel = isProduction() ? LogLevel.ERROR : LogLevel.DEBUG;
		this.enabledModules = new Set<string>();
	}

	static getInstance(): LoggerConfig {
		if (!configInstance) {
			configInstance = new LoggerConfig();
		}
		return configInstance;
	}

	getLogLevel(): LogLevel {
		return this.logLevel;
	}

	setLogLevel(level: LogLevel): void {
		this.logLevel = level;
	}

	enableModule(moduleName: string): void {
		this.enabledModules.add(moduleName);
	}

	disableModule(moduleName: string): void {
		this.enabledModules.delete(moduleName);
	}

	isModuleEnabled(moduleName: string): boolean {
		if (this.enabledModules.size === 0) {
			return true;
		}
		return this.enabledModules.has(moduleName);
	}

	reset(): void {
		this.logLevel = isProduction() ? LogLevel.ERROR : LogLevel.DEBUG;
		this.enabledModules.clear();
	}
}

export class Logger {
	moduleName: string;
	config: LoggerConfig;

	constructor(moduleName: string) {
		this.moduleName = moduleName;
		this.config = LoggerConfig.getInstance();
	}

	debug(message: string, data?: any): void {
		this.logMessage(LogLevel.DEBUG, message, data);
	}

	info(message: string, data?: any): void {
		this.logMessage(LogLevel.INFO, message, data);
	}

	warn(message: string, data?: any): void {
		this.logMessage(LogLevel.WARN, message, data);
	}

	error(message: string, error?: any): void {
		this.logMessage(LogLevel.ERROR, message, error);
	}

	logMessage(level: LogLevel, message: string, data?: any): void {
		if (level < this.config.getLogLevel()) {
			return;
		}

		if (!this.config.isModuleEnabled(this.moduleName)) {
			return;
		}

		const timestamp = new Date().toISOString();
		const prefix = `[${timestamp}] [${this.getLevelName(level)}] [${this.moduleName}]`;

		switch (level) {
			case LogLevel.DEBUG:
				data ? console.debug(`${prefix} ${message}`, data) : console.debug(`${prefix} ${message}`);
				break;
			case LogLevel.INFO:
				data ? console.info(`${prefix} ${message}`, data) : console.info(`${prefix} ${message}`);
				break;
			case LogLevel.WARN:
				data ? console.warn(`${prefix} ${message}`, data) : console.warn(`${prefix} ${message}`);
				break;
			case LogLevel.ERROR:
				data ? console.error(`${prefix} ${message}`, data) : console.error(`${prefix} ${message}`);
				break;
		}
	}

	getLevelName(level: LogLevel): string {
		switch (level) {
			case LogLevel.DEBUG:
				return 'DEBUG';
			case LogLevel.INFO:
				return 'INFO';
			case LogLevel.WARN:
				return 'WARN';
			case LogLevel.ERROR:
				return 'ERROR';
			default:
				return 'UNKNOWN';
		}
	}
}
