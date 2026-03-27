'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Wallet, Key, Link2, Shield, Fingerprint } from 'lucide-react';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { useSmartWallet } from '@/components/providers/smart-wallet-provider';
import WalletOverviewTab from './tabs/WalletOverviewTab';
import SignersTab from './tabs/SignersTab';
import ExternalWalletsTab from './tabs/ExternalWalletsTab';
import ContextRulesTab from './tabs/ContextRulesTab';
import PasskeysTab from './tabs/PasskeysTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Wallet },
  { id: 'passkeys', label: 'Passkeys', icon: Fingerprint },
  { id: 'signers', label: 'Signers', icon: Key },
  { id: 'external-wallets', label: 'External Wallets', icon: Link2 },
  { id: 'context-rules', label: 'Context Rules', icon: Shield },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function WalletSettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabId | null;

  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && TABS.some(t => t.id === tabParam) ? tabParam : 'overview'
  );

  const { walletAddress, walletType, smartWalletAddress } = useWalletContext();
  const { isAvailable: smartWalletAvailable } = useSmartWallet();

  const isSmartWallet = walletType === 'smart';

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-4 sm:p-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-white'>Wallet Settings</h1>
        <p className='mt-1 text-sm text-white/50'>
          Manage your smart wallet, signers, external wallets, and authorization
          rules.
        </p>
      </div>

      {/* Tabs */}
      <div className='flex gap-1 overflow-x-auto rounded-xl border border-white/5 bg-white/2 p-1'>
        {TABS.map(tab => {
          const Icon = tab.icon;
          // Only show advanced tabs for smart wallet users
          if (
            !isSmartWallet &&
            [
              'signers',
              'external-wallets',
              'context-rules',
              'passkeys',
            ].includes(tab.id)
          ) {
            return null;
          }
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              )}
            >
              <Icon className='h-4 w-4' />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className='min-h-[400px]'>
        {activeTab === 'overview' && (
          <WalletOverviewTab
            walletAddress={walletAddress}
            walletType={walletType}
            smartWalletAddress={smartWalletAddress}
            smartWalletAvailable={smartWalletAvailable}
          />
        )}
        {activeTab === 'passkeys' && isSmartWallet && <PasskeysTab />}
        {activeTab === 'signers' && isSmartWallet && <SignersTab />}
        {activeTab === 'external-wallets' && isSmartWallet && (
          <ExternalWalletsTab />
        )}
        {activeTab === 'context-rules' && isSmartWallet && <ContextRulesTab />}
      </div>
    </div>
  );
}
