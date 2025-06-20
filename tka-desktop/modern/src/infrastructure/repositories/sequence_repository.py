"""
Sequence repository implementation with database abstractions.
"""

import json
import sqlite3
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from domain.repositories.base_repository import (
    BaseRepository, 
    QueryCriteria, 
    RepositoryResult,
    validate_required_fields,
    validate_field_types
)
from domain.models.core_models import SequenceData, BeatData
from core.types.result import Result
from core.exceptions import DataProcessingError
from core.logging.structured_logger import get_logger, LogContext

logger = get_logger(__name__)


class SequenceRepository(BaseRepository[SequenceData, str]):
    """
    Repository for sequence data persistence with SQLite backend.
    
    Provides CRUD operations for sequences with validation,
    error handling, and performance monitoring.
    """
    
    def __init__(self, db_path: Optional[Path] = None):
        super().__init__(SequenceData)
        self.db_path = db_path or Path("tka_sequences.db")
        self._setup_validators()
        self._initialize_database()
    
    def _setup_validators(self):
        """Setup validation rules for sequences."""
        def validate_sequence_fields(sequence: SequenceData) -> Result[None, Exception]:
            # Validate required fields
            required_result = validate_required_fields(sequence, ['id', 'name', 'beats'])
            if required_result.is_error():
                return required_result
            
            # Validate field types
            type_result = validate_field_types(sequence, {
                'id': str,
                'name': str,
                'word': str,
                'beats': list
            })
            if type_result.is_error():
                return type_result
            
            # Validate sequence-specific rules
            if len(sequence.name.strip()) == 0:
                return Result.error(Exception("Sequence name cannot be empty"))
            
            if len(sequence.beats) == 0:
                return Result.error(Exception("Sequence must have at least one beat"))
            
            return Result.ok(None)
        
        self.add_validator(validate_sequence_fields)
    
    def _initialize_database(self):
        """Initialize SQLite database with required tables."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Create sequences table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS sequences (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        word TEXT,
                        start_position TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metadata TEXT
                    )
                """)
                
                # Create beats table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS beats (
                        id TEXT PRIMARY KEY,
                        sequence_id TEXT NOT NULL,
                        beat_number INTEGER NOT NULL,
                        letter TEXT,
                        duration REAL DEFAULT 1.0,
                        is_blank BOOLEAN DEFAULT FALSE,
                        blue_reversal BOOLEAN DEFAULT FALSE,
                        red_reversal BOOLEAN DEFAULT FALSE,
                        metadata TEXT,
                        FOREIGN KEY (sequence_id) REFERENCES sequences (id) ON DELETE CASCADE
                    )
                """)
                
                # Create motions table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS motions (
                        id TEXT PRIMARY KEY,
                        beat_id TEXT NOT NULL,
                        color TEXT NOT NULL,
                        motion_type TEXT,
                        prop_rot_dir TEXT,
                        start_loc TEXT,
                        end_loc TEXT,
                        turns INTEGER DEFAULT 1,
                        start_ori TEXT,
                        end_ori TEXT,
                        FOREIGN KEY (beat_id) REFERENCES beats (id) ON DELETE CASCADE
                    )
                """)
                
                # Create indexes for performance
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_beats_sequence_id ON beats (sequence_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_motions_beat_id ON motions (beat_id)")
                
                conn.commit()
                
                logger.info(
                    "Database initialized successfully",
                    context=LogContext(
                        operation="database_init",
                        component="sequence_repository"
                    ),
                    db_path=str(self.db_path)
                )
                
        except Exception as e:
            logger.error(
                "Failed to initialize database",
                error=e,
                context=LogContext(
                    operation="database_init_error",
                    component="sequence_repository"
                ),
                db_path=str(self.db_path)
            )
            raise DataProcessingError(
                f"Failed to initialize database: {str(e)}",
                processing_stage="database_initialization"
            )
    
    async def get_by_id(self, id: str) -> Result[Optional[SequenceData], Exception]:
        """Retrieve sequence by ID."""
        validation_result = self.validate_id(id)
        if validation_result.is_error():
            return Result.error(validation_result.unwrap_error())
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                # Get sequence data
                cursor.execute(
                    "SELECT * FROM sequences WHERE id = ?", (id,)
                )
                sequence_row = cursor.fetchone()
                
                if not sequence_row:
                    return Result.ok(None)
                
                # Get beats for this sequence
                cursor.execute(
                    "SELECT * FROM beats WHERE sequence_id = ? ORDER BY beat_number",
                    (id,)
                )
                beat_rows = cursor.fetchall()
                
                # Build sequence object
                beats = []
                for beat_row in beat_rows:
                    # Get motions for this beat
                    cursor.execute(
                        "SELECT * FROM motions WHERE beat_id = ?",
                        (beat_row['id'],)
                    )
                    motion_rows = cursor.fetchall()
                    
                    # Create beat with motions
                    beat = self._build_beat_from_row(beat_row, motion_rows)
                    beats.append(beat)
                
                sequence = self._build_sequence_from_row(sequence_row, beats)
                
                logger.debug(
                    "Sequence retrieved successfully",
                    context=LogContext(
                        operation="get_sequence",
                        component="sequence_repository"
                    ),
                    sequence_id=id,
                    beat_count=len(beats)
                )
                
                return Result.ok(sequence)
                
        except Exception as e:
            logger.error(
                "Failed to retrieve sequence",
                error=e,
                context=LogContext(
                    operation="get_sequence_error",
                    component="sequence_repository"
                ),
                sequence_id=id
            )
            return Result.error(e)
    
    async def get_all(self, criteria: Optional[QueryCriteria] = None) -> Result[List[SequenceData], Exception]:
        """Retrieve all sequences matching criteria."""
        if criteria:
            validation_result = self.validate_criteria(criteria)
            if validation_result.is_error():
                return Result.error(validation_result.unwrap_error())
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                # Build query
                query = "SELECT * FROM sequences"
                params = []
                
                if criteria and criteria.filters:
                    where_clauses = []
                    for key, value in criteria.filters.items():
                        where_clauses.append(f"{key} = ?")
                        params.append(value)
                    
                    if where_clauses:
                        query += " WHERE " + " AND ".join(where_clauses)
                
                # Add sorting
                if criteria and criteria.sort_by:
                    query += f" ORDER BY {criteria.sort_by} {criteria.sort_order.upper()}"
                else:
                    query += " ORDER BY created_at DESC"
                
                # Add pagination
                if criteria and criteria.limit:
                    query += f" LIMIT {criteria.limit}"
                    if criteria.offset > 0:
                        query += f" OFFSET {criteria.offset}"
                
                cursor.execute(query, params)
                sequence_rows = cursor.fetchall()
                
                sequences = []
                for sequence_row in sequence_rows:
                    # Get beats for each sequence (simplified for list view)
                    cursor.execute(
                        "SELECT COUNT(*) as beat_count FROM beats WHERE sequence_id = ?",
                        (sequence_row['id'],)
                    )
                    beat_count = cursor.fetchone()['beat_count']
                    
                    # Create simplified sequence object
                    sequence = SequenceData(
                        id=sequence_row['id'],
                        name=sequence_row['name'],
                        word=sequence_row['word'] or "",
                        beats=[],  # Empty for list view performance
                        start_position=sequence_row['start_position'] or "alpha",
                        metadata={
                            'beat_count': beat_count,
                            'created_at': sequence_row['created_at'],
                            'updated_at': sequence_row['updated_at']
                        }
                    )
                    sequences.append(sequence)
                
                logger.info(
                    "Sequences retrieved successfully",
                    context=LogContext(
                        operation="get_all_sequences",
                        component="sequence_repository"
                    ),
                    sequence_count=len(sequences)
                )
                
                return Result.ok(sequences)
                
        except Exception as e:
            logger.error(
                "Failed to retrieve sequences",
                error=e,
                context=LogContext(
                    operation="get_all_sequences_error",
                    component="sequence_repository"
                )
            )
            return Result.error(e)
    
    async def save(self, entity: SequenceData) -> Result[SequenceData, Exception]:
        """Save sequence (create or update)."""
        validation_result = self.validate_entity(entity)
        if validation_result.is_error():
            return Result.error(validation_result.unwrap_error())
        
        try:
            # Generate ID if not present
            if not entity.id:
                entity.id = str(uuid.uuid4())
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Check if sequence exists
                cursor.execute("SELECT id FROM sequences WHERE id = ?", (entity.id,))
                exists = cursor.fetchone() is not None
                
                current_time = datetime.utcnow().isoformat()
                
                if exists:
                    # Update existing sequence
                    cursor.execute("""
                        UPDATE sequences 
                        SET name = ?, word = ?, start_position = ?, updated_at = ?, metadata = ?
                        WHERE id = ?
                    """, (
                        entity.name,
                        entity.word,
                        entity.start_position,
                        current_time,
                        json.dumps(entity.metadata),
                        entity.id
                    ))
                    
                    # Delete existing beats and motions
                    cursor.execute("DELETE FROM beats WHERE sequence_id = ?", (entity.id,))
                else:
                    # Insert new sequence
                    cursor.execute("""
                        INSERT INTO sequences (id, name, word, start_position, created_at, updated_at, metadata)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        entity.id,
                        entity.name,
                        entity.word,
                        entity.start_position,
                        current_time,
                        current_time,
                        json.dumps(entity.metadata)
                    ))
                
                # Insert beats and motions
                for beat in entity.beats:
                    if not beat.id:
                        beat.id = str(uuid.uuid4())
                    
                    cursor.execute("""
                        INSERT INTO beats (id, sequence_id, beat_number, letter, duration, 
                                         is_blank, blue_reversal, red_reversal, metadata)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        beat.id,
                        entity.id,
                        beat.beat_number,
                        beat.letter,
                        beat.duration,
                        beat.is_blank,
                        beat.blue_reversal,
                        beat.red_reversal,
                        json.dumps(beat.metadata)
                    ))
                    
                    # Insert motions for this beat
                    if beat.blue_motion:
                        self._insert_motion(cursor, beat.id, "blue", beat.blue_motion)
                    if beat.red_motion:
                        self._insert_motion(cursor, beat.id, "red", beat.red_motion)
                
                conn.commit()
                
                # Update entity metadata
                entity.metadata.update({
                    'saved_at': current_time,
                    'operation': 'update' if exists else 'create'
                })
                
                logger.info(
                    "Sequence saved successfully",
                    context=LogContext(
                        operation="save_sequence",
                        component="sequence_repository"
                    ),
                    sequence_id=entity.id,
                    sequence_name=entity.name,
                    operation='update' if exists else 'create'
                )
                
                return Result.ok(entity)
                
        except Exception as e:
            logger.error(
                "Failed to save sequence",
                error=e,
                context=LogContext(
                    operation="save_sequence_error",
                    component="sequence_repository"
                ),
                sequence_id=getattr(entity, 'id', 'unknown'),
                sequence_name=getattr(entity, 'name', 'unknown')
            )
            return Result.error(e)
    
    async def delete(self, id: str) -> Result[bool, Exception]:
        """Delete sequence by ID."""
        validation_result = self.validate_id(id)
        if validation_result.is_error():
            return Result.error(validation_result.unwrap_error())
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Check if sequence exists
                cursor.execute("SELECT id FROM sequences WHERE id = ?", (id,))
                if not cursor.fetchone():
                    return Result.ok(False)
                
                # Delete sequence (cascades to beats and motions)
                cursor.execute("DELETE FROM sequences WHERE id = ?", (id,))
                conn.commit()
                
                logger.info(
                    "Sequence deleted successfully",
                    context=LogContext(
                        operation="delete_sequence",
                        component="sequence_repository"
                    ),
                    sequence_id=id
                )
                
                return Result.ok(True)
                
        except Exception as e:
            logger.error(
                "Failed to delete sequence",
                error=e,
                context=LogContext(
                    operation="delete_sequence_error",
                    component="sequence_repository"
                ),
                sequence_id=id
            )
            return Result.error(e)
    
    async def exists(self, id: str) -> Result[bool, Exception]:
        """Check if sequence exists."""
        validation_result = self.validate_id(id)
        if validation_result.is_error():
            return Result.error(validation_result.unwrap_error())
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1 FROM sequences WHERE id = ?", (id,))
                exists = cursor.fetchone() is not None
                return Result.ok(exists)
        except Exception as e:
            return Result.error(e)
    
    async def count(self, criteria: Optional[QueryCriteria] = None) -> Result[int, Exception]:
        """Count sequences matching criteria."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                query = "SELECT COUNT(*) FROM sequences"
                params = []
                
                if criteria and criteria.filters:
                    where_clauses = []
                    for key, value in criteria.filters.items():
                        where_clauses.append(f"{key} = ?")
                        params.append(value)
                    
                    if where_clauses:
                        query += " WHERE " + " AND ".join(where_clauses)
                
                cursor.execute(query, params)
                count = cursor.fetchone()[0]
                return Result.ok(count)
        except Exception as e:
            return Result.error(e)
    
    async def find_by_criteria(self, criteria: QueryCriteria) -> Result[RepositoryResult[List[SequenceData]], Exception]:
        """Find sequences by criteria with metadata."""
        # Get total count
        count_result = await self.count(criteria)
        if count_result.is_error():
            return Result.error(count_result.unwrap_error())
        
        # Get sequences
        sequences_result = await self.get_all(criteria)
        if sequences_result.is_error():
            return Result.error(sequences_result.unwrap_error())
        
        result = RepositoryResult(
            data=sequences_result.unwrap(),
            total_count=count_result.unwrap(),
            metadata={
                'query_criteria': criteria.__dict__,
                'retrieved_at': datetime.utcnow().isoformat()
            }
        )
        
        return Result.ok(result)
    
    def _build_sequence_from_row(self, row: sqlite3.Row, beats: List[BeatData]) -> SequenceData:
        """Build SequenceData from database row."""
        metadata = json.loads(row['metadata']) if row['metadata'] else {}
        metadata.update({
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        })
        
        return SequenceData(
            id=row['id'],
            name=row['name'],
            word=row['word'] or "",
            beats=beats,
            start_position=row['start_position'] or "alpha",
            metadata=metadata
        )
    
    def _build_beat_from_row(self, beat_row: sqlite3.Row, motion_rows: List[sqlite3.Row]) -> BeatData:
        """Build BeatData from database rows."""
        # Extract motions by color
        blue_motion = None
        red_motion = None
        
        for motion_row in motion_rows:
            if motion_row['color'] == 'blue':
                blue_motion = self._build_motion_from_row(motion_row)
            elif motion_row['color'] == 'red':
                red_motion = self._build_motion_from_row(motion_row)
        
        metadata = json.loads(beat_row['metadata']) if beat_row['metadata'] else {}
        
        return BeatData(
            id=beat_row['id'],
            beat_number=beat_row['beat_number'],
            letter=beat_row['letter'],
            duration=beat_row['duration'],
            blue_motion=blue_motion,
            red_motion=red_motion,
            blue_reversal=bool(beat_row['blue_reversal']),
            red_reversal=bool(beat_row['red_reversal']),
            is_blank=bool(beat_row['is_blank']),
            metadata=metadata
        )
    
    def _build_motion_from_row(self, motion_row: sqlite3.Row):
        """Build MotionData from database row."""
        # This would need to import and use the actual MotionData class
        # For now, return a simplified dictionary
        return {
            'motion_type': motion_row['motion_type'],
            'prop_rot_dir': motion_row['prop_rot_dir'],
            'start_loc': motion_row['start_loc'],
            'end_loc': motion_row['end_loc'],
            'turns': motion_row['turns'],
            'start_ori': motion_row['start_ori'],
            'end_ori': motion_row['end_ori']
        }
    
    def _insert_motion(self, cursor: sqlite3.Cursor, beat_id: str, color: str, motion_data):
        """Insert motion data into database."""
        motion_id = str(uuid.uuid4())
        
        cursor.execute("""
            INSERT INTO motions (id, beat_id, color, motion_type, prop_rot_dir, 
                               start_loc, end_loc, turns, start_ori, end_ori)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            motion_id,
            beat_id,
            color,
            getattr(motion_data, 'motion_type', None),
            getattr(motion_data, 'prop_rot_dir', None),
            getattr(motion_data, 'start_loc', None),
            getattr(motion_data, 'end_loc', None),
            getattr(motion_data, 'turns', 1),
            getattr(motion_data, 'start_ori', None),
            getattr(motion_data, 'end_ori', None)
        ))
