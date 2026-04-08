'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Check, Link2 } from 'lucide-react';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  projectUrl: string;
}

export function SharePopup({
  isOpen,
  onClose,
  projectTitle,
  projectUrl,
}: SharePopupProps) {
  const [copied, setCopied] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const shareOptions = [
    {
      name: 'X (Twitter)',
      icon: (
        <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
        </svg>
      ),
      color: 'hover:bg-black/10 hover:text-black',
      action: () => {
        const text = `Check out this project: ${projectTitle}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(projectUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
        onClose();
      },
    },
    {
      name: 'Discord',
      icon: (
        <svg
          id='Discord-Logo'
          fill='currentColor'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 126.644 96'
        >
          <path
            id='Discord-Symbol-Black'
            d='M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z'
          />
        </svg>
      ),
      color: 'hover:bg-indigo-500/10 hover:text-indigo-500',
      action: () => {
        const text = `**${projectTitle}**\n${projectUrl}`;
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        onClose();
      },
    },
    {
      name: 'Telegram',
      icon: <Send className='h-5 w-5' />,
      color: 'hover:bg-blue-500/10 hover:text-blue-500',
      action: () => {
        const text = `Check out this project: ${projectTitle}`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(projectUrl)}&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=600,height=400');
        onClose();
      },
    },
    {
      name: 'Copy Link',
      icon: copied ? (
        <Check className='h-5 w-5' />
      ) : (
        <Link2 className='h-5 w-5' />
      ),
      color: copied
        ? 'bg-green-500/10 text-green-500'
        : 'hover:bg-gray-500/10 hover:text-gray-500',
      action: () => {
        navigator.clipboard.writeText(projectUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        onClose();
      },
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className='bg-background absolute top-full right-0 z-50 mt-2 w-[180px] max-w-[180px] rounded-lg border border-white p-2 shadow-[0_4px_4px_0_rgba(43,43,43,0.25)]'
    >
      <div className='flex justify-between gap-4'>
        {shareOptions.map((option, index) => (
          <button
            key={index}
            onClick={option.action}
            className={`h-6 w-6 transition-all duration-200 ${option.color}`}
          >
            <span className='group-hover:text-primary hover:text-primary text-gray-300 transition-colors'>
              {option.icon}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
