'use client';

import React, { useState } from 'react';

import {
  Calendar,
  Coins,
  Link as LinkIcon,
  ChevronUp,
  CloudUpload,
  Check,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MilestoneSubmissionSuccess from './MilestoneSubmissionSuccess';
import { useWalletProtection } from '@/hooks/use-wallet-protection';
import WalletRequiredModal from '@/components/wallet/WalletRequiredModal';
import BoundlessSheet from '@/components/sheet/boundless-sheet';
import { Label } from '@/components/ui/label';
import { BoundlessButton } from '@/components/buttons';

export interface MilestoneSubmissionData {
  files: File[];
  externalLinks: string[];
}

interface MilestoneSubmissionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  milestone: {
    id: string;
    title: string;
    description: string;
    deliveryDate: string;
    fundAmount: number;
    status: 'ready' | 'pending' | 'completed' | 'failed';
  };
  onSubmit: (data: MilestoneSubmissionData) => void;
  loading?: boolean;
}

const MilestoneSubmissionModal: React.FC<MilestoneSubmissionModalProps> = ({
  open,
  setOpen,
  milestone,
  onSubmit,
  loading = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [externalLinks, setExternalLinks] = useState<string[]>(['www.']);
  const [isExpanded, setIsExpanded] = useState(true);
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    requireWallet,
    showWalletModal,
    handleWalletConnected,
    closeWalletModal,
  } = useWalletProtection({
    actionName: 'submit milestone',
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExternalLinkChange = (index: number, value: string) => {
    const newLinks = [...externalLinks];
    if (!value.startsWith('www.')) {
      newLinks[index] = 'www.' + value;
    } else {
      newLinks[index] = value;
    }
    setExternalLinks(newLinks);
  };

  const handleSaveLink = () => {
    setExternalLinks(prev => [...prev, 'www.']);
  };

  const handleSubmit = () => {
    requireWallet(() => {
      const filteredLinks = externalLinks.filter(link => link.trim() !== '');
      onSubmit({
        files,
        externalLinks: filteredLinks,
      });
      setShowSuccess(true);
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <BoundlessSheet open={open} setOpen={setOpen} size='large'>
      {showSuccess ? (
        <MilestoneSubmissionSuccess
          onContinue={() => {
            setShowSuccess(false);
            setOpen(false);
          }}
        />
      ) : (
        <div className='space-y-6'>
          <div className='flex justify-center'>
            <div className='text-left' style={{ width: '500px' }}>
              <h2 className='mb-2 text-xl font-semibold text-white'>
                Milestone Summary
              </h2>
              <p className='text-sm text-gray-400'>Milestone 1</p>
            </div>
          </div>

          <div className='flex justify-center'>
            <div
              className='rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C]'
              style={{
                width: '500px',
                height: '210px',
                padding: '16px',
                gap: '12px',
              }}
            >
              <div className='mb-3 flex items-start justify-between'>
                <h3 className='text-base font-semibold text-white'>
                  {milestone.title}
                </h3>
                <div className='flex items-center gap-2'>
                  <span className='rounded-full bg-[#012657] px-2 py-1 text-xs font-medium text-white'>
                    {milestone.status.charAt(0).toUpperCase() +
                      milestone.status.slice(1)}
                  </span>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className='text-white transition-colors hover:text-gray-300'
                  >
                    <ChevronUp
                      className={cn(
                        'h-4 w-4 transition-transform',
                        !isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <>
                  <p className='mb-4 text-sm leading-relaxed text-gray-300'>
                    {milestone.description}
                  </p>

                  <div className='flex items-center gap-6 text-sm text-gray-400'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      <span>1 {formatDate(milestone.deliveryDate)}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Coins className='h-4 w-4' />
                      <span>{formatCurrency(milestone.fundAmount)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className='flex justify-center'>
            <div className='space-y-3' style={{ width: '500px' }}>
              <h3 className='text-lg font-medium text-white'>
                Upload Proof of Completion
              </h3>

              <div className='text-left'>
                <Label className='font-medium text-white'>
                  File Upload <span className='text-red-500'>*</span>
                </Label>
              </div>

              <div className='flex items-center justify-between rounded-xl border-2 border-dashed border-[#2B2B2B] bg-[#1C1C1C] p-6'>
                <div className='flex items-center gap-4'>
                  <div
                    className='flex items-center justify-center rounded-full'
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#FFFFFF',
                      opacity: 1,
                    }}
                  >
                    <CloudUpload className='h-6 w-6 text-[#1C1C1C]' />
                  </div>

                  <div className='text-left'>
                    <p className='font-medium text-white'>Upload your files</p>
                    <p className='text-sm text-gray-400'>
                      JPEG, PNG, PDF, Docs • Max. 20MB
                    </p>
                  </div>
                </div>

                <BoundlessButton
                  variant='default'
                  onClick={() =>
                    document.getElementById('file-upload')?.click()
                  }
                >
                  Upload
                </BoundlessButton>

                <input
                  id='file-upload'
                  type='file'
                  multiple
                  accept='.jpg,.jpeg,.png,.pdf,.doc,.docx'
                  onChange={handleFileUpload}
                  className='hidden'
                />
              </div>

              {files.length > 0 && (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-medium text-white'>Uploaded Files</h3>
                    <div className='flex h-6 w-6 items-center justify-center rounded-full border border-white bg-[#1C1C1C]'>
                      <span className='text-xs font-medium text-white'>
                        {files.length}
                      </span>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between rounded-lg border border-[#2B2B2B] bg-[#1C1C1C] p-3'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-500'>
                            <Check className='h-3 w-3 text-white' />
                          </div>

                          <div className='flex flex-col'>
                            <span className='text-sm font-medium text-white'>
                              {file.name}
                            </span>
                            <div className='flex items-center gap-2'>
                              <span className='text-xs text-green-400'>
                                Upload complete
                              </span>
                              <span className='text-xs text-gray-400'>•</span>
                              <span className='text-xs text-white'>
                                {(file.size / (1024 * 1024)).toFixed(1)}MB
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveFile(index)}
                          className='flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 transition-colors hover:bg-red-600'
                        >
                          <Trash2 className='h-4 w-4 text-white' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='flex justify-center'>
            <div className='space-y-3' style={{ width: '500px' }}>
              <Label className='font-medium text-white'>
                Links to External Evidence
              </Label>

              {externalLinks.map((link, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <div className='relative flex-1'>
                    <LinkIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                    <input
                      type='url'
                      placeholder=''
                      value={link}
                      onChange={e =>
                        handleExternalLinkChange(index, e.target.value)
                      }
                      onFocus={() => setFocusedInput(index)}
                      onBlur={() => setFocusedInput(null)}
                      style={{
                        width: '500px',
                        height: '48px',
                        borderRadius: '12px',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor:
                          focusedInput === index ? '#A7F950' : '#2B2B2B',
                        backgroundColor: '#1C1C1C',
                        color: '#FFFFFF',
                        paddingLeft: '40px',
                        paddingRight:
                          link.trim() && link !== 'www.' ? '80px' : '16px',
                        paddingTop: '16px',
                        paddingBottom: '16px',
                        gap: '12px',
                        opacity: 1,
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                      }}
                      className='placeholder:text-gray-400'
                    />

                    {link.trim() && link !== 'www.' && (
                      <BoundlessButton
                        className='absolute top-1/2 right-2 h-[36px] w-[65px] -translate-y-1/2 transform rounded-[10px] border-[0.3px] border-[#A7F950] bg-[#A7F950] text-[14px] font-[500] text-black transition-colors'
                        style={{
                          backgroundImage:
                            'linear-gradient(314.7deg, rgba(147, 229, 60, 0.14) 3.33%, rgba(117, 199, 30, 0) 21.54%, rgba(107, 185, 20, 0.14) 87.82%)',
                        }}
                        onClick={handleSaveLink}
                      >
                        Save
                      </BoundlessButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='flex justify-center'>
            <BoundlessButton
              onClick={handleSubmit}
              disabled={files.length === 0 || loading}
              className={cn(
                'h-[40px] w-[500px] rounded-[10px] border-[1.4px] text-[14px] font-[500] transition-all duration-200',
                files.length === 0 || loading
                  ? 'cursor-not-allowed border-[#2B2B2B] bg-[#1C1C1C] text-white opacity-50'
                  : 'border-[#A7F950] bg-[#A7F950] text-black hover:bg-[#8BE03A]'
              )}
              style={{
                backgroundImage:
                  files.length === 0 || loading
                    ? 'none'
                    : 'linear-gradient(314.7deg, rgba(147, 229, 60, 0.14) 3.33%, rgba(117, 199, 30, 0) 21.54%, rgba(107, 185, 20, 0.14) 87.82%)',
              }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </BoundlessButton>
          </div>
        </div>
      )}

      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName='submit milestone'
        onWalletConnected={handleWalletConnected}
      />
    </BoundlessSheet>
  );
};

export default MilestoneSubmissionModal;
