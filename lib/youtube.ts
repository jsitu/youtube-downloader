import 'server-only';
import ytdl from '@distube/ytdl-core';
import { isValidYouTubeUrl } from './youtube-utils';

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
    console.error('ytdl.getInfo error:', error);
    
    const err = error as Error & { statusCode?: number };
    
    // Check for bot detection error
    if (err.message?.includes('Sign in to confirm') || 
        err.message?.includes('bot') ||
        err.statusCode === 429) {
      throw new Error('YouTube has detected this as an automated request. This typically happens on cloud hosting platforms. Please try running this application locally or use a VPN.');
    }
    
    throw new Error('Failed to fetch video information. Please check the URL and try again.');
  }
}

export { isValidYouTubeUrl, formatDuration, sanitizeFilename } from './youtube-utils';