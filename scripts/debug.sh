#!/bin/bash

# Debug helper script for Guardz URL Fetcher Service
# This script provides various debugging options

echo "🐛 Guardz URL Fetcher Service - Debug Helper"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show debug menu
show_debug_menu() {
    echo -e "${BLUE}Choose a debugging option:${NC}"
    echo "1. Start with VS Code debugging"
    echo "2. Start with Chrome DevTools debugging"
    echo "3. Start with breakpoint debugging"
    echo "4. Debug tests"
    echo "5. Show debug logs"
    echo "6. Check service health"
    echo "7. Monitor real-time logs"
    echo "8. Exit"
    echo -n "Enter your choice (1-8): "
}

# Function to start VS Code debugging
start_vscode_debug() {
    echo -e "${GREEN}🚀 Starting VS Code debugging...${NC}"
    echo "1. Open VS Code"
    echo "2. Go to Run and Debug (Ctrl+Shift+D)"
    echo "3. Select 'Debug NestJS App'"
    echo "4. Press F5 or click the play button"
    echo ""
    echo "The application will start with debugging enabled on port 3001"
    echo "Set breakpoints in your code and they will be hit!"
}

# Function to start Chrome DevTools debugging
start_chrome_debug() {
    echo -e "${GREEN}🚀 Starting Chrome DevTools debugging...${NC}"
    echo "Stopping any existing processes..."
    pkill -f "nest start" 2>/dev/null || true
    sleep 2
    
    echo "Starting debug server..."
    PORT=3001 npm run debug > debug.log 2>&1 &
    DEBUG_PID=$!
    
    echo "Debug server started with PID: $DEBUG_PID"
    echo "Debug port: 9229"
    echo ""
    echo "To connect Chrome DevTools:"
    echo "1. Open Chrome browser"
    echo "2. Go to chrome://inspect"
    echo "3. Click 'Open dedicated DevTools for Node'"
    echo "4. Or click 'inspect' next to your process"
    echo ""
    echo "Service will be available at: http://localhost:3001/api"
    echo "Debug logs: tail -f debug.log"
}

# Function to start breakpoint debugging
start_breakpoint_debug() {
    echo -e "${GREEN}🚀 Starting breakpoint debugging...${NC}"
    echo "This will start the app and wait for debugger to attach"
    echo "Stopping any existing processes..."
    pkill -f "nest start" 2>/dev/null || true
    sleep 2
    
    echo "Starting with breakpoint debugging..."
    PORT=3001 npm run debug:break > debug.log 2>&1 &
    DEBUG_PID=$!
    
    echo "Debug server started with PID: $DEBUG_PID"
    echo "The application will pause at the first line waiting for debugger"
    echo ""
    echo "To attach debugger:"
    echo "1. VS Code: F5 or Run > Start Debugging"
    echo "2. Chrome: chrome://inspect"
    echo "3. Command line: node --inspect-brk=9229"
}

# Function to debug tests
debug_tests() {
    echo -e "${GREEN}🧪 Starting test debugging...${NC}"
    echo "Running tests with debugging enabled..."
    npm run test:debug
}

# Function to show debug logs
show_debug_logs() {
    echo -e "${YELLOW}📋 Debug Logs${NC}"
    echo "============="
    
    if [ -f "debug.log" ]; then
        echo "Debug log file found:"
        echo "Size: $(du -h debug.log | cut -f1)"
        echo "Last modified: $(ls -la debug.log | awk '{print $6, $7, $8}')"
        echo ""
        echo "Last 20 lines:"
        echo "--------------"
        tail -20 debug.log
    else
        echo "No debug.log found. Start debugging first."
    fi
}

# Function to check service health
check_service_health() {
    echo -e "${YELLOW}🏥 Service Health Check${NC}"
    echo "========================="
    
    # Check if service is running
    if curl -s http://localhost:3001/api/urls/status > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Service is running on port 3001${NC}"
        echo "Status:"
        curl -s http://localhost:3001/api/urls/status | jq '.' 2>/dev/null || curl -s http://localhost:3001/api/urls/status
    else
        echo -e "${RED}❌ Service is not running on port 3001${NC}"
        echo "Available ports:"
        lsof -i :3001 2>/dev/null || echo "Port 3001 is free"
    fi
    
    echo ""
    echo "Process information:"
    ps aux | grep -E "(nest|node.*main)" | grep -v grep || echo "No NestJS processes found"
}

# Function to monitor real-time logs
monitor_logs() {
    echo -e "${YELLOW}📊 Real-time Log Monitoring${NC}"
    echo "============================="
    
    if [ -f "debug.log" ]; then
        echo "Following debug.log in real-time (Press Ctrl+C to stop):"
        echo "========================================================"
        tail -f debug.log
    else
        echo "No debug.log found. Start debugging first."
    fi
}

# Main loop
while true; do
    show_debug_menu
    read choice
    
    case $choice in
        1) start_vscode_debug ;;
        2) start_chrome_debug ;;
        3) start_breakpoint_debug ;;
        4) debug_tests ;;
        5) show_debug_logs ;;
        6) check_service_health ;;
        7) monitor_logs ;;
        8) echo -e "${GREEN}👋 Happy debugging!${NC}"; exit 0 ;;
        *) echo -e "${RED}Invalid choice. Please try again.${NC}" ;;
    esac
    
    echo -e "\n${BLUE}Press Enter to continue...${NC}"
    read
done
