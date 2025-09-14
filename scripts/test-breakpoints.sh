#!/bin/bash

# Test script to trigger breakpoints
echo "🎯 Testing Breakpoints - This will trigger your breakpoints!"
echo "============================================================="

echo ""
echo "1. Make sure you have breakpoints set in VS Code"
echo "2. Start debugging (F5) or attach to the running process"
echo "3. Press Enter to send test requests..."
read

echo ""
echo "🚀 Sending POST request (will trigger breakpoint in controller)..."
curl -X POST -H "Content-Type: application/json" \
  -d '{"urls": ["https://httpbin.org/json", "https://httpbin.org/xml"]}' \
  http://localhost:3001/api/urls/fetch

echo ""
echo "⏸️  If you have breakpoints set, the code should have stopped!"
echo "   Check your debugger - you can inspect variables, step through code, etc."
echo ""

echo "Press Enter to continue to next request..."
read

echo ""
echo "🚀 Sending GET request (will trigger breakpoint in getAllResults)..."
curl http://localhost:3001/api/urls

echo ""
echo "✅ Breakpoint testing complete!"
echo "   Your breakpoints should have been triggered multiple times."
