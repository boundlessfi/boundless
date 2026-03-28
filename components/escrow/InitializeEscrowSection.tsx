'use client';

import { InitializeEscrowButton } from './InitializeEscrowButton';
import { EscrowDisplay } from './EscrowDisplay';

/**
 * Section combining escrow initialization and display.
 */
export const InitializeEscrowSection = () => {
  return (
    <div className='space-y-6'>
      <InitializeEscrowButton />
      <EscrowDisplay />
    </div>
  );
};
