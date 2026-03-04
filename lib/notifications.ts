import { Notification } from '@/types/notifications';

/**
 * Generates a project URL from notification data.
 * Prefers slug over ID for SEO-friendly URLs.
 * 
 * @param data - The notification data object
 * @returns The project URL path, or empty string if neither slug nor ID is available
 */
export const getProjectUrlFromNotification = (
  data: Notification['data']
): string => {
  // Prefer slug over ID for project links
  if (data.projectSlug) {
    return `/projects/${data.projectSlug}`;
  }
  
  // Fallback to ID if slug is not available
  if (data.projectId) {
    return `/projects/${data.projectId}`;
  }
  
  // Return empty string if neither is available
  return '';
};
