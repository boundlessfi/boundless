import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface HackathonNavTab {
  id: string;
  label: string;
  badge?: number;
}

interface HackathonNavTabsProps {
  tabs: HackathonNavTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function HackathonNavTabs({
  tabs,
  activeTab,
  onTabChange,
}: HackathonNavTabsProps) {
  const handleTabChange = (tabId: string) => {
    onTabChange?.(tabId);
  };

  return (
    <div className='border-primary/20 w-full border-b'>
      <div className='mx-auto max-w-7xl px-6'>
        <ScrollArea className='w-full whitespace-nowrap'>
          <div className='flex items-center gap-1'>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'} `}
                >
                  <div className='flex items-center gap-2'>
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className='bg-primary/20 text-primary rounded-full px-2 py-1 text-xs'>
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <div className='bg-primary absolute right-0 bottom-0 left-0 h-0.5' />
                  )}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      </div>
    </div>
  );
}
