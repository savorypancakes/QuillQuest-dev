#!/bin/bash

echo "🚀 Starting deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
cd Frontend
npm install
npm run build
cd ..

# Ensure backend build directory exists
echo "📁 Creating build directory..."
mkdir -p Backend/build

# Copy frontend build to backend
echo "📋 Copying frontend build to backend..."
cp -r Frontend/build/* Backend/build/

# Install production dependencies in backend
echo "📦 Installing backend dependencies..."
cd Backend
npm install --production
cd ..

echo "✅ Deployment preparation complete!"