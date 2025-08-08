import type { ArrowData } from '$lib/components/objects/Arrow/ArrowData';
import type { GridData } from '$lib/components/objects/Grid/GridData';
import type { Motion } from '$lib/components/objects/Motion/Motion';
import type { MotionData } from '$lib/components/objects/Motion/MotionData';
import type { PropData } from '$lib/components/objects/Prop/PropData';
import type { Letter } from './Letter';
import type { TKAPosition } from './TKAPosition';
import type { GridMode, VTGDir, VTGTiming } from './Types';

export interface PictographData {
	// TKA
	letter: Letter | null;
	startPos: TKAPosition | null;
	endPos: TKAPosition | null;

	// VTG
	timing: VTGTiming | null;
	direction: VTGDir | null;

	// Grid
	gridMode: GridMode;
	gridData: GridData | null;

	// Motion
	blueMotionData: MotionData | null;
	redMotionData: MotionData | null;

	motions?: Motion[] | undefined;
	redMotion?: Motion | null;
	blueMotion?: Motion | null;

	// Props
	redPropData: PropData | null;
	bluePropData: PropData | null;
	props?: PropData[];

	// Arrows
	redArrowData: ArrowData | null;
	blueArrowData: ArrowData | null;

	grid: string;

	// Special flag to mark this as a start position
	isStartPosition?: boolean;
}
