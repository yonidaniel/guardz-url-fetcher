#!/bin/bash

# Local log viewer for development
# Usage: ./scripts/view-local-logs.sh [lines] [follow]

LOG_FILE="local-app.log"
LINES=${1:-50}
FOLLOW=${2:-false}

echo "📋 Guardz URL Fetcher Service - Local Log Viewer"
echo "================================================"

# Check if log file exists
if [ ! -f "$LOG_FILE" ]; then
    echo "❌ No local log file found at $LOG_FILE"
    echo "💡 Start the application first:"
    echo "   npm run start:dev > local-app.log 2>&1 &"
    exit 1
fi

echo "📄 Log file: $LOG_FILE"
echo "📊 Size: $(du -h $LOG_FILE | cut -f1)"
echo "📅 Last modified: $(ls -la $LOG_FILE | awk '{print $6, $7, $8}')"
echo ""

if [ "$FOLLOW" = "true" ] || [ "$FOLLOW" = "follow" ]; then
    echo "🔄 Following logs in real-time (Press Ctrl+C to stop)..."
    echo "Showing last $LINES lines:"
    echo "=========================="
    tail -f -n $LINES "$LOG_FILE"
else
    echo "📄 Showing last $LINES lines of $LOG_FILE:"
    echo "=========================================="
    tail -n $LINES "$LOG_FILE"
fi
