'use client';

import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
// import { Textarea } from '../ui/textarea';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '../ui/select';
import { formatBytes } from '@/lib/utils';
// import { Badge } from '../ui/badge';
import { DollarSign, Package, Trash, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// import { Input } from '../ui/input';

const fundingGoals = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Education', label: 'Education' },
  { value: 'Environment', label: 'Environment' },
  { value: 'Social', label: 'Social' },
  { value: 'Other', label: 'Other' },
];

const projectTags = [
  { value: 'defi', label: 'DeFi' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'nft', label: 'NFT' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'public-good', label: 'Public Good' },
];

export interface ProjectSubmissionData {
  title: string;
  tagline: string;
  description: string;
  category: string;
  fundAmount: number;
  tags: string[];
  whitepaperFile?: File | null;
  thumbnailFile?: File | null;
}

interface ProjectSubmissionFormProps {
  onComplete: (data: ProjectSubmissionData) => void;
  initialData?: ProjectSubmissionData;
  onChange?: (data: ProjectSubmissionData) => void;
}

function ProjectSubmissionForm({
  onComplete,
  initialData,
  onChange,
}: ProjectSubmissionFormProps) {
  const [projectTitle, setProjectTitle] = useState(initialData?.title ?? '');
  const [projectTagline, setProjectTagline] = useState(
    initialData?.tagline ?? ''
  );
  const [projectDescription, setProjectDescription] = useState(
    initialData?.description ?? ''
  );
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [fundAmount, setFundAmount] = useState(
    initialData?.fundAmount != null ? String(initialData.fundAmount) : ''
  );
  const [whitepaperFile, setWhitepaperFile] = useState<File | null>(
    initialData?.whitepaperFile ?? null
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(
    initialData?.thumbnailFile ?? null
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [isFormValid, setIsFormValid] = useState(false);
  const [tagQuery, setTagQuery] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const whitepaperInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const allFieldsFilled =
      projectTitle.trim() !== '' &&
      projectTagline.trim() !== '' &&
      projectDescription.trim() !== '' &&
      category.trim() !== '' &&
      fundAmount.trim() !== '' &&
      whitepaperFile !== null &&
      thumbnailFile !== null;
    setIsFormValid(allFieldsFilled);
    const snapshot: ProjectSubmissionData = {
      title: projectTitle,
      tagline: projectTagline,
      description: projectDescription,
      category,
      fundAmount: Number(fundAmount || 0),
      tags,
      whitepaperFile: whitepaperFile ?? null,
      thumbnailFile: thumbnailFile ?? null,
    };
    onChange?.(snapshot);
  }, [
    projectTitle,
    projectTagline,
    projectDescription,
    category,
    fundAmount,
    whitepaperFile,
    thumbnailFile,
    tags,
    onChange,
  ]);

  const normalizeTag = (value: string) => value.trim();

  const handleAddTag = (rawTag: string) => {
    const tag = normalizeTag(rawTag);
    if (!tag) return;
    if (tags.includes(tag)) return;
    setTags(prev => [...prev, tag]);
    setTagQuery('');
    setIsSuggestionsOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleRemoveFile = (fileType: 'whitepaper' | 'thumbnail') => {
    if (fileType === 'whitepaper') {
      setWhitepaperFile(null);
      if (whitepaperInputRef.current) {
        whitepaperInputRef.current.value = '';
      }
    } else if (fileType === 'thumbnail') {
      setThumbnailFile(null);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  };

  const handleNext = () => {
    if (!isFormValid) return;
    const submissionData: ProjectSubmissionData = {
      title: projectTitle,
      tagline: projectTagline,
      description: projectDescription,
      category,
      fundAmount: Number(fundAmount),
      tags,
      whitepaperFile: whitepaperFile ?? null,
      thumbnailFile: thumbnailFile ?? null,
    };
    onComplete(submissionData);
  };

  return (
    <div className='text-white'>
      <h5>Submit your project information</h5>
      <div className='flex w-[500px] flex-col gap-3 pt-3 pb-6'>
        <div className='flex flex-col gap-1'>
          <label className='text-card text-xs font-medium'>
            Project Title <span className='text-red-500'>*</span>
          </label>
          <div className='bg-stepper-foreground border-stepper-border flex h-12 w-full items-center gap-3 rounded-[12px] border p-4'>
            <Package className='text-card size-5' />
            <input
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              type='text'
              className='text-placeholder w-full bg-transparent text-base font-normal focus:outline-none'
              placeholder='Enter project title'
            />
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-card text-xs font-medium'>
            Project Tagline <span className='text-red-500'>*</span>
          </label>
          <div className='bg-stepper-foreground border-stepper-border flex h-12 w-full items-center gap-3 rounded-[12px] border p-4'>
            <input
              value={projectTagline}
              onChange={e => setProjectTagline(e.target.value)}
              type='text'
              className='text-placeholder w-full bg-transparent text-base font-normal focus:outline-none'
              placeholder='Enter your one-liner'
            />
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-card flex justify-between text-xs font-medium'>
            <span>
              Project Description <span className='text-red-500'>*</span>
            </span>
            <span className='text-card/60'>
              {projectDescription.length}/400
            </span>
          </label>
          <Textarea
            value={projectDescription}
            onChange={e => setProjectDescription(e.target.value)}
            maxLength={400}
            className='text-placeholder bg-stepper-foreground border-stepper-border min-h-[120px] w-full resize-none rounded-[12px] border text-base font-normal focus-visible:ring-0'
            placeholder='Describe your project in a few words'
          />
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-card text-xs font-medium'>
            Category <span className='text-red-500'>*</span>
          </label>
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger className='bg-stepper-foreground border-stepper-border flex !h-12 w-full items-center !gap-3 rounded-[12px] border p-4 focus:ring-0'>
              <div className='flex items-center gap-2'>
                <Image src='/select.svg' width={20} height={20} alt='icon' />
                <SelectValue placeholder='Select a category' />
              </div>
            </SelectTrigger>
            <SelectContent className='bg-background text-placeholder border-stepper-border max-h-[200px] overflow-y-auto rounded-[12px] border text-base font-normal'>
              {fundingGoals.map(goal => (
                <SelectItem key={goal.value} value={goal.value}>
                  {goal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-1'>
          <label className='text-card text-xs font-medium'>
            Fund Amount <span className='text-red-500'>*</span>
          </label>
          <div className='bg-stepper-foreground border-stepper-border flex h-12 w-full items-center gap-3 rounded-[12px] border p-4'>
            <DollarSign className='text-card size-5' />
            <Input
              value={fundAmount}
              onChange={e => setFundAmount(e.target.value)}
              type='number'
              className='text-placeholder w-full !border-none bg-transparent text-base font-normal focus:outline-none'
              placeholder='Enter the amount you need to fund this project'
            />
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='' className='text-card text-xs font-medium'>
            Upload Whitepaper or Detailed Proposal{' '}
            <span className='text-red-500'>*</span>
          </label>
          <div className='bg-stepper-foreground border-stepper-border flex h-[83px] w-full justify-between rounded-[12px] border p-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-card flex size-12 items-center justify-center rounded-full'>
                {whitepaperFile ? (
                  <Image
                    src='/green-circle.svg'
                    width={24}
                    height={24}
                    alt='upload'
                  />
                ) : (
                  <Image
                    src='/upload.svg'
                    width={24}
                    height={24}
                    alt='upload'
                  />
                )}
              </div>
              <div className='space-y-1'>
                {whitepaperFile ? (
                  <>
                    <h5 className='text-card text-base font-semibold'>
                      {whitepaperFile.name}
                    </h5>
                    <p className='flex items-center gap-0.5 text-sm font-normal text-[#40B869]'>
                      Upload complete
                      <div className='bg-placeholder size-1 rounded-full' />
                      <span className='text-placeholder'>
                        {formatBytes(whitepaperFile.size)}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <h5 className='text-card text-base font-semibold'>
                      Upload your document
                    </h5>
                    <p className='text-placeholder flex items-center gap-0.5 text-sm font-normal'>
                      PDF, Docs{' '}
                      <span className='bg-placeholder size-1 rounded-full'></span>
                      Max. 20MB
                    </p>
                  </>
                )}
              </div>
            </div>
            <input
              type='file'
              className='hidden'
              ref={whitepaperInputRef}
              onChange={e => setWhitepaperFile(e.target.files?.[0] ?? null)}
              accept='.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            />
            {whitepaperFile ? (
              <button
                type='button'
                className='text-background rounded-[10px] bg-transparent px-4 py-2 text-base font-normal'
                onClick={() => handleRemoveFile('whitepaper')}
              >
                <Trash className='text-red-500' />
              </button>
            ) : (
              <button
                type='button'
                className='text-background bg-primary rounded-[10px] px-4 py-2 text-base font-normal'
                onClick={() => whitepaperInputRef.current?.click()}
              >
                Upload
              </button>
            )}
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='' className='text-card text-xs font-medium'>
            Upload Project Thumbnail <span className='text-red-500'>*</span>
          </label>
          <div className='bg-stepper-foreground border-stepper-border flex h-[83px] w-full justify-between rounded-[12px] border p-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-card flex size-12 items-center justify-center rounded-full'>
                {thumbnailFile ? (
                  <Image
                    src='/green-circle.svg'
                    width={24}
                    height={24}
                    alt='upload'
                  />
                ) : (
                  <Image
                    src='/upload.svg'
                    width={24}
                    height={24}
                    alt='upload'
                  />
                )}
              </div>
              <div className='space-y-1'>
                {thumbnailFile ? (
                  <>
                    <h5 className='text-card text-base font-semibold'>
                      {thumbnailFile.name}
                    </h5>
                    <p className='flex items-center gap-0.5 text-sm font-normal text-[#40B869]'>
                      Upload complete
                      <div className='bg-placeholder size-1 rounded-full' />
                      <span className='text-placeholder'>
                        {formatBytes(thumbnailFile.size)}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <h5 className='text-card text-base font-semibold'>
                      Upload your image
                    </h5>
                    <p className='text-placeholder flex items-center gap-0.5 text-sm font-normal'>
                      JPG, PNG, GIF{' '}
                      <span className='bg-placeholder size-1 rounded-full'></span>
                      Max. 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
            <input
              type='file'
              className='hidden'
              ref={thumbnailInputRef}
              onChange={e => setThumbnailFile(e.target.files?.[0] ?? null)}
              accept='image/png, image/jpeg, image/gif'
            />
            {thumbnailFile ? (
              <button
                type='button'
                className='text-background rounded-[10px] bg-transparent px-4 py-2 text-base font-normal'
                onClick={() => handleRemoveFile('thumbnail')}
              >
                <Trash className='text-red-500' />
              </button>
            ) : (
              <button
                type='button'
                className='text-background bg-primary rounded-[10px] px-4 py-2 text-base font-normal'
                onClick={() => thumbnailInputRef.current?.click()}
              >
                Upload
              </button>
            )}
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-card flex items-center justify-between text-xs font-medium'>
            Tags <span className='text-placeholder'>Optional</span>
          </label>
          <div className='relative'>
            <div className='bg-stepper-foreground border-stepper-border flex min-h-12 w-full flex-wrap items-center gap-2 rounded-[12px] border p-2'>
              {tags.map(tag => (
                <Badge
                  key={tag}
                  className='bg-background text-card flex items-center gap-1'
                >
                  {projectTags.find(t => t.value === tag)?.label || tag}
                  <button
                    type='button'
                    className='hover:bg-destructive/20 ml-1 rounded-full outline-none'
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className='size-3' />
                  </button>
                </Badge>
              ))}
              <input
                type='text'
                value={tagQuery}
                onChange={e => {
                  setTagQuery(e.target.value);
                  setIsSuggestionsOpen(true);
                }}
                onFocus={() => setIsSuggestionsOpen(true)}
                onBlur={() => {
                  // Delay closing to allow click on suggestion
                  setTimeout(() => setIsSuggestionsOpen(false), 120);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag(tagQuery);
                  } else if (
                    e.key === 'Backspace' &&
                    tagQuery === '' &&
                    tags.length > 0
                  ) {
                    handleRemoveTag(tags[tags.length - 1]);
                  }
                }}
                className='text-placeholder placeholder:text-placeholder/60 min-w-[140px] flex-1 bg-transparent text-base font-normal focus:outline-none'
                placeholder='Type and press Enter'
                aria-label='Add tag'
              />
            </div>

            {isSuggestionsOpen && tagQuery.trim().length > 0 && (
              <div className='bg-background border-stepper-border absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border shadow-md'>
                <ul className='py-1'>
                  {projectTags
                    .filter(
                      t =>
                        !tags.includes(t.value) &&
                        (t.label
                          .toLowerCase()
                          .includes(tagQuery.toLowerCase()) ||
                          t.value
                            .toLowerCase()
                            .includes(tagQuery.toLowerCase()))
                    )
                    .map(t => (
                      <li key={t.value}>
                        <button
                          type='button'
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleAddTag(t.value)}
                          className='hover:bg-stepper-foreground text-card w-full px-3 py-2 text-left'
                        >
                          {t.label}
                        </button>
                      </li>
                    ))}

                  {!projectTags.some(
                    t =>
                      t.value.toLowerCase() === tagQuery.toLowerCase() ||
                      t.label.toLowerCase() === tagQuery.toLowerCase()
                  ) &&
                    !tags.includes(tagQuery.trim()) && (
                      <li>
                        <button
                          type='button'
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleAddTag(tagQuery)}
                          className='hover:bg-stepper-foreground text-card/80 w-full px-3 py-2 text-left'
                        >
                          Create "{tagQuery.trim()}"
                        </button>
                      </li>
                    )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <button
          type='button'
          disabled={!isFormValid}
          onClick={handleNext}
          className={`mt-4 w-[171px] rounded-[10px] px-4 py-2 text-base font-medium transition-colors ${
            isFormValid
              ? 'bg-primary text-background border-primary border'
              : 'bg-stepper-foreground text-card/30 border-stepper-border cursor-not-allowed border'
          }`}
        >
          Set Milestone
        </button>
      </div>
    </div>
  );
}

export default ProjectSubmissionForm;
