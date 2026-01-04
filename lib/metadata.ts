import { Metadata } from 'next';
import { BlogPost } from '@/types/blog';

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

export interface BlogPostMetadata extends PageMetadata {
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  category?: string;
}

// Base metadata configuration
const baseMetadata = {
  siteName: 'Boundless',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://boundlessfi.xyz',
  defaultOgImage:
    'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  twitterHandle: '@boundlessfi',
  locale: 'en_US',
  defaultDescription:
    'Validate, fund, and grow your project with milestone-based support on Stellar.',
};

// Utility function to generate absolute image URLs
function getAbsoluteImageUrl(imageUrl: string): string {
  if (!imageUrl) return baseMetadata.defaultOgImage;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${baseMetadata.siteUrl}${imageUrl}`;
}

// Utility function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// Utility function to truncate description for SEO
export function truncateDescription(
  text: string,
  maxLength: number = 160
): string {
  if (!text) return baseMetadata.defaultDescription;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

// Page-specific metadata
export const pageMetadata: Record<string, PageMetadata> = {
  home: {
    title: 'Boundless - Ideas Made Boundless',
    description:
      'Validate, fund, and grow your project with milestone-based support on Stellar.',
    keywords: [
      'crowdfunding',
      'stellar',
      'blockchain',
      'projects',
      'funding',
      'milestones',
      'boundless',
      'stellar blockchain',
    ],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
  about: {
    title: 'About Us - Boundless',
    description:
      'Learn about Boundless and our mission to make ideas boundless through milestone-based funding on Stellar.',
    keywords: ['about', 'mission', 'team', 'vision', 'boundless'],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
  projects: {
    title: 'Projects - Boundless',
    description:
      'Discover innovative projects and campaigns on Boundless. Support creators and bring ideas to life.',
    keywords: [
      'projects',
      'campaigns',
      'crowdfunding',
      'creators',
      'innovation',
    ],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
  grants: {
    title: 'Grants - Boundless',
    description:
      'Apply for grants and funding opportunities on Boundless. Turn your ideas into reality.',
    keywords: ['grants', 'funding', 'opportunities', 'apply', 'support'],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
  hackathons: {
    title: 'Hackathons - Boundless',
    description:
      'Join exciting hackathons and coding challenges on Boundless. Build, innovate, and win.',
    keywords: [
      'hackathons',
      'coding',
      'challenges',
      'innovation',
      'competition',
    ],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
  contact: {
    title: 'Contact Us - Boundless',
    description:
      "Get in touch with the Boundless team. We're here to help with your questions and feedback.",
    keywords: ['contact', 'support', 'help', 'feedback', 'questions'],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
  privacy: {
    title: 'Privacy Policy - Boundless',
    description:
      'Learn about how Boundless protects your privacy and handles your personal information.',
    keywords: ['privacy', 'policy', 'data protection', 'personal information'],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
  terms: {
    title: 'Terms of Service - Boundless',
    description:
      'Read the terms and conditions for using Boundless services and platform.',
    keywords: ['terms', 'service', 'conditions', 'agreement', 'legal'],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
  disclaimer: {
    title: 'Disclaimer - Boundless',
    description:
      'Important disclaimers and legal information about using the Boundless platform.',
    keywords: ['disclaimer', 'legal', 'information', 'terms'],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
  codeOfConduct: {
    title: 'Code of Conduct - Boundless',
    description:
      'Our community guidelines and code of conduct for maintaining a respectful environment.',
    keywords: [
      'code of conduct',
      'community',
      'guidelines',
      'respect',
      'behavior',
    ],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
  waitlist: {
    title: 'Join Waitlist - Boundless',
    description:
      'Join the Boundless waitlist and be among the first to experience the future of project funding.',
    keywords: ['waitlist', 'early access', 'beta', 'signup', 'exclusive'],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
  blog: {
    title: 'Blog - Boundless',
    description:
      'Read the latest insights, updates, and stories from the Boundless community.',
    keywords: ['blog', 'insights', 'updates', 'community', 'news', 'articles'],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
  },
};

// Blog metadata template
export const blogMetadata: Record<string, BlogPostMetadata> = {
  default: {
    title: 'Blog - Boundless',
    description:
      'Read the latest insights, updates, and stories from the Boundless community.',
    keywords: ['blog', 'insights', 'updates', 'community', 'news'],
    ogImage:
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
    category: 'general',
  },
};

// Generate metadata for a specific page
export function generatePageMetadata(
  pageKey: string,
  customMetadata?: Partial<PageMetadata>
): Metadata {
  const pageMeta = pageMetadata[pageKey] || pageMetadata.home;
  const finalMetadata = { ...pageMeta, ...customMetadata };
  const ogImageUrl = getAbsoluteImageUrl(
    finalMetadata.ogImage || baseMetadata.defaultOgImage
  );
  const pageUrl = `${baseMetadata.siteUrl}/${pageKey === 'home' ? '' : pageKey}`;

  return {
    title: finalMetadata.title,
    description: finalMetadata.description,
    keywords: finalMetadata.keywords?.join(', '),

    // Additional metadata
    applicationName: baseMetadata.siteName,
    authors: [{ name: baseMetadata.siteName }],
    creator: baseMetadata.siteName,
    publisher: baseMetadata.siteName,

    // Robots configuration
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    // Open Graph
    openGraph: {
      title: finalMetadata.title,
      description: finalMetadata.description,
      type: 'website',
      url: pageUrl,
      siteName: baseMetadata.siteName,
      locale: baseMetadata.locale,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: finalMetadata.title,
          type: 'image/png',
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: baseMetadata.twitterHandle,
      creator: baseMetadata.twitterHandle,
      title: finalMetadata.title,
      description: finalMetadata.description,
      images: [ogImageUrl],
    },

    // Canonical and alternates
    alternates: {
      canonical: finalMetadata.canonical || pageUrl,
      languages: {
        'en-US': pageUrl,
      },
    },

    // Additional metadata
    other: {
      'og:site_name': baseMetadata.siteName,
      'og:locale': baseMetadata.locale,
    },
  };
}

// Generate metadata for blog posts
export function generateBlogMetadata(
  post: BlogPostMetadata,
  slug: string
): Metadata {
  const blogMeta = blogMetadata.default;
  const finalMetadata = { ...blogMeta, ...post };
  const ogImageUrl = getAbsoluteImageUrl(
    finalMetadata.ogImage || baseMetadata.defaultOgImage
  );
  const blogUrl = `${baseMetadata.siteUrl}/blog/${slug}`;
  const description = truncateDescription(finalMetadata.description);

  return {
    title: finalMetadata.title,
    description,
    keywords: finalMetadata.keywords?.join(', '),
    authors: finalMetadata.author
      ? [{ name: finalMetadata.author }]
      : undefined,

    // Additional metadata
    creator: finalMetadata.author || baseMetadata.siteName,
    publisher: baseMetadata.siteName,

    // Robots configuration
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    // Open Graph
    openGraph: {
      title: finalMetadata.title,
      description,
      type: 'article',
      url: blogUrl,
      siteName: baseMetadata.siteName,
      locale: baseMetadata.locale,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: finalMetadata.title,
          type: 'image/png',
        },
      ],
      publishedTime: finalMetadata.publishedTime,
      modifiedTime: finalMetadata.modifiedTime,
      authors: finalMetadata.author ? [finalMetadata.author] : undefined,
      tags: finalMetadata.tags,
      section: finalMetadata.category,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: baseMetadata.twitterHandle,
      creator: baseMetadata.twitterHandle,
      title: finalMetadata.title,
      description,
      images: [ogImageUrl],
    },

    // Canonical and alternates
    alternates: {
      canonical: finalMetadata.canonical || blogUrl,
      languages: {
        'en-US': blogUrl,
      },
    },

    // Category
    category: finalMetadata.category,

    // Additional metadata
    other: {
      'article:published_time':
        finalMetadata.publishedTime || new Date().toISOString(),
      'article:modified_time':
        finalMetadata.modifiedTime || new Date().toISOString(),
      'article:author': finalMetadata.author || baseMetadata.siteName,
      'article:section': finalMetadata.category || 'general',
      'article:tag': finalMetadata.tags?.join(',') || '',
    },
  };
}

// Generate metadata for individual blog posts with enhanced options
export function generateBlogPostMetadata(post: BlogPost): Metadata {
  const slug = post.slug;
  const blogUrl = `${baseMetadata.siteUrl}/blog/${slug}`;

  const title = post.seoTitle || `${post.title} | Boundless Blog`;
  const description = truncateDescription(post.seoDescription || post.excerpt);
  const keywords = post.seoKeywords || post.tags.map(t => t.tag.name);

  const coverImageUrl = getAbsoluteImageUrl(post.coverImage);

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: post.author.name }],

    // Additional metadata
    creator: post.author.name,
    publisher: baseMetadata.siteName,

    // Robots configuration
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    // Open Graph
    openGraph: {
      title,
      description,
      type: 'article',
      url: blogUrl,
      siteName: baseMetadata.siteName,
      locale: baseMetadata.locale,
      images: [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/jpeg',
        },
      ],
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt || post.createdAt,
      authors: [post.author.name],
      tags: post.tags.map(t => t.tag.name),
      section: post.categories?.[0] || 'Blog',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: baseMetadata.twitterHandle,
      creator: baseMetadata.twitterHandle,
      title,
      description,
      images: [coverImageUrl],
    },

    // Canonical and alternates
    alternates: {
      canonical: blogUrl,
      languages: {
        'en-US': blogUrl,
      },
    },

    // Category
    category: post.categories?.[0] || 'Blog',

    // Additional metadata
    other: {
      'article:published_time': post.createdAt,
      'article:modified_time': post.updatedAt || post.createdAt,
      'article:author': post.author.name,
      'article:section': post.categories?.[0] || 'Blog',
      'article:tag': post.tags.map(t => t.tag.name).join(','),
    },
  };
}

// Generate JSON-LD structured data for blog posts
export function generateBlogPostJsonLd(post: {
  title: string;
  excerpt: string;
  coverImage: string;
  author: {
    name: string;
    image?: string;
    url?: string;
  };
  createdAt: string;
  updatedAt?: string;
  slug?: string;
  category: string;
  tags: string[];
}) {
  const slug = post.slug || generateSlug(post.title);
  const postUrl = `${baseMetadata.siteUrl}/blog/${slug}`;
  const coverImageUrl = getAbsoluteImageUrl(post.coverImage);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: coverImageUrl,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url:
        post.author.url ||
        `${baseMetadata.siteUrl}/author/${generateSlug(post.author.name)}`,
      ...(post.author.image && {
        image: getAbsoluteImageUrl(post.author.image),
      }),
    },
    publisher: {
      '@type': 'Organization',
      name: baseMetadata.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${baseMetadata.siteUrl}/logo.png`,
      },
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    url: postUrl,
    articleSection: post.category,
    keywords: post.tags.join(', '),
  };
}

