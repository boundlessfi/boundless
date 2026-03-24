import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from './providers';
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';
import CookieConsent from '@/components/CookieConsent';
import {
  generateOrganizationStructuredData,
  generateWebsiteStructuredData,
} from '@/lib/structured-data';
import NextTopLoader from 'nextjs-toploader';
import DevelopmentStatusModal from '@/components/DevelopmentStatusModal';
import localFont from 'next/font/local';

const gilroy = localFont({
  src: [
    {
      path: '../public/fonts/Gilroy/Fonts/Gilroy-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Gilroy/Fonts/Gilroy-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Gilroy/Fonts/Gilroy-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Gilroy/Fonts/Gilroy-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Gilroy/Fonts/Gilroy-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Gilroy/Fonts/Gilroy-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../public/fonts/Gilroy/Fonts/Gilroy-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-gilroy',
});
const francy = localFont({
  src: [
    {
      path: '../public/fonts/Francy/Francy.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-francy',
});
export const metadata: Metadata = {
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
  ],
  authors: [{ name: 'Boundless Team' }],
  creator: 'Boundless',
  publisher: 'Boundless',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://boundlessfi.xyz',
    siteName: 'Boundless',
    title: 'Boundless - Ideas Made Boundless',
    description:
      'Validate, fund, and grow your project with milestone-based support on Stellar.',
    images: [
      {
        url: 'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
        width: 1200,
        height: 630,
        alt: 'Boundless',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@boundless',
    creator: '@boundless',
    title: 'Boundless - Ideas Made Boundless',
    description:
      'Validate, fund, and grow your project with milestone-based support on Stellar.',
    images: [
      'https://res.cloudinary.com/danuy5rqb/image/upload/v1759143589/bondless-og-image_jufgnu.png',
    ],
  },
  alternates: {
    canonical: 'https://boundlessfi.xyz',
  },
  metadataBase: new URL('https://boundlessfi.xyz'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${francy.variable} ${gilroy.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel='manifest' href='/site.webmanifest' />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: generateOrganizationStructuredData(),
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: generateWebsiteStructuredData(),
          }}
        />
      </head>
      <body className='antialiased'>
        <NextTopLoader color='#2EEDAA' />

        <Providers>
          {children}
          <Toaster />
          <CookieConsent />
          <DevelopmentStatusModal />
        </Providers>
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
