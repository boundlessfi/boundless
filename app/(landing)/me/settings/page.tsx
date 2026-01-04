import { AuthGuard } from '@/components/auth';
import SettingsContent from './SettingsContent';

export default async function SettingsPage() {
  return (
    <AuthGuard
      redirectTo='/auth?mode=signin'
      fallback={<div className='p-8 text-center'>Authenticating...</div>}
    >
      <SettingsContent />
    </AuthGuard>
  );
}
