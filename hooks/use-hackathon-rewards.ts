import React, { useState, useEffect, useRef, useCallback } from 'react';
import pLimit from 'p-limit';
// Import Hackathon types
import {
  getJudgingSubmissions,
  getHackathon,
  getHackathonEscrow,
  type Hackathon,
  type HackathonEscrowData,
  type HackathonTrackWinner,
} from '@/lib/api/hackathons';
import { getHackathonWinners } from '@/lib/api/hackathon';
import {
  getJudgingResults,
  type JudgingResult,
} from '@/lib/api/hackathons/judging';
import { getSubmissionDetails } from '@/lib/api/hackathons/participants';
import { getCrowdfundingProject } from '@/features/projects/api';
import { mapJudgingSubmissionsToRewardSubmissions } from '@/lib/utils/rewards-data-mapper';
import { Submission } from '@/components/organization/hackathons/rewards/types';
import { PrizeTier } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import { toast } from 'sonner';
import { reportError } from '@/lib/error-reporting';

const getOrdinalSuffix = (i: number) => {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + 'st';
  }
  if (j === 2 && k !== 12) {
    return i + 'nd';
  }
  if (j === 3 && k !== 13) {
    return i + 'rd';
  }
  return i + 'th';
};

const getDefaultPrizeTiers = (): PrizeTier[] => [
  {
    id: 'tier-1',
    place: '1st Place',
    prizeAmount: '0',
    currency: 'USDC',
    rank: 1,
    passMark: 0,
  },
  {
    id: 'tier-2',
    place: '2nd Place',
    prizeAmount: '0',
    currency: 'USDC',
    rank: 2,
    passMark: 0,
  },
  {
    id: 'tier-3',
    place: '3rd Place',
    prizeAmount: '0',
    currency: 'USDC',
    rank: 3,
    passMark: 0,
  },
];

interface UseHackathonRewardsReturn {
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  escrow: HackathonEscrowData | null;
  prizeTiers: PrizeTier[];
  contractId: string | null;
  isLoading: boolean;
  isLoadingEscrow: boolean;
  isLoadingSubmissions: boolean;
  error: string | null;
  refreshEscrow: () => Promise<void>;
  refetchHackathon: () => Promise<void>;
  resultsPublished: boolean;
  hackathon: Hackathon | null;
  /**
   * Per-track winners stamped by publishResults. Empty until results
   * are published, and empty for OVERALL_ONLY hackathons. The page
   * renders these in a separate section below the rank-based podium.
   */
  trackWinners: HackathonTrackWinner[];
}

