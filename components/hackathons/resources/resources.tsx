'use client';
import { useState, useEffect } from 'react';
import {
  BarChart3,
  FileEdit,
  FileText,
  Library,
  Link2,
  Presentation,
  VideoIcon,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  getHackathonResources,
  type HackathonResource,
} from '@/lib/api/hackathons';
import { toast } from 'sonner';

interface HackathonResourcesProps {
  hackathonSlugOrId?: string;
  organizationId?: string;
}

export function HackathonResources({
  hackathonSlugOrId,
  organizationId,
}: HackathonResourcesProps) {
  const [resources, setResources] = useState<HackathonResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hackathonSlugOrId) {
      fetchResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hackathonSlugOrId, organizationId]);

  const fetchResources = async () => {
    if (!hackathonSlugOrId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getHackathonResources(
        hackathonSlugOrId,
        organizationId
      );
      if (response.success && response.data) {
        setResources(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch resources');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load resources';
      setError(errorMessage);
      toast.error('Error', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Separate resources by type
  const videoResources = resources.filter(r => r.type === 'video');
  const documentResources = resources.filter(r => r.type !== 'video');

  // Mock resources for fallback (if API returns empty)
  const mockResources: HackathonResource[] = [
    {
      _id: '1',
      title: 'Hackathon Rulebook',
      type: 'pdf',
      size: '2.4 MB',
      url: '#',
      uploadDate: 'Oct 15, 2024',
      description: 'Complete rules and guidelines for participation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const displayResources = resources.length > 0 ? resources : mockResources;
  const displayVideoResources = videoResources.length > 0 ? videoResources : [];
  const displayDocumentResources =
    documentResources.length > 0 ? documentResources : displayResources;

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

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-[#a7f950]' />
        <span className='ml-3 text-gray-400'>Loading resources...</span>
      </div>
    );
  }

  if (error && resources.length === 0) {
    return (
      <div className='flex min-h-[400px] flex-col items-center justify-center'>
        <p className='mb-4 text-red-400'>{error}</p>
        <button
          onClick={fetchResources}
          className='rounded-md bg-[#a7f950] px-4 py-2 text-black hover:bg-[#8fd93f]'
        >
          Retry
        </button>
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
      {displayVideoResources.length > 0 && (
        <section className=''>
          <h3 className='mb-4 flex items-center gap-2 text-xl font-semibold text-white'>
            <div className='bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full'>
              <VideoIcon className='text-primary h-5 w-5' />
            </div>
            Video Guides
          </h3>

          <div className='mb-6 space-y-4'>
            {displayVideoResources.map(resource => (
              <div
                key={resource._id}
                className='aspect-video overflow-hidden rounded-lg bg-black'
              >
                <iframe
                  src={resource.url}
                  className='h-full w-full'
                  allowFullScreen
                  title={resource.title}
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Documents & Resources Section */}
      <section className={displayVideoResources.length > 0 ? 'pt-6' : ''}>
        <h3 className='mb-4 flex items-center gap-2 text-xl font-semibold text-white'>
          <div className='bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full'>
            <Library className='text-primary h-5 w-5' />
          </div>
          Documents & Resources
        </h3>

        {displayDocumentResources.length === 0 ? (
          <div className='flex min-h-[200px] items-center justify-center rounded-lg border border-gray-700 bg-gray-800/50'>
            <p className='text-gray-400'>No resources available yet.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {displayDocumentResources.map(resource => (
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

      {error && resources.length > 0 && (
        <div className='rounded-md border border-red-500/50 bg-red-500/10 p-3'>
          <p className='text-sm text-red-400'>{error}</p>
        </div>
      )}
    </div>
  );
}
