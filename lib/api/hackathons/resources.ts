import api from '../api';
import { ApiResponse } from '../types';

export interface HackathonResourceDocument {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'sheet' | 'slide' | 'link' | 'video';
  url: string;
  size?: string;
  description?: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetHackathonResourcesResponse extends ApiResponse<
  HackathonResourceDocument[]
> {
  success: true;
  data: HackathonResourceDocument[];
  message: string;
}

/**
 * Get resources for a hackathon
 */
export const getHackathonResources = async (
  hackathonSlugOrId: string,
  organizationId?: string
): Promise<GetHackathonResourcesResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/resources`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/resources`;
  }

  const res = await api.get(url);
  return res.data;
};
