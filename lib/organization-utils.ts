import { Organization, OrganizationLinks } from './api/types';

/**
 * Organization Profile Completion Utilities
 *
 * This module provides utilities for checking and calculating organization profile completion status.
 * Profile completion is determined by several criteria:
 * 1. Required fields: name, logo, tagline, about must all be filled
 * 2. At least one link: website, x, github, or others must be present
 * 3. Members: There must be at least one member (besides the owner)
 */

export interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  completedFields: string[];
}

export interface ProfileCompletionCriteria {
  hasRequiredFields: boolean;
  hasAtLeastOneLink: boolean;
  hasMembers: boolean;
}

/**
 * Check if all required profile fields are filled
 */
export const hasRequiredFields = (
  organization: Partial<Organization>
): boolean => {
  return !!(
    organization.name &&
    organization.logo &&
    organization.tagline &&
    organization.about
  );
};

/**
 * Check if at least one link is provided
 */
export const hasAtLeastOneLink = (
  links: Partial<OrganizationLinks>
): boolean => {
  if (!links) return false;

  return Boolean(links.website || links.x || links.github || links.others);
};

/**
 * Check if organization has members (excluding owner)
 */
export const hasMembers = (organization: Partial<Organization>): boolean => {
  if (!organization.members || !Array.isArray(organization.members)) {
    return false;
  }

  const nonOwnerMembers = organization.members.filter(
    member => member !== organization.owner
  );

  return nonOwnerMembers.length > 0;
};

/**
 * Get detailed profile completion criteria
 */
export const getProfileCompletionCriteria = (
  organization: Partial<Organization>
): ProfileCompletionCriteria => {
  return {
    hasRequiredFields: hasRequiredFields(organization),
    hasAtLeastOneLink: hasAtLeastOneLink(organization.links || {}),
    hasMembers: hasMembers(organization),
  };
};

/**
 * Calculate profile completion percentage
 */
export const calculateCompletionPercentage = (
  organization: Partial<Organization>
): number => {
  const criteria = getProfileCompletionCriteria(organization);
  const totalCriteria = 3;
  const completedCriteria = Object.values(criteria).filter(Boolean).length;

  return Math.round((completedCriteria / totalCriteria) * 100);
};

/**
 * Get list of missing fields for profile completion
 */
export const getMissingFields = (
  organization: Partial<Organization>
): string[] => {
  const missing: string[] = [];

  if (!organization.name) missing.push('name');
  if (!organization.logo) missing.push('logo');
  if (!organization.tagline) missing.push('tagline');
  if (!organization.about) missing.push('about');

  const links: Partial<OrganizationLinks> = organization.links || {};
  const hasAnyLink = Boolean(
    links.website || links.x || links.github || links.others
  );
  if (!hasAnyLink) {
    missing.push('links (at least one of: website, x, github, others)');
  }

  if (!hasMembers(organization)) {
    missing.push('members (at least one member besides owner)');
  }

  return missing;
};

/**
 * Get list of completed fields
 */
export const getCompletedFields = (
  organization: Partial<Organization>
): string[] => {
  const completed: string[] = [];

  if (organization.name) completed.push('name');
  if (organization.logo) completed.push('logo');
  if (organization.tagline) completed.push('tagline');
  if (organization.about) completed.push('about');

  const links: Partial<OrganizationLinks> = organization.links || {};
  if (links.website) completed.push('website link');
  if (links.x) completed.push('x (Twitter) link');
  if (links.github) completed.push('github link');
  if (links.others) completed.push('other links');

  if (hasMembers(organization)) {
    completed.push('members');
  }

  return completed;
};

/**
 * Check if organization profile is complete
 */
export const isProfileComplete = (
  organization: Partial<Organization>
): boolean => {
  const criteria = getProfileCompletionCriteria(organization);
  return Object.values(criteria).every(Boolean);
};

/**
 * Get comprehensive profile completion status
 */
export const getProfileCompletionStatus = (
  organization: Partial<Organization>
): ProfileCompletionStatus => {
  const isComplete = isProfileComplete(organization);
  const completionPercentage = calculateCompletionPercentage(organization);
  const missingFields = getMissingFields(organization);
  const completedFields = getCompletedFields(organization);

  return {
    isComplete,
    completionPercentage,
    missingFields,
    completedFields,
  };
};

/**
 * Validate organization data for profile completion
 */
