import React from 'react';
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import CodeOfConductContent from './CodeOfConductContent';

export const metadata: Metadata = generatePageMetadata('codeOfConduct');

const CodeOfConductPage = () => {
  return <CodeOfConductContent />;
};

export default CodeOfConductPage;
