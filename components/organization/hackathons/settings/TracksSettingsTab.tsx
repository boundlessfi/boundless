'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ArchiveRestore,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  bulkOptInAllSubmissions,
  createTrack,
  deleteTrack,
  listOrganizerTracks,
  updateTrack,
  type CreateTrackRequest,
  type HackathonTrack,
  type TrackCustomQuestion,
  type TrackEligibility,
  type TrackRequiredArtifact,
} from '@/lib/api/hackathons/tracks';
import { extractApiErrorMessage } from '@/lib/api/api';

interface TracksSettingsTabProps {
  organizationId: string;
  hackathonId: string;
}

const TRACK_TYPE_OPTIONS = [
  { value: 'skill', label: 'Skill (e.g. Best UI/UX)' },
  { value: 'technology', label: 'Technology (e.g. Best Use of X)' },
  { value: 'theme', label: 'Theme (e.g. DeFi)' },
  { value: 'special', label: 'Special Award' },
] as const;

const ELIGIBILITY_OPTIONS: Array<{
  value: TrackEligibility;
  label: string;
  hint: string;
}> = [
  {
    value: 'OPT_IN',
    label: 'Opt-in',
    hint: 'Submitters explicitly enter this track.',
  },
  {
    value: 'OPEN',
    label: 'Open',
    hint: 'Every submission is auto-eligible. No opt-in row needed.',
  },
];

interface TrackFormState {
  id?: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  eligibility: TrackEligibility;
  displayOrder: number;
  // Phase B customization
  prompt: string;
  customQuestions: TrackCustomQuestion[];
  requiredArtifacts: TrackRequiredArtifact[];
}

const emptyForm = (next: HackathonTrack[] = []): TrackFormState => ({
  name: '',
  slug: '',
  description: '',
  type: 'skill',
  eligibility: 'OPT_IN',
  // Default to (max existing + 10) so the new row lands at the end of the list.
  displayOrder:
    next.length > 0 ? Math.max(...next.map(t => t.displayOrder)) + 10 : 10,
  prompt: '',
  customQuestions: [],
  requiredArtifacts: [],
});

