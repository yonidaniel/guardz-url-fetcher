#!/bin/bash

# Guardz URL Fetcher Service Deployment Script
# This script deploys the service to the GCP Compute Engine instance

set -e

# Configuration
SERVER_IP="34.135.82.223"
SERVER_USER="candidate"
SSH_KEY="/Users/yoni/Guardz/id_ed25519"
APP_DIR="/home/candidate/app"
PORT=8080

echo "🚀 Starting deployment to GCP Compute Engine..."

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

# Copy files to server
echo "📤 Copying files to server..."
scp -i "$SSH_KEY" -r . "$SERVER_USER@$SERVER_IP:$APP_DIR"

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy files to server"
    exit 1
fi

# Deploy on server
echo "🔧 Setting up application on server..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << EOF
    cd $APP_DIR
    
    # Install dependencies
    echo "📥 Installing dependencies..."
    npm install --production
    
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
