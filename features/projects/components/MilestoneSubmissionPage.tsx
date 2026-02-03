'use client';

import React, { useState } from 'react';
import { BoundlessButton } from '@/components/buttons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Coins,
  Upload,
  Link as LinkIcon,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MilestoneSubmissionData } from './MilestoneSubmissionModal';
import { useWalletProtection } from '@/hooks/use-wallet-protection';
import WalletRequiredModal from '@/components/wallet/WalletRequiredModal';

interface MilestoneSubmissionPageProps {
  milestone: {
    id: string;
    title: string;
    description: string;
    deliveryDate: string;
    fundAmount: number;
    status: 'ready' | 'pending' | 'completed' | 'failed';
  };
  onSubmit: (data: MilestoneSubmissionData) => void;
  onBack: () => void;
  loading?: boolean;
}

const MilestoneSubmissionPage: React.FC<MilestoneSubmissionPageProps> = ({
  milestone,
  onSubmit,
  onBack,
  loading = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [externalLinks, setExternalLinks] = useState<string[]>(['']);
  const [isExpanded, setIsExpanded] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState('');

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
    newLinks[index] = value;
    setExternalLinks(newLinks);
  };

  const handleAddExternalLink = () => {
    setExternalLinks(prev => [...prev, '']);
  };

  const handleRemoveExternalLink = (index: number) => {
    if (externalLinks.length > 1) {
      setExternalLinks(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    requireWallet(() => {
      const filteredLinks = externalLinks.filter(link => link.trim() !== '');
      onSubmit({
        files,
        externalLinks: filteredLinks,
      });
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
    <div className='min-h-screen bg-[#030303] text-white'>
      <div className='mx-auto max-w-4xl px-4 py-8'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-center gap-4'>
          <BoundlessButton
            variant='ghost'
            onClick={onBack}
            className='text-white hover:text-gray-300'
          >
            <ArrowLeft className='h-5 w-5' />
          </BoundlessButton>
          <div>
            <h1 className='text-2xl font-bold text-white'>
              Milestone Submission
            </h1>
            <p className='text-gray-400'>
              Submit proof of completion for your milestone
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 justify-center gap-8 lg:grid-cols-3'>
          {/* Main Content */}
          <div className='flex flex-col items-center space-y-6 lg:col-span-2'>
            {/* Milestone Card */}
            <div className='w-full max-w-2xl self-start rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-6'>
              <div className='mb-4 flex items-start justify-between'>
                <h2 className='text-xl font-semibold text-white'>
                  {milestone.title}
                </h2>
                <div className='flex items-center gap-2'>
                  <span className='rounded-full bg-[#012657] px-3 py-1 text-sm font-medium text-white'>
                    {milestone.status.charAt(0).toUpperCase() +
                      milestone.status.slice(1)}
                  </span>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className='text-white transition-colors hover:text-gray-300'
                  >
                    <ChevronUp
                      className={cn(
                        'h-5 w-5 transition-transform',
                        !isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <>
                  <p className='mb-6 text-base leading-relaxed text-gray-300'>
                    {milestone.description}
                  </p>

                  <div className='flex items-center gap-8 text-sm text-gray-400'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-5 w-5' />
                      <span>1 {formatDate(milestone.deliveryDate)}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Coins className='h-5 w-5' />
                      <span>{formatCurrency(milestone.fundAmount)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className='w-full max-w-2xl space-y-4 self-start rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-6'>
              <div>
                <Label className='text-lg font-medium text-white'>
                  Upload Proof of Completion{' '}
                  <span className='text-red-500'>*</span>
                </Label>
                <p className='mt-1 text-sm text-gray-400'>
                  Upload files that demonstrate the completion of this milestone
                </p>
              </div>

              <div className='rounded-xl border-2 border-dashed border-[#2B2B2B] bg-[#0F0F0F] p-8'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Upload className='h-12 w-12 text-gray-400' />
                    <div>
                      <p className='text-lg font-medium text-white'>
                        Upload your files
                      </p>
                      <p className='text-sm text-gray-400'>
                        JPEG, PNG, PDF, Docs • Max. 20MB
                      </p>
                    </div>
                  </div>
                  <BoundlessButton
                    variant='default'
                    size='lg'
                    onClick={() =>
                      document.getElementById('file-upload-page')?.click()
                    }
                  >
                    Upload
                  </BoundlessButton>
                </div>

                <input
                  id='file-upload-page'
                  type='file'
                  multiple
                  accept='.jpg,.jpeg,.png,.pdf,.doc,.docx'
                  onChange={handleFileUpload}
                  className='hidden'
                />
              </div>

              {files.length > 0 && (
                <div className='space-y-3'>
                  <h4 className='font-medium text-white'>Uploaded Files</h4>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between rounded-lg border border-[#2B2B2B] bg-[#0F0F0F] p-4'
                    >
                      <div className='flex items-center gap-3'>
                        <Coins className='h-5 w-5 text-gray-400' />
                        <div>
                          <span className='text-sm font-medium text-white'>
                            {file.name}
                          </span>
                          <p className='text-xs text-gray-400'>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className='rounded border border-red-400/20 px-3 py-1 text-sm text-red-400 hover:bg-red-400/10 hover:text-red-300'
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='w-full max-w-2xl space-y-4 self-start rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-6'>
              <div>
                <Label className='text-lg font-medium text-white'>
                  Links to External Evidence
                </Label>
                <p className='mt-1 text-sm text-gray-400'>
                  Add links to external resources, demos, or documentation
                </p>
              </div>

              {externalLinks.map((link, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <div className='relative flex-1'>
                    <LinkIcon className='absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                    <Input
                      type='url'
                      placeholder='https://www.example.com'
                      value={link}
                      onChange={e =>
                        handleExternalLinkChange(index, e.target.value)
                      }
                      className='h-12 border-[#2B2B2B] bg-[#0F0F0F] pl-12 text-base text-white placeholder:text-gray-400'
                    />
                  </div>
                  {externalLinks.length > 1 && (
                    <button
                      onClick={() => handleRemoveExternalLink(index)}
                      className='rounded border border-red-400/20 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 hover:text-red-300'
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <BoundlessButton
                variant='outline'
                onClick={handleAddExternalLink}
                className='w-full'
              >
                Add Another Link
              </BoundlessButton>
            </div>

            <div className='w-full max-w-2xl space-y-4 self-start rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-6'>
              <div>
                <Label className='text-lg font-medium text-white'>
                  Additional Notes
                </Label>
                <p className='mt-1 text-sm text-gray-400'>
                  Any additional context or explanations about your submission
                </p>
              </div>

              <Textarea
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                placeholder='Provide any additional context about your milestone completion...'
                className='min-h-[120px] resize-none border-[#2B2B2B] bg-[#0F0F0F] text-white placeholder:text-gray-400'
                maxLength={1000}
              />

              <div className='text-right'>
                <span className='text-sm text-gray-400'>
                  {additionalNotes.length}/1000
                </span>
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-6'>
              <h3 className='mb-4 text-lg font-semibold text-white'>
                Submission Summary
              </h3>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-400'>Files uploaded:</span>
                  <span className='font-medium text-white'>{files.length}</span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-gray-400'>External links:</span>
                  <span className='font-medium text-white'>
                    {externalLinks.filter(link => link.trim() !== '').length}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-gray-400'>Milestone value:</span>
                  <span className='font-medium text-white'>
                    {formatCurrency(milestone.fundAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className='rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] p-6'>
              <h3 className='mb-4 text-lg font-semibold text-white'>
                Submission Guidelines
              </h3>

              <div className='space-y-3 text-sm text-gray-300'>
                <div className='flex items-start gap-2'>
                  <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500'></div>
                  <p>
                    Upload clear, high-quality evidence of milestone completion
                  </p>
                </div>

                <div className='flex items-start gap-2'>
                  <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500'></div>
                  <p>Include screenshots, videos, or documentation as proof</p>
                </div>

                <div className='flex items-start gap-2'>
                  <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500'></div>
                  <p>Provide links to live demos or external resources</p>
                </div>

                <div className='flex items-start gap-2'>
                  <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500'></div>
                  <p>Ensure all files are under 20MB each</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='mx-auto mt-8 w-full max-w-2xl border-t border-[#2B2B2B] pt-6'>
          <div className='flex items-center justify-between'>
            <BoundlessButton variant='outline' onClick={onBack} size='lg'>
              Cancel
            </BoundlessButton>

            <BoundlessButton
              variant='default'
              onClick={handleSubmit}
              loading={loading}
              disabled={files.length === 0}
              size='lg'
            >
              Submit Milestone
            </BoundlessButton>
          </div>
        </div>
      </div>

      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName='submit milestone'
        onWalletConnected={handleWalletConnected}
      />
    </div>
  );
};

export default MilestoneSubmissionPage;
