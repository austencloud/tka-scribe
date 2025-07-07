import { Injectable } from '../core/di/ServiceDecorator.js';
import { SERVICE_TOKENS } from '../core/di/ServiceTokens.js';
import { IdGeneratorFormat, type IdGenerator } from '../core/services/IdGenerator.js';
import { browser } from '$app/environment';

@Injectable(SERVICE_TOKENS.ID_GENERATOR, { scope: 'transient' })
export class SequentialIdGenerator implements IdGenerator {
	private sequence = 0;
	private prefix: string;
	private format: IdGeneratorFormat;

	constructor(prefix: string = '', format: IdGeneratorFormat = IdGeneratorFormat.SEQUENCE) {
		this.prefix = prefix;
		this.format = format;
		this.sequence = Math.floor(Math.random() * 1000);
	}

	next(): string {
		switch (this.format) {
			case IdGeneratorFormat.UUID:
				return browser
					? `${this.prefix}${crypto.randomUUID()}`
					: `${this.prefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

			case IdGeneratorFormat.TIMESTAMP:
				return `${this.prefix}${Date.now()}`;

			case IdGeneratorFormat.SEQUENCE:
			default:
				return `${this.prefix}${++this.sequence}`;
		}
	}

	reset(): void {
		this.sequence = 0;
	}
}
