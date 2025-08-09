'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { isValidYouTubeUrl } from '@/lib/youtube-utils';

interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  author: string;
  videoId: string;
}

interface DownloadFormProps {
  onVideoInfoFetch: (info: VideoInfo | null) => void;
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
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download video';
      toast.error(errorMessage);
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