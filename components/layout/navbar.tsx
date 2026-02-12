'use client';
import React from 'react';
import { motion } from 'motion/react';
import { fadeInUp, slideInFromLeft, slideInFromRight } from '@/lib/motion';
import { Search, Bell, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  return (
    <motion.nav
      className='border-b border-[#2A2A2A] bg-[#1C1C1C] px-4 py-3'
      initial='hidden'
      animate='visible'
      variants={fadeInUp}
    >
      <div className='flex items-center justify-between'>
        {/* Left side - Search */}
        <motion.div className='max-w-md flex-1' variants={slideInFromLeft}>
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Search...'
              className='border-[#2A2A2A] bg-[#2A2A2A] pl-10 text-white placeholder:text-gray-400'
            />
          </div>
        </motion.div>

        {/* Right side - Actions */}
        <motion.div
          className='flex items-center space-x-4'
          variants={slideInFromRight}
        >
          {/* Notifications */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant='ghost'
              size='icon'
              className='text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
            >
              <Bell className='h-5 w-5' />
            </Button>
          </motion.div>

          {/* User Avatar */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar className='h-8 w-8 cursor-pointer'>
              <AvatarImage src='/api/placeholder/32/32' />
              <AvatarFallback className='bg-blue-500'>
                <User className='h-4 w-4 text-white' />
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
