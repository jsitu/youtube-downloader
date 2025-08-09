# YouTube to MP3 Converter

A Next.js application for converting YouTube videos to MP3 audio files.

## ⚠️ Important Notice

**This application may not work on cloud platforms (Vercel, Netlify, etc.) due to YouTube's bot detection mechanisms.** YouTube blocks requests from data center IP addresses to prevent automated scraping. 

For reliable operation, please run this application locally or on a personal server.

## Features

- Convert YouTube videos to MP3 format
- High-quality audio extraction (192 kbps)
- Clean, modern UI with shadcn/ui components
- Video preview with metadata display
- Download progress tracking
- Maximum video duration: 30 minutes

## Local Installation

### Prerequisites

- Node.js 18+ 
- ffmpeg installed on your system
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt-get install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/jsitu/youtube-downloader.git
cd youtube-downloader
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
npm start
```

## Known Issues

### Cloud Deployment Limitations

When deployed to cloud platforms like Vercel, you may encounter:
- "Sign in to confirm you're not a bot" errors
- Failed video information fetching
- 500 errors on download attempts

This is because YouTube detects and blocks requests from cloud provider IP addresses.

### Solutions

1. **Run Locally**: The most reliable solution is to run the application on your local machine
2. **Use a VPS with Residential IP**: Deploy to a VPS that uses residential IP addresses
3. **Proxy Configuration**: Set up a proxy server with residential IPs (advanced)

## Technology Stack

- **Next.js 15.4** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **@distube/ytdl-core** - YouTube video information and downloading
- **fluent-ffmpeg** - Audio conversion
- **ffmpeg-static** - Bundled ffmpeg binary

## Legal Notice

This tool is for personal use only. Please respect YouTube's Terms of Service and copyright laws. Only download content you have permission to use.

## Troubleshooting

### ffmpeg not found
Make sure ffmpeg is installed and accessible in your system PATH.

### YouTube URL not working
- Ensure the URL is a valid YouTube video link
- Check if the video is publicly accessible
- Try using the full URL format: `https://www.youtube.com/watch?v=VIDEO_ID`

### Download fails
- Check your internet connection
- Verify the video is not age-restricted or private
- Ensure the video duration is under 30 minutes
- If on cloud hosting, see "Cloud Deployment Limitations" above

## Development

```bash
# Run development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## License

MIT License - See LICENSE file for details

## Disclaimer

This project is for educational purposes only. Users are responsible for complying with YouTube's Terms of Service and applicable copyright laws.