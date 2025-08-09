import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { getVideoInfo, isValidYouTubeUrl, sanitizeFilename } from '@/lib/youtube';
import { MAX_VIDEO_DURATION, AUDIO_BITRATE } from '@/lib/constants';
import * as fs from 'fs';

// Set ffmpeg path - handle both local and Vercel environments
function setFfmpegPath() {
  // Try multiple potential paths
  const potentialPaths = [
    '/opt/homebrew/bin/ffmpeg', // macOS with Homebrew
    '/usr/local/bin/ffmpeg',     // Common Linux/macOS path
    '/usr/bin/ffmpeg',            // Linux system path
  ];

  // Check if running in Vercel/production
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    try {
      // In production, use the ffmpeg-static package
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ffmpegStatic = require('ffmpeg-static');
      if (ffmpegStatic) {
        console.log('Using ffmpeg-static:', ffmpegStatic);
        ffmpeg.setFfmpegPath(ffmpegStatic);
        return;
      }
    } catch (error) {
      console.error('ffmpeg-static not available:', error);
    }
  }

  // For local development, try to find system ffmpeg
  for (const ffmpegPath of potentialPaths) {
    if (fs.existsSync(ffmpegPath)) {
      console.log('Using system ffmpeg:', ffmpegPath);
      ffmpeg.setFfmpegPath(ffmpegPath);
      return;
    }
  }

  // Fallback to PATH
  console.log('Using ffmpeg from PATH');
  ffmpeg.setFfmpegPath('ffmpeg');
}

setFfmpegPath();

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
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    // Convert to MP3
    const filename = `${sanitizeFilename(videoInfo.title)}.mp3`;
    
    // Create a readable stream for ffmpeg
    const readableStream = Readable.from(audioStream);
    
    // Process with ffmpeg
    return new Promise<NextResponse>((resolve) => {
      const chunks: Buffer[] = [];
      
      ffmpeg(readableStream)
        .audioBitrate(AUDIO_BITRATE)
        .audioCodec('libmp3lame')
        .format('mp3')
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          resolve(NextResponse.json(
            { error: 'Failed to process audio. Please ensure ffmpeg is installed.' },
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
    
    // Return the specific error message if available
    const errorMessage = error instanceof Error ? error.message : 'Failed to download video';
    
    return NextResponse.json(
      { error: errorMessage },
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
    console.error('GET /api/download error:', error);
    
    // Return the specific error message if available
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch video information';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}