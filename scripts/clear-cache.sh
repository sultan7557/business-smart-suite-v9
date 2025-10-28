#!/bin/bash

echo "🧹 Clearing all caches to fix corruption issues..."

# Clear Next.js build cache
echo "Clearing Next.js build cache..."
rm -rf .next

# Clear node modules cache
echo "Clearing node modules cache..."
rm -rf node_modules/.cache

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Clear browser cache instructions
echo ""
echo "📱 BROWSER CACHE CLEARING INSTRUCTIONS:"
echo "1. Open Chrome DevTools (F12)"
echo "2. Right-click the refresh button"
echo "3. Select 'Empty Cache and Hard Reload'"
echo "4. Or use Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)"
echo ""
echo "🔄 Alternative: Open in Incognito/Private mode"
echo ""

# Restart development server
echo "🚀 Restarting development server..."
npm run dev
