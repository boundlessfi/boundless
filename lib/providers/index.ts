export {
  OrganizationProvider,
  useOrganization,
  OrganizationContext,
} from './OrganizationProvider';

export {
  NavigationLoadingProvider,
  useNavigationLoading,
} from './NavigationLoadingProvider';

export {
  TrustlessWorkProvider,
  useTrustlessWorkConfig,
  TrustlessWorkContext,
} from './TrustlessWorkProvider';

export { EscrowProvider, useEscrowContext } from './EscrowProvider';

export {
  useActiveOrganization,
  useOrganizations,
  useOrganizationLoading,
  useOrganizationErrors,
  useOrganizationManagement,
  useOrganizationUtils,
  useOrganizationRefresh,
  useOrganizationSwitching,
  useOrganizationStats,
  useOrganizationProfileCompletion,
  useOrganizationPermissions,
  useOrganizationById,
  default as useOrganizationHook,
} from './useOrganization';

export type {
  OrganizationSummary,
  UserProfileResponse,
  OrganizationContextValue,
  OrganizationProviderProps,
  OrganizationChangeEvent,
  OrganizationStats,
  OrganizationFormData,
  OrganizationInviteData,
  OrganizationMember,
  OrganizationActivity,
  OrganizationNotificationPreferences,
  OrganizationSettings,
  OrganizationSearchFilters,
  OrganizationPagination,
  OrganizationApiResponse,
  OrganizationContextState,
  OrganizationContextActions,
} from './organization-types';

export {
  organizationToSummary,
  isOrganizationComplete,
  getOrganizationCompletionPercentage,
  getOrganizationMissingFields,
  isUserOwner,
  isUserMember,
  canUserManage,
  getUserRole,
  hasPendingInvites,
  getOrganizationStats,
  sortOrganizationsByName,
  sortOrganizationsByCompletion,
  sortOrganizationsByMemberCount,
  filterOrganizationsByCompletion,
  filterOrganizationsByRole,
  searchOrganizations,
  getOrganizationDisplayName,
  getOrganizationAvatar,
  getOrganizationDescription,
  // isOrganizationActive, // deprecated export; use isOrganizationComplete or status helpers
  getOrganizationAge,
  isNewOrganization,
  getOrganizationActivityLevel,
  formatMemberCount,
  formatHackathonCount,
  formatGrantCount,
  getOrganizationStatusBadge,
  getOrganizationRoleBadge,
  validateOrganizationData,
  sanitizeOrganizationData,
  getOrganizationStorageKey,
  getOrganizationCacheKey,
  isOrganizationDataCached,
  cacheOrganizationData,
  getCachedOrganizationData,
  clearOrganizationCache,
  getOrganizationBreadcrumb,
  getOrganizationSlug,
  isOrganizationNameAvailable,
  generateOrganizationSuggestions,
} from './organization-utils';
