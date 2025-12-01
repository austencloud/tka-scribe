/**
 * PerformanceHistoryService - Performance History Implementation
 *
 * Manages training session history storage and retrieval.
 * Uses IndexedDB for local storage with future Firestore sync.
 */

import { injectable } from "inversify";
import type {
	IPerformanceHistoryService,
	PersonalBest,
	StatsOverview
} from "../contracts/IPerformanceHistoryService";
import type { StoredPerformance } from "../../domain/models/TrainDatabaseModels";

@injectable()
export class PerformanceHistoryService implements IPerformanceHistoryService {
	constructor() {
		// TODO: Inject TKADatabase when implementing persistence
	}

	async savePerformance(performance: StoredPerformance): Promise<void> {
		// TODO: Save to IndexedDB
		console.log("[PerformanceHistoryService] Save performance (stub):", performance);
	}

	async getRecentSessions(limit: number): Promise<StoredPerformance[]> {
		// TODO: Fetch from IndexedDB
		console.log("[PerformanceHistoryService] Get recent sessions (stub):", limit);
		return [];
	}

	async getPersonalBests(): Promise<PersonalBest[]> {
		// TODO: Calculate from IndexedDB
		console.log("[PerformanceHistoryService] Get personal bests (stub)");
		return [];
	}

	async getStatsOverview(): Promise<StatsOverview> {
		// TODO: Calculate from IndexedDB
		console.log("[PerformanceHistoryService] Get stats overview (stub)");
		return {
			totalSessions: 0,
			totalPracticeTime: 0,
			averageAccuracy: 0,
			maxCombo: 0
		};
	}

	async getPersonalBest(sequenceId: string): Promise<PersonalBest | null> {
		// TODO: Fetch from IndexedDB
		console.log("[PerformanceHistoryService] Get personal best (stub):", sequenceId);
		return null;
	}

	async deleteSession(sessionId: string): Promise<void> {
		// TODO: Delete from IndexedDB
		console.log("[PerformanceHistoryService] Delete session (stub):", sessionId);
	}
}
