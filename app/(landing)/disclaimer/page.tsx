import React from 'react';
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import DisclaimerContent from './DisclaimerContent';

export const metadata: Metadata = generatePageMetadata('disclaimer');

const DisclaimerPage = () => {
  return <DisclaimerContent />;
};

export default DisclaimerPage;
