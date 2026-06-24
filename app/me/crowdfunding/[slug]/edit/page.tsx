'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import {
  getCrowdfundingProject,
  updateCrowdfundingProject,
} from '@/features/projects/api';
import { Crowdfunding } from '@/features/projects/types';

import {
  BasicInfoSection,
  DetailsFundingSection,
  RepoLinksSection,
  ProjectLinksSection,
  MilestonesSection,
  TeamSection,
  ContactSocialSection,
} from './components';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CampaignEditPage({ params }: PageProps) {
  const [campaign, setCampaign] = useState<Crowdfunding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const router = useRouter();

  // Form data state
  const [formData, setFormData] = useState({
    // Basic info
    title: '',
    logo: '',
    vision: '',
    category: '',

    // Details & funding
    description: '',
    fundingAmount: 0,
    fundingCurrency: 'USD',

    // Repo links
    githubUrl: '',
    gitlabUrl: '',
    bitbucketUrl: '',

    // Project links
    projectWebsite: '',
    demoVideo: '',

    // Milestones
    milestones: [] as any[],

    // Team
    team: [] as any[],

    // Contact & social
    contact: { primary: '', backup: '' },
    socialLinks: [] as any[],
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const { slug } = await params;
        const data = await getCrowdfundingProject(slug);
        setCampaign(data);

        // Initialize form data
        const project = data.project;
        setFormData({
          title: project.title,
          logo: project.logo,
          vision: project.vision || '',
          category: project.category,
          description: project.description || '',
          fundingAmount: data.fundingGoal,
          fundingCurrency: data.fundingCurrency,
          githubUrl: project.githubUrl,
          gitlabUrl: project.gitlabUrl || '',
          bitbucketUrl: project.bitbucketUrl || '',
          projectWebsite: project.projectWebsite,
          demoVideo: project.demoVideo,
          milestones: Array.isArray(data.milestones) ? data.milestones : [],
          team: Array.isArray(data.team) ? data.team : [],
          contact: data.contact || { primary: '', backup: '' },
          socialLinks: Array.isArray(project.socialLinks)
            ? project.socialLinks
            : [],
        });
      } catch {
        toast.error('Failed to load campaign data');
        router.push('/me/crowdfunding');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [params, router, toast]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!campaign) return;

    setSaving(true);
    try {
      // Prepare update data
      const updateData = {
        projectId: campaign.projectId,
        // Basic info
        title: formData.title,
        logo: formData.logo,
        vision: formData.vision,
        category: formData.category,

        // Details
        details: formData.description,

        // Funding
        fundingAmount: formData.fundingAmount,
        fundingCurrency: formData.fundingCurrency,

        // Links
        githubUrl: formData.githubUrl,
        gitlabUrl: formData.gitlabUrl,
        bitbucketUrl: formData.bitbucketUrl,
        projectWebsite: formData.projectWebsite,
        demoVideo: formData.demoVideo,

        // Team
        team: formData.team,

        // Contact & social
        contact: formData.contact,
        socialLinks: formData.socialLinks,

        // Milestones
        milestones: formData.milestones,
      };

      await updateCrowdfundingProject(campaign.id, updateData);

      setHasChanges(false);
      toast.success('Campaign updated successfully');

      // Redirect back to campaign view
      router.push(`/me/crowdfunding/${campaign.id}`);
    } catch {
      toast.error('Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto max-w-4xl px-4 py-8'>
        <div className='text-center'>Loading...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className='container mx-auto max-w-4xl px-4 py-8'>
        <div className='text-center'>Campaign not found</div>
      </div>
    );
  }

  return (
    <div className='relative container mx-auto px-4 py-8'>
      <div className='sticky top-0 z-100 mb-8 flex items-center justify-between bg-[#0e0c0c] py-4'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' asChild>
            <Link href={`/me/crowdfunding/${campaign.slug}`}>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-white'>Edit Campaign</h1>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className='bg-primary hover:bg-primary/90 flex items-center gap-2 text-black'
        >
          {saving ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Save className='h-4 w-4' />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className='space-y-12 px-4'>
        <div className='space-y-4'>
          <h2 className='flex items-center gap-2 text-xl font-semibold text-white'>
            Basic Information
          </h2>
          <BasicInfoSection
            data={{
              title: formData.title,
              logo: formData.logo,
              vision: formData.vision,
              category: formData.category,
            }}
            onChange={handleFieldChange}
          />
        </div>

        {/* Details & Funding */}
        <div className='space-y-4'>
          <h2 className='flex items-center gap-2 text-xl font-semibold text-white'>
            Details & Funding
          </h2>
          <DetailsFundingSection
            data={{
              description: formData.description,
              fundingAmount: formData.fundingAmount,
              fundingCurrency: formData.fundingCurrency,
            }}
            onChange={handleFieldChange}
          />
        </div>

        {/* Repository Links */}
        <div className='space-y-4'>
          <h2 className='flex items-center gap-2 text-xl font-semibold text-white'>
            Repository Links
          </h2>
          <RepoLinksSection
            data={{
              githubUrl: formData.githubUrl,
              gitlabUrl: formData.gitlabUrl,
              bitbucketUrl: formData.bitbucketUrl,
            }}
            onChange={handleFieldChange}
          />
        </div>

        {/* Project Links */}
        <div className='space-y-4'>
          <h2 className='flex items-center gap-2 text-xl font-semibold text-white'>
            Project Links
          </h2>
          <ProjectLinksSection
            data={{
              projectWebsite: formData.projectWebsite,
              demoVideo: formData.demoVideo,
            }}
            onChange={handleFieldChange}
          />
        </div>

        {/* Milestones */}
        <div className='space-y-4'>
          <h2 className='flex items-center gap-2 text-xl font-semibold text-white'>
            Milestones
          </h2>
          <MilestonesSection
            milestones={formData.milestones}
            onChange={milestones => handleFieldChange('milestones', milestones)}
          />
        </div>

        {/* Team Members */}
        <div className='space-y-4'>
          <h2 className='flex items-center gap-2 text-xl font-semibold text-white'>
            Team Members
          </h2>
          <TeamSection
            team={formData.team}
            onChange={team => handleFieldChange('team', team)}
          />
        </div>

        {/* Contact & Social */}
        <div className='space-y-4'>
          <h2 className='flex items-center gap-2 text-xl font-semibold text-white'>
            Contact & Social Links
          </h2>
          <ContactSocialSection
            data={{
              contact: formData.contact,
              socialLinks: formData.socialLinks,
            }}
            onChange={handleFieldChange}
          />
        </div>
      </div>
    </div>
  );
}
