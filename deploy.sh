#!/bin/bash

# EsportsNeo Backend - Quick Deploy Script for Vercel

echo "🚀 EsportsNeo Backend - Vercel Deployment"
echo "=========================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found!"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
    echo ""
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your credentials before deploying!"
    echo "   Required variables:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - CLOUDINARY_CLOUD_NAME"
    echo "   - CLOUDINARY_API_KEY"
    echo "   - CLOUDINARY_API_SECRET"
    echo ""
    read -p "Press Enter after you've updated .env file..."
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated!"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""
vercel

echo ""
echo "✨ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables in Vercel Dashboard"
echo "2. Run database migrations: npx prisma db push"
echo "3. Test your API endpoints"
echo ""
echo "📚 For detailed instructions, see VERCEL_DEPLOYMENT.md"
echo ""
