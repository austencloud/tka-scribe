# Simple test script for date sorting

import os
import sys
from datetime import datetime

# Add the src directory to the path
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src")
)

from domain.models.sequence_data import SequenceData
from presentation.tabs.browse.services.modern_dictionary_data_manager import (
    ModernDictionaryDataManager,
)

print("🔍 Testing actual sequence data loading...")

# Create the data manager
tka_root = os.path.dirname(__file__)
data_dir = os.path.join(tka_root, "data")
data_manager = ModernDictionaryDataManager(data_dir)

# Load data
print("Loading sequence data...")
import asyncio

from PyQt6.QtWidgets import QApplication

# Create QApplication if not exists
app = QApplication.instance()
if app is None:
    app = QApplication(sys.argv)

# Load the data
data_manager.load_data()

# Wait a bit for data to load
import time

time.sleep(2)

# Check the loaded records
records = data_manager.get_all_records()
print(f"Loaded {len(records)} sequence records")

# Check for date_added in first few records
date_count = 0
for i, record in enumerate(records[:10]):
    if hasattr(record, "date_added") and record.date_added:
        date_count += 1
        print(f"Record {i}: {record.word} has date: {record.date_added}")
    else:
        print(f"Record {i}: {record.word} has no date_added")

print(
    f"\nFound {date_count} records with date_added out of {min(10, len(records))} checked"
)

# Test the sorting with real data
sequences = [data_manager.record_to_sequence_data(record) for record in records[:5]]
print(f"\nConverted {len(sequences)} records to SequenceData:")
for seq in sequences:
    date_str = seq.date_added.strftime("%m-%d-%Y") if seq.date_added else "None"
    print(f"  {seq.word}: {date_str}")

print("\n✅ Debug complete!")
