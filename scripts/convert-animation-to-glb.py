"""
Convert Mixamo FBX animation to GLB format.

Usage:
    blender --background --python convert-animation-to-glb.py -- input.fbx output.glb

The animation will be embedded in the GLB file.
"""

import bpy
import sys

def convert_fbx_to_glb(input_path: str, output_path: str) -> None:
    # Clear existing scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Import FBX
    bpy.ops.import_scene.fbx(filepath=input_path)

    # Export as GLB with animations
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_animations=True,
        export_skins=False,  # We don't need the mesh, just animation data
        export_morph=False,
    )

    print(f"Converted {input_path} -> {output_path}")

if __name__ == "__main__":
    # Parse arguments after '--'
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []

    if len(argv) != 2:
        print("Usage: blender --background --python convert-animation-to-glb.py -- input.fbx output.glb")
        sys.exit(1)

    input_path = argv[0]
    output_path = argv[1]

    convert_fbx_to_glb(input_path, output_path)
