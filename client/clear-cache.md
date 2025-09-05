# Clear Browser Cache for Video Access Feature

## Issue
You're experiencing a `ReferenceError: isAccessExpired is not defined` error, which suggests that your browser is still loading an old cached version of the OptimizedLessonContentModal component.

## Solution Steps

### 1. Clear Browser Cache
**Chrome/Edge:**
- Press `Ctrl + Shift + Delete`
- Select "Cached images and files"
- Click "Clear data"

**Firefox:**
- Press `Ctrl + Shift + Delete`
- Select "Cache"
- Click "Clear Now"

### 2. Hard Refresh
- Press `Ctrl + F5` or `Ctrl + Shift + R` to force reload without cache

### 3. Clear Vite Dev Server Cache
```bash
# Stop the dev server (Ctrl + C)
# Then restart with cache clearing
npm run dev -- --force
```

### 4. Alternative: Clear node_modules and reinstall
```bash
# If the above doesn't work
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 5. Check Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache" checkbox
4. Reload the page

## What Was Fixed
The `isAccessExpired` variable was removed from the OptimizedLessonContentModal component as part of simplifying the video access feature to work only at the video level (not course level).

## Test After Clearing Cache
1. Navigate to a course
2. Click on a lesson
3. The lesson modal should open without errors
4. Videos should display normally
5. For videos requiring access codes, the VideoAccessModal should appear when clicked

If you continue to experience issues after clearing cache, please restart your development server and try again.
