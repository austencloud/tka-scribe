/**
 * Core Service Interfaces for TKA V2 Modern
 * 
 * These interfaces define the contract for all application services,
 * following the service-oriented architecture pattern from the desktop app.
 */

import type { SequenceData, BeatData, MotionData } from '@tka/schemas';

// ============================================================================
// SEQUENCE SERVICES
// ============================================================================

export interface SequenceCreateRequest {
	name: string;
	length: number;
	gridMode?: 'diamond' | 'box';
	propType?: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

export interface ISequenceService {
	createSequence(request: SequenceCreateRequest): Promise<SequenceData>;
	updateBeat(sequenceId: string, beatIndex: number, beatData: BeatData): Promise<void>;
	deleteSequence(id: string): Promise<void>;
	getSequence(id: string): Promise<SequenceData | null>;
	getAllSequences(): Promise<SequenceData[]>;
}

export interface ISequenceDomainService {
	validateCreateRequest(request: SequenceCreateRequest): ValidationResult;
	createSequence(request: SequenceCreateRequest): SequenceData;
	updateBeat(sequence: SequenceData, beatIndex: number, beatData: BeatData): SequenceData;
	calculateSequenceWord(sequence: SequenceData): string;
}

// ============================================================================
// PICTOGRAPH SERVICES
// ============================================================================

export interface PictographData {
	id: string;
	gridData: any;
	arrows: { blue: any; red: any };
	props: { blue: any; red: any };
	motions: { blue: MotionData | null; red: MotionData | null };
}

export interface IPictographService {
	renderPictograph(data: PictographData): Promise<SVGElement>;
	updateArrow(pictographId: string, arrowData: any): Promise<PictographData>;
}

export interface IPictographRenderingService {
	renderPictograph(data: PictographData): Promise<SVGElement>;
	renderBeat(beat: BeatData): Promise<SVGElement>;
}

// ============================================================================
// PERSISTENCE SERVICES
// ============================================================================

export interface IPersistenceService {
	saveSequence(sequence: SequenceData): Promise<void>;
	loadSequence(id: string): Promise<SequenceData | null>;
	loadAllSequences(): Promise<SequenceData[]>;
	deleteSequence(id: string): Promise<void>;
}

// ============================================================================
// GENERATION SERVICES
// ============================================================================

export interface GenerationOptions {
	length: number;
	gridMode: 'diamond' | 'box';
	propType: string;
	difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ISequenceGenerationService {
	generateSequence(options: GenerationOptions): Promise<SequenceData>;
}

export interface IMotionGenerationService {
	generateMotion(
		color: 'blue' | 'red',
		options: GenerationOptions,
		previousBeats: BeatData[]
	): Promise<MotionData>;
}

// ============================================================================
// APPLICATION SERVICES
// ============================================================================

export interface IApplicationInitializationService {
	initialize(): Promise<void>;
}

export interface AppSettings {
	theme: 'light' | 'dark';
	gridMode: 'diamond' | 'box';
	showBeatNumbers: boolean;
	autoSave: boolean;
	exportQuality: 'low' | 'medium' | 'high';
}

export interface ISettingsService {
	currentSettings: AppSettings;
	updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void>;
	loadSettings(): Promise<void>;
}

// ============================================================================
// EXPORT SERVICES
// ============================================================================

export interface ExportOptions {
	beatSize: number;
	spacing: number;
	includeTitle: boolean;
	includeMetadata: boolean;
}

export interface IExportService {
	exportSequenceAsImage(sequence: SequenceData, options: ExportOptions): Promise<Blob>;
	exportSequenceAsJson(sequence: SequenceData): Promise<string>;
}

// ============================================================================
// SERVICE REGISTRY
// ============================================================================

export type ServiceInterface<T> = {
	readonly name: string;
	readonly _type?: T;
};

// Helper function to define service interfaces
export function defineService<T>(name: string): ServiceInterface<T> {
	return { name } as ServiceInterface<T>;
}

// Service interface definitions
export const ISequenceService = defineService<ISequenceService>('ISequenceService');
export const ISequenceDomainService = defineService<ISequenceDomainService>('ISequenceDomainService');
export const IPictographService = defineService<IPictographService>('IPictographService');
export const IPictographRenderingService = defineService<IPictographRenderingService>('IPictographRenderingService');
export const IPersistenceService = defineService<IPersistenceService>('IPersistenceService');
export const ISequenceGenerationService = defineService<ISequenceGenerationService>('ISequenceGenerationService');
export const IMotionGenerationService = defineService<IMotionGenerationService>('IMotionGenerationService');
export const IApplicationInitializationService = defineService<IApplicationInitializationService>('IApplicationInitializationService');
export const ISettingsService = defineService<ISettingsService>('ISettingsService');
export const IExportService = defineService<IExportService>('IExportService');
