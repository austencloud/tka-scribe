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
 * Bone names that should be animated by the walk cycle.
 * Only these bones will have their animation tracks preserved.
 */
const LEG_BONE_NAMES = [
	// Hips - only rotation (walk has hip sway)
	"Hips",
	"mixamorigHips",
	// Left leg
	"LeftUpLeg",
	"mixamorigLeftUpLeg",
	"LeftLeg",
	"mixamorigLeftLeg",
	"LeftFoot",
	"mixamorigLeftFoot",
	"LeftToeBase",
	"mixamorigLeftToeBase",
	// Right leg
	"RightUpLeg",
	"mixamorigRightUpLeg",
	"RightLeg",
	"mixamorigRightLeg",
	"RightFoot",
	"mixamorigRightFoot",
	"RightToeBase",
	"mixamorigRightToeBase",
];

/**
 * Check if a track name corresponds to a leg bone.
 * Track names are formatted as: "boneName.property" (e.g., "LeftUpLeg.quaternion")
 */
function isLegBoneTrack(trackName: string): boolean {
	const boneName = trackName.split(".")[0];
	return LEG_BONE_NAMES.some(
		(legBone) => boneName === legBone || boneName.endsWith(legBone)
	);
}

/**
 * Filter an animation clip to only include leg bone tracks.
 * This allows upper body to remain controlled by IK.
 */
function filterToLegBones(clip: AnimationClip): AnimationClip {
	const legTracks: KeyframeTrack[] = [];

	for (const track of clip.tracks) {
		if (isLegBoneTrack(track.name)) {
			legTracks.push(track);
		}
	}

	// Create a new clip with only leg tracks
	return new AnimationClip(clip.name + "_legs", clip.duration, legTracks);
}

@injectable()
export class LegAnimator implements ILegAnimator {
	private mixer: AnimationMixer | null = null;
	private walkAction: AnimationAction | null = null;
	private walkClip: AnimationClip | null = null;
	private root: Object3D | null = null;
	private loader: GLTFLoader;

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

	initialize(root: Object3D): void {
		this.root = root;
		this.mixer = new AnimationMixer(root);
		this.initialized = true;

		// If we already have a clip loaded, create the action now
		if (this.walkClip) {
			this.createWalkAction();
		}
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

					// Filter to only leg bones
					this.walkClip = filterToLegBones(fullClip);
					this.animationLoaded = true;

					// If already initialized, create the action
					if (this.initialized && this.mixer) {
						this.createWalkAction();
					}

					console.log(
						`[LegAnimator] Loaded walk animation: ${this.walkClip.tracks.length} leg tracks, ${this.walkClip.duration.toFixed(2)}s`
					);
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
		// Filter to only leg bones
		this.walkClip = filterToLegBones(clip);
		this.animationLoaded = true;

		// If already initialized, create the action
		if (this.initialized && this.mixer) {
			this.createWalkAction();
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
		this.root = null;
		this.initialized = false;
		this.animationLoaded = false;
	}
}
