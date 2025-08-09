# YouTube to MP3 Downloader - Implementation Plan

## Project Overview
A Next.js web application that allows users to download YouTube videos as MP3 audio files. Built with TypeScript, shadcn/ui components, and server-side audio processing.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [API Documentation](#api-documentation)
5. [Testing Procedures](#testing-procedures)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Basic knowledge of React and Next.js
- FFmpeg (will be installed via package)

## Project Setup

### Initial Dependencies Installation
The project already has Next.js, React, and TypeScript configured. We need to add:
- shadcn/ui components
- YouTube downloading library
- Audio processing tools
- Additional utilities

## Step-by-Step Implementation

### Phase 1: Setup shadcn/ui (15 minutes)

#### Step 1.1: Initialize shadcn/ui
```bash
npx shadcn@latest init
```
When prompted, select:
- Style: Default
- Base color: Slate
- CSS variables: Yes

#### Step 1.2: Install Required shadcn Components
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add progress
npx shadcn@latest add alert
npx shadcn@latest add label
npx shadcn@latest add skeleton
npx shadcn@latest add toast
```

#### Step 1.3: Install Sonner for Notifications
```bash
npm install sonner
```

#### Step 1.4: Update app/layout.tsx for Toaster
Add the Toaster component to your root layout:
```tsx
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
```

### Phase 2: Install Core Dependencies (10 minutes)

#### Step 2.1: Install YouTube and Audio Processing Libraries
```bash
npm install ytdl-core fluent-ffmpeg ffmpeg-static ffprobe-static
npm install --save-dev @types/fluent-ffmpeg
```

#### Step 2.2: Install Additional Utilities
```bash
npm install lucide-react zod
```

### Phase 3: Create Utility Functions (20 minutes)

#### Step 3.1: Create lib/youtube.ts
```typescript
import ytdl from 'ytdl-core';

export interface VideoInfo {
  title: string;
  duration: number; // in seconds
  thumbnail: string;
  author: string;
  videoId: string;
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  if (!isValidYouTubeUrl(url)) {
    throw new Error('Invalid YouTube URL');
  }

  try {
    const info = await ytdl.getInfo(url);
    return {
      title: info.videoDetails.title,
      duration: parseInt(info.videoDetails.lengthSeconds),
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      author: info.videoDetails.author.name,
      videoId: info.videoDetails.videoId,
    };
  } catch (error) {
    throw new Error('Failed to fetch video information');
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
  return pattern.test(url);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^\w\s-]/g, '').trim();
}
```

#### Step 3.2: Create lib/constants.ts
```typescript
export const MAX_VIDEO_DURATION = 1800; // 30 minutes in seconds
export const ALLOWED_AUDIO_QUALITY = 'highestaudio';
export const OUTPUT_FORMAT = 'mp3';
export const AUDIO_BITRATE = '192k';
```

### Phase 4: Create API Route (30 minutes)

#### Step 4.1: Create app/api/download/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { Readable } from 'stream';
import { getVideoInfo, isValidYouTubeUrl, sanitizeFilename } from '@/lib/youtube';
import { MAX_VIDEO_DURATION, ALLOWED_AUDIO_QUALITY, AUDIO_BITRATE } from '@/lib/constants';

// Set ffmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // Validate URL
    if (!url || !isValidYouTubeUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Get video info
    const videoInfo = await getVideoInfo(url);

    // Check video duration
    if (videoInfo.duration > MAX_VIDEO_DURATION) {
      return NextResponse.json(
        { error: `Video duration exceeds maximum allowed (${MAX_VIDEO_DURATION / 60} minutes)` },
        { status: 400 }
      );
    }

    // Download audio stream
    const audioStream = ytdl(url, {
      quality: ALLOWED_AUDIO_QUALITY,
      filter: 'audioonly',
    });

    // Convert to MP3
    const filename = `${sanitizeFilename(videoInfo.title)}.mp3`;
    
    // Create a readable stream for ffmpeg
    const readableStream = Readable.from(audioStream);
    
    // Process with ffmpeg
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      
      ffmpeg(readableStream)
        .audioBitrate(AUDIO_BITRATE)
        .audioCodec('libmp3lame')
        .format('mp3')
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          resolve(NextResponse.json(
            { error: 'Failed to process audio' },
            { status: 500 }
          ));
        })
        .on('end', () => {
          const buffer = Buffer.concat(chunks);
          const response = new NextResponse(buffer);
          response.headers.set('Content-Type', 'audio/mpeg');
          response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
          response.headers.set('Content-Length', buffer.length.toString());
          resolve(response);
        })
        .pipe()
        .on('data', (chunk) => {
          chunks.push(chunk);
        });
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download video' },
      { status: 500 }
    );
  }
}

// Endpoint to get video info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || !isValidYouTubeUrl(url)) {
    return NextResponse.json(
      { error: 'Invalid YouTube URL' },
      { status: 400 }
    );
  }

  try {
    const videoInfo = await getVideoInfo(url);
    return NextResponse.json(videoInfo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch video information' },
      { status: 500 }
    );
  }
}
```

### Phase 5: Create UI Components (45 minutes)

#### Step 5.1: Create components/download-form.tsx
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { isValidYouTubeUrl } from '@/lib/youtube';

interface DownloadFormProps {
  onVideoInfoFetch: (info: any) => void;
  onDownloadStart: () => void;
  onDownloadComplete: () => void;
}

export function DownloadForm({ 
  onVideoInfoFetch, 
  onDownloadStart, 
  onDownloadComplete 
}: DownloadFormProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Auto-fetch video info when valid URL is entered
    if (isValidYouTubeUrl(newUrl)) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/download?url=${encodeURIComponent(newUrl)}`);
        if (response.ok) {
          const info = await response.json();
          setVideoInfo(info);
          onVideoInfoFetch(info);
        }
      } catch (error) {
        console.error('Failed to fetch video info:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setVideoInfo(null);
      onVideoInfoFetch(null);
    }
  };

  const handleDownload = async () => {
    if (!isValidYouTubeUrl(url)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setIsDownloading(true);
    onDownloadStart();

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${videoInfo?.title || 'download'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Download completed successfully!');
      onDownloadComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to download video');
      onDownloadComplete();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">YouTube URL</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={handleUrlChange}
          disabled={isDownloading}
        />
      </div>

      <Button
        onClick={handleDownload}
        disabled={!url || !isValidYouTubeUrl(url) || isDownloading || isLoading}
        className="w-full"
      >
        {isDownloading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download MP3
          </>
        )}
      </Button>
    </div>
  );
}
```

#### Step 5.2: Create components/video-preview.tsx
```tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User } from 'lucide-react';
import { formatDuration } from '@/lib/youtube';
import Image from 'next/image';

interface VideoPreviewProps {
  videoInfo: {
    title: string;
    duration: number;
    thumbnail: string;
    author: string;
  } | null;
  isLoading?: boolean;
}

export function VideoPreview({ videoInfo, isLoading }: VideoPreviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Skeleton className="h-20 w-36 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!videoInfo) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative h-20 w-36 flex-shrink-0">
            <Image
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              fill
              className="rounded object-cover"
            />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold line-clamp-2">{videoInfo.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {videoInfo.author}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(videoInfo.duration)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Step 5.3: Create components/download-progress.tsx
```tsx
'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface DownloadProgressProps {
  isDownloading: boolean;
  progress?: number;
}

export function DownloadProgress({ isDownloading, progress = 0 }: DownloadProgressProps) {
  if (!isDownloading) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing audio...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
```

### Phase 6: Update Main Page (20 minutes)

#### Step 6.1: Update app/page.tsx
```tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DownloadForm } from '@/components/download-form';
import { VideoPreview } from '@/components/video-preview';
import { DownloadProgress } from '@/components/download-progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function Home() {
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleVideoInfoFetch = (info: any) => {
    setVideoInfo(info);
  };

  const handleDownloadStart = () => {
    setIsDownloading(true);
    // Simulate progress (in real app, this would come from the API)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setDownloadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 500);
  };

  const handleDownloadComplete = () => {
    setIsDownloading(false);
    setDownloadProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>YouTube to MP3 Converter</CardTitle>
            <CardDescription>
              Download YouTube videos as high-quality MP3 audio files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DownloadForm
              onVideoInfoFetch={handleVideoInfoFetch}
              onDownloadStart={handleDownloadStart}
              onDownloadComplete={handleDownloadComplete}
            />

            {videoInfo && (
              <VideoPreview videoInfo={videoInfo} />
            )}

            <DownloadProgress 
              isDownloading={isDownloading} 
              progress={downloadProgress}
            />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Maximum video duration: 30 minutes. Only for personal use.
                Please respect copyright laws.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-muted-foreground">
          <p>Built with Next.js and shadcn/ui</p>
        </footer>
      </div>
    </div>
  );
}
```

### Phase 7: Configuration Updates (10 minutes)

#### Step 7.1: Update next.config.ts for Image Domains
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
};

export default nextConfig;
```

