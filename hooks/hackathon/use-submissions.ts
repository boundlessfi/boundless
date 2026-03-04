import { useState, useMemo } from 'react';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { useOrganizationUtils } from '@/lib/providers/useOrganization';
import {
  SubmissionVisibility,
  SubmissionStatusVisibility,
} from '@/lib/api/hackathons';

export function useSubmissions() {
  const {
    currentHackathon,
    submissions: privateSubmissions,
    exploreSubmissions,
  } = useHackathonData();
  const { canManage } = useOrganizationUtils();

  const isOrganizer = currentHackathon
    ? canManage(currentHackathon.organizationId)
    : false;
  const isParticipant = currentHackathon?.isParticipant ?? false;

  // For the public showcase, we prioritize the exploreSubmissions endpoint.
  // If we're an organizer, we might want to see the full list of private submissions.
  const allSubmissions =
    exploreSubmissions.length > 0 ? exploreSubmissions : privateSubmissions;
  const submissions = useMemo(() => {
    if (isOrganizer) return allSubmissions;
    let filtered = allSubmissions;

    // Check who can view submissions
    if (
      currentHackathon?.submissionVisibility ===
        SubmissionVisibility.PARTICIPANTS_ONLY &&
      !isParticipant
    ) {
      return [];
    }

    // Check which submission statuses are visible
    if (
      currentHackathon?.submissionStatusVisibility ===
      SubmissionStatusVisibility.ACCEPTED_SHORTLISTED
    ) {
      filtered = filtered.filter(
        sub => sub.status?.toLowerCase() === 'approved'
      );
    }

    return filtered;
  }, [allSubmissions, isOrganizer, isParticipant, currentHackathon]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Memoize sort options to avoid changing reference each render
  const sortOptions = useMemo(
    () => [
      { label: 'Newest First', value: 'newest' },
      { label: 'Oldest First', value: 'oldest' },
      { label: 'Most Upvoted', value: 'upvotes_high' },
      { label: 'Least Upvoted', value: 'upvotes_low' },
      { label: 'Highest Score', value: 'score_high' },
      { label: 'Most Commented', value: 'comments_high' },
    ],
    []
  );

  const categoryOptions = useMemo(() => {
    const categoriesSet = new Set<string>();
    submissions.forEach(sub => {
      if (sub.category) categoriesSet.add(sub.category);
      if (sub.categories)
        sub.categories.forEach((cat: string) => categoriesSet.add(cat));
    });

    return [
      { label: 'All Categories', value: 'all' },
      ...Array.from(categoriesSet).map(cat => ({
        label: cat,
        value: cat.toLowerCase(),
      })),
    ];
  }, [submissions]);

  const filteredAndSortedSubmissions = useMemo(() => {
    let filtered = submissions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        sub =>
          sub.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.submitterName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(sub => {
        const allCategories = sub.category
          ? [sub.category, ...(sub.categories || [])]
          : sub.categories || [];
        return allCategories.some(
          (cat: string) => cat.toLowerCase() === selectedCategory.toLowerCase()
        );
      });
    }

    // Sort
    const sortValue =
      sortOptions.find(opt => opt.label === selectedSort)?.value || 'newest';

    filtered = [...filtered].sort((a, b) => {
      switch (sortValue) {
        case 'newest':
          if (a.submittedDate && b.submittedDate) {
            return (
              new Date(b.submittedDate).getTime() -
              new Date(a.submittedDate).getTime()
            );
          }
          return 0;
        case 'oldest':
          if (a.submittedDate && b.submittedDate) {
            return (
              new Date(a.submittedDate).getTime() -
              new Date(b.submittedDate).getTime()
            );
          }
          return 0;
        case 'upvotes_high':
          return (
            (b.votes?.current || b.upvotes || 0) -
            (a.votes?.current || a.upvotes || 0)
          );
        case 'upvotes_low':
          return (
            (a.votes?.current || a.upvotes || 0) -
            (b.votes?.current || b.upvotes || 0)
          );
        case 'score_high':
          return (b.score || 0) - (a.score || 0);
        case 'comments_high':
          return (b.comments || 0) - (a.comments || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [submissions, searchTerm, selectedSort, selectedCategory, sortOptions]);

  return {
    submissions: filteredAndSortedSubmissions,
    searchTerm,
    selectedSort,
    selectedCategory,
    sortOptions,
    categoryOptions,
    setSearchTerm,
    setSelectedSort,
    setSelectedCategory,
  };
}
