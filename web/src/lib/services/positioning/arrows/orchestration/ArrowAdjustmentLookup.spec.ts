import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMotionData,
  createPictographData,
  createGridData,
} from "$lib/domain";
import { MotionType, GridMode } from "$lib/domain/enums";
import type {
  ISpecialPlacementService,
  IDefaultPlacementService,
} from "../../placement-services";
import type {
  ISpecialPlacementOriKeyGenerator,
  IPlacementKeyGenerator,
  ITurnsTupleKeyGenerator,
  IAttributeKeyGenerator,
} from "../../data-services";
import { ArrowAdjustmentLookup } from "./ArrowAdjustmentLookup";

// Mock services: simulate the special/default services and key generators
const createMockServices = () => {
  const mockSpecial = {
    getSpecialAdjustment: vi.fn().mockResolvedValue(null),
  } as ISpecialPlacementService;

  const mockDefault: IDefaultPlacementService = {
    getAvailablePlacementKeys: vi.fn().mockResolvedValue(["pro"]),
    getDefaultAdjustment: vi.fn().mockResolvedValue({ x: 100, y: 50 }),
    isLoaded: vi.fn().mockReturnValue(true),
    getPlacementData: vi.fn().mockResolvedValue({}),
    debugAvailableKeys: vi.fn().mockResolvedValue(undefined),
  };

  const mockOriKeyGen: ISpecialPlacementOriKeyGenerator = {
    generateOrientationKey: vi.fn().mockReturnValue("from_layer1"),
  };

  const mockPlacementKeyGen: IPlacementKeyGenerator = {
    generatePlacementKey: vi.fn().mockReturnValue("pro"),
  };

  const mockTurnsGen: ITurnsTupleKeyGenerator = {
    generateTurnsTuple: vi.fn().mockReturnValue([0, 0]),
  };

  const mockAttrGen: IAttributeKeyGenerator = {
    getKeyFromArrow: vi.fn().mockReturnValue("basic"),
  };

  return {
    mockSpecial,
    mockDefault,
    mockOriKeyGen,
    mockPlacementKeyGen,
    mockTurnsGen,
    mockAttrGen,
  };
};

describe("ArrowAdjustmentLookup (advanced orchestration)", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns special adjustment when available", async () => {
    const mocks = createMockServices();
    vi.mocked(mocks.mockSpecial.getSpecialAdjustment).mockResolvedValue({
      x: 20,
      y: -30,
    });

    const lookup = new ArrowAdjustmentLookup(
      mocks.mockSpecial,
      mocks.mockDefault,
      mocks.mockOriKeyGen,
      mocks.mockPlacementKeyGen,
      mocks.mockTurnsGen,
      mocks.mockAttrGen
    );

    const pictograph = createPictographData({
      letter: "C",
      grid_data: createGridData({ grid_mode: GridMode.DIAMOND }),
    });
    const motion = createMotionData({
      motion_type: MotionType.ANTI,
      turns: 0,
    });

    const result = await lookup.getBaseAdjustment(pictograph, motion, "C");
    expect(result).toEqual({ x: 20, y: -30 });
    expect(mocks.mockSpecial.getSpecialAdjustment).toHaveBeenCalledWith(
      motion,
      pictograph,
      undefined
    );
  });

  it("falls back to default when special not available", async () => {
    const mocks = createMockServices();
    vi.mocked(mocks.mockSpecial.getSpecialAdjustment).mockResolvedValue(null);

    const lookup = new ArrowAdjustmentLookup(
      mocks.mockSpecial,
      mocks.mockDefault,
      mocks.mockOriKeyGen,
      mocks.mockPlacementKeyGen,
      mocks.mockTurnsGen,
      mocks.mockAttrGen
    );

    const pictograph = createPictographData({
      letter: "A",
      grid_data: createGridData({ grid_mode: GridMode.DIAMOND }),
    });
    const motion = createMotionData({
      motion_type: MotionType.PRO,
      turns: 0,
    });

    const result = await lookup.getBaseAdjustment(pictograph, motion, "A");
    expect(result).toEqual({ x: 100, y: 50 });
    expect(mocks.mockDefault.getDefaultAdjustment).toHaveBeenCalledWith(
      "pro",
      0,
      "pro",
      "diamond"
    );
  });

  it("generates lookup keys from key services", async () => {
    const mocks = createMockServices();
    vi.mocked(mocks.mockSpecial.getSpecialAdjustment).mockResolvedValue({
      x: 5,
      y: 10,
    });

    const lookup = new ArrowAdjustmentLookup(
      mocks.mockSpecial,
      mocks.mockDefault,
      mocks.mockOriKeyGen,
      mocks.mockPlacementKeyGen,
      mocks.mockTurnsGen,
      mocks.mockAttrGen
    );

    const pictograph = createPictographData({
      motions: {
        blue: createMotionData(),
        red: createMotionData(),
      },
    });
    const motion = createMotionData({
      motion_type: MotionType.FLOAT,
    });

    await lookup.getBaseAdjustment(pictograph, motion, "T");

    expect(mocks.mockOriKeyGen.generateOrientationKey).toHaveBeenCalledWith(
      motion,
      pictograph
    );
    expect(mocks.mockTurnsGen.generateTurnsTuple).toHaveBeenCalledWith(
      pictograph
    );
    expect(mocks.mockAttrGen.getKeyFromArrow).toHaveBeenCalled();
  });
});