// Generate a stable id used inside customQuestions / requiredArtifacts.
// Doesn't need to be a real cuid; uniqueness within the track is enough.
const tinyId = () =>
  `q-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

export default function TracksSettingsTab({
  organizationId,
  hackathonId,
}: TracksSettingsTabProps) {
  const [tracks, setTracks] = useState<HackathonTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TrackFormState>(emptyForm());
  const [confirmDelete, setConfirmDelete] = useState<HackathonTrack | null>(
    null
  );
  // Retrofit dialog state. Populated when the organizer clicks the
  // "Opt in all submissions" action — we confirm before firing the
  // endpoint because it can touch every submission for the hackathon.
  const [confirmBulkOptIn, setConfirmBulkOptIn] =
    useState<HackathonTrack | null>(null);
  const [bulkOptInBusy, setBulkOptInBusy] = useState(false);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listOrganizerTracks(organizationId, hackathonId);
      setTracks(rows);
    } catch (err) {
      toast.error(extractApiErrorMessage(err) ?? 'Failed to load tracks');
    } finally {
      setLoading(false);
    }
  }, [organizationId, hackathonId]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const openCreate = () => {
    setForm(emptyForm(tracks));
    setDialogOpen(true);
  };

  const openEdit = (track: HackathonTrack) => {
    setForm({
      id: track.id,
      name: track.name,
      slug: track.slug,
      description: track.description ?? '',
      type: track.type ?? '',
      eligibility: track.eligibility,
      displayOrder: track.displayOrder,
      prompt: track.prompt ?? '',
      customQuestions: track.customQuestions ?? [],
      requiredArtifacts: track.requiredArtifacts ?? [],
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Track name is required');
      return;
    }
    setSaving(true);
    try {
      // Strip blank labels before sending — leftover empty rows from
      // accidental "Add" clicks shouldn't reach the backend.
      const cleanedQuestions = form.customQuestions
        .map(q => ({ ...q, label: q.label.trim() }))
        .filter(q => q.label.length > 0);
      const cleanedArtifacts = form.requiredArtifacts
        .map(a => ({ ...a, label: a.label.trim() }))
        .filter(a => a.label.length > 0);
      if (form.id) {
        const updated = await updateTrack(
          organizationId,
          hackathonId,
          form.id,
          {
            name: form.name.trim(),
            slug: form.slug.trim() || undefined,
            description: form.description.trim() || undefined,
            type: form.type || undefined,
            eligibility: form.eligibility,
            displayOrder: form.displayOrder,
            prompt: form.prompt.trim() || undefined,
            customQuestions: cleanedQuestions,
            requiredArtifacts: cleanedArtifacts,
          }
        );
        setTracks(prev =>
          prev.map(t => (t.id === updated.id ? { ...t, ...updated } : t))
        );
        toast.success('Track updated');
      } else {
        const payload: CreateTrackRequest = {
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim() || undefined,
          type: form.type || undefined,
          eligibility: form.eligibility,
          displayOrder: form.displayOrder,
          prompt: form.prompt.trim() || undefined,
          customQuestions: cleanedQuestions,
          requiredArtifacts: cleanedArtifacts,
        };
        const created = await createTrack(organizationId, hackathonId, payload);
        setTracks(prev =>
          [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder)
        );
        toast.success('Track created');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(extractApiErrorMessage(err) ?? 'Failed to save track');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (track: HackathonTrack) => {
    setSaving(true);
    try {
      await deleteTrack(organizationId, hackathonId, track.id);
      // The backend hard-deletes when there are no entries, or archives.
      // Re-fetch so the table reflects whichever happened.
      await fetchTracks();
      toast.success(
        track.entryCount > 0
          ? 'Track archived (had submissions)'
          : 'Track deleted'
      );
    } catch (err) {
      toast.error(extractApiErrorMessage(err) ?? 'Failed to delete track');
    } finally {
      setSaving(false);
      setConfirmDelete(null);
    }
  };

  const handleUnarchive = async (track: HackathonTrack) => {
    setSaving(true);
    try {
      const updated = await updateTrack(organizationId, hackathonId, track.id, {
        isArchived: false,
      });
      setTracks(prev =>
        prev.map(t => (t.id === updated.id ? { ...t, ...updated } : t))
      );
      toast.success('Track restored');
    } catch (err) {
      toast.error(extractApiErrorMessage(err) ?? 'Failed to restore track');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkOptIn = async (track: HackathonTrack) => {
    setBulkOptInBusy(true);
    try {
      const result = await bulkOptInAllSubmissions(
        organizationId,
        hackathonId,
        track.id
      );
      const parts: string[] = [];
      if (result.added > 0) {
        parts.push(
          `${result.added} submission${result.added === 1 ? '' : 's'} added`
        );
      }
      if (result.alreadyOptedIn > 0) {
        parts.push(`${result.alreadyOptedIn} already in`);
      }
      if (result.skippedDisqualified > 0) {
        parts.push(`${result.skippedDisqualified} disqualified skipped`);
      }
      const summary =
        parts.length > 0 ? parts.join(' · ') : 'No changes needed';
      toast.success(
        `${result.trackName}: ${summary}${
          result.newCap
            ? ` · Per-submission cap raised to ${result.newCap}`
            : ''
        }`
      );
      // Refetch so the entryCount column reflects the new state.
      await fetchTracks();
    } catch (err) {
      toast.error(extractApiErrorMessage(err) ?? 'Bulk opt-in failed');
    } finally {
      setBulkOptInBusy(false);
      setConfirmBulkOptIn(null);
    }
  };

  return (
    <div className='bg-background-card rounded-xl border border-gray-900 p-6'>
      <div className='mb-6 flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-xl font-semibold text-white'>Tracks</h2>
          <p className='mt-1 text-sm text-gray-400'>
            Categorical prizes alongside overall placements (e.g. Best UI/UX,
            Best Technical). Submitters opt into tracks at submission time;
            winners are picked from each track&apos;s opted-in pool.
          </p>
        </div>
        <Button onClick={openCreate} className='shrink-0'>
          <Plus className='h-4 w-4' />
          New track
        </Button>
      </div>

      {loading ? (
        <div className='flex justify-center py-12'>
          <Loader2 className='text-primary h-6 w-6 animate-spin' />
        </div>
      ) : tracks.length === 0 ? (
        <div className='rounded-lg border border-dashed border-gray-800 px-6 py-12 text-center'>
          <p className='text-sm text-gray-400'>
            No tracks yet. Create one to unlock track-based prizes in the
            Rewards tab.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead className='text-right'>Entries</TableHead>
              <TableHead className='text-right'>Order</TableHead>
              <TableHead className='w-[120px] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.map(track => (
              <TableRow
                key={track.id}
                className={track.isArchived ? 'opacity-60' : undefined}
              >
                <TableCell>
                  <div className='font-medium text-white'>
                    {track.name}
                    {track.isArchived && (
                      <Badge variant='outline' className='ml-2'>
                        Archived
                      </Badge>
                    )}
                  </div>
                  <div className='text-xs text-gray-500'>/{track.slug}</div>
                  {track.description && (
                    <div className='mt-1 line-clamp-2 text-xs text-gray-400'>
                      {track.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className='text-sm text-gray-400'>
                  {track.type ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      track.eligibility === 'OPT_IN' ? 'default' : 'secondary'
                    }
                  >
                    {track.eligibility === 'OPT_IN' ? 'Opt-in' : 'Open'}
                  </Badge>
                </TableCell>
                <TableCell className='text-right text-gray-300 tabular-nums'>
                  {track.entryCount}
                </TableCell>
                <TableCell className='text-right text-gray-400 tabular-nums'>
                  {track.displayOrder}
                </TableCell>
                <TableCell>
                  <div className='flex justify-end gap-1'>
                    {/* Bulk opt-in: retrofit tool for hackathons where
                        submissions already exist before tracks were
                        added. Hidden for archived tracks and OPEN
                        tracks (which auto-include everyone). */}
                    {!track.isArchived && track.eligibility === 'OPT_IN' && (
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() => setConfirmBulkOptIn(track)}
                        disabled={saving || bulkOptInBusy}
                        title='Opt in all existing submissions'
                      >
                        <Users className='h-4 w-4' />
                      </Button>
                    )}
                    {track.isArchived ? (
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() => handleUnarchive(track)}
                        disabled={saving}
                        title='Restore'
                      >
                        <ArchiveRestore className='h-4 w-4' />
                      </Button>
                    ) : (
                      <Button
                        size='icon'
                        variant='ghost'
                        onClick={() => openEdit(track)}
                        disabled={saving}
                        title='Edit'
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                    )}
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={() => setConfirmDelete(track)}
                      disabled={saving || track.isArchived}
                      title='Delete'
                    >
                      <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={o => !o && closeDialog()}>
        <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit track' : 'New track'}</DialogTitle>
            <DialogDescription>
              {form.id
                ? 'Renaming a track keeps every existing entry attached.'
                : 'Tracks show up in the submission form once participants can submit. You can rename, reorder, or archive later.'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='track-name'>Name</Label>
              <Input
                id='track-name'
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder='Best UI/UX'
                maxLength={80}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='track-slug'>Slug</Label>
              <Input
                id='track-slug'
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder='best-ui-ux (auto-generated if blank)'
                maxLength={40}
              />
              <p className='text-xs text-gray-500'>
                Lowercase letters, digits, hyphens. Used in URLs and stays
                stable when you rename.
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='track-description'>Description</Label>
              <Textarea
                id='track-description'
                value={form.description}
                onChange={e =>
                  setForm(f => ({ ...f, description: e.target.value }))
                }
                placeholder='What does this track reward?'
                maxLength={500}
                rows={3}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Type</Label>
                <Select
                  value={form.type || 'skill'}
                  onValueChange={v => setForm(f => ({ ...f, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRACK_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='track-order'>Display order</Label>
                <Input
                  id='track-order'
                  type='number'
                  min={0}
                  value={form.displayOrder}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      displayOrder: Number.isFinite(Number(e.target.value))
                        ? Number(e.target.value)
                        : 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Eligibility</Label>
              <Select
                value={form.eligibility}
                onValueChange={v =>
                  setForm(f => ({
                    ...f,
                    eligibility: v as TrackEligibility,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ELIGIBILITY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-xs text-gray-500'>
                {
                  ELIGIBILITY_OPTIONS.find(o => o.value === form.eligibility)
                    ?.hint
                }
              </p>
            </div>

            {/* Phase B per-track customization ------------------------- */}
            <div className='space-y-2 border-t border-gray-800 pt-4'>
              <Label htmlFor='track-prompt'>
                Prompt{' '}
                <span className='text-xs font-normal text-gray-500'>
                  (optional, single open question)
                </span>
              </Label>
              <Textarea
                id='track-prompt'
                value={form.prompt}
                onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                placeholder='Why does this project fit Best UI/UX?'
                maxLength={500}
                rows={2}
              />
              <p className='text-xs text-gray-500'>
                Shown on the submission form when a submitter opts into this
                track. When set, an answer is required.
              </p>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label>Custom questions</Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setForm(f => ({
                      ...f,
                      customQuestions: [
                        ...f.customQuestions,
                        {
                          id: tinyId(),
                          label: '',
                          type: 'short',
                          required: false,
                        },
                      ],
                    }))
                  }
                >
                  <Plus className='h-3.5 w-3.5' />
                  Add question
                </Button>
              </div>
              {form.customQuestions.length === 0 && (
                <p className='text-xs text-gray-500'>
                  No custom questions. Add one if you want sponsors / judges to
                  see specific info per submission.
                </p>
              )}
              {form.customQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className='space-y-2 rounded-md border border-gray-800 bg-gray-900/40 p-3'
                >
                  <Input
                    placeholder='Question label (e.g. "Primary audience")'
                    value={q.label}
                    maxLength={200}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        customQuestions: f.customQuestions.map((qq, i) =>
                          i === idx ? { ...qq, label: e.target.value } : qq
                        ),
                      }))
                    }
                  />
                  <div className='grid grid-cols-3 gap-2'>
                    <Select
                      value={q.type}
                      onValueChange={v =>
                        setForm(f => ({
                          ...f,
                          customQuestions: f.customQuestions.map((qq, i) =>
                            i === idx
                              ? {
                                  ...qq,
                                  type: v as TrackCustomQuestion['type'],
                                }
                              : qq
                          ),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='short'>Short text</SelectItem>
                        <SelectItem value='long'>Long text</SelectItem>
                        <SelectItem value='url'>URL</SelectItem>
                      </SelectContent>
                    </Select>
                    <label className='flex items-center gap-2 rounded-md border border-gray-800 bg-gray-950/30 px-3 text-sm text-gray-300'>
                      <input
                        type='checkbox'
                        checked={!!q.required}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            customQuestions: f.customQuestions.map((qq, i) =>
                              i === idx
                                ? { ...qq, required: e.target.checked }
                                : qq
                            ),
                          }))
                        }
                      />
                      Required
                    </label>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        setForm(f => ({
                          ...f,
                          customQuestions: f.customQuestions.filter(
                            (_, i) => i !== idx
                          ),
                        }))
                      }
                      className='text-red-400 hover:bg-red-500/20'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label>Required artifacts</Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setForm(f => ({
                      ...f,
                      requiredArtifacts: [
                        ...f.requiredArtifacts,
                        {
                          id: tinyId(),
                          label: '',
                          type: 'url',
                          required: true,
                        },
                      ],
                    }))
                  }
                >
                  <Plus className='h-3.5 w-3.5' />
                  Add artifact
                </Button>
              </div>
              {form.requiredArtifacts.length === 0 && (
                <p className='text-xs text-gray-500'>
                  No artifact requirements. Add one if the track expects a
                  specific link (Figma file, demo deployment, contract address,
                  etc.).
                </p>
              )}
              {form.requiredArtifacts.map((a, idx) => (
                <div
                  key={a.id}
                  className='space-y-2 rounded-md border border-gray-800 bg-gray-900/40 p-3'
                >
                  <Input
                    placeholder='Artifact label (e.g. "Figma file URL")'
                    value={a.label}
                    maxLength={120}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        requiredArtifacts: f.requiredArtifacts.map((aa, i) =>
                          i === idx ? { ...aa, label: e.target.value } : aa
                        ),
                      }))
                    }
                  />
                  <div className='grid grid-cols-3 gap-2'>
                    <Select
                      value={a.type}
                      onValueChange={v =>
                        setForm(f => ({
                          ...f,
                          requiredArtifacts: f.requiredArtifacts.map((aa, i) =>
                            i === idx
                              ? {
                                  ...aa,
                                  type: v as TrackRequiredArtifact['type'],
                                }
                              : aa
                          ),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='url'>Generic URL</SelectItem>
                        <SelectItem value='figma'>Figma</SelectItem>
                        <SelectItem value='github'>GitHub repo</SelectItem>
                        <SelectItem value='video'>Video</SelectItem>
                        <SelectItem value='pdf'>PDF</SelectItem>
                      </SelectContent>
                    </Select>
                    <label className='flex items-center gap-2 rounded-md border border-gray-800 bg-gray-950/30 px-3 text-sm text-gray-300'>
                      <input
                        type='checkbox'
                        checked={!!a.required}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            requiredArtifacts: f.requiredArtifacts.map(
                              (aa, i) =>
                                i === idx
                                  ? { ...aa, required: e.target.checked }
                                  : aa
                            ),
                          }))
                        }
                      />
                      Required
                    </label>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        setForm(f => ({
                          ...f,
                          requiredArtifacts: f.requiredArtifacts.filter(
                            (_, i) => i !== idx
                          ),
                        }))
                      }
                      className='text-red-400 hover:bg-red-500/20'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant='ghost' onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className='h-4 w-4 animate-spin' />}
              {form.id ? 'Save changes' : 'Create track'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={o => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete track?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete && confirmDelete.entryCount > 0 ? (
                <>
                  This track has{' '}
                  <span className='font-medium text-white'>
                    {confirmDelete.entryCount}
                  </span>{' '}
                  submission
                  {confirmDelete.entryCount === 1 ? '' : 's'} attached. It will
                  be archived instead of deleted so the existing entries stay
                  intact. You can restore it later.
                </>
              ) : (
                'This track has no submissions yet, so it will be permanently deleted.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              disabled={saving}
            >
              {saving && <Loader2 className='h-4 w-4 animate-spin' />}
              {confirmDelete && confirmDelete.entryCount > 0
                ? 'Archive'
                : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmBulkOptIn}
        onOpenChange={o => !o && !bulkOptInBusy && setConfirmBulkOptIn(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opt in all submissions?</AlertDialogTitle>
            <AlertDialogDescription>
              Every existing submission in this hackathon will be added to{' '}
              <span className='font-medium text-white'>
                {confirmBulkOptIn?.name}
              </span>
              . Submitters can still opt themselves out by editing their
              submission. Disqualified submissions are skipped.
              <br />
              <br />
              Use this when tracks were created after submissions already exist
              — it lets the winner allocator pick from the full pool instead of
              only the (small) set of submitters who opted in manually.
              <br />
              <br />
              If a submission would end up in more tracks than the current
              per-submission cap allows, the cap is auto-raised.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkOptInBusy}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmBulkOptIn && handleBulkOptIn(confirmBulkOptIn)
              }
              disabled={bulkOptInBusy}
            >
              {bulkOptInBusy && <Loader2 className='h-4 w-4 animate-spin' />}
              Opt in all submissions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
