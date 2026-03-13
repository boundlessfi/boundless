import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const BasicAvatar = ({
  name,
  username,
  image,
}: {
  name: string;
  username: string;
  image?: string;
}) => {
  return (
    <div className='flex items-center gap-2'>
      <Avatar className='border-primary/20 h-8 w-8 border'>
        <AvatarImage src={image} />
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <p className='w-full max-w-[100px] truncate text-sm font-bold tracking-tight'>
          {name}
        </p>
        <p className='w-full max-w-[100px] truncate text-[10px] text-gray-500'>
          @{username}
        </p>
      </div>
    </div>
  );
};

export default BasicAvatar;
