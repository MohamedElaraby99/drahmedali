#!/bin/bash

echo "🚀 Creating Super Admin User..."
echo "================================"
echo

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Run the super admin creation script
node scripts/create-super-admin.js

echo
echo "Press Enter to exit..."
read
