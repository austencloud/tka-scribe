"""
SequenceManager

Manages sequence operations, workbench interactions, and sequence state for the construct tab.
Responsible for handling beat additions, sequence modifications, and workbench coordination.
"""

from typing import Optional, Callable
from PyQt6.QtCore import QObject, pyqtSignal

from domain.models.core_models import SequenceData, BeatData
from application.services.option_picker.orientation_update_service import (
    OptionOrientationUpdateService,
)
from application.services.core.sequence_persistence_service import (
    SequencePersistenceService,
)


class SequenceManager(QObject):
    """
    Manages sequence operations and workbench interactions.

    Responsibilities:
    - Adding beats to sequences
    - Managing sequence state changes
    - Coordinating with workbench component
    - Handling sequence clearing operations

    Signals:
    - sequence_modified: Emitted when sequence is modified
    - sequence_cleared: Emitted when sequence is cleared
    """

    sequence_modified = pyqtSignal(object)  # SequenceData object
    sequence_cleared = pyqtSignal()

    def __init__(
        self,
        workbench_getter: Optional[Callable[[], object]] = None,
        workbench_setter: Optional[Callable[[SequenceData], None]] = None,
    ):
        super().__init__()
        self.workbench_getter = workbench_getter
        self.workbench_setter = workbench_setter
        self._emitting_signal = False
        self.orientation_update_service = OptionOrientationUpdateService()
        # Initialize sequence persistence service - exactly like legacy
        self.persistence_service = SequencePersistenceService()

    def add_beat_to_sequence(self, beat_data: BeatData):
        """Add a beat to the current sequence"""
        current_sequence = self._get_current_sequence()
        if current_sequence is None:
            current_sequence = SequenceData.empty()

        try:
            if current_sequence.length > 0:
                updated_beats = (
                    self.orientation_update_service.update_option_orientations(
                        current_sequence, [beat_data]
                    )
                )
                beat_data = updated_beats[0]

            new_beat = beat_data.update(
                beat_number=current_sequence.length + 1,
                duration=1.0,
            )

            updated_beats = current_sequence.beats + [new_beat]
            updated_sequence = current_sequence.update(beats=updated_beats)

            # Update current_sequence.json file - exactly like legacy
            self._save_sequence_to_persistence(updated_sequence)
            
            if self.workbench_setter:
                self.workbench_setter(updated_sequence)
            else:
                self._emit_sequence_modified(updated_sequence)

        except Exception as e:
            print(f"❌ Error adding beat to sequence: {e}")
            import traceback
            traceback.print_exc()

    def clear_sequence(self):
        """Clear the current sequence - V1 behavior: hide all beats, keep start position visible"""
        # Clear current_sequence.json file - exactly like legacy
        self.persistence_service.clear_all_beats()
        
        if self.workbench_setter:
            self.workbench_setter(SequenceData.empty())
        self.sequence_cleared.emit()

    def handle_workbench_modified(self, sequence: SequenceData):
        """Handle workbench sequence modification with circular emission protection"""
        if self._emitting_signal:
            return

        try:
            self._emitting_signal = True
            # Update current_sequence.json file when sequence is modified - exactly like legacy
            self._save_sequence_to_persistence(sequence)
            self.sequence_modified.emit(sequence)
        except Exception as e:
            print(f"❌ Sequence manager: Signal emission failed: {e}")
            import traceback
            traceback.print_exc()
        finally:
            self._emitting_signal = False

    def _get_current_sequence(self) -> Optional[SequenceData]:
        """Get the current sequence from workbench"""
        if self.workbench_getter:
            try:
                workbench = self.workbench_getter()
                if workbench and hasattr(workbench, "get_sequence"):
                    return workbench.get_sequence()
            except Exception as e:
                print(f"❌ Error getting current sequence: {e}")
        return None

    def _emit_sequence_modified(self, sequence: SequenceData):
        """Emit sequence modified signal with circular emission protection"""
        if not self._emitting_signal:
            try:
                self._emitting_signal = True
                self.sequence_modified.emit(sequence)
            finally:
                self._emitting_signal = False

    def get_current_sequence_length(self) -> int:
        """Get the length of the current sequence"""
        current_sequence = self._get_current_sequence()
        return current_sequence.length if current_sequence else 0

    def _save_sequence_to_persistence(self, sequence: SequenceData):
        """Convert modern SequenceData to legacy format and save to current_sequence.json"""
        try:
            # Load existing sequence to preserve start position
            existing_sequence = self.persistence_service.load_current_sequence()
            
            # Calculate word from beat letters exactly like legacy
            word = self._calculate_sequence_word(sequence)
            
            # Update metadata with calculated word
            metadata = existing_sequence[0] if existing_sequence else self.persistence_service.get_default_sequence()[0]
            metadata["word"] = word
            
            # Check if there's an existing start position (beat 0)
            existing_start_position = None
            if len(existing_sequence) > 1 and existing_sequence[1].get("beat") == 0:
                existing_start_position = existing_sequence[1]
                print(f"✅ Preserving existing start position: {existing_start_position.get('sequence_start_position', 'unknown')}")
            
            # Convert beats to legacy format (these will be beat 1, 2, 3, etc.)
            legacy_beats = []
            for i, beat in enumerate(sequence.beats):
                beat_dict = {
                    "beat": i + 1,  # Start numbering from 1 (start position is 0)
                    "letter": beat.letter,
                    "letter_type": "Type1",  # Default for now
                    "duration": int(beat.duration),
                    "start_pos": getattr(beat, 'start_position', ''),
                    "end_pos": getattr(beat, 'end_position', ''),
                    "timing": getattr(beat, 'timing', 'tog'),
                    "direction": getattr(beat, 'direction', 'same'),
                    "blue_attributes": {
                        "motion_type": getattr(beat, 'blue_motion_type', 'pro'),
                        "start_ori": getattr(beat, 'blue_start_ori', 'in'),
                        "end_ori": getattr(beat, 'blue_end_ori', 'in'),
                        "prop_rot_dir": getattr(beat, 'blue_prop_rot_dir', 'cw'),
                        "start_loc": getattr(beat, 'blue_start_loc', 's'),
                        "end_loc": getattr(beat, 'blue_end_loc', 's'),
                        "turns": getattr(beat, 'blue_turns', 0),
                    },
                    "red_attributes": {
                        "motion_type": getattr(beat, 'red_motion_type', 'pro'),
                        "start_ori": getattr(beat, 'red_start_ori', 'in'),
                        "end_ori": getattr(beat, 'red_end_ori', 'in'),
                        "prop_rot_dir": getattr(beat, 'red_prop_rot_dir', 'cw'),
                        "start_loc": getattr(beat, 'red_start_loc', 's'),
                        "end_loc": getattr(beat, 'red_end_loc', 's'),
                        "turns": getattr(beat, 'red_turns', 0),
                    },
                }
                legacy_beats.append(beat_dict)
            
            # Build final sequence: [metadata, start_position (if exists), beat1, beat2, ...]
            final_sequence = [metadata]
            if existing_start_position:
                final_sequence.append(existing_start_position)
            final_sequence.extend(legacy_beats)
            
            # Save the complete sequence
            self.persistence_service.save_current_sequence(final_sequence)
            print(f"✅ Saved sequence to current_sequence.json: {len(final_sequence)} items (word: '{word}')")
            
        except Exception as e:
            print(f"❌ Failed to save sequence to persistence: {e}")
            import traceback
            traceback.print_exc()

    def _calculate_sequence_word(self, sequence: SequenceData) -> str:
        """Calculate sequence word from beat letters exactly like legacy"""
        if not sequence.beats:
            return ""
            
        # Extract letters from beats exactly like legacy calculate_word method
        word = "".join(beat.letter for beat in sequence.beats)
        
        # Apply word simplification for circular sequences like legacy
        return self._simplify_repeated_word(word)
    
    def _simplify_repeated_word(self, word: str) -> str:
        """Simplify repeated patterns exactly like legacy WordSimplifier"""
        def can_form_by_repeating(s: str, pattern: str) -> bool:
            pattern_len = len(pattern)
            return all(
                s[i : i + pattern_len] == pattern for i in range(0, len(s), pattern_len)
            )

        n = len(word)
        for i in range(1, n // 2 + 1):
            pattern = word[:i]
            if n % i == 0 and can_form_by_repeating(word, pattern):
                return pattern
        return word

    def update_beat_turns(self, beat_index: int, color: str, new_turns: int):
        """Update the number of turns for a specific beat - exactly like legacy"""
        try:
            current_sequence = self._get_current_sequence()
            if not current_sequence or beat_index >= len(current_sequence.beats):
                return

            # Update the beat in memory
            updated_beats = list(current_sequence.beats)
            beat = updated_beats[beat_index]
            
            # Update the turn count for the specified color
            if color == 'blue':
                updated_beat = beat.update(blue_turns=new_turns)
            elif color == 'red':
                updated_beat = beat.update(red_turns=new_turns)
            else:
                return
                
            updated_beats[beat_index] = updated_beat
            updated_sequence = current_sequence.update(beats=updated_beats)
            
            # Save to persistence and update workbench
            self._save_sequence_to_persistence(updated_sequence)
            
            if self.workbench_setter:
                self.workbench_setter(updated_sequence)
                
            print(f"✅ Updated {color} turns for beat {beat_index} to {new_turns}")
            
        except Exception as e:
            print(f"❌ Failed to update beat turns: {e}")
            import traceback
            traceback.print_exc()

    def remove_beat(self, beat_index: int):
        """Remove a beat from the sequence - exactly like legacy"""
        try:
            current_sequence = self._get_current_sequence()
            if not current_sequence or beat_index >= len(current_sequence.beats):
                return

            # Remove the beat
            updated_beats = list(current_sequence.beats)
            updated_beats.pop(beat_index)
            
            # Renumber remaining beats
            for i, beat in enumerate(updated_beats):
                updated_beats[i] = beat.update(beat_number=i + 1)
                
            updated_sequence = current_sequence.update(beats=updated_beats)
            
            # Save to persistence and update workbench
            self._save_sequence_to_persistence(updated_sequence)
            
            if self.workbench_setter:
                self.workbench_setter(updated_sequence)
                
            print(f"✅ Removed beat {beat_index}")
            
        except Exception as e:
            print(f"❌ Failed to remove beat: {e}")
            import traceback
            traceback.print_exc()

    def set_start_position(self, start_position_data: BeatData):
        """Set the start position - exactly like legacy"""
        try:
            # Convert start position to legacy format and save as beat 0
            start_pos_dict = self._convert_start_position_to_legacy_format(start_position_data)
            
            # Load current sequence to preserve existing beats
            sequence = self.persistence_service.load_current_sequence()
            
            # Find where to insert/replace start position
            if len(sequence) == 1:  # Only metadata
                sequence.append(start_pos_dict)
                print(f"✅ Inserted start position as beat 0")
            elif len(sequence) > 1 and sequence[1].get("beat") == 0:
                # Replace existing start position
                sequence[1] = start_pos_dict
                print(f"✅ Replaced existing start position")
            else:
                # Insert start position, shifting existing beats
                sequence.insert(1, start_pos_dict)
                print(f"✅ Inserted start position, preserving {len(sequence) - 2} existing beats")
            
            # Save updated sequence (preserves existing beats)
            self.persistence_service.save_current_sequence(sequence)
            
            print(f"✅ Set start position: {start_position_data.letter}")
            
        except Exception as e:
            print(f"❌ Failed to set start position: {e}")
            import traceback
            traceback.print_exc()
    
    def _convert_start_position_to_legacy_format(self, start_position_data: BeatData) -> dict:
        """Convert start position BeatData to legacy format exactly like JsonStartPositionHandler"""
        # Extract start position type (alpha, beta, gamma) from end position
        end_pos = getattr(start_position_data, 'end_position', 'alpha1')
        if end_pos.startswith("alpha"):
            sequence_start_position = "alpha"
        elif end_pos.startswith("beta"):
            sequence_start_position = "beta"
        elif end_pos.startswith("gamma"):
            sequence_start_position = "gamma"
        else:
            sequence_start_position = end_pos.rstrip("0123456789")
        
        return {
            "beat": 0,
            "sequence_start_position": sequence_start_position,
            "letter": start_position_data.letter,
            "end_pos": end_pos,
            "timing": getattr(start_position_data, 'timing', 'none'),
            "direction": getattr(start_position_data, 'direction', 'none'),
            "blue_attributes": {
                "start_loc": getattr(start_position_data, 'blue_start_loc', 's'),
                "end_loc": getattr(start_position_data, 'blue_end_loc', 's'),
                "start_ori": getattr(start_position_data, 'blue_start_ori', 'in'),
                "end_ori": getattr(start_position_data, 'blue_end_ori', 'in'),
                "prop_rot_dir": "no_rot",
                "turns": 0,
                "motion_type": "static",
            },
            "red_attributes": {
                "start_loc": getattr(start_position_data, 'red_start_loc', 'n'),
                "end_loc": getattr(start_position_data, 'red_end_loc', 'n'),
                "start_ori": getattr(start_position_data, 'red_start_ori', 'in'),
                "end_ori": getattr(start_position_data, 'red_end_ori', 'in'),
                "prop_rot_dir": "no_rot",
                "turns": 0,
                "motion_type": "static",
            },
        }

    def load_sequence_on_startup(self):
        """Load sequence from current_sequence.json on startup - exactly like legacy"""
        try:
            # Load sequence from persistence
            sequence_data = self.persistence_service.load_current_sequence()
            
            if len(sequence_data) <= 1:
                print("ℹ️ [SEQUENCE_MANAGER] No sequence to load on startup")
                return
                
            print(f"🔍 [SEQUENCE_MANAGER] Loading sequence from current_sequence.json...")
            print(f"🔍 [SEQUENCE_MANAGER] Sequence has {len(sequence_data)} items")
            
            # Extract metadata and beats
            metadata = sequence_data[0]
            sequence_word = metadata.get("word", "")
            print(f"🔍 [SEQUENCE_MANAGER] Sequence word: '{sequence_word}'")
            
            # Find start position (beat 0) and actual beats (beat 1+)
            start_position_data = None
            beats_data = []
            
            for item in sequence_data[1:]:
                if item.get("beat") == 0:
                    start_position_data = item
                    print(f"✅ [SEQUENCE_MANAGER] Found start position: {item.get('sequence_start_position', 'unknown')}")
                elif "letter" in item and not item.get("is_placeholder", False):
                    beats_data.append(item)
                    print(f"✅ [SEQUENCE_MANAGER] Found beat {item.get('beat', '?')}: {item.get('letter', '?')}")
            
            # Convert beats to modern format
            from domain.models.core_models import BeatData
            beat_objects = []
            for i, beat_dict in enumerate(beats_data):
                try:
                    beat_obj = BeatData.from_dict(beat_dict)
                    # Renumber beats to be sequential starting from 1
                    beat_obj = beat_obj.update(beat_number=i + 1)
                    beat_objects.append(beat_obj)
                except Exception as e:
                    print(f"⚠️ [SEQUENCE_MANAGER] Failed to convert beat {beat_dict.get('letter', '?')}: {e}")
                    # Create fallback beat with proper numbering
                    fallback_beat = BeatData.empty().update(
                        letter=beat_dict.get("letter", "?"),
                        beat_number=i + 1,  # Sequential numbering
                        duration=beat_dict.get("duration", 1.0)
                    )
                    beat_objects.append(fallback_beat)
            
            if beat_objects:
                # First, set start position if it exists (like legacy)
                if start_position_data:
                    try:
                        # Convert start position to BeatData
                        start_pos_beat = BeatData.empty().update(
                            letter=start_position_data.get("letter", "α"),
                            beat_number=0,
                            duration=1.0
                        )
                        
                        # Set start position in workbench first
                        if self.workbench_setter:
                            self.workbench_setter(start_pos_beat)
                            print(f"✅ [SEQUENCE_MANAGER] Start position loaded into workbench")
                            
                    except Exception as e:
                        print(f"⚠️ [SEQUENCE_MANAGER] Failed to load start position: {e}")
                
                # Then create and set the sequence
                from domain.models.core_models import SequenceData
                loaded_sequence = SequenceData(
                    id="loaded_sequence",
                    name=sequence_word or "Loaded Sequence",
                    beats=beat_objects
                )
                
                print(f"✅ [SEQUENCE_MANAGER] Created sequence: '{loaded_sequence.name}' with {len(beat_objects)} beats")
                
                # Set sequence in workbench
                if self.workbench_setter:
                    self.workbench_setter(loaded_sequence)
                    print(f"✅ [SEQUENCE_MANAGER] Sequence loaded into workbench")
                        
            else:
                print("ℹ️ [SEQUENCE_MANAGER] No beats found to load")
                
        except Exception as e:
            print(f"❌ [SEQUENCE_MANAGER] Failed to load sequence on startup: {e}")
            import traceback
            traceback.print_exc()
