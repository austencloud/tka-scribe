export const parseCoords = (coords: string): { x: number; y: number } => {
	const [x, y] = coords.replace(/[()]/g, '').split(',').map(Number);
	return { x, y };
};

