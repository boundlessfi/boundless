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
  {
    id: 'overview',
    label: 'Overview',
    icon: Wallet,
    description: 'Wallet status & balances',
  },
  {
    id: 'passkeys',
    label: 'Passkeys',
    icon: Fingerprint,
    description: 'WebAuthn credentials',
  },
  {
    id: 'signers',
    label: 'Signers',
    icon: Key,
    description: 'On-chain signer management',
  },
  {
    id: 'external-wallets',
    label: 'External Wallets',
    icon: Link2,
    description: 'Freighter, Lobstr & more',
  },
  {
    id: 'context-rules',
    label: 'Context Rules',
    icon: Shield,
    description: 'Authorization policies',
  },
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

  const visibleTabs = TABS.filter(tab => {
    if (
      !isSmartWallet &&
      ['signers', 'external-wallets', 'context-rules', 'passkeys'].includes(
        tab.id
      )
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-8'>
      {/* Header */}
      <div className='mb-6 lg:mb-8'>
        <h1 className='text-2xl font-bold text-white sm:text-3xl'>
          Wallet Settings
        </h1>
        <p className='mt-1 text-sm text-white/50 sm:text-base'>
          Manage your smart wallet, signers, external wallets, and authorization
          rules.
        </p>
      </div>

      {/* Desktop: side-by-side layout / Mobile: stacked */}
      <div className='flex flex-col gap-6 lg:flex-row lg:gap-8'>
        {/* Sidebar nav — desktop */}
        <nav className='hidden w-56 shrink-0 lg:block xl:w-64'>
          <div className='sticky top-20 space-y-1'>
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all',
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  )}
                >
                  <Icon className='h-5 w-5 shrink-0' />
                  <div className='min-w-0'>
                    <div className='text-sm font-medium'>{tab.label}</div>
                    <div
                      className={cn(
                        'truncate text-xs',
                        activeTab === tab.id
                          ? 'text-primary/60'
                          : 'text-white/30'
                      )}
                    >
                      {tab.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile tab bar */}
        <div className='flex gap-1 overflow-x-auto rounded-xl border border-white/5 bg-white/2 p-1 lg:hidden'>
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                )}
              >
                <Icon className='h-4 w-4' />
                <span className='hidden sm:inline'>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content — fills remaining space */}
        <div className='min-h-[400px] min-w-0 flex-1'>
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
          {activeTab === 'context-rules' && isSmartWallet && (
            <ContextRulesTab />
          )}
        </div>
      </div>
    </div>
  );
}
