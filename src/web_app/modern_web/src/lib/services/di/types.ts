/**
 * Type definitions for the DI system
 * Local implementation to replace missing @tka/shared/di/core/types
 */

export interface ServiceInterface<T = any> {
	token: string;
	implementation: new (...args: any[]) => T;
}

export function createServiceInterface<T>(
	token: string,
	implementation: new (...args: any[]) => T
): ServiceInterface<T> {
	return { token, implementation };
}

export type Factory<T> = () => T;
