# 🚀 Quick Start Guide

Get the YouTube to MP3 converter running in 5 minutes!

## For Mac Users

### 1️⃣ Download the App
1. Go to: https://github.com/jsitu/youtube-downloader
2. Click green **"Code"** button → **"Download ZIP"**
3. Extract ZIP to your Desktop
4. Rename folder to `youtube-downloader` (remove "-main")

### 2️⃣ Open Terminal
- Press `Cmd + Space`, type "Terminal", press Enter

### 3️⃣ Copy & Paste These Commands
Run these one at a time (paste, press Enter, wait for each to finish):

```bash
# Install Homebrew (if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install requirements
brew install node ffmpeg

# Navigate to app folder
cd ~/Desktop/youtube-downloader

# Install and start
npm install
npm run dev
```

### 4️⃣ Open Your Browser
Go to: **http://localhost:3000**

✅ **Done! The app is running.**

---

## For Windows Users

### 1️⃣ Install Required Software
Download and install these (click "Next" through all installers):
1. **Node.js**: https://nodejs.org (choose LTS version)
2. **FFmpeg**: 
   - Download: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-full.zip
   - Extract to `C:\ffmpeg`
   - Add `C:\ffmpeg\bin` to your PATH ([How to add to PATH](https://www.architectryan.com/2018/03/17/add-to-the-path-on-windows-10/))

### 2️⃣ Download the App
1. Go to: https://github.com/jsitu/youtube-downloader
2. Click green **"Code"** button → **"Download ZIP"**
3. Extract ZIP to your Desktop
4. Rename folder to `youtube-downloader` (remove "-main")

### 3️⃣ Open Command Prompt
- Press `Windows + R`, type "cmd", press Enter

### 4️⃣ Copy & Paste These Commands
Run these one at a time:

```cmd
cd Desktop\youtube-downloader
npm install
npm run dev
```

### 5️⃣ Open Your Browser
Go to: **http://localhost:3000**

✅ **Done! The app is running.**

---

## How to Use

1. **Copy** a YouTube video URL
2. **Paste** it in the app
3. Click **"Get Video Info"**
4. Click **"Download MP3"**

## How to Stop

Press `Ctrl + C` in the Terminal/Command Prompt

## Start Again Later

```bash
# Mac
cd ~/Desktop/youtube-downloader && npm run dev

# Windows
cd Desktop\youtube-downloader && npm run dev
```

Then open: **http://localhost:3000**

---

⚠️ **Remember**: Only download videos you have permission to use!