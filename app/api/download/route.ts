import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { getVideoInfo, isValidYouTubeUrl, sanitizeFilename } from '@/lib/youtube';
import { MAX_VIDEO_DURATION, ALLOWED_AUDIO_QUALITY, AUDIO_BITRATE } from '@/lib/constants';
import path from 'path';

// Set ffmpeg path - prefer system ffmpeg over the bundled one for better compatibility
const systemFfmpegPath = '/opt/homebrew/bin/ffmpeg';
const fs = require('fs');

if (fs.existsSync(systemFfmpegPath)) {
  console.log('Using system ffmpeg at:', systemFfmpegPath);
  ffmpeg.setFfmpegPath(systemFfmpegPath);
} else {
  // Fallback to ffmpeg-static
  try {
    const ffmpegPath = require('ffmpeg-static');
    if (ffmpegPath) {
      console.log('Using ffmpeg-static at:', ffmpegPath);
      ffmpeg.setFfmpegPath(ffmpegPath);
    }
  } catch (error) {
    console.error('Failed to set ffmpeg path, using system default:', error);
    ffmpeg.setFfmpegPath('ffmpeg');
  }
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

    // Try to get the best audio format available
    const info = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    
    // Prefer mp4a (AAC) or opus formats which are common
    const bestAudioFormat = audioFormats.find(f => f.audioCodec === 'mp4a.40.2') || 
                            audioFormats.find(f => f.audioCodec === 'opus') ||
                            audioFormats[0];

    if (!bestAudioFormat) {
      throw new Error('No audio format available');
    }

    // Download audio stream with the best format
    const audioStream = ytdl(url, {
      format: bestAudioFormat,
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
    console.error('GET /api/download error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video information' },
      { status: 500 }
    );
  }
}