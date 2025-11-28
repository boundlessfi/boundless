'use client';
import { useMemo } from 'react';
import {
  BarChart3,
  FileEdit,
  FileText,
  Library,
  Link2,
  Presentation,
  VideoIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import type { HackathonResource } from '@/lib/api/hackathons';
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
  VideoPlayerVolumeRange,
} from '@/components/ui/video-player';

interface HackathonResourcesProps {
  hackathonSlugOrId?: string;
  organizationId?: string;
}

export function HackathonResources({}: HackathonResourcesProps) {
  const { currentHackathon } = useHackathonData();

  // Transform resources from hackathon data to component format
  const resources: HackathonResource[] = useMemo(() => {
    if (!currentHackathon?.resources?.resources) {
      return [];
    }

    return currentHackathon.resources.resources.map((resource, index) => {
      const url = resource.fileUrl || resource.link || '';
      const fileName = resource.fileName || '';

      // Determine resource type based on URL or file extension
      let type: 'pdf' | 'doc' | 'sheet' | 'slide' | 'link' | 'video' = 'link';

      if (resource.fileUrl) {
        const extension = fileName.toLowerCase().split('.').pop();
        if (extension === 'pdf') type = 'pdf';
        else if (extension === 'doc' || extension === 'docx') type = 'doc';
        else if (extension === 'xls' || extension === 'xlsx') type = 'sheet';
        else if (extension === 'ppt' || extension === 'pptx') type = 'slide';
        else if (
          extension === 'mp4' ||
          extension === 'webm' ||
          extension === 'ogg' ||
          extension === 'mov' ||
          extension === 'avi' ||
          extension === 'mkv'
        ) {
          type = 'video';
        }
      } else if (
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('vimeo.com')
      ) {
        type = 'video';
      } else {
        // Check URL extension for video files
        const urlExtension = url.toLowerCase().split('.').pop()?.split('?')[0];
        if (
          urlExtension === 'mp4' ||
          urlExtension === 'webm' ||
          urlExtension === 'ogg' ||
          urlExtension === 'mov' ||
          urlExtension === 'avi' ||
          urlExtension === 'mkv'
        ) {
          type = 'video';
        }
      }

      return {
        _id: `resource-${index}`,
        title: resource.description || fileName || `Resource ${index + 1}`,
        type,
        url,
        size: undefined, // Size not available in current structure
        description: resource.description,
        uploadDate: new Date().toISOString(), // Use current date as fallback
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
  }, [currentHackathon]);

  // Separate resources by type
  const videoResources = resources.filter(r => r.type === 'video');
  const documentResources = resources.filter(r => r.type !== 'video');

  // Check if URL is YouTube or Vimeo (use iframe) vs direct video file (use VideoPlayer)
  const isEmbedVideo = (url: string) => {
    return (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com')
    );
  };

  // Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // Convert Vimeo URL to embed format
  const getVimeoEmbedUrl = (url: string) => {
    const regExp = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const match = url.match(regExp);
    const videoId = match ? match[1] : null;
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  };

  const getFileIcon = (type: string) => {
    const iconClass = 'w-5 h-5';

    switch (type) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-400`} />;
      case 'doc':
        return <FileEdit className={`${iconClass} text-blue-400`} />;
      case 'sheet':
        return <BarChart3 className={`${iconClass} text-green-400`} />;
      case 'slide':
        return <Presentation className={`${iconClass} text-yellow-400`} />;
      case 'link':
        return <Link2 className={`${iconClass} text-purple-400`} />;
      default:
        return <FileText className={`${iconClass} text-gray-400`} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF';
      case 'doc':
        return 'DOC';
      case 'sheet':
        return 'SHEET';
      case 'slide':
        return 'SLIDES';
      case 'link':
        return 'LINK';
      default:
        return type.toUpperCase();
    }
  };

  // Show empty state if no resources
  if (resources.length === 0) {
    return (
      <div className='space-y-8'>
        <div className='text-left'>
          <h2 className='text-primary mb-2 text-2xl font-bold'>
            Hackathon Resources
          </h2>
        </div>
        <div className='flex min-h-[400px] items-center justify-center rounded-lg border border-gray-700 bg-gray-800/50'>
          <p className='text-gray-400'>No resources available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='text-left'>
        <h2 className='text-primary mb-2 text-2xl font-bold'>
          Hackathon Resources
        </h2>
      </div>

      {/* Video Guides Section */}
      {videoResources.length > 0 && (
        <section className=''>
          <h3 className='mb-4 flex items-center gap-2 text-xl font-semibold text-white'>
            <div className='bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full'>
              <VideoIcon className='text-primary h-5 w-5' />
            </div>
            Video Guides
          </h3>

          <div className='mb-6 space-y-4'>
            {videoResources.map(resource => {
              const isEmbed = isEmbedVideo(resource.url);
              let embedUrl = resource.url;

              if (
                resource.url.includes('youtube.com') ||
                resource.url.includes('youtu.be')
              ) {
                embedUrl = getYouTubeEmbedUrl(resource.url);
              } else if (resource.url.includes('vimeo.com')) {
                embedUrl = getVimeoEmbedUrl(resource.url);
              }

              return (
                <div
                  key={resource._id}
                  className='aspect-video overflow-hidden rounded-lg bg-black'
                >
                  {isEmbed ? (
                    <iframe
                      src={embedUrl}
                      className='h-full w-full'
                      allowFullScreen
                      title={resource.title}
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    />
                  ) : (
                    <VideoPlayer className='h-full w-full'>
                      <VideoPlayerContent
                        src={resource.url}
                        className='h-full w-full object-contain'
                        controls
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
                    </VideoPlayer>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Documents & Resources Section */}
      <section className={videoResources.length > 0 ? 'pt-6' : ''}>
        <h3 className='mb-4 flex items-center gap-2 text-xl font-semibold text-white'>
          <div className='bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full'>
            <Library className='text-primary h-5 w-5' />
          </div>
          Documents & Resources
        </h3>

        {documentResources.length === 0 ? (
          <div className='flex min-h-[200px] items-center justify-center rounded-lg border border-gray-700 bg-gray-800/50'>
            <p className='text-gray-400'>No resources available yet.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {documentResources.map(resource => (
              <Link
                key={resource._id}
                href={resource.url}
                target={resource.type === 'link' ? '_blank' : '_self'}
                rel={resource.type === 'link' ? 'noopener noreferrer' : ''}
                className='border-primary/45 hover:border-primary/80 hover:bg-primary/5 group rounded-md border p-4 text-left transition-all'
              >
                <div className='flex items-start gap-3'>
                  <div className='relative flex-shrink-0'>
                    <div className='flex h-16 w-20 items-center justify-center bg-gray-800 transition-colors group-hover:bg-gray-700'>
                      {getFileIcon(resource.type)}
                    </div>
                    <span className='absolute right-1 bottom-1 rounded bg-black/80 px-1 text-xs text-white'>
                      {getTypeLabel(resource.type)}
                    </span>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h5 className='group-hover:text-primary truncate text-sm font-medium text-white transition-colors'>
                      {resource.title}
                    </h5>
                    {resource.description && (
                      <p className='mt-1 line-clamp-2 text-xs text-gray-400'>
                        {resource.description}
                      </p>
                    )}
                    <div className='mt-1 flex items-center gap-2 text-xs text-gray-400'>
                      {resource.size && (
                        <>
                          <span>{resource.size}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        {new Date(resource.uploadDate).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
