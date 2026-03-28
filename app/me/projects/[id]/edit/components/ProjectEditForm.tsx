'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSubmitProjectEdit } from '@/features/projects/hooks/use-project-queries';
import type { Project, ProjectEditChanges } from '@/features/projects/types';

const CATEGORIES = [
  'DeFi & Finance',
  'Gaming & Metaverse',
  'Social & Community',
  'Infrastructure & Tooling',
  'AI & Machine Learning',
  'Sustainability & Impact',
  'Other',
];

interface ProjectEditFormProps {
  project: Project;
}

export function ProjectEditForm({ project }: ProjectEditFormProps) {
  const router = useRouter();
  const editMutation = useSubmitProjectEdit(project.id);

  const [formData, setFormData] = useState({
    title: project.title,
    tagline: project.tagline ?? '',
    description: project.description ?? '',
    summary: project.summary ?? '',
    category: project.category,
    tags: project.tags ?? [],
    socialLinks: project.socialLinks ?? {},
    contact: project.contact ?? { primary: '', backup: '' },
  });

  const [tagInput, setTagInput] = useState('');

  // Track what changed compared to original
  const hasChanges = useMemo(() => {
    return (
      formData.title !== project.title ||
      formData.tagline !== (project.tagline ?? '') ||
      formData.description !== (project.description ?? '') ||
      formData.summary !== (project.summary ?? '') ||
      formData.category !== project.category ||
      JSON.stringify(formData.tags) !== JSON.stringify(project.tags ?? []) ||
      JSON.stringify(formData.socialLinks) !==
        JSON.stringify(project.socialLinks ?? {}) ||
      JSON.stringify(formData.contact) !==
        JSON.stringify(project.contact ?? { primary: '', backup: '' })
    );
  }, [formData, project]);

  // Determine if changes are major (title or category changed)
  const isMajorChange = useMemo(() => {
    return (
      formData.title !== project.title || formData.category !== project.category
    );
  }, [formData.title, formData.category, project.title, project.category]);

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: url },
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      handleFieldChange('tags', [...formData.tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleFieldChange(
      'tags',
      formData.tags.filter((t: string) => t !== tag)
    );
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    // Build changes payload — only include fields that actually changed
    const changes: ProjectEditChanges = {};
    if (formData.title !== project.title) changes.title = formData.title;
    if (formData.tagline !== (project.tagline ?? ''))
      changes.tagline = formData.tagline;
    if (formData.description !== (project.description ?? ''))
      changes.description = formData.description;
    if (formData.summary !== (project.summary ?? ''))
      changes.summary = formData.summary;
    if (formData.category !== project.category)
      changes.category = formData.category;
    if (JSON.stringify(formData.tags) !== JSON.stringify(project.tags ?? []))
      changes.tags = formData.tags;
    if (
      JSON.stringify(formData.socialLinks) !==
      JSON.stringify(project.socialLinks ?? {})
    )
      changes.socialLinks = formData.socialLinks;
    if (
      JSON.stringify(formData.contact) !==
      JSON.stringify(project.contact ?? { primary: '', backup: '' })
    )
      changes.contact = formData.contact;

    const editType = isMajorChange ? 'MAJOR' : 'MINOR';

    try {
      await editMutation.mutateAsync({
        editType,
        changes,
      });

      if (editType === 'MAJOR') {
        toast.success(
          'Edit submitted for review. Your project will be updated once approved.'
        );
      } else {
        toast.success('Project updated successfully.');
      }
      router.push('/me/projects');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save changes';
      toast.error(message);
    }
  };

  return (
    <div className='relative container mx-auto max-w-4xl px-4 py-8'>
      {/* Sticky header */}
      <div className='sticky top-0 z-50 mb-8 flex items-center justify-between bg-[#0a0a0a] py-4'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/me/projects'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-white'>Edit Project</h1>
            <p className='text-sm text-white/50'>{project.title}</p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || editMutation.isPending}
          className='bg-primary hover:bg-primary/90 flex items-center gap-2 text-black'
        >
          {editMutation.isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Save className='h-4 w-4' />
          )}
          {editMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Major change warning */}
      {isMajorChange && (
        <div className='mb-6 flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4'>
          <Info className='mt-0.5 h-5 w-5 shrink-0 text-yellow-400' />
          <div className='text-sm text-yellow-200'>
            <p className='font-medium'>Major change detected</p>
            <p className='mt-1 text-yellow-200/70'>
              Changing the project title or category requires admin review. Your
              project will be temporarily moved to &quot;In Review&quot; status
              until approved.
            </p>
          </div>
        </div>
      )}

      <div className='space-y-10'>
        {/* Basic Information */}
        <section className='space-y-4'>
          <h2 className='text-xl font-semibold text-white'>
            Basic Information
          </h2>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='title' className='text-sm font-medium text-white'>
                Title <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='title'
                value={formData.title}
                onChange={e => handleFieldChange('title', e.target.value)}
                placeholder='Project title'
                className='border-[#484848] bg-[#1A1A1A] text-white placeholder:text-[#919191]'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='category'
                className='text-sm font-medium text-white'
              >
                Category <span className='text-red-500'>*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={value => handleFieldChange('category', value)}
              >
                <SelectTrigger className='border-[#484848] bg-[#1A1A1A] text-white'>
                  <SelectValue placeholder='Select a category' />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='tagline' className='text-sm font-medium text-white'>
              Tagline
            </Label>
            <Input
              id='tagline'
              value={formData.tagline}
              onChange={e => handleFieldChange('tagline', e.target.value)}
              placeholder='A short, catchy tagline for your project'
              maxLength={120}
              className='border-[#484848] bg-[#1A1A1A] text-white placeholder:text-[#919191]'
            />
            <p className='text-right text-xs text-white/40'>
              {formData.tagline.length}/120
            </p>
          </div>
        </section>

        {/* Description & Summary */}
        <section className='space-y-4'>
          <h2 className='text-xl font-semibold text-white'>Details</h2>

          <div className='space-y-2'>
            <Label
              htmlFor='description'
              className='text-sm font-medium text-white'
            >
              Description <span className='text-red-500'>*</span>
            </Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={e => handleFieldChange('description', e.target.value)}
              placeholder='Describe your project in detail...'
              className='min-h-40 resize-y border-[#484848] bg-[#1A1A1A] text-white placeholder:text-[#919191]'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='summary' className='text-sm font-medium text-white'>
              Summary
            </Label>
            <Textarea
              id='summary'
              value={formData.summary}
              onChange={e => handleFieldChange('summary', e.target.value)}
              placeholder='A brief summary of your project'
              maxLength={300}
              className='min-h-24 resize-y border-[#484848] bg-[#1A1A1A] text-white placeholder:text-[#919191]'
            />
            <p className='text-right text-xs text-white/40'>
              {formData.summary.length}/300
            </p>
          </div>
        </section>

        {/* Tags */}
        <section className='space-y-4'>
          <h2 className='text-xl font-semibold text-white'>Tags</h2>
          <div className='flex gap-2'>
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder='Add a tag and press Enter'
              className='border-[#484848] bg-[#1A1A1A] text-white placeholder:text-[#919191]'
            />
            <Button
              type='button'
              variant='outline'
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {formData.tags.map((tag: string) => (
                <span
                  key={tag}
                  className='inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white'
                >
                  {tag}
                  <button
                    type='button'
                    onClick={() => handleRemoveTag(tag)}
                    className='text-white/50 transition-colors hover:text-white'
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Contact */}
        <section className='space-y-4'>
          <h2 className='text-xl font-semibold text-white'>Contact</h2>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label
                htmlFor='contact-primary'
                className='text-sm font-medium text-white'
              >
                Primary (Telegram)
              </Label>
              <div className='relative'>
                <span className='absolute top-1/2 left-3 -translate-y-1/2 text-[#B5B5B5]'>
                  @
                </span>
                <Input
                  id='contact-primary'
                  value={(formData.contact.primary ?? '').replace('@', '')}
                  onChange={e =>
                    handleFieldChange('contact', {
                      ...formData.contact,
                      primary: `@${e.target.value.replace('@', '')}`,
                    })
                  }
                  placeholder='username'
                  className='border-[#484848] bg-[#1A1A1A] pl-8 text-white placeholder:text-[#919191]'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='contact-backup'
                className='text-sm font-medium text-white'
              >
                Backup (Discord / WhatsApp)
              </Label>
              <Input
                id='contact-backup'
                value={formData.contact.backup ?? ''}
                onChange={e =>
                  handleFieldChange('contact', {
                    ...formData.contact,
                    backup: e.target.value,
                  })
                }
                placeholder='Discord user or WhatsApp number'
                className='border-[#484848] bg-[#1A1A1A] text-white placeholder:text-[#919191]'
              />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className='space-y-4'>
          <h2 className='text-xl font-semibold text-white'>Social Links</h2>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {['twitter', 'discord', 'telegram'].map(platform => (
              <div key={platform} className='space-y-2'>
                <Label className='text-sm text-white/70 capitalize'>
                  {platform}
                </Label>
                <Input
                  value={formData.socialLinks[platform] ?? ''}
                  onChange={e =>
                    handleSocialLinkChange(platform, e.target.value)
                  }
                  placeholder={`${platform} link or handle`}
                  className='border-[#484848] bg-[#1A1A1A] text-white placeholder:text-[#919191]'
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
