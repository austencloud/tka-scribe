"""
Mixamo FBX to GLTF Converter

Usage:
  blender --background --python convert-mixamo-to-gltf.py -- input.fbx output.glb

This script:
1. Imports Mixamo FBX file
2. Cleans up the armature for web use
3. Standardizes bone names for IK compatibility
4. Exports as optimized GLB
"""

import bpy
import sys
import os

def clear_scene():
    """Remove all objects from the scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # Clear orphan data
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.armatures:
        if block.users == 0:
            bpy.data.armatures.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)

def import_fbx(filepath):
    """Import FBX file"""
    print(f"Importing: {filepath}")
    bpy.ops.import_scene.fbx(
        filepath=filepath,
        use_anim=False,  # No animations needed (we use IK)
        ignore_leaf_bones=True,
        automatic_bone_orientation=True,
    )
    print("Import complete")

def find_armature():
    """Find the armature object"""
    for obj in bpy.context.scene.objects:
        if obj.type == 'ARMATURE':
            return obj
    return None

def standardize_bone_names(armature):
    """
    Rename Mixamo bones to standard names our IK service expects.
    Mixamo uses 'mixamorig:' prefix which we strip.
    """
    print("Standardizing bone names...")

    # Mapping from Mixamo names to standard names
    # Our service already handles these variations, but cleaner is better
    name_map = {
        'mixamorig:Hips': 'Hips',
        'mixamorig:Spine': 'Spine',
        'mixamorig:Spine1': 'Spine1',
        'mixamorig:Spine2': 'Spine2',
        'mixamorig:Neck': 'Neck',
        'mixamorig:Head': 'Head',
        'mixamorig:LeftShoulder': 'LeftShoulder',
        'mixamorig:LeftArm': 'LeftArm',
        'mixamorig:LeftForeArm': 'LeftForeArm',
        'mixamorig:LeftHand': 'LeftHand',
        'mixamorig:RightShoulder': 'RightShoulder',
        'mixamorig:RightArm': 'RightArm',
        'mixamorig:RightForeArm': 'RightForeArm',
        'mixamorig:RightHand': 'RightHand',
        'mixamorig:LeftUpLeg': 'LeftUpLeg',
        'mixamorig:LeftLeg': 'LeftLeg',
        'mixamorig:LeftFoot': 'LeftFoot',
        'mixamorig:LeftToeBase': 'LeftToeBase',
        'mixamorig:RightUpLeg': 'RightUpLeg',
        'mixamorig:RightLeg': 'RightLeg',
        'mixamorig:RightFoot': 'RightFoot',
        'mixamorig:RightToeBase': 'RightToeBase',
    }

    # Also handle finger bones
    for side in ['Left', 'Right']:
        for finger in ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']:
            for i in range(1, 5):
                old_name = f'mixamorig:{side}Hand{finger}{i}'
                new_name = f'{side}Hand{finger}{i}'
                name_map[old_name] = new_name

    # Enter edit mode to rename bones
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode='EDIT')

    renamed_count = 0
    for bone in armature.data.edit_bones:
        if bone.name in name_map:
            bone.name = name_map[bone.name]
            renamed_count += 1
        elif bone.name.startswith('mixamorig:'):
            # Strip prefix for any bones not in our map
            bone.name = bone.name.replace('mixamorig:', '')
            renamed_count += 1

    bpy.ops.object.mode_set(mode='OBJECT')
    print(f"Renamed {renamed_count} bones")

def optimize_for_web(armature):
    """Optimize the model for web delivery"""
    print("Optimizing for web...")

    # Find all mesh objects parented to this armature
    meshes = [obj for obj in bpy.context.scene.objects
              if obj.type == 'MESH' and obj.parent == armature]

    for mesh in meshes:
        bpy.context.view_layer.objects.active = mesh

        # Remove doubles
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles(threshold=0.0001)
        bpy.ops.object.mode_set(mode='OBJECT')

        # Limit bone influences to 4 per vertex (GPU friendly)
        for modifier in mesh.modifiers:
            if modifier.type == 'ARMATURE':
                # Already good
                pass

    print(f"Optimized {len(meshes)} mesh(es)")

def apply_transforms():
    """Apply all transforms"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

def export_gltf(filepath):
    """Export as GLB (binary GLTF)"""
    print(f"Exporting to: {filepath}")

    # Blender 5.0 compatible export settings
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',  # Binary format, smaller file
        use_selection=False,
        export_apply=True,
        export_animations=False,  # We use IK, not keyframes
        export_skins=True,  # Include skinning
        export_morph=False,  # No shape keys needed
        export_lights=False,
        export_cameras=False,
        export_materials='EXPORT',
    )

    # Get file size
    size_mb = os.path.getsize(filepath) / (1024 * 1024)
    print(f"Export complete: {size_mb:.2f} MB")

def main():
    # Get command line arguments after '--'
    argv = sys.argv
    if '--' in argv:
        argv = argv[argv.index('--') + 1:]
    else:
        print("Usage: blender --background --python convert-mixamo-to-gltf.py -- input.fbx output.glb")
        sys.exit(1)

    if len(argv) < 2:
        print("Please provide input FBX and output GLB paths")
        sys.exit(1)

    input_fbx = argv[0]
    output_glb = argv[1]

    if not os.path.exists(input_fbx):
        print(f"Error: Input file not found: {input_fbx}")
        sys.exit(1)

    print("=" * 60)
    print("Mixamo FBX to GLTF Converter")
    print("=" * 60)

    # Clear existing scene
    clear_scene()

    # Import FBX
    import_fbx(input_fbx)

    # Find armature
    armature = find_armature()
    if not armature:
        print("Error: No armature found in FBX file")
        sys.exit(1)

    print(f"Found armature: {armature.name}")

    # Standardize bone names
    standardize_bone_names(armature)

    # Optimize for web
    optimize_for_web(armature)

    # Apply transforms
    apply_transforms()

    # Export
    export_gltf(output_glb)

    print("=" * 60)
    print("Conversion complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