#### Step 7.2: Add Environment Variables (.env.local)
```env
# Rate limiting (optional)
RATE_LIMIT_PER_MINUTE=10

# Max file size in MB
MAX_FILE_SIZE=50
```

### Phase 8: Error Handling & Edge Cases (15 minutes)

#### Step 8.1: Create lib/errors.ts
```typescript
export class YouTubeError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'YouTubeError';
  }
}

export const ErrorCodes = {
  INVALID_URL: 'INVALID_URL',
  VIDEO_TOO_LONG: 'VIDEO_TOO_LONG',
  VIDEO_NOT_AVAILABLE: 'VIDEO_NOT_AVAILABLE',
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
  CONVERSION_FAILED: 'CONVERSION_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    [ErrorCodes.INVALID_URL]: 'Please enter a valid YouTube URL',
    [ErrorCodes.VIDEO_TOO_LONG]: 'Video is too long. Maximum duration is 30 minutes',
    [ErrorCodes.VIDEO_NOT_AVAILABLE]: 'This video is not available or is private',
    [ErrorCodes.DOWNLOAD_FAILED]: 'Failed to download the video. Please try again',
    [ErrorCodes.CONVERSION_FAILED]: 'Failed to convert to MP3. Please try again',
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment',
  };
  
  return messages[code] || 'An unexpected error occurred';
}
```

