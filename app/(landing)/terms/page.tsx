import React from 'react';
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import TermsContent from '../privacy/TermsContent';

export const metadata: Metadata = generatePageMetadata('terms');

const TermsPage = () => {
  return <TermsContent />;
};

export default TermsPage;
