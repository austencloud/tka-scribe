import { describe, expect, it } from "vitest";
import { createMotionData, createPictographData } from "$lib/domain";
import { MotionType, Orientation } from "$lib/domain/enums";
import { PlacementKeyGenerator } from "./PlacementKeyGenerator";
import { SpecialPlacementOriKeyGenerator } from "./SpecialPlacementOriKeyGenerator";
import { TurnsTupleKeyGenerator } from "./TurnsTupleKeyGenerator";

describe("Key Generators", () => {
  it("PlacementKeyGenerator selects first available key from candidates", () => {
    const gen = new PlacementKeyGenerator();
    const motion = createMotionData({ motion_type: MotionType.PRO });
    const pictograph = createPictographData({ letter: "A" });
    const available = { pro_to_layer1_alpha_A: true, pro: true };

    const key = gen.generatePlacementKey(motion, pictograph, available);
    expect(key).toBe("pro_to_layer1_alpha_A");
  });

  it("SpecialPlacementOriKeyGenerator generates from_layer2 for layer2 orientations", () => {
    const gen = new SpecialPlacementOriKeyGenerator();
    const motion = createMotionData({ motion_type: MotionType.PRO });
    const pictograph = createPictographData({
      motions: {
        blue: createMotionData({ end_ori: Orientation.CLOCK }),
        red: createMotionData({ end_ori: Orientation.COUNTER }),
      },
    });

    const key = gen.generateOrientationKey(motion, pictograph);
    expect(key).toBe("from_layer2");
  });

  it("TurnsTupleKeyGenerator returns [blueTurns, redTurns] array", () => {
    const gen = new TurnsTupleKeyGenerator();
    const pictograph = createPictographData({
      motions: {
        blue: createMotionData({ turns: 1.5 }),
        red: createMotionData({ turns: 0.5 }),
      },
    });

    const tuple = gen.generateTurnsTuple(pictograph);
    expect(tuple).toEqual([1.5, 0.5]);
  });
});
