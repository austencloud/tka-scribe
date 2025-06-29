#!/usr/bin/env python3
"""
Direct Simple TKA Launcher
=========================

Direct launcher for the simple horizontal TKA command bar.
Just runs the simple launcher without the complex initialization.
"""

import sys
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def main():
    """Main entry point for simple launcher"""
    try:
        # Add launcher directory to path
        launcher_dir = Path(__file__).parent
        if str(launcher_dir) not in sys.path:
            sys.path.insert(0, str(launcher_dir))
        
        logger.info("🚀 Starting Simple TKA Launcher...")
        
        # Import and run simple launcher
        from simple_launcher import main as simple_main
        return simple_main()
        
    except ImportError as e:
        logger.error(f"❌ Import error: {e}")
        return 1
    except Exception as e:
        logger.error(f"💥 Failed to start simple launcher: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
