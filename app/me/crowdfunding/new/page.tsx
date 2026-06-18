import { redirect } from 'next/navigation';

export default function NewCampaignRedirect() {
  redirect('/crowdfunding/new');
}
