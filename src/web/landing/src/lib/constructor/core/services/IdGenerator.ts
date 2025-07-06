export interface IdGenerator {
	next(): string;
	reset(): void;
}

export enum IdGeneratorFormat {
	UUID = 'uuid',
	SEQUENCE = 'sequence',
	TIMESTAMP = 'timestamp'
}
