'use client';

import { useState } from 'react';
import { Project } from '@/types/project';

export function useProjectFilters(projects: Project[]) {
  const [activeTab, setActiveTab] = useState('Projects');
  const [sortFilter, setSortFilter] = useState('Default');
  const [statusFilter, setStatusFilter] = useState('Status');
  const [categoryFilter, setCategoryFilter] = useState('Category');

  const getFilteredProjects = () => {
    if (!projects) return [];

    let filteredProjects = [...projects];

    // Filter by tab type
    if (activeTab === 'Projects') {
      filteredProjects = filteredProjects.filter(
        project => project.type === 'crowdfunding'
      );
    } else if (activeTab === 'Hackathons') {
      filteredProjects = filteredProjects.filter(
        project => project.type === 'hackathon'
      );
    } else if (activeTab === 'Grants') {
      filteredProjects = filteredProjects.filter(
        project => project.type === 'grant'
      );
    }

    // Filter by status
    if (statusFilter !== 'Status') {
      filteredProjects = filteredProjects.filter(
        project => project.status === statusFilter.toLowerCase()
      );
    }

    // Filter by category
    if (categoryFilter !== 'Category') {
      const categoryMap: { [key: string]: string } = {
        Health: 'healthcare',
        Finance: 'defi',
        Environment: 'environment',
        Education: 'education',
        Technology: 'technology',
      };
      const mappedCategory =
        categoryMap[categoryFilter] || categoryFilter.toLowerCase();
      filteredProjects = filteredProjects.filter(
        project => project.category === mappedCategory
      );
    }

    // Sort projects
    if (sortFilter === 'Newest') {
      filteredProjects.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortFilter === 'Oldest') {
      filteredProjects.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return filteredProjects;
  };

  return {
    activeTab,
    setActiveTab,
    sortFilter,
    setSortFilter,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    getFilteredProjects,
  };
}
