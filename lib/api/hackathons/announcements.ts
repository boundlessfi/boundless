import { api } from '../api';
import { ApiResponse } from '../types';
import {
  HackathonAnnouncement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../types';

export type {
  HackathonAnnouncement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
};

/**
 * Retrieves all announcements for a hackathon.
 * Drafts are only visible to organizers.
 */
export async function listAnnouncements(
  hackathonIdOrSlug: string,
  page = 1,
  limit = 20
): Promise<HackathonAnnouncement[]> {
  const res = await api.get<ApiResponse<HackathonAnnouncement[]>>(
    `/hackathons/${hackathonIdOrSlug}/announcements?page=${page}&limit=${limit}`
  );
  return res.data.data || [];
}

/**
 * Creates a new announcement for an organization hackathon.
 */
export async function createAnnouncement(
  organizationId: string,
  hackathonIdOrSlug: string,
  payload: CreateAnnouncementRequest
): Promise<HackathonAnnouncement> {
  const res = await api.post<ApiResponse<HackathonAnnouncement>>(
    `/organizations/${organizationId}/hackathons/${hackathonIdOrSlug}/announcements`,
    payload
  );
  if (!res.data.data) throw new Error('No data received');
  return res.data.data;
}

/**
 * Updates an existing announcement for an organization hackathon.
 */
export async function updateAnnouncement(
  organizationId: string,
  hackathonIdOrSlug: string,
  announcementId: string,
  payload: UpdateAnnouncementRequest
): Promise<HackathonAnnouncement> {
  const res = await api.patch<ApiResponse<HackathonAnnouncement>>(
    `/organizations/${organizationId}/hackathons/${hackathonIdOrSlug}/announcements/${announcementId}`,
    payload
  );
  if (!res.data.data) throw new Error('No data received');
  return res.data.data;
}

/**
 * Deletes an announcement for an organization hackathon.
 */
export async function deleteAnnouncement(
  organizationId: string,
  hackathonIdOrSlug: string,
  announcementId: string
): Promise<void> {
  await api.delete(
    `/organizations/${organizationId}/hackathons/${hackathonIdOrSlug}/announcements/${announcementId}`
  );
}

/**
 * Retrieves details of a specific announcement.
 */
export async function getAnnouncementDetails(
  announcementId: string
): Promise<HackathonAnnouncement> {
  const res = await api.get<ApiResponse<HackathonAnnouncement>>(
    `/hackathons/announcements/${announcementId}`
  );
  if (!res.data.data) throw new Error('No data received');
  return res.data.data;
}

/**
 * Publishes a draft announcement for an organization hackathon.
 */
export async function publishAnnouncement(
  organizationId: string,
  hackathonIdOrSlug: string,
  announcementId: string
): Promise<HackathonAnnouncement> {
  const res = await api.post<ApiResponse<HackathonAnnouncement>>(
    `/organizations/${organizationId}/hackathons/${hackathonIdOrSlug}/announcements/${announcementId}/publish`
  );
  if (!res.data.data) throw new Error('No data received');
  return res.data.data;
}
