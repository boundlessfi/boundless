import React from 'react';
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = generatePageMetadata('privacy');

const PrivacyPage = () => {
  return <PrivacyContent />;
};

export default PrivacyPage;
