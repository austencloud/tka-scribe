# Prop SVG Scaling Reference

All prop SVGs have been scaled to exactly **300px width** for use within the Animation Viewer canvas, following the same approach used for `staff.svg` → `staff_animated.svg`.

## Scaling Methodology

The scaling process:
1. Calculate scale factor: `300 / original_width`
2. Apply scale factor to all numeric values in the SVG:
   - `viewBox` dimensions
   - Path data coordinates
   - Stroke widths
   - Circle radii
   - All position attributes (x, y, cx, cy)

## Prop Scaling Factors

| Prop Name | Original Width (px) | Scaled Width (px) | Scale Factor | Original Viewbox | Scaled Viewbox |
|-----------|---------------------|-------------------|--------------|------------------|----------------|
| buugeng | 262.60 | 300 | 1.142422 | `0 0 262.6 135.9` | `0 0 300 155.26` |
| club | 258.67 | 300 | 1.159779 | `0 0 258.67 34.17` | `0 0 300 39.63` |
| doublestar | 300.00 | 300 | 1.000000 | `0 0 300 150` | `0 0 300 150` |
| eightrings | 257.30 | 300 | 1.165954 | `0 0 257.3 137.1` | `0 0 300 159.9` |
| fan | 258.60 | 300 | 1.160093 | `0 0 258.6 206.4` | `0 0 300 239.4` |
| fractalgeng | 250.00 | 300 | 1.200000 | `0 0 250 190.3` | `0 0 300 228.36` |
| guitar | 600.80 | 300 | 0.499334 | `0 0 600.8 111.5` | `0 0 300 55.68` |
| hand | 75.00 | 300 | 4.000000 | `0 0 75 100` | `0 0 300 400` |
| minihoop | 257.30 | 300 | 1.165954 | `0 0 257.3 137.1` | `0 0 300 159.9` |
| staff | 252.80 | 300 | 1.186709 | `0 0 252.8 77.8` | `0 0 300 92.32` |
| sword | 572.30 | 300 | 0.524201 | `0 0 572.3 64` | `0 0 300 33.55` |
| triad | 248.76 | 300 | 1.205982 | `0 0 248.76 219.09` | `0 0 300 264.18` |
| ukulele | 260.90 | 300 | 1.149866 | `0 0 260.9 50.4` | `0 0 300 57.95` |

## File Naming Convention

- **Original files**: `{prop_name}.svg`
- **Scaled files**: `{prop_name}_animated.svg`

The `_animated` suffix indicates these files are scaled for use in the Animation Viewer canvas.

## Usage

When rendering props in the Animation Viewer canvas, use the `_animated` versions to ensure consistent sizing at 300px width. This makes all props render beautifully at the same scale within the canvas.

## Script

The scaling was performed using the script at:
```
scripts/scale-props-to-300.js
```

To regenerate the scaled files:
```bash
node scripts/scale-props-to-300.js
```
