'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu } from 'lucide-react';
import ResponsiveSidebar from './ResponsiveSidebar';
import ProfileTab from './tabs/ProfileTab';
import LinksTab from './tabs/LinksTab';
import MembersTab from './tabs/MembersTab';
import TransferOwnershipTab from './tabs/TransferOwnershipTab';
interface OrganizationSettingsProps {
  organizationId?: string;
  initialData?: {
    name?: string;
    logo?: string;
    tagline?: string;
    about?: string;
  };
}

export default function OrganizationSettings({
  organizationId,
  initialData,
}: OrganizationSettingsProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleProfileSave = () => {
    // TODO: Implement profile save logic
  };

  const handleLinksSave = () => {
    // TODO: Implement links save logic
  };

  const handleMembersSave = () => {
    // TODO: Implement members save logic
  };

  const handleTransferOwnership = () => {
    // TODO: Implement ownership transfer logic
  };

  return (
    <div className='flex-1 bg-black text-white' id={organizationId}>
      <Tabs defaultValue='profile' className='w-full'>
        <div className='border-b border-zinc-800 px-6 md:px-20'>
          <div className='flex items-center gap-4'>
            {/* Hamburger Menu - Visible only on medium screens and below */}
            <button
              onClick={() => setModalOpen(true)}
              className='rounded-lg p-2 transition-colors hover:bg-zinc-800 md:hidden'
              aria-label='Open menu'
            >
              <Menu className='h-5 w-5' />
            </button>
            <div className='h-[50px] w-[0.5px] bg-gray-900 md:hidden' />

            <div className='scrollbar-hide overflow-x-auto'>
              <TabsList className='inline-flex h-auto gap-10 bg-transparent p-0'>
                <TabsTrigger
                  value='profile'
                  className='data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-0 pt-4 pb-3 text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value='links'
                  className='data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-0 pt-4 pb-3 text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
                >
                  Links
                </TabsTrigger>
                <TabsTrigger
                  value='members'
                  className='data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-0 pt-4 pb-3 text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
                >
                  Members
                </TabsTrigger>
                <TabsTrigger
                  value='transfer'
                  className='data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-0 pt-4 pb-3 text-sm font-medium text-zinc-400 transition-all data-[state=active]:text-white data-[state=active]:shadow-none'
                >
                  Transfer Ownership
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <div className='px-6 py-6 md:px-20'>
          <TabsContent value='profile' className='mt-0'>
            <ProfileTab
              organizationId={organizationId as string}
              initialData={initialData}
              onSave={handleProfileSave}
            />{' '}
          </TabsContent>

          <TabsContent value='links' className='mt-0'>
            <LinksTab onSave={handleLinksSave} />
          </TabsContent>

          <TabsContent value='members' className='mt-0'>
            <MembersTab onSave={handleMembersSave} />
          </TabsContent>

          <TabsContent value='transfer' className='mt-0'>
            <TransferOwnershipTab onTransfer={handleTransferOwnership} />
          </TabsContent>
        </div>
      </Tabs>

      <ResponsiveSidebar
        organizationId={organizationId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
