#!/bin/bash

echo "🚀 Starting deployment process..."

# Set the correct working directory
WORK_DIR="/opt/render/project/src"
echo "Working directory: $WORK_DIR"

# Install root dependencies if package.json exists
if [ -f "$WORK_DIR/package.json" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

# Build frontend
echo "🏗️ Building frontend..."
cd "$WORK_DIR/Frontend"
npm install
npm run build
cd "$WORK_DIR"

# Create backend build directory
echo "📁 Creating backend build directory..."
mkdir -p "$WORK_DIR/Backend/build"

# Copy frontend build to backend
echo "📋 Copying frontend build files..."
cp -r "$WORK_DIR/Frontend/build/"* "$WORK_DIR/Backend/build/"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd "$WORK_DIR/Backend"
npm install

# Verify build files
echo "✅ Verifying build files..."
if [ -f "$WORK_DIR/Backend/build/index.html" ]; then
    echo "Build files successfully copied!"
else
    echo "❌ Error: Build files not found!"
    exit 1
fi

echo "🎉 Deployment preparation complete!"