#!/bin/bash

# Simple log viewer for the deployed service
# Usage: ./scripts/view-logs.sh [lines] [follow]

SERVER_IP="34.135.82.223"
SERVER_USER="candidate"
SSH_KEY="id_ed25519"
APP_DIR="/home/candidate/app"

# Default number of lines to show
LINES=${1:-50}
FOLLOW=${2:-false}

echo "📋 Guardz URL Fetcher Service - Log Viewer"
echo "=========================================="

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found at $SSH_KEY"
    echo "Please place your SSH private key in the project root as 'id_ed25519'"
    exit 1
fi

# Set correct permissions for SSH key
chmod 600 "$SSH_KEY"

if [ "$FOLLOW" = "true" ] || [ "$FOLLOW" = "follow" ]; then
    echo "🔄 Following logs in real-time (Press Ctrl+C to stop)..."
    echo "Showing last $LINES lines:"
    echo "=========================="
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "tail -f -n $LINES /home/candidate/app/app.log"
else
    echo "📄 Showing last $LINES lines of app.log:"
    echo "======================================="
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "tail -n $LINES /home/candidate/app/app.log"
fi
