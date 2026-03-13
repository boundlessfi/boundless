'use client';

import { TabsContent } from '@/components/ui/tabs';

import AnnouncementsIndex from './announcements';

const Announcements = () => {
  return (
    <TabsContent value='announcements' className='mt-0 w-full outline-none'>
      <AnnouncementsIndex />
    </TabsContent>
  );
};

export default Announcements;
