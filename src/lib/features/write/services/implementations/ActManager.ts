/**
 * ActManager - Implementation for Write tab Act operations
 */
import { injectable } from "inversify";
import type { ActSummary, IActManager } from "../contracts/IActManager";

@injectable()
export class ActManager implements IActManager {
  private acts: Map<string, ActSummary> = new Map();
  private initialized = false;

  constructor() {
    console.log("🎭 ActManager initialized");
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log("🎭 ActManager: Initializing...");

    // TODO: Load acts from persistent storage
    // For now, create some sample acts
    const sampleActs: ActSummary[] = [
      {
        id: "act-1",
        name: "Sample Act 1",
        description: "A sample act for testing",
        sequences: [],
      },
      {
        id: "act-2",
        name: "Sample Act 2",
        description: "Another sample act",
        sequences: [],
      },
    ];

    for (const act of sampleActs) {
      this.acts.set(act.id, act);
    }

    this.initialized = true;
    console.log("✅ ActManager initialized with", this.acts.size, "acts");
  }

  cleanup(): void {
    console.log("🎭 ActManager: Cleaning up...");
    this.acts.clear();
    this.initialized = false;
  }

  async loadAct(idOrPath: string): Promise<ActSummary | null> {
    await this.ensureInitialized();

    const act = this.acts.get(idOrPath);
    if (act) {
      console.log("🎭 ActManager: Loaded act", act.name);
      return { ...act }; // Return a copy
    }

    console.warn("🎭 ActManager: Act not found:", idOrPath);
    return null;
  }

  async getAllActs(): Promise<ActSummary[]> {
    await this.ensureInitialized();

    const acts = Array.from(this.acts.values()).map((act) => ({ ...act }));
    console.log("🎭 ActManager: Retrieved", acts.length, "acts");
    return acts;
  }

  async addSequenceToAct(actId: string, sequenceId: string): Promise<void> {
    await this.ensureInitialized();

    const act = this.acts.get(actId);
    if (!act) {
      throw new Error(`Act not found: ${actId}`);
    }

    if (!act.sequences) {
      act.sequences = [];
    }

    if (!act.sequences.includes(sequenceId)) {
      act.sequences.push(sequenceId);
      console.log("🎭 ActManager: Added sequence", sequenceId, "to act", actId);
    }
  }

  async removeSequenceFromAct(
    actId: string,
    sequenceId: string
  ): Promise<void> {
    await this.ensureInitialized();

    const act = this.acts.get(actId);
    if (!act) {
      throw new Error(`Act not found: ${actId}`);
    }

    if (act.sequences) {
      const index = act.sequences.indexOf(sequenceId);
      if (index > -1) {
        act.sequences.splice(index, 1);
        console.log(
          "🎭 ActManager: Removed sequence",
          sequenceId,
          "from act",
          actId
        );
      }
    }
  }

  async exportAct(actId: string): Promise<void> {
    await this.ensureInitialized();

    const act = this.acts.get(actId);
    if (!act) {
      throw new Error(`Act not found: ${actId}`);
    }

    // TODO: Implement export functionality
    console.log("🎭 ActManager: Exporting act", act.name);
    console.warn("🚧 ActManager: Export functionality not yet implemented");
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}
