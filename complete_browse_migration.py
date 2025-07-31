#!/usr/bin/env python3
"""
Complete Browse Services Migration Script

This script performs the complete migration of browse services from the
presentation layer to the application services layer, including:

1. Moving service files to the correct location
2. Updating all import statements throughout the codebase
3. Cleaning up empty directories
4. Validating the migration

Architecture Fix:
- FROM: src/desktop/modern/presentation/tabs/browse/services/
- TO:   src/desktop/modern/application/services/browse/

This ensures proper separation of concerns where services are in the
application layer and presentation components are in the presentation layer.
"""

import shutil
import subprocess
import sys
from pathlib import Path


class CompleteBrowseMigration:
    """Orchestrates the complete browse services migration."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.source_dir = (
            project_root / "src/desktop/modern/presentation/tabs/browse/services"
        )
        self.target_dir = (
            project_root / "src/desktop/modern/application/services/browse"
        )
        self.backup_dir = project_root / "migration_backup"

    def check_prerequisites(self) -> bool:
        """Check if migration prerequisites are met."""
        print("Checking prerequisites...")

        if not self.source_dir.exists():
            print(f"ERROR: Source directory does not exist: {self.source_dir}")
            print("   Migration may not be needed or already completed.")
            return False

        if not (self.project_root / "src").exists():
            print(f"ERROR: Project structure not found at: {self.project_root}")
            return False

        print("SUCCESS: Prerequisites met")
        return True

    def run_file_migration(self) -> bool:
        """Run the file migration script."""
        print("\nPhase 1: Moving service files...")
        print("-" * 40)

        migration_script = self.project_root / "migrate_browse_services.py"

        try:
            result = subprocess.run(
                [sys.executable, str(migration_script)],
                cwd=self.project_root,
                capture_output=True,
                text=True,
            )

            print(result.stdout)
            if result.stderr:
                print("STDERR:", result.stderr)

            return result.returncode == 0

        except Exception as e:
            print(f"ERROR: Failed to run file migration: {e}")
            return False

    def run_import_updates(self) -> bool:
        """Run the import update script."""
        print("\nPhase 2: Updating import statements...")
        print("-" * 40)

        import_script = self.project_root / "update_browse_imports.py"

        try:
            result = subprocess.run(
                [sys.executable, str(import_script)],
                cwd=self.project_root,
                capture_output=True,
                text=True,
            )

            print(result.stdout)
            if result.stderr:
                print("STDERR:", result.stderr)

            return result.returncode == 0

        except Exception as e:
            print(f"ERROR: Failed to run import updates: {e}")
            return False

    def cleanup_empty_directories(self) -> None:
        """Clean up empty directories after migration."""
        print("\nPhase 3: Cleaning up empty directories...")
        print("-" * 40)

        # Check if source services directory is empty
        if self.source_dir.exists():
            try:
                # List all files (excluding __pycache__)
                remaining_files = [
                    f
                    for f in self.source_dir.iterdir()
                    if f.is_file() and not f.name.startswith("__pycache__")
                ]

                if not remaining_files:
                    print(f"   Removing empty directory: {self.source_dir}")
                    shutil.rmtree(self.source_dir)
                else:
                    print(f"   Directory not empty, keeping: {self.source_dir}")
                    print(f"   Remaining files: {[f.name for f in remaining_files]}")

            except Exception as e:
                print(f"   WARNING: Could not remove directory: {e}")

    def validate_migration(self) -> bool:
        """Validate that the migration was successful."""
        print("\nPhase 4: Validating migration...")
        print("-" * 40)

        validation_passed = True

        # Check that target directory exists and has files
        if not self.target_dir.exists():
            print("ERROR: Target directory does not exist")
            validation_passed = False
        else:
            target_files = list(self.target_dir.glob("*.py"))
            if len(target_files) < 2:  # At least __init__.py and one service
                print(f"ERROR: Target directory has too few files: {len(target_files)}")
                validation_passed = False
            else:
                print(f"SUCCESS: Target directory has {len(target_files)} Python files")

        # Check that __init__.py was updated
        init_file = self.target_dir / "__init__.py"
        if init_file.exists():
            content = init_file.read_text()
            if "BrowseService" in content:
                print("SUCCESS: Target __init__.py includes migrated services")
            else:
                print(
                    "WARNING: Target __init__.py may not include all migrated services"
                )
        else:
            print("ERROR: Target __init__.py does not exist")
            validation_passed = False

        # Check for remaining old imports (basic check)
        print("   Checking for remaining old imports...")
        old_import_count = 0
        for py_file in self.project_root.rglob("*.py"):
            if py_file.is_file() and "__pycache__" not in str(py_file):
                try:
                    content = py_file.read_text()
                    if "desktop.modern.presentation.tabs.browse.services" in content:
                        old_import_count += 1
                except (UnicodeDecodeError, PermissionError):
                    continue

        if old_import_count == 0:
            print("SUCCESS: No remaining old import statements found")
        else:
            print(f"WARNING: Found {old_import_count} files with old import statements")
            validation_passed = False

        return validation_passed

    def generate_final_report(self, success: bool) -> None:
        """Generate final migration report."""
        print("\n" + "=" * 60)
        print("BROWSE SERVICES MIGRATION REPORT")
        print("=" * 60)

        if success:
            print("Migration completed successfully!")
            print("\nWhat was accomplished:")
            print("SUCCESS: Service files moved to proper application layer")
            print("SUCCESS: Import statements updated throughout codebase")
            print("SUCCESS: Directory structure cleaned up")
            print("SUCCESS: Migration validated")

            print("\nServices are now located at:")
            print(f"   {self.target_dir}")

            if self.backup_dir.exists():
                print("\nBackup created at:")
                print(f"   {self.backup_dir}")
                print("   (You can remove this after testing)")

        else:
            print("WARNING: Migration completed with issues")
            print("\nSome steps may have failed. Please:")
            print("1. Review the output above for specific errors")
            print("2. Check the backup directory for original files")
            print("3. Manually fix any remaining issues")
            print("4. Test the application thoroughly")

        print("\nNext steps:")
        print("1. Test the application to ensure everything works")
        print("2. Run existing tests to verify functionality")
        print("3. Update any documentation that references old paths")
        print("4. Consider removing backup after successful testing")

    def run_complete_migration(self) -> bool:
        """Run the complete migration process."""
        print("Starting Complete Browse Services Migration")
        print("=" * 60)

        # Check prerequisites
        if not self.check_prerequisites():
            return False

        success = True

        # Phase 1: Move files
        if not self.run_file_migration():
            print("ERROR: File migration failed")
            success = False

        # Phase 2: Update imports (even if file migration failed, might be useful)
        if not self.run_import_updates():
            print("ERROR: Import update failed")
            success = False

        # Phase 3: Cleanup (only if previous phases succeeded)
        if success:
            self.cleanup_empty_directories()

        # Phase 4: Validate
        validation_success = self.validate_migration()
        if not validation_success:
            success = False

        # Generate final report
        self.generate_final_report(success)

        return success


def main():
    """Main migration function."""
    # Get project root (assuming script is in project root)
    script_path = Path(__file__).resolve()
    project_root = script_path.parent

    # Run complete migration
    migrator = CompleteBrowseMigration(project_root)
    success = migrator.run_complete_migration()

    return success


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
