#!/bin/bash

# TKA Web App - Comprehensive Validation Script (Bash)
# 
# This script runs all type checks, linting, tests, and validations
# to ensure the codebase is in perfect condition.
# 
# Usage:
#   ./validate-all.sh
#   npm run validate:all

# Colors for output
CYAN='\033[0;36m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    TKA Web App Validator                     ║${NC}"
echo -e "${CYAN}║              Comprehensive Quality Assurance                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Change to the web directory if not already there
if [ ! -f "package.json" ]; then
    if [ -f "web/package.json" ]; then
        cd web
        echo -e "${YELLOW}Changed to web directory${NC}"
    else
        echo -e "${RED}Error: Could not find package.json. Please run from TKA project root or web directory.${NC}"
        exit 1
    fi
fi

# Make sure we have npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed or not in PATH${NC}"
    exit 1
fi

# Run the Node.js validation script
echo -e "${BLUE}Running comprehensive validation...${NC}"
echo ""

if npm run validate:all; then
    echo ""
    echo -e "${GREEN}🎉 Bash wrapper completed successfully! 🎉${NC}"
    exit 0
else
    exit_code=$?
    echo ""
    echo -e "${RED}💥 Validation failed with exit code: $exit_code 💥${NC}"
    exit $exit_code
fi
