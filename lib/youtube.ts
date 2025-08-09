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
    throw new Error('Failed to fetch video information');
  }
}

export { isValidYouTubeUrl, formatDuration, sanitizeFilename } from './youtube-utils';