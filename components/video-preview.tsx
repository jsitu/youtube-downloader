'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User } from 'lucide-react';
import { formatDuration } from '@/lib/youtube-utils';
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