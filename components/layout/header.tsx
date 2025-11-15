'use client';

import React, { useState } from 'react';
import { Input } from '../ui/input';
import { BoundlessButton } from '../buttons';
import { Plus, Search, Menu } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeInUp, slideInFromLeft, slideInFromRight } from '@/lib/motion';
import { WalletButton } from '../wallet/WalletButton';
import { ProjectSheetFlow } from '../project';
import { useProjectSheetStore } from '@/lib/stores/project-sheet-store';
import { useProtectedAction } from '@/hooks/use-protected-action';
import WalletRequiredModal from '../wallet/WalletRequiredModal';

const Header = () => {
  const [open, setOpen] = useState(false);
  const sheet = useProjectSheetStore();

  const {
    executeProtectedAction,
    showWalletModal,
    closeWalletModal,
    handleWalletConnected,
  } = useProtectedAction({
    actionName: 'create project',
    onSuccess: () => {
      sheet.openInitialize();
      setOpen(true);
    },
  });

  return (
    <motion.header
      className='sticky top-0 z-50 flex shrink-0 flex-col items-start gap-4 border-none bg-transparent px-4 py-4 sm:flex-row sm:items-center sm:px-6 sm:py-6 lg:px-8'
      initial='hidden'
      animate='visible'
      variants={fadeInUp}
    >
      {/* Mobile Menu Trigger - Only visible on mobile */}
      <motion.div
        className='flex w-full items-center gap-3 sm:hidden'
        variants={slideInFromLeft}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <SidebarTrigger className='rounded-lg bg-[#2A2A2A] p-2 text-white transition-colors hover:text-gray-300'>
            <Menu className='h-5 w-5' />
          </SidebarTrigger>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Image src='/logo.svg' alt='logo' width={100} height={100} />
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className='flex w-full flex-1 items-center sm:w-auto'
        variants={fadeInUp}
      >
        <div className='relative w-full max-w-md'>
          <motion.span
            className='absolute top-1/2 left-3 -translate-y-1/2 text-gray-400'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Search className='h-4 w-4 sm:h-5 sm:w-5' />
          </motion.span>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Input
              type='text'
              placeholder='Search project...'
              className='h-10 w-full rounded-xl border border-[#2B2B2B] bg-[#1C1C1C] py-2 pr-4 pl-9 text-sm text-white shadow-none placeholder:text-gray-400 focus:ring-0 focus:outline-none sm:h-9 sm:pl-10 sm:text-base'
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4'
        variants={slideInFromRight}
      >
        {/* New Project Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <BoundlessButton
            variant='secondary'
            size='default'
            icon={<Plus className='h-4 w-4 sm:h-5 sm:w-5' />}
            iconPosition='right'
            onClick={async () => {
              await executeProtectedAction(() => {
                sheet.openInitialize();
                setOpen(true);
              });
            }}
          >
            New Project
          </BoundlessButton>
        </motion.div>

        {/* Wallet Connect Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <WalletButton />
        </motion.div>
      </motion.div>
      <ProjectSheetFlow
        open={open || sheet.open}
        onOpenChange={o => {
          setOpen(o);
          sheet.setOpen(o);
        }}
      />

      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName='create project'
        onWalletConnected={handleWalletConnected}
      />
    </motion.header>
  );
};

export default Header;