// Generate breadcrumb JSON-LD
export function generateBreadcrumbJsonLd(post: {
  title: string;
  slug?: string;
  category: string;
}) {
  const slug = post.slug || generateSlug(post.title);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseMetadata.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${baseMetadata.siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.category,
        item: `${baseMetadata.siteUrl}/blog/category/${generateSlug(post.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: post.title,
        item: `${baseMetadata.siteUrl}/blog/${slug}`,
      },
    ],
  };
}

// Generate sitemap data
export function generateSitemapData() {
  const pages = Object.keys(pageMetadata).map(page => ({
    url: `${baseMetadata.siteUrl}/${page === 'home' ? '' : page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: page === 'home' ? 1 : 0.8,
  }));

  return pages;
}

// Generate sitemap entry for blog post
export function generateBlogSitemapEntry(post: {
  slug?: string;
  title: string;
  updatedAt?: string;
  createdAt: string;
}) {
  const slug = post.slug || generateSlug(post.title);

  return {
    url: `${baseMetadata.siteUrl}/blog/${slug}`,
    lastModified: post.updatedAt || post.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  };
}

// Type exports
export type BlogPostMetadataInput = Parameters<
  typeof generateBlogPostMetadata
>[0];
export type BlogPostJsonLd = ReturnType<typeof generateBlogPostJsonLd>;