export const validateOrganizationForCompletion = (
  organization: Partial<Organization>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!organization.name || organization.name.trim() === '') {
    errors.push('Organization name is required');
  }

  if (!organization.logo || organization.logo.trim() === '') {
    errors.push('Organization logo is required');
  }

  if (!organization.tagline || organization.tagline.trim() === '') {
    errors.push('Organization tagline is required');
  }

  if (!organization.about || organization.about.trim() === '') {
    errors.push('Organization about section is required');
  }

  const links: Partial<OrganizationLinks> = organization.links || {};
  const hasAnyLink = Boolean(
    links.website || links.x || links.github || links.others
  );
  if (!hasAnyLink) {
    errors.push('At least one social link is required');
  }

  if (!organization.members || !Array.isArray(organization.members)) {
    errors.push('Organization must have members');
  } else {
    const nonOwnerMembers = organization.members.filter(
      member => member !== organization.owner
    );
    if (nonOwnerMembers.length === 0) {
      errors.push(
        'Organization must have at least one member besides the owner'
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get profile completion suggestions
 */
export const getProfileCompletionSuggestions = (
  organization: Partial<Organization>
): string[] => {
  const suggestions: string[] = [];
  const status = getProfileCompletionStatus(organization);

  if (status.missingFields.includes('name')) {
    suggestions.push('Add a clear, descriptive organization name');
  }

  if (status.missingFields.includes('logo')) {
    suggestions.push(
      'Upload a professional logo that represents your organization'
    );
  }

  if (status.missingFields.includes('tagline')) {
    suggestions.push(
      "Write a compelling tagline that describes your organization's mission"
    );
  }

  if (status.missingFields.includes('about')) {
    suggestions.push(
      "Provide a detailed description of your organization's goals and activities"
    );
  }

  if (
    status.missingFields.includes(
      'links (at least one of: website, x, github, others)'
    )
  ) {
    suggestions.push(
      'Add at least one social media or website link to help people connect with your organization'
    );
  }

  if (
    status.missingFields.includes('members (at least one member besides owner)')
  ) {
    suggestions.push(
      'Invite team members to join your organization to complete your profile'
    );
  }

  return suggestions;
};

/**
 * Calculate organization profile score (0-100)
 */
export const calculateProfileScore = (
  organization: Partial<Organization>
): number => {
  getProfileCompletionStatus(organization);
  let score = 0;

  if (organization.name) score += 15;
  if (organization.logo) score += 15;
  if (organization.tagline) score += 15;
  if (organization.about) score += 15;

  const links: Partial<OrganizationLinks> = organization.links || {};
  if (links.website) score += 5;
  if (links.x) score += 5;
  if (links.github) score += 5;
  if (links.others) score += 5;

  if (hasMembers(organization)) {
    score += 20;
  }

  return Math.min(score, 100);
};

/**
 * Get organization profile completeness badge
 */
export const getProfileCompletenessBadge = (
  organization: Partial<Organization>
): {
  level: 'incomplete' | 'partial' | 'complete';
  label: string;
  color: string;
} => {
  const score = calculateProfileScore(organization);

  if (score >= 100) {
    return {
      level: 'complete',
      label: 'Complete',
      color: 'green',
    };
  } else if (score >= 60) {
    return {
      level: 'partial',
      label: 'Partial',
      color: 'yellow',
    };
  } else {
    return {
      level: 'incomplete',
      label: 'Incomplete',
      color: 'red',
    };
  }
};

/**
 * Compare two organizations by profile completeness
 */
export const compareOrganizationsByCompleteness = (
  org1: Partial<Organization>,
  org2: Partial<Organization>
): number => {
  const score1 = calculateProfileScore(org1);
  const score2 = calculateProfileScore(org2);

  return score2 - score1;
};

/**
 * Filter organizations by profile completeness
 */
export const filterOrganizationsByCompleteness = (
  organizations: Partial<Organization>[],
  completeness: 'all' | 'complete' | 'incomplete' | 'partial'
): Partial<Organization>[] => {
  switch (completeness) {
    case 'complete':
      return organizations.filter(org => isProfileComplete(org));
    case 'incomplete':
      return organizations.filter(org => !isProfileComplete(org));
    case 'partial':
      return organizations.filter(org => {
        const score = calculateProfileScore(org);
        return score >= 60 && score < 100;
      });
    default:
      return organizations;
  }
};

/**
 * Get organization profile completion progress
 */
export const getProfileCompletionProgress = (
  organization: Partial<Organization>
): {
  current: number;
  total: number;
  percentage: number;
  steps: Array<{
    name: string;
    completed: boolean;
    required: boolean;
  }>;
} => {
  const steps = [
    {
      name: 'Organization Name',
      completed: !!organization.name,
      required: true,
    },
    {
      name: 'Organization Logo',
      completed: !!organization.logo,
      required: true,
    },
    {
      name: 'Organization Tagline',
      completed: !!organization.tagline,
      required: true,
    },
    {
      name: 'About Section',
      completed: !!organization.about,
      required: true,
    },
    {
      name: 'Social Links',
      completed: hasAtLeastOneLink(organization.links || {}),
      required: true,
    },
    {
      name: 'Team Members',
      completed: hasMembers(organization),
      required: true,
    },
  ];

  const completed = steps.filter(step => step.completed).length;
  const total = steps.length;
  const percentage = Math.round((completed / total) * 100);

  return {
    current: completed,
    total,
    percentage,
    steps,
  };
};
