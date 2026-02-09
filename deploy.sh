#!/bin/bash

# MeroKitab Deployment Script
# This script helps you deploy to Vercel

echo "🚀 MeroKitab Deployment Helper"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Staging all changes..."
    git add .
    echo ""
    echo "✅ Files staged. Ready to commit."
    echo ""
    echo "Next steps:"
    echo "1. Commit your changes:"
    echo "   git commit -m 'Ready for deployment'"
    echo ""
    echo "2. Create a GitHub repository at https://github.com/new"
    echo "   Name it: merokitab"
    echo ""
    echo "3. Push your code:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/merokitab.git"
    echo "   git push -u origin main"
    echo ""
    echo "4. Then go to https://vercel.com and import your repository"
else
    echo "✅ All changes committed!"
    echo ""
    echo "Ready to push to GitHub!"
fi

echo ""
echo "📚 For detailed instructions, see QUICK_DEPLOY.md"
