export interface OrganizationStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': string;
    telephone: string;
    contactType: string;
    email: string;
  };
}

export interface WebSiteStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  description: string;
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

export interface BlogPostingStructuredData {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image: string;
  author: {
    '@type': string;
    name: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage: {
    '@type': string;
    '@id': string;
  };
}

// Generate organization structured data
export function generateOrganizationStructuredData(): string {
  const data: OrganizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Boundless',
    url: 'https://boundlessfi.xyz',
    logo: 'https://res.cloudinary.com/danuy5rqb/image/upload/q_auto/f_auto/v1775418401/Frame_1_tfvjva.png',
    description:
      'Validate, fund, and grow your project with milestone-based support on Stellar.',
    sameAs: [
      'https://twitter.com/boundless',
      'https://linkedin.com/company/boundless',
      'https://github.com/boundless',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-0123',
      contactType: 'customer service',
      email: 'hello@boundlessfi.xyz',
    },
  };

  return JSON.stringify(data);
}

// Generate website structured data
export function generateWebsiteStructuredData(): string {
  const data: WebSiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Boundless',
    url: 'https://boundlessfi.xyz',
    description:
      'Validate, fund, and grow your project with milestone-based support on Stellar.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://boundlessfi.xyz/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return JSON.stringify(data);
}

// Generate blog posting structured data
export function generateBlogPostingStructuredData(post: {
  title: string;
  description: string;
  image: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  url: string;
}): string {
  const data: BlogPostingStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Boundless',
      logo: {
        '@type': 'ImageObject',
        url: 'https://res.cloudinary.com/danuy5rqb/image/upload/q_auto/f_auto/v1775418401/Frame_1_tfvjva.png',
      },
    },
    datePublished: post.publishedTime,
    dateModified: post.modifiedTime || post.publishedTime,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
  };

  return JSON.stringify(data);
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(data);
}
