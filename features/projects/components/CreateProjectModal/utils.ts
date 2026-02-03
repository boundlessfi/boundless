import { CreateCrowdfundingProjectRequest } from '@/lib/api/types';
import { ProjectFormData } from './types';

export const mapFormDataToApiRequest = (
  data: ProjectFormData
): CreateCrowdfundingProjectRequest => {
  const basic = data.basic || {};
  const details = data.details || {};
  const milestones = data.milestones || {
    fundingAmount: '0',
    milestones: [],
  };
  const team = data.team || { members: [] };
  const contact = data.contact || {
    telegram: '',
    backupType: 'whatsapp',
    backupContact: '',
  };

  // Convert milestones to API format
  const apiMilestones = (milestones.milestones || []).map(
    (milestone, index) => {
      // Create a date object from the end date string
      const endDate = milestone.endDate
        ? new Date(milestone.endDate).toISOString()
        : new Date().toISOString();

      // Calculate percentage (equal distribution for now as per previous logic)
      // Ideally this should be user definable but keeping it simple for now
      const count = milestones.milestones?.length || 1;
      const percentage = parseFloat((100 / count).toFixed(2));

      return {
        title: milestone.title,
        description: milestone.description,
        deliverable: milestone.description,
        expectedDeliveryDate: endDate,
        fundingPercentage: percentage,
        orderIndex: index,
        amount:
          (percentage / 100) *
          (parseFloat(milestones.fundingAmount || '0') || 0),
      };
    }
  );

  // Convert team members to API format
  const apiTeam = (team.members || []).map(member => ({
    name: member.email.split('@')[0], // Extract name from email
    role: 'MEMBER', // Default role for all members
    email: member.email,
  }));

  // Convert social links to API format
  const socialLinks = basic.socialLinks?.filter(link => link.trim()) || [];
  const apiSocialLinks = socialLinks.map(link => ({
    platform: link.startsWith('https://twitter.com/')
      ? 'twitter'
      : link.startsWith('https://discord.gg/')
        ? 'discord'
        : link.startsWith('https://t.me/')
          ? 'telegram'
          : 'other', // Default platform
    url: link,
  }));

  return {
    title: basic.projectName || '',
    logo: basic.logoUrl || '',
    banner: basic.bannerUrl || undefined,
    vision: basic.vision || '',
    category: basic.category || '',
    details: details.vision || '',
    fundingAmount: parseFloat(milestones.fundingAmount || '0') || 0,
    githubUrl: basic.githubUrl || undefined,
    gitlabUrl: undefined,
    bitbucketUrl: undefined,
    projectWebsite: basic.websiteUrl || undefined,
    demoVideo: basic.demoVideoUrl || undefined,
    milestones: apiMilestones,
    team: apiTeam,
    contact: {
      primary: `@${contact.telegram || ''}`,
      backup: contact.backupContact || '',
    },
    socialLinks: apiSocialLinks,
    escrowId: '',
    transactionHash: '',
  };
};
