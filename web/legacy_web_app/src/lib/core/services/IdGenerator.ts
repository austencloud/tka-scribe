/**
 * ID Generator Service Interface
 */

export enum IdGeneratorFormat {
  UUID = "uuid",
  SHORT = "short",
  TIMESTAMP = "timestamp",
  CUSTOM = "custom"
}

export interface IdGenerator {
  generate(format?: IdGeneratorFormat): string;
  generateWithPrefix(prefix: string, format?: IdGeneratorFormat): string;
  isValid(id: string): boolean;
}