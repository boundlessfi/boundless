'use client';

import { InitializeEscrowButton } from './InitializeEscrowButton';
import { EscrowDisplay } from './EscrowDisplay';

/**
 * Combined component that includes both the initialize button and escrow display
 * This component shows the button to initialize escrow and displays the result
 */
export const InitializeEscrowSection = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Initialize Escrow</h2>
          <p className='mt-1 text-sm text-gray-600'>
            Create a new multi-release escrow using Trustless Work
          </p>
        </div>
        <InitializeEscrowButton />
      </div>
      <EscrowDisplay />
    </div>
  );
};
