#!/usr/bin/env python3
"""
Browse Services Migration Script

This script moves browse services from the presentation layer to the proper
application services directory and updates all import statements throughout
the codebase to maintain proper architectural separation.

Architecture Fix:
- FROM: src/desktop/modern/presentation/tabs/browse/services/
- TO:   src/desktop/modern/application/services/browse/

This follows the established pattern where services are in application/services/
and presentation components are in presentation/tabs/.
"""

import re
import shutil
from pathlib import Path


class BrowseServicesMigrator:
    """Handles the migration of browse services to proper architecture."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.source_dir = (
            project_root / "src/desktop/modern/presentation/tabs/browse/services"
        )
        self.target_dir = (
            project_root / "src/desktop/modern/application/services/browse"
        )

        # Services to migrate (based on __init__.py analysis)
        self.services_to_migrate = {
            "browse_service.py": "BrowseService",
            "browse_state_service.py": "BrowseStateService",
            "modern_dictionary_data_manager.py": "ModernDictionaryDataManager",
            "progressive_loading_service.py": "ProgressiveLoadingService",
            "sequence_sorter_service.py": "SequenceSorterService",
            "thumbnail_factory_service.py": "ThumbnailFactoryService",
        }

        # Additional files that might exist but aren't in __init__.py
        self.additional_files = [
            "grid_layout_service.py",
            "layout_manager_service.py",
            "loading_state_manager_service.py",
            "navigation_handler_service.py",
            "progressive_loading_coordinator.py",
            "progressive_loading_event_handler.py",
            "sequence_display_coordinator_service.py",
            "thumbnail_display_service.py",
        ]

        # Track files that need import updates
        self.files_to_update: set[Path] = set()

    def analyze_current_state(self) -> dict[str, any]:
        """Analyze the current state before migration."""
        print("Analyzing current state...")

        analysis = {
            "source_exists": self.source_dir.exists(),
            "target_exists": self.target_dir.exists(),
            "source_files": [],
            "target_files": [],
            "import_references": [],
        }

        if analysis["source_exists"]:
            analysis["source_files"] = [f.name for f in self.source_dir.glob("*.py")]
            print(
                f"   Found {len(analysis['source_files'])} Python files in source directory"
            )

        if analysis["target_exists"]:
            analysis["target_files"] = [f.name for f in self.target_dir.glob("*.py")]
            print(
                f"   Found {len(analysis['target_files'])} Python files in target directory"
            )

        # Find all files that import from the old location
        analysis["import_references"] = self._find_import_references()
        print(
            f"   Found {len(analysis['import_references'])} files with import references"
        )

        return analysis

    def _find_import_references(self) -> list[Path]:
        """Find all files that import from the old browse services location."""
        references = []

        # Search patterns for imports
        patterns = [
            r"from\s+desktop\.modern\.presentation\.tabs\.browse\.services",
            r"import\s+desktop\.modern\.presentation\.tabs\.browse\.services",
            r"from\s+\.\.\.services\.",  # Relative imports from browse tab components
        ]

        # Search in Python files
        for py_file in self.project_root.rglob("*.py"):
            if py_file.is_file():
                try:
                    content = py_file.read_text(encoding="utf-8")
                    for pattern in patterns:
                        if re.search(pattern, content):
                            references.append(py_file)
                            break
                except (UnicodeDecodeError, PermissionError):
                    continue

        return references

    def backup_files(self) -> Path:
        """Create backup of files before migration."""
        backup_dir = self.project_root / "migration_backup"
        backup_dir.mkdir(exist_ok=True)

        print(f"Creating backup in {backup_dir}")

        # Backup source directory
        if self.source_dir.exists():
            backup_source = backup_dir / "browse_services_old"
            if backup_source.exists():
                shutil.rmtree(backup_source)
            shutil.copytree(self.source_dir, backup_source)

        # Backup target directory
        if self.target_dir.exists():
            backup_target = backup_dir / "browse_services_target_backup"
            if backup_target.exists():
                shutil.rmtree(backup_target)
            shutil.copytree(self.target_dir, backup_target)

        return backup_dir

    def move_service_files(self) -> bool:
        """Move service files from presentation to application layer."""
        print("Moving service files...")

        if not self.source_dir.exists():
            print(f"ERROR: Source directory does not exist: {self.source_dir}")
            return False

        # Ensure target directory exists
        self.target_dir.mkdir(parents=True, exist_ok=True)

        moved_files = []

        # Move core services
        for filename, class_name in self.services_to_migrate.items():
            source_file = self.source_dir / filename
            target_file = self.target_dir / filename

            if source_file.exists():
                if target_file.exists():
                    print(f"WARNING: Target file already exists: {target_file}")
                    # Create backup with timestamp
                    backup_name = f"{filename}.backup"
                    shutil.move(str(target_file), str(self.target_dir / backup_name))

                shutil.move(str(source_file), str(target_file))
                moved_files.append(filename)
                print(f"   SUCCESS: Moved {filename}")
            else:
                print(f"   WARNING: Source file not found: {source_file}")

        # Move additional files if they exist
        for filename in self.additional_files:
            source_file = self.source_dir / filename
            target_file = self.target_dir / filename

            if source_file.exists():
                if not target_file.exists():
                    shutil.move(str(source_file), str(target_file))
                    moved_files.append(filename)
                    print(f"   SUCCESS: Moved additional file {filename}")

        print(f"Successfully moved {len(moved_files)} files")
        return len(moved_files) > 0

    def update_target_init_file(self) -> None:
        """Update the __init__.py file in the target directory."""
        print("Updating target __init__.py file...")

        init_file = self.target_dir / "__init__.py"

        # Build new __init__.py content
        imports = []
        exports = []

        # Add existing content if file exists
        if init_file.exists():
            content = init_file.read_text()
            if "SequenceDeletionService" in content:
                imports.append(
                    "from .sequence_deletion_service import SequenceDeletionService"
                )
                exports.append("SequenceDeletionService")

        # Add migrated services
        for filename, class_name in self.services_to_migrate.items():
            if (self.target_dir / filename).exists():
                module_name = filename[:-3]  # Remove .py extension
                imports.append(f"from .{module_name} import {class_name}")
                exports.append(class_name)

        # Write new __init__.py
        content = '"""Browse Services Module - Application Layer Services"""\n\n'
        content += "\n".join(imports)
        content += "\n\n__all__ = [\n"
        for export in exports:
            content += f'    "{export}",\n'
        content += "]\n"

        init_file.write_text(content)
        print(f"   SUCCESS: Updated {init_file}")


def main():
    """Main migration function."""
    print("Starting Browse Services Migration")
    print("=" * 60)

    # Get project root
    script_path = Path(__file__).resolve()
    project_root = script_path.parent

    # Initialize migrator
    migrator = BrowseServicesMigrator(project_root)

    # Analyze current state
    analysis = migrator.analyze_current_state()

    if not analysis["source_exists"]:
        print("ERROR: Source directory does not exist. Migration not needed.")
        return False

    # Create backup
    backup_dir = migrator.backup_files()

    try:
        # Move files
        if migrator.move_service_files():
            # Update target __init__.py
            migrator.update_target_init_file()

            print("\nPhase 1 Complete: Files moved successfully!")
            print(f"Backup created at: {backup_dir}")
            print("\nNext Steps:")
            print("1. Run the import update script to fix all import statements")
            print("2. Test the application to ensure everything works")
            print("3. Remove the old services directory if empty")

            return True
        else:
            print("ERROR: Failed to move files")
            return False

    except Exception as e:
        print(f"ERROR: Migration failed: {e}")
        print(f"Backup available at: {backup_dir}")
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
