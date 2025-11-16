import { useContext } from 'react';
import { OrganizationContext } from './OrganizationProvider';
import { OrganizationContextValue } from './organization-types';

/**
 * Custom hook to access organization context
 *
 * @returns OrganizationContextValue - The organization context value
 * @throws Error if used outside of OrganizationProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { activeOrg, organizations, setActiveOrg } = useOrganization();
 *
 *   return (
 *     <div>
 *       <h1>{activeOrg?.name}</h1>
 *       <select onChange={(e) => setActiveOrg(e.target.value)}>
 *         {organizations.map(org => (
 *           <option key={org._id} value={org._id}>{org.name}</option>
 *         ))}
 *       </select>
 *     </div>
 *   );
 * }
 * ```
 */
export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);

  if (context === undefined) {
    throw new Error(
      'useOrganization must be used within an OrganizationProvider'
    );
  }

  return context;
}

/**
 * Hook to get only the active organization
 *
 * @returns The active organization or null
 *
 * @example
 * ```tsx
 * function OrganizationHeader() {
 *   const activeOrg = useActiveOrganization();
 *
 *   if (!activeOrg) return null;
 *
 *   return <h1>{activeOrg.name}</h1>;
 * }
 * ```
 */
export function useActiveOrganization() {
  const { activeOrg } = useOrganization();
  return activeOrg;
}

/**
 * Hook to get only the organizations list
 *
 * @returns Array of organization summaries
 *
 * @example
 * ```tsx
 * function OrganizationList() {
 *   const organizations = useOrganizations();
 *
 *   return (
 *     <ul>
 *       {organizations.map(org => (
 *         <li key={org._id}>{org.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useOrganizations() {
  const { organizations } = useOrganization();
  return organizations;
}

/**
 * Hook to get organization loading states
 *
 * @returns Object with loading states
 *
 * @example
 * ```tsx
 * function OrganizationLoader() {
 *   const { isLoading, isLoadingOrganizations, isLoadingActiveOrg } = useOrganizationLoading();
 *
 *   if (isLoading) return <Spinner />;
 *   if (isLoadingOrganizations) return <Text>Loading organizations...</Text>;
 *   if (isLoadingActiveOrg) return <Text>Loading organization details...</Text>;
 *
 *   return null;
 * }
 * ```
 */
export function useOrganizationLoading() {
  const { isLoading, isLoadingOrganizations, isLoadingActiveOrg } =
    useOrganization();
  return { isLoading, isLoadingOrganizations, isLoadingActiveOrg };
}

/**
 * Hook to get organization error states
 *
 * @returns Object with error states
 *
 * @example
 * ```tsx
 * function OrganizationError() {
 *   const { error, organizationsError, activeOrgError } = useOrganizationErrors();
 *
 *   if (error) return <Alert type="error">{error}</Alert>;
 *   if (organizationsError) return <Alert type="error">{organizationsError}</Alert>;
 *   if (activeOrgError) return <Alert type="error">{activeOrgError}</Alert>;
 *
 *   return null;
 * }
 * ```
 */
export function useOrganizationErrors() {
  const { error, organizationsError, activeOrgError } = useOrganization();
  return { error, organizationsError, activeOrgError };
}

/**
 * Hook to get organization management functions
 *
 * @returns Object with management functions
 *
 * @example
 * ```tsx
 * function OrganizationManager() {
 *   const {
 *     createOrganization,
 *     updateOrganization,
 *     deleteOrganization,
 *     inviteMember,
 *     removeMember
 *   } = useOrganizationManagement();
 *
 *   const handleCreate = async (data) => {
 *     try {
 *       await createOrganization(data);
 *       toast.success('Organization created!');
 *     } catch (error) {
 *       toast.error('Failed to create organization');
 *     }
 *   };
 *
 *   return <button onClick={() => handleCreate({ name: 'New Org' })}>Create</button>;
 * }
 * ```
 */
export function useOrganizationManagement() {
  const {
    createOrganization,
    updateOrganization,
    deleteOrganization,
    inviteMember,
    removeMember,
    addHackathon,
    removeHackathon,
    addGrant,
    removeGrant,
  } = useOrganization();

  return {
    createOrganization,
    updateOrganization,
    deleteOrganization,
    inviteMember,
    removeMember,
    addHackathon,
    removeHackathon,
    addGrant,
    removeGrant,
  };
}

