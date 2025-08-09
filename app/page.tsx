"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DownloadForm } from "@/components/download-form";
import { VideoPreview } from "@/components/video-preview";
import { DownloadProgress } from "@/components/download-progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function Home() {
  const [videoInfo, setVideoInfo] = useState<{
    title: string;
    duration: number;
    thumbnail: string;
    author: string;
    videoId: string;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleVideoInfoFetch = (
    info: {
      title: string;
      duration: number;
      thumbnail: string;
      author: string;
      videoId: string;
    } | null
  ) => {
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

            {videoInfo && <VideoPreview videoInfo={videoInfo} />}

            <DownloadProgress
              isDownloading={isDownloading}
              progress={downloadProgress}
            />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Maximum video duration: 30 minutes. Only for personal use.</p>
                  <p>Please respect copyright laws.</p>
                  {process.env.NEXT_PUBLIC_VERCEL && (
                    <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                      Note: This app may not work on cloud platforms due to YouTube&apos;s bot detection. 
                      For best results, run locally.
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

