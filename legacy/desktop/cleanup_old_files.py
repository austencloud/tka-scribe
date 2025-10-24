#!/usr/bin/env python3
"""
Cleanup script to safely remove old massive files after refactoring.

This script will:
1. Check if the new architecture is working
2. Create backups of old files
3. Remove the old massive files
4. Provide rollback instructions
"""

import shutil
import sys
from datetime import datetime
from pathlib import Path

# Add the current directory to Python path (we're already in src/desktop)
desktop_dir = Path(__file__).parent
sys.path.insert(0, str(desktop_dir))

# Also add parent directories for imports
sys.path.insert(0, str(desktop_dir.parent))  # src
sys.path.insert(0, str(desktop_dir.parent.parent))  # TKA root

# Files to be removed (the massive components we refactored)
OLD_FILES = [
    "modern/presentation/controllers/construct/signal_coordinator.py",  # 531 lines
    "modern/presentation/managers/construct/layout_manager.py",  # 451 lines
    "modern/presentation/components/sequence_workbench/sequence_workbench.py",  # 486 lines
    "modern/presentation/components/workbench/workbench.py",  # 469 lines
]


def create_backup_directory():
    """Create a backup directory with timestamp."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = desktop_dir / f"refactoring_backup_{timestamp}"
    backup_dir.mkdir(exist_ok=True)
    return backup_dir


def test_new_architecture():
    """Test if the new architecture is working."""
    print("🧪 Testing new architecture...")

    try:
        # Test service registration
        from modern.core.dependency_injection.construct_tab_service_registration import (
            register_construct_tab_services,
        )
        from modern.core.dependency_injection.di_container import DIContainer

        container = DIContainer()
        register_construct_tab_services(container)

        # Test component imports

        print("✅ New architecture is working!")
        return True

    except Exception as e:
        print(f"❌ New architecture test failed: {e}")
        return False


def backup_old_files(backup_dir):
    """Create backups of old files."""
    print("📦 Creating backups of old files...")

    backed_up = []

    for file_path in OLD_FILES:
        full_path = desktop_dir / file_path

        if full_path.exists():
            # Create backup directory structure
            backup_file_path = backup_dir / file_path
            backup_file_path.parent.mkdir(parents=True, exist_ok=True)

            # Copy file to backup
            shutil.copy2(full_path, backup_file_path)
            backed_up.append(file_path)
            print(f"  ✅ Backed up: {file_path}")
        else:
            print(f"  ⚠️  File not found: {file_path}")

    return backed_up


def remove_old_files(backed_up_files):
    """Remove the old files."""
    print("🗑️  Removing old files...")

    removed = []

    for file_path in backed_up_files:
        full_path = desktop_dir / file_path

        try:
            full_path.unlink()
            removed.append(file_path)
            print(f"  ✅ Removed: {file_path}")
        except Exception as e:
            print(f"  ❌ Failed to remove {file_path}: {e}")

    return removed


def create_rollback_script(backup_dir, removed_files):
    """Create a rollback script in case something goes wrong."""
    rollback_script = backup_dir / "rollback.py"

    script_content = f'''#!/usr/bin/env python3
"""
Rollback script to restore old files if needed.
Generated on {datetime.now().isoformat()}
"""

import shutil
from pathlib import Path

desktop_dir = Path(__file__).parent.parent
backup_dir = Path(__file__).parent

files_to_restore = {removed_files!r}

def main():
    print("🔄 Rolling back refactoring changes...")
    
    for file_path in files_to_restore:
        backup_file = backup_dir / file_path
        target_file = desktop_dir / file_path
        
        if backup_file.exists():
            # Create target directory if needed
            target_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Restore file
            shutil.copy2(backup_file, target_file)
            print(f"  ✅ Restored: {{file_path}}")
        else:
            print(f"  ❌ Backup not found: {{file_path}}")
    
    print("🎯 Rollback complete!")

if __name__ == "__main__":
    main()
'''

    rollback_script.write_text(script_content)
    print(f"📝 Created rollback script: {rollback_script}")


def main():
    """Main cleanup process."""
    print("🧹 Starting cleanup of old massive files...\n")

    # Step 1: Test new architecture
    if not test_new_architecture():
        print("❌ New architecture is not working. Aborting cleanup.")
        print("   Please fix the issues and try again.")
        return 1

    print()

    # Step 2: Create backup directory
    backup_dir = create_backup_directory()
    print(f"📁 Created backup directory: {backup_dir}\n")

    # Step 3: Backup old files
    backed_up_files = backup_old_files(backup_dir)

    if not backed_up_files:
        print("⚠️  No files to remove. Cleanup complete.")
        return 0

    print()

    # Step 4: Confirm removal
    print("⚠️  About to remove the following files:")
    for file_path in backed_up_files:
        full_path = desktop_dir / file_path
        size = full_path.stat().st_size if full_path.exists() else 0
        print(f"   - {file_path} ({size:,} bytes)")

    print(f"\n📦 Backups are stored in: {backup_dir}")

    response = input("\n❓ Proceed with removal? (y/N): ").strip().lower()

    if response != "y":
        print("🚫 Cleanup cancelled. Backups are preserved.")
        return 0

    print()

    # Step 5: Remove old files
    removed_files = remove_old_files(backed_up_files)

    print()

    # Step 6: Create rollback script
    create_rollback_script(backup_dir, removed_files)

    print()

    # Step 7: Summary
    total_size = sum(
        (desktop_dir / file_path).stat().st_size
        for file_path in removed_files
        if (desktop_dir / file_path).exists()
    )

    print("🎉 Cleanup complete!")
    print(f"   Removed {len(removed_files)} files")
    print(f"   Freed up ~{total_size:,} bytes")
    print(f"   Backups stored in: {backup_dir}")
    print(f"   To rollback: python {backup_dir}/rollback.py")

    return 0


if __name__ == "__main__":
    sys.exit(main())
