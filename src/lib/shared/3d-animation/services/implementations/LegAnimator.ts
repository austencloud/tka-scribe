/**
 * LegAnimator
 *
 * Controls leg animations independently from upper body IK.
 * Uses Three.js AnimationMixer with track filtering to only
 * animate leg bones while arms remain controlled by prop IK.
 */

import { injectable } from "inversify";
import {
	AnimationMixer,
	AnimationClip,
	AnimationAction,
	LoopRepeat,
	Object3D,
	KeyframeTrack,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type {
	ILegAnimator,
	LocomotionInput,
	LegAnimatorConfig,
} from "../contracts/ILegAnimator";

/**
 * Core bone names for leg animation (standard humanoid names).
 * These are the target bone names we want in the final animation.
 */
const LEG_BONE_CORE_NAMES = [
	"Hips",
	"LeftUpLeg",
	"LeftLeg",
	"LeftFoot",
	"LeftToeBase",
	"RightUpLeg",
	"RightLeg",
	"RightFoot",
	"RightToeBase",
];

/**
 * Known bone name prefixes from various sources.
 * We strip these to get the core bone name.
 */
const BONE_PREFIXES = [
	"mixamorig",      // Mixamo standard
	"characters3dcom___", // characters3d.com
	"mixamorig:",     // Some exports use colon
	"",               // No prefix (standard names)
];

/**
 * Bone name mapping from characters3d.com convention to standard humanoid names.
 * characters3d.com uses different names entirely, not just different prefixes.
 */
const BONE_NAME_MAPPING: Record<string, string> = {
	// Hips/Pelvis
	"Pelvis": "Hips",
	"pelvis": "Hips",

	// Left leg
	"L_Thigh": "LeftUpLeg",
	"L_Calf": "LeftLeg",
	"L_Foot": "LeftFoot",
	"L_Toe": "LeftToeBase",
	"L_ToeBase": "LeftToeBase",
	"LeftThigh": "LeftUpLeg",
	"LeftCalf": "LeftLeg",
	"Left_Thigh": "LeftUpLeg",
	"Left_Calf": "LeftLeg",
	"Left_Foot": "LeftFoot",
	"Left_Toe": "LeftToeBase",

	// Right leg
	"R_Thigh": "RightUpLeg",
	"R_Calf": "RightLeg",
	"R_Foot": "RightFoot",
	"R_Toe": "RightToeBase",
	"R_ToeBase": "RightToeBase",
	"RightThigh": "RightUpLeg",
	"RightCalf": "RightLeg",
	"Right_Thigh": "RightUpLeg",
	"Right_Calf": "RightLeg",
	"Right_Foot": "RightFoot",
	"Right_Toe": "RightToeBase",

	// Already standard names (identity mapping)
	"Hips": "Hips",
	"LeftUpLeg": "LeftUpLeg",
	"LeftLeg": "LeftLeg",
	"LeftFoot": "LeftFoot",
	"LeftToeBase": "LeftToeBase",
	"RightUpLeg": "RightUpLeg",
	"RightLeg": "RightLeg",
	"RightFoot": "RightFoot",
	"RightToeBase": "RightToeBase",
};

/**
 * Extract the core bone name by stripping known prefixes
 * and mapping to standard humanoid names.
 * e.g., "characters3dcom___L_Thigh" -> "LeftUpLeg"
 *       "mixamorigLeftUpLeg" -> "LeftUpLeg"
 */
function extractCoreBoneName(boneName: string): string {
	// First strip any known prefix
	let stripped = boneName;
	for (const prefix of BONE_PREFIXES) {
		if (prefix && boneName.startsWith(prefix)) {
			stripped = boneName.slice(prefix.length);
			break;
		}
	}

	// Then map to standard name if needed
	const mapped = BONE_NAME_MAPPING[stripped];
	if (mapped) {
		return mapped;
	}

	// Return stripped name as-is if no mapping found
	return stripped;
}

/**
 * Check if a bone name (after extraction/mapping) is a leg bone.
 */
function isLegBone(coreName: string): boolean {
	return LEG_BONE_CORE_NAMES.includes(coreName);
}

/**
 * Retarget animation track name to match target skeleton's naming convention.
 * e.g., "characters3dcom___Hips.quaternion" -> "mixamorigHips.quaternion"
 */
function retargetTrackName(trackName: string, targetPrefix: string): string {
	const [boneName, ...rest] = trackName.split(".");
	if (!boneName) return trackName;

	const coreName = extractCoreBoneName(boneName);
	const property = rest.join(".");

	return `${targetPrefix}${coreName}.${property}`;
}

/**
 * Filter and retarget animation clip to only include leg bone tracks,
 * remapping bone names to match the target skeleton.
 */
function filterAndRetargetToLegBones(
	clip: AnimationClip,
	targetPrefix: string
): AnimationClip {
	const legTracks: KeyframeTrack[] = [];
	const mappedBones: string[] = [];

	for (const track of clip.tracks) {
		const boneName = track.name.split(".")[0] ?? "";
		const coreName = extractCoreBoneName(boneName);

		if (isLegBone(coreName)) {
			// Clone the track with retargeted name
			const newTrackName = retargetTrackName(track.name, targetPrefix);
			const clonedTrack = track.clone();
			clonedTrack.name = newTrackName;
			legTracks.push(clonedTrack);

			// Track mapping for debug
			if (!mappedBones.includes(`${boneName} → ${coreName}`)) {
				mappedBones.push(`${boneName} → ${coreName}`);
			}
		}
	}

	console.log(
		`[LegAnimator] Retargeted ${legTracks.length} leg tracks to prefix "${targetPrefix}"`
	);
	if (mappedBones.length > 0) {
		console.log("[LegAnimator] Bone mappings applied:");
		for (const mapping of mappedBones) {
			console.log(`  - ${mapping}`);
		}
	}

	return new AnimationClip(clip.name + "_legs", clip.duration, legTracks);
}

@injectable()
export class LegAnimator implements ILegAnimator {
	private mixer: AnimationMixer | null = null;
	private walkAction: AnimationAction | null = null;
	private walkClip: AnimationClip | null = null;
	private rawWalkClip: AnimationClip | null = null; // Unprocessed clip
	private root: Object3D | null = null;
	private loader: GLTFLoader;
	private targetBonePrefix: string = "mixamorig"; // Detected from skeleton

	private config: Required<LegAnimatorConfig> = {
		baseSpeed: 1,
		blendTime: 0.2,
		useRootMotion: false,
	};

	private currentLocomotion: LocomotionInput = {
		isMoving: false,
		speed: 0,
	};

	private initialized = false;
	private animationLoaded = false;

	constructor() {
		this.loader = new GLTFLoader();
	}

	/**
	 * Detect the bone naming prefix used by the skeleton.
	 * Searches for common leg bones and extracts their prefix.
	 */
	private detectBonePrefix(root: Object3D): string {
		// DEBUG: Log all bone names in the skeleton
		const boneNames: string[] = [];
		root.traverse((obj) => {
			if (obj.name) {
				boneNames.push(obj.name);
			}
		});
		console.log("[LegAnimator] Skeleton bone names (first 30):");
		for (const name of boneNames.slice(0, 30)) {
			console.log(`  - ${name}`);
		}
		if (boneNames.length > 30) {
			console.log(`  ... and ${boneNames.length - 30} more`);
		}

		const prefixesToCheck = ["mixamorig", ""];

		for (const prefix of prefixesToCheck) {
			const testBoneName = `${prefix}Hips`;
			const bone = root.getObjectByName(testBoneName);
			if (bone) {
				console.log(`[LegAnimator] Detected bone prefix: "${prefix}"`);
				return prefix;
			}
		}

		// Fallback: search for any bone containing "Hips"
		let foundPrefix = "mixamorig";
		root.traverse((obj) => {
			if (obj.name.includes("Hips")) {
				const idx = obj.name.indexOf("Hips");
				foundPrefix = obj.name.slice(0, idx);
				console.log(
					`[LegAnimator] Found Hips bone: "${obj.name}", extracted prefix: "${foundPrefix}"`
				);
			}
		});

		return foundPrefix;
	}

	initialize(root: Object3D): void {
		this.root = root;
		this.mixer = new AnimationMixer(root);
		this.targetBonePrefix = this.detectBonePrefix(root);
		this.initialized = true;

		// If we already have a raw clip loaded, process and create the action now
		if (this.rawWalkClip) {
			this.processAndCreateAction();
		}
	}

	/**
	 * Process the raw clip with retargeting and create the walk action.
	 */
	private processAndCreateAction(): void {
		if (!this.rawWalkClip || !this.mixer) return;

		this.walkClip = filterAndRetargetToLegBones(
			this.rawWalkClip,
			this.targetBonePrefix
		);
		this.createWalkAction();

		console.log(
			`[LegAnimator] Loaded walk animation: ${this.walkClip.tracks.length} leg tracks, ${this.walkClip.duration.toFixed(2)}s`
		);
	}

	async loadWalkAnimation(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.loader.load(
				url,
				(gltf) => {
					if (gltf.animations.length === 0) {
						reject(new Error("No animations found in GLTF file"));
						return;
					}

					// Use the first animation (typically the only one from Mixamo)
					const fullClip = gltf.animations[0];
					if (!fullClip) {
						reject(new Error("Animation clip is undefined"));
						return;
					}

					// DEBUG: Log all tracks in the animation to understand bone naming
					console.log(
						`[LegAnimator] Animation "${fullClip.name}" has ${fullClip.tracks.length} tracks, duration: ${fullClip.duration.toFixed(2)}s`
					);
					console.log("[LegAnimator] Track names in animation:");
					for (const track of fullClip.tracks.slice(0, 20)) {
						console.log(`  - ${track.name}`);
					}
					if (fullClip.tracks.length > 20) {
						console.log(`  ... and ${fullClip.tracks.length - 20} more`);
					}

					// Store the raw clip - we'll retarget when we know the skeleton prefix
					this.rawWalkClip = fullClip;
					this.animationLoaded = true;

					// If already initialized, process and create the action
					if (this.initialized && this.mixer) {
						this.processAndCreateAction();
					}

					resolve();
				},
				undefined,
				(error) => {
					console.error("[LegAnimator] Failed to load walk animation:", error);
					reject(error);
				}
			);
		});
	}

	setWalkClip(clip: AnimationClip): void {
		// Store the raw clip
		this.rawWalkClip = clip;
		this.animationLoaded = true;

		// If already initialized, process and create the action
		if (this.initialized && this.mixer) {
			this.processAndCreateAction();
		}
	}

	private createWalkAction(): void {
		if (!this.mixer || !this.walkClip) return;

		this.walkAction = this.mixer.clipAction(this.walkClip);
		this.walkAction.setLoop(LoopRepeat, Infinity);

		// Start paused at weight 0
		this.walkAction.enabled = true;
		this.walkAction.setEffectiveWeight(0);
		this.walkAction.play();
	}

	setLocomotion(input: LocomotionInput): void {
		const wasMoving = this.currentLocomotion.isMoving;
		this.currentLocomotion = { ...input };

		if (!this.walkAction) return;

		// Start or stop walk animation
		if (input.isMoving && !wasMoving) {
			// Start walking - fade in
			this.walkAction.fadeIn(this.config.blendTime);
		} else if (!input.isMoving && wasMoving) {
			// Stop walking - fade out
			this.walkAction.fadeOut(this.config.blendTime);
		}

		// Adjust playback speed based on movement speed
		if (input.isMoving) {
			const playbackSpeed = this.config.baseSpeed * Math.max(0.5, input.speed);
			this.walkAction.setEffectiveTimeScale(playbackSpeed);
		}
	}

	update(delta: number): void {
		if (!this.mixer) return;
		this.mixer.update(delta);
	}

	isReady(): boolean {
		return this.initialized && this.animationLoaded && this.walkAction !== null;
	}

	configure(config: LegAnimatorConfig): void {
		this.config = { ...this.config, ...config };
	}

	dispose(): void {
		if (this.walkAction) {
			this.walkAction.stop();
			this.walkAction = null;
		}
		if (this.mixer) {
			this.mixer.stopAllAction();
			this.mixer = null;
		}
		this.walkClip = null;
		this.rawWalkClip = null;
		this.root = null;
		this.initialized = false;
		this.animationLoaded = false;
	}
}
