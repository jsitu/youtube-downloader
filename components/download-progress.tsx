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