import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/api/blog';
import { getHackathons } from '@/lib/api/hackathons';
import { getCrowdfundingProjects } from '@/features/projects/api';
import type { BlogPost } from '@/types/blog';
import type { Hackathon as HackathonAPI } from '@/lib/api/hackathons';
import type { Crowdfunding } from '@/features/projects/types';

// Constants
const SITE_URL = 'https://www.boundlessfi.xyz';
const MAX_ITEMS = 100;

/**
 * Generates the sitemap for the website
 * Includes static pages and dynamically fetched content
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, hackathons, crowdfundingProjects] = await Promise.all([
    fetchBlogPostsSitemap(),
    fetchHackathonsSitemap(),
    fetchCrowdfundingProjectsSitemap(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/waitlist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/code-of-conduct`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/waitlist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/hackathons`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/me`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  return [...staticPages, ...blogPosts, ...hackathons, ...crowdfundingProjects];
}

/**
 * Fetches published blog posts and formats them for sitemap
 * Returns empty array if fetch fails
 */
async function fetchBlogPostsSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await getBlogPosts({
      status: 'PUBLISHED',
      limit: MAX_ITEMS,
    });

    // Validate response
    if (!response?.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data
      .filter((post: BlogPost) => {
        // Validate required fields
        if (!post.slug) {
          return false;
        }
        return true;
      })
      .map((post: BlogPost) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(
          post.updatedAt || post.publishedAt || new Date()
        ),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
  } catch {
    // Silently fail if fetch fails, return empty array
    return [];
  }
}

/**
 * Fetches published hackathons and formats them for sitemap
 * Returns empty array if fetch fails
 */
async function fetchHackathonsSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await getHackathons(1, MAX_ITEMS, {});

    // Validate response
    if (
      !response?.data ||
      !response.data.hackathons ||
      !Array.isArray(response.data.hackathons)
    ) {
      return [];
    }

    return response.data.hackathons
      .filter((hackathon: HackathonAPI) => {
        // Validate required fields
        if (!hackathon.slug) {
          return false;
        }
        return true;
      })
      .map((hackathon: HackathonAPI) => ({
        url: `${SITE_URL}/hackathons/${hackathon.slug}`,
        lastModified: new Date(
          hackathon.updatedAt || hackathon.publishedAt || new Date()
        ),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  } catch {
    // Silently fail if fetch fails, return empty array
    return [];
  }
}

/**
 * Fetches crowdfunding projects and formats them for sitemap
 * Returns empty array if fetch fails
 */
async function fetchCrowdfundingProjectsSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await getCrowdfundingProjects(1, MAX_ITEMS);

    // Validate response
    if (!response?.data.campaigns || !Array.isArray(response.data.campaigns)) {
      return [];
    }

    return response.data.campaigns
      .filter((project: Crowdfunding) => {
        // Validate required fields
        if (!project.id) {
          return false;
        }
        return true;
      })
      .map((project: Crowdfunding) => ({
        url: `${SITE_URL}/projects/${project.id}`,
        lastModified: new Date(project.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  } catch {
    // Silently fail if fetch fails, return empty array
    return [];
  }
}
