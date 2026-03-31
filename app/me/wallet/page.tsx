import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import WalletSettingsContent from './WalletSettingsContent';

export default async function WalletSettingsPage() {
  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <WalletSettingsContent />
    </AuthGuard>
  );
}
