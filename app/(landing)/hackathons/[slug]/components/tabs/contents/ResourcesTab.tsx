'use client';

import { TabsContent } from '@/components/ui/tabs';
import { ResourcesList } from './resources/index';

const ResourcesTab = () => {
  return (
    <TabsContent value='resources' className='mt-0 w-full outline-none'>
      <ResourcesList />
    </TabsContent>
  );
};

export default ResourcesTab;