/**
 * Hook to get organization utility functions
 *
 * @returns Object with utility functions
 *
 * @example
 * ```tsx
 * function OrganizationUtils() {
 *   const {
 *     isOwner,
 *     isMember,
 *     canManage,
 *     getProfileCompletionStatus
 *   } = useOrganizationUtils();
 *
 *   const canEdit = canManage();
 *   const profileStatus = getProfileCompletionStatus();
 *
 *   return (
 *     <div>
 *       {canEdit && <EditButton />}
 *       <ProfileCompletion percentage={profileStatus.percentage} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useOrganizationUtils() {
  const {
    isOwner,
    isMember,
    canManage,
    getProfileCompletionStatus,
    getOrganizationById,
  } = useOrganization();

  return {
    isOwner,
    isMember,
    canManage,
    getProfileCompletionStatus,
    getOrganizationById,
  };
}

/**
 * Hook to get organization refresh functions
 * 
 * @returns Object with refresh functions
 * 
 * @example
 * ```tsx
 * function RefreshButton() {
 *   const { refreshOrganization, refreshOrganizations, refreshAll } = useOrganizationRefresh();
 *   
 *   return (
 *     <div>
 *       <button onClick={refreshOrganization}>Refresh Current</button>
       <button onClick={refreshOrganizations}>Refresh List</button>
       <button onClick={refreshAll}>Refresh All</button>
     </div>
   );
 * }
 * ```
 */
export function useOrganizationRefresh() {
  const { refreshOrganization, refreshOrganizations, refreshAll } =
    useOrganization();
  return { refreshOrganization, refreshOrganizations, refreshAll };
}

/**
 * Hook to get organization switching functions
 *
 * @returns Object with switching functions
 *
 * @example
 * ```tsx
 * function OrganizationSwitcher() {
 *   const { activeOrgId, organizations, setActiveOrg } = useOrganizationSwitching();
 *
 *   return (
 *     <select value={activeOrgId || ''} onChange={(e) => setActiveOrg(e.target.value)}>
 *       {organizations.map(org => (
 *         <option key={org._id} value={org._id}>{org.name}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useOrganizationSwitching() {
  const { activeOrgId, organizations, setActiveOrg } = useOrganization();
  return { activeOrgId, organizations, setActiveOrg };
}

/**
 * Hook to get organization statistics
 *
 * @returns Object with organization statistics
 *
 * @example
 * ```tsx
 * function OrganizationStats() {
 *   const { activeOrg } = useOrganization();
 *
 *   if (!activeOrg) return null;
 *
 *   return (
 *     <div>
 *       <p>Members: {activeOrg.members.length}</p>
 *       <p>Hackathons: {activeOrg.hackathons.length}</p>
 *       <p>Grants: {activeOrg.grants.length}</p>
 *       <p>Profile Complete: {activeOrg.isProfileComplete ? 'Yes' : 'No'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useOrganizationStats() {
  const { activeOrg } = useOrganization();

  if (!activeOrg) {
    return {
      memberCount: 0,
      hackathonCount: 0,
      grantCount: 0,
      pendingInviteCount: 0,
      isProfileComplete: false,
    };
  }

  return {
    memberCount: activeOrg.members.length,
    hackathonCount: activeOrg.hackathons.length,
    grantCount: activeOrg.grants.length,
    pendingInviteCount: activeOrg.pendingInvites.length,
    isProfileComplete: activeOrg.isProfileComplete,
  };
}

/**
 * Hook to get organization profile completion status
 *
 * @returns Object with profile completion information
 *
 * @example
 * ```tsx
 * function ProfileCompletion() {
 *   const { isComplete, percentage, missingFields } = useOrganizationProfileCompletion();
 *
 *   return (
 *     <div>
 *       <ProgressBar value={percentage} />
 *       {!isComplete && (
 *         <ul>
 *           {missingFields.map(field => (
 *             <li key={field}>{field}</li>
 *           ))}
 *         </ul>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useOrganizationProfileCompletion() {
  const { getProfileCompletionStatus } = useOrganization();
  return getProfileCompletionStatus();
}

/**
 * Hook to check if user has specific permissions
 *
 * @param orgId - Optional organization ID (defaults to active org)
 * @returns Object with permission checks
 *
 * @example
 * ```tsx
 * function PermissionGate({ children, requiredPermission }) {
 *   const { isOwner, isMember, canManage } = useOrganizationPermissions();
 *
 *   if (requiredPermission === 'owner' && !isOwner()) return null;
 *   if (requiredPermission === 'member' && !isMember()) return null;
 *   if (requiredPermission === 'manage' && !canManage()) return null;
 *
 *   return children;
 * }
 * ```
 */
export function useOrganizationPermissions(orgId?: string) {
  const { isOwner, isMember, canManage } = useOrganization();

  return {
    isOwner: () => isOwner(orgId),
    isMember: () => isMember(orgId),
    canManage: () => canManage(orgId),
  };
}

/**
 * Hook to get organization by ID
 *
 * @param orgId - Organization ID
 * @returns Organization summary or undefined
 *
 * @example
 * ```tsx
 * function OrganizationCard({ orgId }) {
 *   const org = useOrganizationById(orgId);
 *
 *   if (!org) return <div>Organization not found</div>;
 *
 *   return (
 *     <div>
 *       <h3>{org.name}</h3>
 *       <p>{org.tagline}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useOrganizationById(orgId: string) {
  const { getOrganizationById } = useOrganization();
  return getOrganizationById(orgId);
}

// Re-export the main hook as default
export default useOrganization;
