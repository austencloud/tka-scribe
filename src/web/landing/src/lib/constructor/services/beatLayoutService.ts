import {
	fetchDefaultLayouts,
	type LayoutDict
} from '$lib/components/SequenceWorkbench/BeatFrame/beatFrameHelpers.js';

let layoutsCache: LayoutDict | null = null;

export async function getDefaultLayouts(): Promise<LayoutDict> {
	if (!layoutsCache) {
		layoutsCache = await fetchDefaultLayouts('/data/default_layouts.json');
	}
	return layoutsCache;
}
