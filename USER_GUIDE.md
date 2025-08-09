# 📖 User Guide - YouTube to MP3 Converter

This guide will help you run the YouTube to MP3 converter on your own computer. No technical experience needed!

## 📋 Table of Contents
- [What You'll Need](#what-youll-need)
- [Installation Guide for Mac](#installation-guide-for-mac)
- [Installation Guide for Windows](#installation-guide-for-windows)
- [How to Use the App](#how-to-use-the-app)
- [Troubleshooting](#troubleshooting)
- [How to Stop the App](#how-to-stop-the-app)

---

## What You'll Need

Before starting, make sure you have:
- ✅ A computer (Mac or Windows)
- ✅ Internet connection
- ✅ About 15 minutes for setup
- ✅ Basic ability to copy/paste text

---

## Installation Guide for Mac

### Step 1: Install Homebrew (Package Manager)

1. Open **Terminal** (find it in Applications → Utilities → Terminal)
2. Copy and paste this entire line:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
3. Press **Enter** and follow the prompts (you may need to enter your password)
4. Wait for it to complete (this may take 5-10 minutes)

### Step 2: Install Required Software

In the same Terminal window, copy and paste these commands **one at a time**:

1. Install Node.js (the programming language):
```bash
brew install node
```
Press Enter and wait for completion.

2. Install FFmpeg (for audio conversion):
```bash
brew install ffmpeg
```
Press Enter and wait for completion.

### Step 3: Download the App

1. In Terminal, navigate to your Desktop:
```bash
cd ~/Desktop
```

2. Download the app:
```bash
git clone https://github.com/jsitu/youtube-downloader.git
```

3. Enter the app folder:
```bash
cd youtube-downloader
```

### Step 4: Install App Dependencies

Run this command:
```bash
npm install
```
Wait for it to complete (usually 1-2 minutes).

### Step 5: Start the App

Run this command:
```bash
npm run dev
```

You should see:
```
✓ Ready in 1234ms
➜ Local: http://localhost:3000
```

### Step 6: Open the App

1. Open your web browser (Chrome, Safari, Firefox, etc.)
2. Go to: **http://localhost:3000**
3. You should see the YouTube to MP3 Converter!

---

## Installation Guide for Windows

### Step 1: Install Node.js

1. Go to https://nodejs.org
2. Click the **"LTS" version** button (the big green one)
3. Download will start automatically
4. Open the downloaded file
5. Click "Next" through the installer (use default settings)
6. Click "Install"
7. Click "Finish" when done

### Step 2: Install Git

1. Go to https://git-scm.com/download/win
2. Download will start automatically
3. Open the downloaded file
4. Click "Next" through the installer (use default settings)
5. Click "Install"
6. Click "Finish" when done

### Step 3: Install FFmpeg

1. Go to https://www.gyan.dev/ffmpeg/builds/
2. Under "Release builds", click **"full" link** next to "release"
3. Download the .zip file
4. Extract the zip file to `C:\`
5. Rename the extracted folder to just `ffmpeg`
6. Add FFmpeg to your system:
   - Right-click "This PC" → Properties
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\ffmpeg\bin`
   - Click "OK" on all windows

### Step 4: Download the App

1. Open **Command Prompt** (search for "cmd" in Start menu)
2. Navigate to your Desktop:
```cmd
cd Desktop
```

3. Download the app:
```cmd
git clone https://github.com/jsitu/youtube-downloader.git
```

4. Enter the app folder:
```cmd
cd youtube-downloader
```

### Step 5: Install App Dependencies

Run this command:
```cmd
npm install
```
Wait for it to complete (usually 1-2 minutes).

### Step 6: Start the App

Run this command:
```cmd
npm run dev
```

You should see:
```
✓ Ready in 1234ms
➜ Local: http://localhost:3000
```

### Step 7: Open the App

1. Open your web browser (Chrome, Edge, Firefox, etc.)
2. Go to: **http://localhost:3000**
3. You should see the YouTube to MP3 Converter!

---

## How to Use the App

### Converting a Video to MP3

1. **Find a YouTube Video**
   - Go to YouTube in another browser tab
   - Find the video you want to convert
   - Copy the URL from the address bar (it should look like: `https://www.youtube.com/watch?v=...`)

2. **Paste the URL**
   - Go back to the converter (http://localhost:3000)
   - Paste the URL in the input box
   - Click **"Get Video Info"**

3. **Preview the Video**
   - You'll see the video title, author, and duration
   - Make sure it's the right video

4. **Download as MP3**
   - Click **"Download MP3"**
   - Choose where to save the file
   - Wait for download to complete

### Important Notes

⚠️ **Legal Notice**: Only download videos you have permission to use
⏱️ **Duration Limit**: Videos must be under 30 minutes
📁 **Download Location**: Files save to your computer's Downloads folder by default

---

## Troubleshooting

### "Command not found" Error

**For Mac:**
- Make sure you completed Step 1 (Homebrew installation)
- Try closing and reopening Terminal

**For Windows:**
- Make sure you completed all installation steps
- Restart Command Prompt
- Try restarting your computer

### "Port 3000 is already in use" Error

This means the app is already running. Either:
- Go to http://localhost:3000 in your browser
- Or stop the existing process (see "How to Stop the App" below)

### "Failed to fetch video information" Error

- Check your internet connection
- Make sure the YouTube URL is correct
- Try a different video
- The video might be private or age-restricted

### App Won't Start

1. Make sure you're in the right folder:
   - Mac: `cd ~/Desktop/youtube-downloader`
   - Windows: `cd Desktop\youtube-downloader`

2. Try reinstalling dependencies:
```bash
npm install
```

3. Make sure Node.js is installed:
```bash
node --version
```
(Should show a version number like v18.x.x)

---

## How to Stop the App

### When You're Done Using the App:

1. Go to the Terminal/Command Prompt window where the app is running
2. Press **Ctrl + C** (on both Mac and Windows)
3. You should see the terminal return to normal
4. You can now close the Terminal/Command Prompt window

### To Start Again Later:

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to the app:
   - Mac: `cd ~/Desktop/youtube-downloader`
   - Windows: `cd Desktop\youtube-downloader`
3. Start the app: `npm run dev`
4. Open browser to: http://localhost:3000

---

## 🔒 Safety Tips

1. **Only download videos you own or have permission to use**
2. **Don't share the app while it's running** (keep it local)
3. **Be respectful of copyright laws**
4. **Don't download copyrighted music for distribution**

---

## 🆘 Need More Help?

If you're stuck:
1. Try restarting your computer
2. Go through the installation steps again
3. Ask a tech-savvy friend for help
4. Create an issue on GitHub: https://github.com/jsitu/youtube-downloader/issues

---

## 📝 Quick Command Reference

### Starting the App
```bash
cd ~/Desktop/youtube-downloader  # Mac
cd Desktop\youtube-downloader     # Windows
npm run dev
```

### Stopping the App
Press `Ctrl + C` in the terminal

### App URL
http://localhost:3000

---

*Remember: This app runs on YOUR computer, not on the internet. You need to start it each time you want to use it.*