export const useHackathonRewards = (
  organizationId: string,
  hackathonId: string
): UseHackathonRewardsReturn => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [escrow, setEscrow] = useState<HackathonEscrowData | null>(null);
  const [prizeTiers, setPrizeTiers] = useState<PrizeTier[]>([]);
  const [contractId, setContractId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEscrow, setIsLoadingEscrow] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [trackWinners, setTrackWinners] = useState<HackathonTrackWinner[]>([]);

  const isFetchingEscrowRef = useRef(false);
  const lastFetchedContractIdRef = useRef<string | null>(null);

  const fetchEscrowData = useCallback(
    async (contractIdToFetch: string) => {
      if (
        isFetchingEscrowRef.current ||
        lastFetchedContractIdRef.current === contractIdToFetch
      ) {
        return;
      }

      isFetchingEscrowRef.current = true;
      lastFetchedContractIdRef.current = contractIdToFetch;
      setIsLoadingEscrow(true);

      try {
        const response = await getHackathonEscrow(organizationId, hackathonId);

        if (response.success && response.data) {
          setEscrow(response.data);
        } else {
          setEscrow(null);
        }
      } catch {
        setEscrow(null);
        lastFetchedContractIdRef.current = null;
      } finally {
        setIsLoadingEscrow(false);
        isFetchingEscrowRef.current = false;
      }
    },
    [organizationId, hackathonId]
  );

  const refreshEscrow = useCallback(async () => {
    if (!contractId) return;
    lastFetchedContractIdRef.current = null;
    await fetchEscrowData(contractId);
  }, [contractId, fetchEscrowData]);

  const fetchHackathon = useCallback(async () => {
    try {
      const response = await getHackathon(hackathonId);
      if (response.success) {
        const fetchedHackathon: Hackathon = response.data;
        setHackathon(fetchedHackathon);

        if (fetchedHackathon.prizeTiers) {
          // Sort: OVERALL tiers first by parsed numeric place ("1st",
          // "2nd", etc.) ascending, then by amount descending; TRACK
          // tiers after, in their original order (which matches the
          // organizer-defined displayOrder). The previous code fell
          // back to rank=999 for any non-numeric place string, which
          // collapsed every track tier to the same slot.
          const indexedTiers = (fetchedHackathon.prizeTiers as any[]).map(
            (tier, i) => ({ tier, originalIndex: i })
          );

          const isTrack = (t: any) => t.kind === 'TRACK';

          const overallEntries = indexedTiers.filter(e => !isTrack(e.tier));
          const trackEntries = indexedTiers.filter(e => isTrack(e.tier));

          overallEntries.sort((a, b) => {
            const rankA = parseInt(
              a.tier.place?.match(/\d+/)?.[0] || '999',
              10
            );
            const rankB = parseInt(
              b.tier.place?.match(/\d+/)?.[0] || '999',
              10
            );
            if (rankA !== rankB) return rankA - rankB;
            const amountA = parseFloat(a.tier.prizeAmount || '0');
            const amountB = parseFloat(b.tier.prizeAmount || '0');
            return amountB - amountA;
          });
          // Track entries keep their original ordering — that matches
          // HackathonTrack.displayOrder on the backend.
          trackEntries.sort((a, b) => a.originalIndex - b.originalIndex);

          const sortedTiers = [...overallEntries, ...trackEntries].map(
            e => e.tier
          );

          const tiers: PrizeTier[] = sortedTiers.map(
            (tier: any, index: number) => {
              // Overall tiers get a numeric rank parsed from "place".
              // Track tiers get a synthetic rank slot AFTER the highest
              // overall rank so existing rank-keyed lookups don't
              // collide with overall ranks. Components that render
              // track winners should branch on `kind === 'TRACK'`
              // instead of relying on this rank value.
              const numericFromPlace = parseInt(
                tier.place?.match(/\d+/)?.[0] || '',
                10
              );
              const parsedRank = !isNaN(numericFromPlace)
                ? numericFromPlace
                : index + 1;
              return {
                id: tier.id || `tier-${index + 1}`,
                place: tier.place || `${getOrdinalSuffix(index + 1)} Place`,
                prizeAmount: tier.prizeAmount?.toString() || '0',
                currency: tier.currency || 'USDC',
                passMark: tier.passMark || 0,
                description: tier.description,
                rank: parsedRank,
                kind: tier.kind,
                trackId: tier.trackId,
              };
            }
          );
          setPrizeTiers(tiers);
        }

        const hackathonContractId =
          fetchedHackathon.contractId || fetchedHackathon.escrowAddress || null;
        if (hackathonContractId) {
          setContractId(hackathonContractId);
        }
      }
    } catch {
      setPrizeTiers(getDefaultPrizeTiers());
    }
  }, [hackathonId]);

  useEffect(() => {
    if (organizationId && hackathonId) {
      fetchHackathon();
    }
  }, [organizationId, hackathonId, fetchHackathon]);

  useEffect(() => {
    if (contractId) {
      if (escrow && escrow.contractId === contractId) {
        lastFetchedContractIdRef.current = contractId;
        return;
      }
      fetchEscrowData(contractId);
    } else {
      setIsLoadingEscrow(false);
      setEscrow(null);
    }
  }, [contractId, escrow, fetchEscrowData]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoadingSubmissions(true);
      setError(null);
      try {
        const response = await getJudgingSubmissions(
          organizationId,
          hackathonId,
          1,
          100,
          'all'
        );
        if (response.success) {
          // response.data may be a plain array or a paginated object { submissions: [...] }
          const rawData = response.data as any;
          const submissionsArray = Array.isArray(rawData)
            ? rawData
            : Array.isArray(rawData?.submissions)
              ? rawData.submissions
              : [];

          const limit = pLimit(5);
          const detailsPromises = submissionsArray.map((sub: any) =>
            limit(async () => {
              try {
                // Standard path for judging submission data
                const subData = sub.submission || sub;
                const partData = sub.participant || sub;

                // Get current profile data safely
                const profile =
                  partData.user?.profile || partData.submitterProfile || {};
                const name =
                  partData.name ||
                  profile.firstName ||
                  profile.name ||
                  (partData as any)?.username;
                const avatar =
                  profile.avatar ||
                  profile.image ||
                  (partData as any)?.image ||
                  (partData as any)?.avatar;

                const isGenericName =
                  !name || name === 'Unknown' || name === 'anonymous';
                const isGenericAvatar =
                  !avatar || avatar.includes('github.com/shadcn.png');

                // If we already have good data, don't re-fetch
                if (!isGenericName && !isGenericAvatar) {
                  return sub;
                }

                // 1. Try resolving via Project ID (best for creator info)
                const pId = sub.projectId || subData.projectId || subData.id;
                if (pId) {
                  try {
                    const project = await getCrowdfundingProject(pId);
                    if (project && project.project && project.project.creator) {
                      const creator = project.project.creator;
                      return {
                        ...sub,
                        participant: {
                          ...partData,
                          name: creator.name || partData.name,
                          username: creator.username || partData.username,
                          image: creator.image,
                          email: creator.email,
                          user: {
                            ...partData.user,
                            name: creator.name,
                            username: creator.username,
                            image: creator.image,
                            email: creator.email,
                            profile: {
                              ...partData.user?.profile,
                              firstName: creator.name?.split(' ')[0] || '',
                              lastName:
                                creator.name?.split(' ').slice(1).join(' ') ||
                                '',
                              username: creator.username,
                              avatar: creator.image,
                              image: creator.image,
                            },
                          },
                        },
                      };
                    }
                  } catch (pErr) {
                    // silent fail for project fetch
                  }
                }

                // 2. Fallback to Submission Details (fetches participant/user object directly)
                const sId = sub.id || subData.id || sub.submissionId;
                if (sId) {
                  try {
                    const detailsRes = await getSubmissionDetails(sId);
                    if (detailsRes.success && detailsRes.data) {
                      const details = detailsRes.data as any;
                      return {
                        ...sub,
                        participant: {
                          ...partData,
                          ...details.participant,
                          user: details.participant?.user || partData.user,
                        },
                      };
                    }
                  } catch (sErr) {
                    // silent fail
                  }
                }

                return sub;
              } catch (err) {
                reportError(err, {
                  context: 'rewards-enrichSubmission',
                  submissionId: sub.id,
                });
                return sub;
              }
            })
          );

          const enrichedSubmissions = await Promise.all(detailsPromises);

          // 3. Fetch Judging Results to get actual rankings
          let mappedSubmissions =
            mapJudgingSubmissionsToRewardSubmissions(enrichedSubmissions);

          try {
            const resultsRes = await getJudgingResults(
              organizationId,
              hackathonId
            );
            if (resultsRes.success && resultsRes.data) {
              const resultsList = resultsRes.data.results || [];

              // Merge rank and scores from results into submissions
              mappedSubmissions = mappedSubmissions.map(sub => {
                const s = sub as any;
                // Try to find result by participantId or submissionId matching various sub IDs
                const result = resultsList.find(
                  r =>
                    r.participantId === sub.id ||
                    r.submissionId === sub.id ||
                    r.submissionId === s.submissionId ||
                    r.participantId === s.participantId
                );

                if (result) {
                  return {
                    ...sub,
                    rank: result.rank,
                    score: Math.round(Number(result.averageScore || 0)),
                    maxScore: 100,
                    averageScore: Number(result.averageScore || 0),
                    projectName: result.projectName || sub.projectName,
                    submissionTitle: result.projectName || sub.submissionTitle,
                  };
                }
                return sub;
              });
            }
          } catch (resultsErr) {
            reportError(resultsErr, {
              context: 'rewards-fetchJudgingResults',
              organizationId,
              hackathonId,
            });
          }

          setSubmissions(mappedSubmissions);
        } else {
          throw new Error('Failed to fetch submissions');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load submissions';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingSubmissions(false);
        setIsLoading(false);
      }
    };

    if (organizationId && hackathonId) {
      fetchSubmissions();
    }
  }, [organizationId, hackathonId]);

  // Post-publish track-winner enrichment.
  //
  // Track winners are stamped on `SubmissionTrackEntry.wonRank`, not on
  // `submission.rank`, so the submissions list above has no idea who
  // won a track. We pull `/judging/winners` (which returns the
  // overall + trackWinners payload) and merge the track-winner info
  // into the corresponding submission rows. Runs only after results
  // are published — pre-publish, trackWinners doesn't exist yet.
  useEffect(() => {
    if (!hackathon?.resultsPublished || !hackathonId) {
      setTrackWinners([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const winnersRes = await getHackathonWinners(hackathonId);
        if (cancelled) return;
        if (!winnersRes.success || !winnersRes.data) {
          setTrackWinners([]);
          return;
        }
        const data = winnersRes.data as {
          trackWinners?: HackathonTrackWinner[];
        };
        const fetched = data.trackWinners ?? [];
        setTrackWinners(fetched);
        if (fetched.length === 0) return;
        const byId = new Map(fetched.map(tw => [tw.submissionId, tw]));
        setSubmissions(prev =>
          prev.map(sub => {
            // Match against the real submission row ID (now threaded
            // through by the mapper). Fall back to `sub.id` for any
            // mapper output that predates the `submissionId` field —
            // older rows would have `id === submissionId` when
            // participant data was missing.
            const tw =
              (sub.submissionId && byId.get(sub.submissionId)) ||
              byId.get(sub.id);
            if (!tw) return sub;
            return {
              ...sub,
              isTrackWinner: true,
              trackId: tw.track.id,
              trackName: tw.track.name,
              trackPrize: tw.prize,
              trackWonRank: tw.wonRank,
            };
          })
        );
      } catch (winnersErr) {
        if (cancelled) return;
        // Best-effort: an unreachable winners endpoint shouldn't kill
        // the rewards page. Overall winners (from judging results) still
        // render; track winners just go missing.
        reportError(winnersErr, {
          context: 'rewards-fetchTrackWinners',
          organizationId,
          hackathonId,
        });
        setTrackWinners([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hackathon?.resultsPublished, hackathonId, organizationId]);

  return {
    submissions,
    setSubmissions,
    escrow,
    prizeTiers,
    contractId,
    isLoading,
    isLoadingEscrow,
    isLoadingSubmissions,
    error,
    refreshEscrow,
    refetchHackathon: fetchHackathon,
    resultsPublished: !!hackathon?.resultsPublished,
    hackathon,
    trackWinners,
  };
};
