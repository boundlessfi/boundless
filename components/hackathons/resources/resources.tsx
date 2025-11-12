'use client';
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

interface ResourceItem {
  id: number;
  title: string;
  type: 'pdf' | 'doc' | 'sheet' | 'slide' | 'link';
  size?: string;
  url: string;
  uploadDate: string;
  description?: string;
}

export function HackathonResources() {
  const resources: ResourceItem[] = [
    // Documents
    {
      id: 1,
      title: 'Hackathon Rulebook',
      type: 'pdf',
      size: '2.4 MB',
      url: '#',
      uploadDate: 'Oct 15, 2024',
      description: 'Complete rules and guidelines for participation',
    },
    {
      id: 2,
      title: 'Submission Template',
      type: 'doc',
      size: '1.1 MB',
      url: '#',
      uploadDate: 'Oct 15, 2024',
      description: 'Template for project submission documentation',
    },
    {
      id: 3,
      title: 'Judging Criteria',
      type: 'sheet',
      size: '0.8 MB',
      url: '#',
      uploadDate: 'Oct 14, 2024',
      description: 'Detailed breakdown of judging criteria and scoring',
    },
    {
      id: 5,
      title: 'Design Resources',
      type: 'slide',
      size: '5.7 MB',
      url: '#',
      uploadDate: 'Oct 12, 2024',
      description: 'Design assets and presentation templates',
    },
    {
      id: 7,
      title: 'GitHub Repository',
      type: 'link',
      url: 'https://github.com/techvision/hackathon-2024',
      uploadDate: 'Oct 14, 2024',
      description: 'Starter code and project templates',
    },
  ];

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

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='text-left'>
        <h2 className='text-primary mb-2 text-2xl font-bold'>
          Hackathon Resources
        </h2>
      </div>

      {/* Video Guides Section */}
      <section className=''>
        <h3 className='mb-4 flex items-center gap-2 text-xl font-semibold text-white'>
          <div className='bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full'>
            <VideoIcon className='text-primary h-5 w-5' />
          </div>
          Video Guides
        </h3>

        <div className='mb-6'>
          <div className='aspect-video overflow-hidden bg-black'>
            <iframe
              src={`https://www.youtube.com/embed/IbSTKM8ib98`}
              className='h-full w-full'
              allowFullScreen
              title='Hackathon Guide Video'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            />
          </div>
        </div>
      </section>

      {/* Documents & Resources Section */}
      <section className='pt-6'>
        <h3 className='mb-4 flex items-center gap-2 text-xl font-semibold text-white'>
          <div className='bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full'>
            <Library className='text-primary h-5 w-5' />
          </div>
          Documents & Resources
        </h3>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {resources.map(resource => (
            <Link
              key={resource.id}
              href={resource.url}
              target={resource.type === 'link' ? '_blank' : '_self'}
              rel={resource.type === 'link' ? 'noopener noreferrer' : ''}
              className='border-primary hover:border-primary/80 hover:bg-primary/5 group rounded-md border p-4 text-left transition-all'
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
                    <span>{resource.uploadDate}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
