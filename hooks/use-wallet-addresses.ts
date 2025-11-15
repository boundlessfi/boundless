import { useState, useEffect } from 'react';
import { validateStellarAddress } from '@/lib/utils/stellar-address-validation';
import type { Submission } from '@/components/organization/hackathons/rewards/types';

interface UseWalletAddressesProps {
  isOpen: boolean;
  winners: Submission[];
}

export const useWalletAddresses = ({
  isOpen,
  winners,
}: UseWalletAddressesProps) => {
  const [walletAddresses, setWalletAddresses] = useState<
    Record<string, string>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const addresses: Record<string, string> = {};
      winners.forEach(winner => {
        if (winner.walletAddress) {
          addresses[winner.id] = winner.walletAddress;
        }
      });
      setWalletAddresses(addresses);
      setErrors({});
    }
  }, [isOpen, winners]);

  const handleWalletAddressChange = (submissionId: string, address: string) => {
    setWalletAddresses(prev => ({
      ...prev,
      [submissionId]: address,
    }));

    if (errors[submissionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[submissionId];
        return newErrors;
      });
    }

    if (address && !validateStellarAddress(address)) {
      setErrors(prev => ({
        ...prev,
        [submissionId]: 'Invalid Stellar address format',
      }));
    }
  };

  return {
    walletAddresses,
    errors,
    setErrors,
    handleWalletAddressChange,
  };
};
