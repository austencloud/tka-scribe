import { describe, it, expect, beforeEach } from "vitest";
import { CAPTypeService } from "./CAPTypeService";
import { CAPComponent, CAPType } from "$shared";

describe("CAPTypeService", () => {
	let service: CAPTypeService;

	beforeEach(() => {
		service = new CAPTypeService();
	});

	describe("parseComponents", () => {
		it("should parse STRICT_ROTATED correctly", () => {
			const result = service.parseComponents(CAPType.STRICT_ROTATED);
			expect(result.has(CAPComponent.ROTATED)).toBe(true);
			expect(result.size).toBe(1);
		});

		it("should parse MIRRORED_COMPLEMENTARY correctly", () => {
			const result = service.parseComponents(CAPType.MIRRORED_COMPLEMENTARY);
			expect(result.has(CAPComponent.MIRRORED)).toBe(true);
			expect(result.has(CAPComponent.COMPLEMENTARY)).toBe(true);
			expect(result.size).toBe(2);
		});

		it("should parse MIRRORED_COMPLEMENTARY_ROTATED correctly", () => {
			const result = service.parseComponents(CAPType.MIRRORED_COMPLEMENTARY_ROTATED);
			expect(result.has(CAPComponent.MIRRORED)).toBe(true);
			expect(result.has(CAPComponent.COMPLEMENTARY)).toBe(true);
			expect(result.has(CAPComponent.ROTATED)).toBe(true);
			expect(result.size).toBe(3);
		});
	});

	describe("generateCAPType", () => {
		it("should generate STRICT_ROTATED from single ROTATED component", () => {
			const components = new Set([CAPComponent.ROTATED]);
			const result = service.generateCAPType(components);
			expect(result).toBe(CAPType.STRICT_ROTATED);
		});

		it("should generate MIRRORED_COMPLEMENTARY from two components", () => {
			const components = new Set([
				CAPComponent.MIRRORED,
				CAPComponent.COMPLEMENTARY
			]);
			const result = service.generateCAPType(components);
			expect(result).toBe(CAPType.MIRRORED_COMPLEMENTARY);
		});

		it("should generate STRICT_ROTATED from empty set", () => {
			const components = new Set<CAPComponent>();
			const result = service.generateCAPType(components);
			expect(result).toBe(CAPType.STRICT_ROTATED);
		});
	});

	describe("formatForDisplay", () => {
		it("should format STRICT_ROTATED correctly", () => {
			const result = service.formatForDisplay(CAPType.STRICT_ROTATED);
			expect(result).toBe("Strict Rotated");
		});

		it("should format MIRRORED_COMPLEMENTARY correctly", () => {
			const result = service.formatForDisplay(CAPType.MIRRORED_COMPLEMENTARY);
			expect(result).toBe("Mirrored Complementary");
		});

		it("should truncate long names", () => {
			const result = service.formatForDisplay(CAPType.MIRRORED_COMPLEMENTARY_ROTATED);
			expect(result).toContain("+");
			expect(result).toContain("more");
		});
	});

	describe("roundtrip", () => {
		it("should parse and generate the same CAP type", () => {
			const original = CAPType.MIRRORED_COMPLEMENTARY;
			const components = service.parseComponents(original);
			const result = service.generateCAPType(components);
			expect(result).toBe(original);
		});
	});
});
