/**
 * KYC (identity verification) status and corresponding badge images.
 * Used in UserMenu and navbar to show verified / pending / rejected state.
 */

export type KycStatus = 'Approved' | 'Declined' | 'In Review';

export const KYC_STATUS_IMAGE: Record<KycStatus, string> = {
  Approved: '/kyc-verified.png',
  Declined: '/kyc-rejected.png',
  'In Review': '/kyc-pending.png',
};

export const KYC_STATUS_ALT: Record<KycStatus, string> = {
  Approved: 'Verified',
  Declined: 'Rejected',
  'In Review': 'Pending',
};

export function getKycImageAndAlt(
  status: KycStatus | null | undefined
): { src: string; alt: string } | null {
  if (!status || !(status in KYC_STATUS_IMAGE)) return null;
  const kycStatus = status as KycStatus;
  return {
    src: KYC_STATUS_IMAGE[kycStatus],
    alt: KYC_STATUS_ALT[kycStatus],
  };
}
