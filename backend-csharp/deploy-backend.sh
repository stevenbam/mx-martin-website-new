#!/bin/bash
# Backend Deployment Script (Run on VPS)

set -e

echo "========================================="
echo " Deploying Stuck On Steven Backend"
echo "========================================="
echo ""

BACKEND_DIR="/var/www/stuckonsteven/backend"
SERVICE_NAME="stuckonsteven-api"

# Check if running as correct user
if [ "$USER" != "stuckonsteven" ] && [ "$USER" != "root" ]; then
    echo "❌ Error: This script should be run as 'stuckonsteven' or 'root'"
    exit 1
fi

# Navigate to backend directory
cd "$BACKEND_DIR"

echo "[1/4] Pulling latest code..."
if [ -d ".git" ]; then
    git pull
    echo "✓ Code updated from git"
else
    echo "ℹ No git repository found, skipping pull"
fi

echo ""
echo "[2/4] Restoring dependencies..."
dotnet restore

echo ""
echo "[3/4] Building and publishing..."
dotnet publish -c Release -o ./publish

echo ""
echo "[4/4] Restarting service..."
if [ "$USER" = "root" ]; then
    systemctl restart "$SERVICE_NAME"
else
    sudo systemctl restart "$SERVICE_NAME"
fi

echo ""
echo "========================================="
echo " Deployment Complete!"
echo "========================================="
echo ""
echo "Service Status:"
if [ "$USER" = "root" ]; then
    systemctl status "$SERVICE_NAME" --no-pager -l
else
    sudo systemctl status "$SERVICE_NAME" --no-pager -l
fi

echo ""
echo "To view logs:"
echo "  sudo journalctl -u $SERVICE_NAME -f"
echo ""
