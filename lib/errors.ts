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