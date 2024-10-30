#!/bin/bash

echo "🚀 Starting deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build-client

# Copy frontend build to backend
echo "📋 Copying frontend build to Backend..."
npm run copy-build

# Install production dependencies in backend
echo "📦 Installing Backend dependencies..."
cd Backend
npm install --production
cd ..

echo "✅ Deployment preparation complete!"