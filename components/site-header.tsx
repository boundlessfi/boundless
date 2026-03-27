import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenu } from './user/UserMenu';
import { SmartBreadcrumb } from './smart-breadcrumb';
import { WalletTrigger } from './wallet/WalletTrigger';
import { MessagesTrigger } from '@/components/messages/MessagesTrigger';

export function SiteHeader() {
  return (
    <header className='sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center border-b border-white/6 bg-[#0e0c0c]/80 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1.5 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1 text-white/50 hover:text-white/80' />
        <Separator
          orientation='vertical'
          className='mx-2 bg-white/10 data-[orientation=vertical]:h-4'
        />
        <div className='flex flex-col'>
          <SmartBreadcrumb />
        </div>
        <div className='ml-auto flex items-center gap-1.5'>
          <MessagesTrigger />
          <WalletTrigger variant='icon' />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
