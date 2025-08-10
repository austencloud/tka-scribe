/**
 * Simple Dependency Injection Container
 * Local implementation to replace missing @tka/shared/di/core modules
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

export class ServiceContainer {
	private services = new Map<string, any>();
	private factories = new Map<string, Factory<any>>();
	private singletons = new Map<string, any>();

	constructor(public readonly name: string) {}

	register<T>(serviceInterface: ServiceInterface<T>, ...dependencies: ServiceInterface[]): void {
		this.services.set(serviceInterface.token, {
			implementation: serviceInterface.implementation,
			dependencies: dependencies.map((dep) => dep.token),
		});
	}

	registerFactory<T>(serviceInterface: ServiceInterface<T>, factory: Factory<T>): void {
		this.factories.set(serviceInterface.token, factory);
	}

	registerSingleton<T>(serviceInterface: ServiceInterface<T>, instance: T): void {
		this.singletons.set(serviceInterface.token, instance);
	}

	registerSingletonClass<T>(serviceInterface: ServiceInterface<T>): void {
		const instance = new serviceInterface.implementation();
		this.singletons.set(serviceInterface.token, instance);
	}

	resolve<T>(serviceInterface: ServiceInterface<T>): T {
		const token = serviceInterface.token;

		// Check if it's a singleton
		if (this.singletons.has(token)) {
			return this.singletons.get(token);
		}

		// Check if it's a factory
		if (this.factories.has(token)) {
			return this.factories.get(token)!();
		}

		// Check if it's a registered service
		const serviceConfig = this.services.get(token);
		if (serviceConfig) {
			const { implementation, dependencies } = serviceConfig;
			const resolvedDependencies = dependencies.map((depToken: string) => {
				const depInterface = Array.from(this.services.keys()).find(
					(key) => key === depToken
				);
				if (!depInterface) {
					throw new Error(`Dependency ${depToken} not found`);
				}
				return this.resolve({
					token: depToken,
					implementation: this.services.get(depToken).implementation,
				});
			});

			return new implementation(...resolvedDependencies);
		}

		throw new Error(`Service ${token} not registered`);
	}

	has(serviceInterface: ServiceInterface): boolean {
		return (
			this.services.has(serviceInterface.token) ||
			this.factories.has(serviceInterface.token) ||
			this.singletons.has(serviceInterface.token)
		);
	}

	clear(): void {
		this.services.clear();
		this.factories.clear();
		this.singletons.clear();
	}
}
