#!/bin/bash

# Guardz URL Fetcher Service Deployment Script
# This script deploys the service to the GCP Compute Engine instance

set -e

# Configuration
SERVER_IP="34.135.82.223"
SERVER_USER="candidate"
SSH_KEY="id_ed25519"  # SSH key is in project root
APP_DIR="/home/candidate/app"
PORT=8080

echo "🚀 Starting deployment to GCP Compute Engine..."

# Change to project root directory
cd "$(dirname "$0")/.."

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found at $SSH_KEY"
    exit 1
fi

# Set correct permissions for SSH key
chmod 600 "$SSH_KEY"

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Show what we're excluding and size savings
echo "📊 Checking file sizes..."
TOTAL_SIZE=$(du -sh . | cut -f1)
EXCLUDED_SIZE=$(du -sh node_modules/ .git/ dist/ coverage/ 2>/dev/null | awk '{sum+=$1} END {print sum "M"}' || echo "0M")
echo "📁 Total project size: $TOTAL_SIZE"
echo "🚫 Excluding: node_modules, .git, coverage, tests, and other unnecessary files"
echo "📤 Copying files to server..."

# Use tar for efficient transfer (works reliably across systems)
echo "📦 Using tar for efficient file transfer..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='coverage' \
    --exclude='*.log' \
    --exclude='.env*' \
    --exclude='.DS_Store' \
    --exclude='*.swp' \
    --exclude='*.swo' \
    --exclude='.vscode' \
    --exclude='.idea' \
    --exclude='test' \
    --exclude='*.spec.ts' \
    --exclude='*.test.ts' \
    --exclude='docs' \
    --exclude='*.md' \
    --exclude='.gitignore' \
    --exclude='debug.config.js' \
    --exclude='PROJECT_STRUCTURE.md' \
    --exclude='scripts/debug.sh' \
    --exclude='scripts/test-*.sh' \
    --exclude='scripts/check-logs.sh' \
    --exclude='scripts/view-*.sh' \
    --exclude='id_ed25519*' \
    -czf - . | ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "cd $APP_DIR && tar -xzf -"

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy files to server"
    exit 1
fi

# Deploy on server
echo "🔧 Setting up application on server..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << EOF
    cd $APP_DIR
    
    # Install curl if not present
    if ! command -v curl &> /dev/null; then
        echo "📦 Installing curl..."
        sudo apt-get update && sudo apt-get install -y curl
    fi
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "📦 Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo "✅ Node.js already installed: \$(node --version)"
    fi
    
    # Install dependencies (production only)
    echo "📥 Installing dependencies..."
    npm install --production --no-optional
    
    # Kill any existing process on the port
    echo "🛑 Stopping existing processes..."
    sudo lsof -ti:$PORT | xargs -r sudo kill -9 || true
    
    # Start the application
    echo "🚀 Starting the application..."
    nohup npm run start:prod > app.log 2>&1 &
    
    # Wait a moment for the app to start
    sleep 5
    
    # Check if the app is running
    if curl -f http://localhost:$PORT/api/urls/status > /dev/null 2>&1; then
        echo "✅ Application is running successfully!"
        echo "🌐 Service available at: http://$SERVER_IP:$PORT/api"
    else
        echo "❌ Application failed to start. Check logs:"
        tail -20 app.log
        exit 1
    fi
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📡 Service endpoints:"
    echo "   • Status: http://$SERVER_IP:$PORT/api/urls/status"
    echo "   • Fetch URLs: http://$SERVER_IP:$PORT/api/urls/fetch"
    echo "   • Get Results: http://$SERVER_IP:$PORT/api/urls"
    echo ""
    echo "🧪 Test the service:"
    echo "   curl -X POST -H \"Content-Type: application/json\" \\"
    echo "     -d '{\"urls\": [\"https://httpbin.org/json\"]}' \\"
    echo "     http://$SERVER_IP:$PORT/api/urls/fetch"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
