'use client';

import React from 'react';
import { X } from 'lucide-react';
import {
  VideoPlayer as ShadcnVideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeRange,
  VideoPlayerTimeDisplay,
  VideoPlayerMuteButton,
  VideoPlayerVolumeRange,
} from '@/components/ui/shadcn-io/video-player';

interface VideoPlayerProps {
  videoUrl: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const isYouTube =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/.test(
      videoUrl
    );

  if (isYouTube) {
    const getYouTubeEmbedUrl = (url: string) => {
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    return (
      <iframe
        src={getYouTubeEmbedUrl(videoUrl)}
        className='h-full w-full rounded-lg'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      />
    );
  }

  return (
    <ShadcnVideoPlayer className='relative h-full w-full rounded-lg'>
      <VideoPlayerContent
        src={videoUrl}
        className='h-full w-full rounded-lg object-cover'
      />
      <VideoPlayerControlBar className='absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-2'>
        <VideoPlayerSeekBackwardButton />
        <VideoPlayerPlayButton />
        <VideoPlayerSeekForwardButton />
        <VideoPlayerTimeRange />
        <VideoPlayerTimeDisplay />
        <VideoPlayerMuteButton />
        <VideoPlayerVolumeRange />
      </VideoPlayerControlBar>
    </ShadcnVideoPlayer>
  );
};

export const VideoPlayerError: React.FC = () => {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center p-8 text-center'>
      <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20'>
        <X className='h-8 w-8 text-red-500' />
      </div>
      <p className='mb-2 text-sm text-white'>Watch video on YouTube</p>
      <p className='text-xs text-gray-400'>Error 153</p>
      <p className='mt-1 text-xs text-gray-500'>
        Video player configuration error
      </p>
    </div>
  );
};
