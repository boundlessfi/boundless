import { AuthGuard } from '@/components/auth';
import SettingsContent from './SettingsContent';
import Loading from '@/components/Loading';

export default async function SettingsPage() {
  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <SettingsContent />
    </AuthGuard>
  );
}
