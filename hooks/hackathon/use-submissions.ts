import { useState, useMemo } from 'react';
import { useHackathonData } from '@/lib/providers/hackathonProvider';

export function useSubmissions() {
  const { submissions } = useHackathonData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Most Upvoted', value: 'upvotes_high' },
    { label: 'Least Upvoted', value: 'upvotes_low' },
    { label: 'Highest Score', value: 'score_high' },
    { label: 'Most Commented', value: 'comments_high' },
  ];

  const categoryOptions = useMemo(() => {
    const categoriesSet = new Set<string>();
    submissions.forEach(sub => {
      if (sub.category) categoriesSet.add(sub.category);
      if (sub.categories) sub.categories.forEach(cat => categoriesSet.add(cat));
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
          sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          cat => cat.toLowerCase() === selectedCategory.toLowerCase()
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
