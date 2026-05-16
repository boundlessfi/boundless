import api from '../api';
import { ApiResponse } from '../types';

// ── Types ───────────────────────────────────────────────────────────────

export type TrackEligibility = 'OPT_IN' | 'OPEN';

export type HackathonPrizeStructure =
  | 'OVERALL_ONLY'
  | 'OVERALL_AND_TRACKS'
  | 'TRACKS_ONLY';

export interface TrackCustomQuestion {
  id: string;
  label: string;
  type: 'short' | 'long' | 'url';
  maxLength?: number;
  required?: boolean;
}

export interface TrackRequiredArtifact {
  id: string;
  label: string;
  type: 'figma' | 'github' | 'video' | 'pdf' | 'url';
  required?: boolean;
}

export interface HackathonTrack {
  id: string;
  hackathonId: string;
  slug: string;
  name: string;
  description?: string;
  /** Free-form classifier: 'skill' | 'technology' | 'theme' | 'special'. */
  type?: string;
  eligibility: TrackEligibility;
  displayOrder: number;
  isArchived: boolean;
  /** Number of submissions opted into this track. */
  entryCount: number;
  /** Single open-ended prompt rendered on the submission form. */
  prompt?: string;
  /** Organizer-defined custom questions. Phase B. */
  customQuestions?: TrackCustomQuestion[];
  /** Required artifact slots (e.g. Figma file URL). Phase B. */
  requiredArtifacts?: TrackRequiredArtifact[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackRequest {
  name: string;
  /** Optional. Auto-generated from name if omitted. */
  slug?: string;
  description?: string;
  type?: string;
  eligibility?: TrackEligibility;
  displayOrder?: number;
  prompt?: string;
  customQuestions?: TrackCustomQuestion[];
  requiredArtifacts?: TrackRequiredArtifact[];
}

export interface UpdateTrackRequest {
  name?: string;
  slug?: string;
  description?: string;
  type?: string;
  eligibility?: TrackEligibility;
  displayOrder?: number;
  isArchived?: boolean;
  prompt?: string;
  customQuestions?: TrackCustomQuestion[];
  requiredArtifacts?: TrackRequiredArtifact[];
}

/** Submitter responses to a single track's customization. */
export interface TrackAnswer {
  promptAnswer?: string;
  customAnswers?: Record<string, string>;
  artifacts?: Record<string, string>;
}

/**
 * Shape returned alongside each submission once tracks are wired in.
 * `wonRank` is stamped when results are published; null otherwise.
 * `trackAnswers` carries the submitter's responses to the track's
 * customization (Phase B).
 */
export interface SubmissionTrackEntry {
  trackId: string;
  trackSlug: string;
  trackName: string;
  wonRank: number | null;
  trackAnswers?: TrackAnswer;
}

// ── API ─────────────────────────────────────────────────────────────────

/**
 * Public list of tracks for a hackathon. Pass includeArchived for the
 * organizer view (the management table needs the full set so renames /
 * un-archiving stay visible).
 */
export const listTracks = async (
  idOrSlug: string,
  options?: { includeArchived?: boolean }
): Promise<HackathonTrack[]> => {
  const params = new URLSearchParams();
  if (options?.includeArchived) {
    params.append('includeArchived', 'true');
  }
  const qs = params.toString();
  const url = `/hackathons/${idOrSlug}/tracks${qs ? `?${qs}` : ''}`;
  const res = await api.get<ApiResponse<HackathonTrack[]>>(url);
  return res.data?.data ?? [];
};

/**
 * Organizer view. Includes archived tracks by default; pass
 * `{ includeArchived: false }` to hide them.
 */
export const listOrganizerTracks = async (
  organizationId: string,
  hackathonId: string,
  options?: { includeArchived?: boolean }
): Promise<HackathonTrack[]> => {
  const params = new URLSearchParams();
  if (options?.includeArchived === false) {
    params.append('includeArchived', 'false');
  }
  const qs = params.toString();
  const url = `/organizations/${organizationId}/hackathons/${hackathonId}/tracks${qs ? `?${qs}` : ''}`;
  const res = await api.get<ApiResponse<HackathonTrack[]>>(url);
  return res.data?.data ?? [];
};

export const createTrack = async (
  organizationId: string,
  hackathonId: string,
  data: CreateTrackRequest
): Promise<HackathonTrack> => {
  const res = await api.post<ApiResponse<HackathonTrack>>(
    `/organizations/${organizationId}/hackathons/${hackathonId}/tracks`,
    data
  );
  if (!res.data?.data) throw new Error('Invalid create-track response');
  return res.data.data;
};

export const updateTrack = async (
  organizationId: string,
  hackathonId: string,
  trackId: string,
  data: UpdateTrackRequest
): Promise<HackathonTrack> => {
  const res = await api.patch<ApiResponse<HackathonTrack>>(
    `/organizations/${organizationId}/hackathons/${hackathonId}/tracks/${trackId}`,
    data
  );
  if (!res.data?.data) throw new Error('Invalid update-track response');
  return res.data.data;
};

/**
 * Hard-deletes a track with no entries; soft-archives it otherwise.
 * 204 No Content on success.
 */
export const deleteTrack = async (
  organizationId: string,
  hackathonId: string,
  trackId: string
): Promise<void> => {
  await api.delete(
    `/organizations/${organizationId}/hackathons/${hackathonId}/tracks/${trackId}`
  );
};

export interface BulkOptInResult {
  trackName: string;
  added: number;
  alreadyOptedIn: number;
  skippedDisqualified: number;
  totalSubmissions: number;
  /** Set when the hackathon's tracksMaxPerSubmission was auto-raised. */
  newCap?: number;
}

/**
 * Organizer-only retrofit: opt every existing submission into this track.
 * Use when tracks were added after submissions already exist.
 * Idempotent. Auto-bumps tracksMaxPerSubmission if needed.
 */
export const bulkOptInAllSubmissions = async (
  organizationId: string,
  hackathonId: string,
  trackId: string
): Promise<BulkOptInResult> => {
  const res = await api.post<ApiResponse<BulkOptInResult>>(
    `/organizations/${organizationId}/hackathons/${hackathonId}/tracks/${trackId}/bulk-opt-in`
  );
  if (!res.data?.data) throw new Error('Invalid bulk-opt-in response');
  return res.data.data;
};
