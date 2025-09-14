#!/bin/bash

# Script to check logs from the deployed service
# This script helps you access logs from the GCP server

SERVER_IP="34.135.82.223"
SERVER_USER="candidate"
SSH_KEY="id_ed25519"  # SSH key should be in the same directory as this script
APP_DIR="/home/candidate/app"

echo "🔍 Guardz URL Fetcher Service - Log Checker"
echo "=========================================="

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found at $SSH_KEY"
    echo "Please place your SSH private key in the project root as 'id_ed25519'"
    exit 1
fi

# Set correct permissions for SSH key
chmod 600 "$SSH_KEY"

echo "📊 Checking logs on server..."

# Check if the application is running and get logs
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'EOF'
    cd /home/candidate/app
    
    echo "🔍 Checking for log files..."
    echo "================================"
    
    # Check for application log
    if [ -f "app.log" ]; then
        echo "📄 Application log found (app.log):"
        echo "Size: $(du -h app.log | cut -f1)"
        echo "Last modified: $(ls -la app.log | awk '{print $6, $7, $8}')"
        echo ""
        echo "📋 Last 20 lines of app.log:"
        echo "----------------------------"
        tail -20 app.log
        echo ""
    else
        echo "❌ No app.log found"
    fi
    
    # Check for npm logs
    if [ -f "npm-debug.log" ]; then
        echo "📄 NPM debug log found:"
        echo "Size: $(du -h npm-debug.log | cut -f1)"
        echo "Last modified: $(ls -la npm-debug.log | awk '{print $6, $7, $8}')"
        echo ""
    fi
    
    # Check for system logs
    echo "🔍 Checking system logs..."
    echo "=========================="
    
    # Check if the process is running
    if pgrep -f "node.*main" > /dev/null; then
        echo "✅ Application is running (PID: $(pgrep -f 'node.*main'))"
    else
        echo "❌ Application is not running"
    fi
    
    # Check system resources
    echo ""
    echo "💻 System Resources:"
    echo "==================="
    echo "Memory usage:"
    free -h
    echo ""
    echo "Disk usage:"
    df -h /home/candidate/app
    echo ""
    echo "Process list (Node.js related):"
    ps aux | grep -E "(node|npm)" | grep -v grep
EOF

echo ""
echo "📋 Log Locations Summary:"
echo "========================="
echo "• Application logs: /home/candidate/app/app.log"
echo "• NPM logs: /home/candidate/app/npm-debug.log"
echo "• System logs: /var/log/syslog (requires sudo)"
echo ""
echo "💡 To view logs in real-time, run:"
echo "ssh -i id_ed25519 candidate@34.135.82.223 'tail -f /home/candidate/app/app.log'"
