#!/usr/bin/env python3
import subprocess
import sys
import os

# Change to TKA directory
os.chdir(r'F:\CODE\TKA')

# Run pytest
result = subprocess.run([
    sys.executable, '-m', 'pytest', 
    'tests/test_application_factory.py::TestApplicationFactoryContract::test_create_headless_app', 
    '-v'
], capture_output=True, text=True)

print("STDOUT:")
print(result.stdout)
print("\nSTDERR:")
print(result.stderr)
print(f"\nReturn code: {result.returncode}")