#### Step 8.2: Add Rate Limiting (Optional)
Create lib/rate-limit.ts:
```typescript
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, limit: number = 10): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + 60000, // Reset after 1 minute
    });
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count++;
  return true;
}
```

## Testing Procedures

### Manual Testing Checklist
1. **URL Validation**
   - [ ] Test with valid YouTube URL
   - [ ] Test with invalid URL
   - [ ] Test with YouTube Shorts URL
   - [ ] Test with playlist URL (should fail)
   - [ ] Test with private video (should fail)

2. **Download Functionality**
   - [ ] Download short video (< 5 minutes)
   - [ ] Download medium video (5-15 minutes)
   - [ ] Download long video (15-30 minutes)
   - [ ] Try video > 30 minutes (should fail)
   - [ ] Verify MP3 quality

3. **UI/UX Testing**
   - [ ] Check responsive design on mobile
   - [ ] Test loading states
   - [ ] Verify error messages display correctly
   - [ ] Test keyboard navigation
   - [ ] Check dark mode (if implemented)

4. **Performance Testing**
   - [ ] Monitor memory usage during download
   - [ ] Check download speed
   - [ ] Test concurrent downloads

### Automated Testing
Create app/__tests__/youtube.test.ts:
```typescript
import { isValidYouTubeUrl, formatDuration, sanitizeFilename } from '@/lib/youtube';

describe('YouTube Utilities', () => {
  describe('isValidYouTubeUrl', () => {
    it('should validate correct YouTube URLs', () => {
      expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidYouTubeUrl('https://vimeo.com/123456')).toBe(false);
      expect(isValidYouTubeUrl('not-a-url')).toBe(false);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(3665)).toBe('1:01:05');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove invalid characters', () => {
      expect(sanitizeFilename('Test/Video:Name*')).toBe('TestVideoName');
    });
  });
});
```

## Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Important Deployment Considerations
- **FFmpeg**: Vercel serverless functions have limitations. Consider:
  - Using a dedicated server for audio processing
  - Implementing a queue system for large files
  - Using AWS Lambda with layers for FFmpeg

### Alternative Deployment (Self-Hosted)
```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "FFmpeg not found"
**Solution**: Ensure ffmpeg-static is installed and path is set correctly:
```typescript
import ffmpegStatic from 'ffmpeg-static';
if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic);
```

#### Issue: "Download fails for certain videos"
**Possible causes**:
- Video is age-restricted
- Video is private or deleted
- Geographic restrictions
- YouTube API changes

**Solution**: Add better error handling and user feedback

#### Issue: "Large files timeout"
**Solution**: 
- Implement streaming download
- Use background jobs for processing
- Consider chunked transfer encoding

#### Issue: "Memory issues with large videos"
**Solution**:
- Stream processing instead of buffering
- Implement proper cleanup
- Set memory limits

### Security Considerations
1. **Input Validation**: Always validate YouTube URLs
2. **Rate Limiting**: Prevent abuse
3. **File Size Limits**: Prevent server overload
4. **Sanitize Filenames**: Prevent path traversal attacks
5. **CORS Configuration**: Restrict to your domain
6. **API Authentication**: Consider adding auth for production

### Performance Optimizations
1. **Caching**: Cache video metadata
2. **CDN**: Use CDN for static assets
3. **Compression**: Enable gzip/brotli
4. **Database**: Store download history (optional)
5. **Queue System**: For handling multiple downloads

## Additional Features (Optional)

### Future Enhancements
1. **Batch Downloads**: Multiple URLs at once
2. **Quality Selection**: Choose audio bitrate
3. **Format Options**: Support other audio formats (WAV, AAC)
4. **History**: Track download history
5. **Playlist Support**: Download entire playlists
6. **Progress Bar**: Real-time download progress via WebSocket
7. **Mobile App**: React Native version
8. **Browser Extension**: Quick download from YouTube

## Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [ytdl-core Documentation](https://github.com/fent/node-ytdl-core)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [YouTube Terms of Service](https://www.youtube.com/t/terms)

## Legal Notice
This application is for educational purposes. Users are responsible for complying with YouTube's Terms of Service and respecting copyright laws. Only download content you have permission to download.

---

## Quick Start Commands
```bash
# Install all dependencies
npm install

# Initialize shadcn/ui
npx shadcn@latest init

# Install all shadcn components at once
npx shadcn@latest add button input card progress alert label skeleton toast

# Install core dependencies
npm install ytdl-core fluent-ffmpeg ffmpeg-static ffprobe-static lucide-react sonner zod

# Install type definitions
npm install --save-dev @types/fluent-ffmpeg

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Project Structure Summary
```
youtube-downloader/
├── app/
│   ├── api/
│   │   └── download/
│   │       └── route.ts         # API endpoint
│   ├── page.tsx                 # Main page
│   ├── layout.tsx               # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── download-form.tsx       # URL input form
│   ├── video-preview.tsx       # Video info display
│   └── download-progress.tsx   # Progress indicator
├── lib/
│   ├── youtube.ts              # YouTube utilities
│   ├── constants.ts            # App constants
│   ├── errors.ts               # Error handling
│   └── utils.ts                # General utilities
├── docs/
│   └── implementation-plan.md  # This file
└── package.json               # Dependencies
```

---

*Last Updated: [Current Date]*
*Version: 1.0.0*