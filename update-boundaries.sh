#!/bin/bash

# Unix/Mac Shell Script for Local Boundary Updater
# 
# This script runs on Unix/Mac to download and update conservation site boundaries
# 
# Usage:
#   ./update-boundaries.sh              - Download and process only
#   ./update-boundaries.sh commit       - Also commit changes
#   ./update-boundaries.sh commit push  - Commit and push to GitHub

echo ""
echo "========================================================="
echo "  Conservation Connector - Boundary Updater"
echo "========================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Build the command
CMD="node scripts/local-boundary-updater.cjs"

# Check for commit flag
if [ "$1" = "commit" ]; then
    CMD="$CMD --commit"
    echo "Mode: Will commit changes after download"
fi

# Check for push flag
if [ "$2" = "push" ]; then
    CMD="$CMD --push"
    echo "Mode: Will also push to GitHub"
fi

echo ""
echo "Running: $CMD"
echo ""

# Run the script
$CMD

echo ""
echo "========================================================="
echo "Done!"
echo "========================================================="
