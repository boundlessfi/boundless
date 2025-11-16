import React from 'react';
import {
  CollaborationFormData,
  SponsorPartner,
} from '../../schemas/collaborationSchema';
import {
  Mail,
  Send,
  ExternalLink,
  X,
  MessageCircle,
  Linkedin,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface CollaborationSectionProps {
  data: CollaborationFormData;
  onEdit?: () => void;
}

const getSocialIcon = (url: string): React.ReactNode => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('discord')) {
    return <MessageCircle className='h-4 w-4 text-gray-500' />;
  }
  if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) {
    return <X className='h-4 w-4 text-gray-500' />;
  }
  if (lowerUrl.includes('linkedin.com')) {
    return <Linkedin className='h-4 w-4 text-gray-500' />;
  }
  return <ExternalLink className='h-4 w-4 text-gray-500' />;
};

export default function CollaborationSection({
  data,
  onEdit,
}: CollaborationSectionProps) {
  const contactItems: Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
  }> = [
    {
      icon: <Mail className='h-4 w-4 text-gray-500' />,
      label: 'Email',
      value: data.contactEmail,
    },
  ];

  if (data.telegram) {
    contactItems.push({
      icon: <Send className='h-4 w-4 text-gray-500' />,
      label: 'Telegram',
      value: data.telegram,
    });
  }

  if (data.discord) {
    contactItems.push({
      icon: <MessageCircle className='h-4 w-4 text-gray-500' />,
      label: 'Discord',
      value: data.discord,
    });
  }

  // Add social links
  if (data.socialLinks) {
    data.socialLinks
      .filter(link => link && link.trim() !== '')
      .forEach(link => {
        contactItems.push({
          icon: getSocialIcon(link),
          label: '',
          value: link,
        });
      });
  }

  return (
    <div className='space-y-6'>
      {/* Contact Section */}
      <div className='space-y-1'>
        <p className='mb-2 text-xs font-medium text-gray-500'>Contact</p>
        <div className='space-y-0'>
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <Separator className='bg-gray-900' />}
              <div className='flex items-center justify-between py-3'>
                <div className='flex items-center gap-2'>
                  {item.icon}
                  <span className='text-sm text-white'>{item.value}</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Sponsors & Partners Section */}
      {data.sponsorsPartners && data.sponsorsPartners.length > 0 && (
        <div className='space-y-1'>
          <p className='mb-3 text-xs font-medium text-gray-500'>
            Sponsors & Partners
          </p>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            {data.sponsorsPartners.map(
              (sponsor: SponsorPartner, idx: number) => (
                <div key={sponsor.id || idx} className='space-y-2'>
                  {sponsor.logo ? (
                    <div className='relative aspect-square w-full overflow-hidden rounded-lg border border-gray-800 bg-gray-900'>
                      <Image
                        src={sponsor.logo}
                        alt={sponsor.name || 'Sponsor logo'}
                        fill
                        className='object-contain p-2'
                      />
                    </div>
                  ) : (
                    <div className='flex aspect-square w-full items-center justify-center rounded-lg border border-gray-800 bg-gray-900'>
                      <span className='text-xs text-gray-600'>
                        {sponsor.name?.charAt(0) || 'S'}
                      </span>
                    </div>
                  )}
                  <div className='flex items-center gap-1'>
                    <a
                      href={sponsor.link || '#'}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='hover:text-primary flex items-center gap-1 text-sm text-white'
                    >
                      {sponsor.name}
                      {sponsor.link && (
                        <ExternalLink className='h-3 w-3 text-gray-500' />
                      )}
                    </a>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          className='text-primary mt-2 text-sm hover:underline'
        >
          Edit Collaboration
        </button>
      )}
    </div>
  );
}
