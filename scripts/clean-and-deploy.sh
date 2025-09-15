#!/bin/bash

set -e

SERVER_IP="34.135.82.223"
SERVER_USER="candidate"
SSH_KEY="id_ed25519"
APP_DIR="/home/candidate/app"

cd "$(dirname "$0")/.."

if [ ! -f "$SSH_KEY" ]; then
  echo "❌ SSH key not found at $SSH_KEY"
  exit 1
fi

chmod 600 "$SSH_KEY"

echo "🛑 Stopping remote app and wiping directory..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "\
  sudo pkill -f 'node dist/src/main' || true; \
  sudo pkill -f 'npm run start:prod' || true; \
  sudo fuser -k 8080/tcp || true; \
  rm -rf $APP_DIR/*; \
  mkdir -p $APP_DIR; \
  echo '✅ Remote app directory cleaned'"

echo "🚀 Deploying fresh build..."
./scripts/deploy.sh


