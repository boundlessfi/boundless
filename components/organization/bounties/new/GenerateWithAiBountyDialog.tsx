'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BoundlessButton } from '@/components/buttons';
import AiClarifyQuestions, {
  type ClarifyAnswer,
} from '@/components/ai/AiClarifyQuestions';
import AiExampleReference, {
  type ExampleItem,
} from '@/components/ai/AiExampleReference';
import AiUsageNote from '@/components/ai/AiUsageNote';
import AiStreamPreview, {
  type PreviewField,
} from '@/components/ai/AiStreamPreview';
import { streamDraft } from '@/lib/ai/stream-draft';
import {
  useClarifyBountyDraft,
  useOrganizationBounties,
  bountyKeys,
  type ClarifyQuestion,
} from '@/features/bounties';

/** Fold chosen clarify answers back into the brief before drafting. */
function augmentBrief(brief: string, answers: ClarifyAnswer[]): string {
  if (answers.length === 0) return brief;
  const lines = answers.map(a => `- ${a.question} ${a.label}`).join('\n');
  return `${brief}\n\nAdditional details:\n${lines}`;
}

const briefSchema = z.object({
  brief: z
    .string()
    .trim()
    .min(10, 'Add a little more detail (at least 10 characters).')
    .max(2000, 'Keep the brief under 2000 characters.'),
  budgetCapUsdc: z
    .string()
    .trim()
    .regex(/^\d+(\.\d+)?$/, 'Enter a number, e.g. 500.'),
  earliestStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick an earliest start date.'),
});

type BriefForm = z.infer<typeof briefSchema>;

/**
 * Curated starter briefs. Static (no admin CMS yet) — selecting one fills the
 * brief textarea; the organizer edits freely from there.
 */
interface BriefTemplate {
  id: string;
  name: string;
  description: string;
  brief: string;
}

const BRIEF_TEMPLATES: BriefTemplate[] = [
  {
    id: 'design-single',
    name: 'Design task',
    description: 'One winner, paid on the best entry',
    brief:
      'A one-week bounty to design three onboarding illustrations for a Stellar wallet app, in a clean flat style. Pay the single best entry.',
  },
  {
    id: 'dev-issue',
    name: 'Dev fix',
    description: 'GitHub issue, vetted applicants',
    brief:
      'A development bounty to fix a flaky integration test in our open-source Soroban SDK. Reviewers should vet a short application before work starts. GitHub issue: https://github.com/example/sdk/issues/42',
  },
  {
    id: 'content-competition',
    name: 'Content competition',
    description: 'Multiple winners, ranked',
    brief:
      'A two-week competition for written tutorials explaining how to build on Stellar, aimed at new developers. Reward the top three entries.',
  },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function TemplateChip({
  template,
  selected,
  onSelect,
}: {
  template: BriefTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className={[
        'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border hover:border-primary/50 hover:bg-muted/40 text-foreground',
      ].join(' ')}
    >
      <div className='leading-tight font-medium'>{template.name}</div>
      <div className='text-muted-foreground mt-0.5 text-xs leading-tight'>
        {template.description}
      </div>
    </button>
  );
}

interface GenerateWithAiBountyDialogProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GenerateWithAiBountyDialog({
  organizationId,
  open,
  onOpenChange,
}: GenerateWithAiBountyDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clarify = useClarifyBountyDraft(organizationId);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  // Live streaming reveal: partial draft snapshots + an abort handle for Cancel.
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState<Record<string, unknown> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Adaptive clarify gate: when the brief is thin we collect a couple of chip
  // answers before drafting.
  const [questions, setQuestions] = useState<ClarifyQuestion[]>([]);
  const [pending, setPending] = useState<BriefForm | null>(null);
  // Optional "match a past bounty" style reference (fed to the model as examples).
  const [exampleId, setExampleId] = useState<string | null>(null);
  const { data: pastBounties } = useOrganizationBounties(organizationId);
  const exampleItems: ExampleItem[] = useMemo(
    () =>
      (pastBounties ?? []).map(b => ({
        id: b.id,
        label: b.title || 'Untitled bounty',
        example: `A past bounty titled "${b.title}"${
          b.rewardAmount
            ? ` with a ${b.rewardAmount} ${b.rewardCurrency ?? 'USDC'} reward`
            : ''
        }.`,
      })),
    [pastBounties]
  );
  const exampleText =
    exampleItems.find(i => i.id === exampleId)?.example ?? null;

  const form = useForm<BriefForm>({
    resolver: zodResolver(briefSchema),
    defaultValues: { brief: '', budgetCapUsdc: '', earliestStart: todayIso() },
  });

  const isClarifying = clarify.isPending;

  useEffect(() => {
    if (!open) {
      setSelectedTemplateId(null);
      setQuestions([]);
      setPending(null);
      setExampleId(null);
      setStreaming(false);
      setPartial(null);
    }
  }, [open]);

  const handleClose = (next: boolean) => {
    if (streaming) return;
    onOpenChange(next);
  };

  const cancelStream = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setPartial(null);
  };

  const handleSelectTemplate = (template: BriefTemplate) => {
    if (selectedTemplateId === template.id) {
      setSelectedTemplateId(null);
      return;
    }
    setSelectedTemplateId(template.id);
    form.setValue('brief', template.brief, { shouldValidate: true });
  };

  const runGenerate = async (values: BriefForm, answers: ClarifyAnswer[]) => {
    const ac = new AbortController();
    abortRef.current = ac;
    setPartial(null);
    setStreaming(true);
    await streamDraft(
      `/api/organizations/${organizationId}/bounties/draft/from-brief/stream`,
      {
        ...values,
        brief: augmentBrief(values.brief, answers),
        ...(exampleText ? { examples: [exampleText] } : {}),
      },
      ac.signal,
      {
        onPartial: setPartial,
        onDone: ({ draftId, draft }) => {
          if (draft) {
            queryClient.setQueryData(
              bountyKeys.draft(organizationId, draftId),
              draft
            );
          }
          queryClient.invalidateQueries({
            queryKey: bountyKeys.drafts(organizationId),
          });
          toast.success('Draft generated. Review and publish when ready.');
          setStreaming(false);
          onOpenChange(false);
          router.push(
            `/organizations/${organizationId}/bounties/drafts/${draftId}`
          );
        },
        onError: e => {
          setStreaming(false);
          handleStreamError(e);
        },
      }
    );
  };

  const onSubmit = async (values: BriefForm) => {
    // Adaptive gate: ask the AI whether the brief needs clarifying questions.
    try {
      const verdict = await clarify.mutateAsync(values.brief);
      if (!verdict.ready && verdict.questions.length > 0) {
        setPending(values);
        setQuestions(verdict.questions);
        return;
      }
    } catch {
      // Clarify is a soft gate — if it fails, draft from the brief as-is.
    }
    await runGenerate(values, []);
  };

  const handleStreamError = (err: { status?: number; message: string }) => {
    if (err.status === 503) {
      toast.error('The AI assistant is busy right now.', {
        description: 'You can start your bounty manually instead.',
        action: {
          label: 'Start manually',
          onClick: () => {
            onOpenChange(false);
            router.push(`/organizations/${organizationId}/bounties/new`);
          },
        },
      });
      return;
    }
    toast.error(err.message || 'Could not generate a draft. Please try again.');
  };

  // Live preview fields, derived from the streaming partial suggestion.
  const previewFields: PreviewField[] = [
    {
      label: 'Title',
      value: typeof partial?.title === 'string' ? partial.title : null,
    },
    {
      label: 'Description',
      value:
        typeof partial?.description === 'string'
          ? partial.description.slice(0, 240)
          : null,
    },
    {
      label: 'Mode',
      value:
        partial?.entryType && partial?.claimType
          ? `${String(partial.entryType)} · ${String(partial.claimType)}`
          : null,
    },
    {
      label: 'Prizes',
      value:
        Array.isArray(partial?.prizeTiers) && partial.prizeTiers.length > 0
          ? `${partial.prizeTiers.length} tier(s)`
          : null,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Sparkles className='text-primary h-5 w-5' />
            Generate with AI
          </DialogTitle>
          <DialogDescription>
            Describe your bounty or pick a template below. We&apos;ll pick a
            sensible mode and draft the scope, submission rules, and prize tiers
            for you to review and edit.
          </DialogDescription>
        </DialogHeader>

        {streaming ? (
          <AiStreamPreview fields={previewFields} onCancel={cancelStream} />
        ) : questions.length > 0 && pending ? (
          <AiClarifyQuestions
            questions={questions}
            isSubmitting={streaming}
            onSubmit={answers => runGenerate(pending, answers)}
            onSkip={() => runGenerate(pending, [])}
          />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='space-y-2'>
                <p className='text-sm font-medium'>Start from a template</p>
                <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                  {BRIEF_TEMPLATES.map(t => (
                    <TemplateChip
                      key={t.id}
                      template={t}
                      selected={selectedTemplateId === t.id}
                      onSelect={() => handleSelectTemplate(t)}
                    />
                  ))}
                </div>
                <p className='text-muted-foreground text-xs'>
                  Selecting a template fills the brief — edit it freely.
                </p>
              </div>

              <AiExampleReference
                items={exampleItems}
                value={exampleId}
                onChange={setExampleId}
                noun='bounty'
              />

              <FormField
                control={form.control}
                name='brief'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder='A one-week bounty to design three onboarding illustrations for a Stellar wallet, paid to the best entry.'
                        onChange={e => {
                          field.onChange(e);
                          setSelectedTemplateId(null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='budgetCapUsdc'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prize budget (USDC)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode='decimal'
                          placeholder='500'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='earliestStart'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Earliest start</FormLabel>
                      <FormControl>
                        <Input {...field} type='date' min={todayIso()} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <AiUsageNote organizationId={organizationId} />

              <DialogFooter className='gap-2 sm:gap-0'>
                <BoundlessButton
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </BoundlessButton>
                <BoundlessButton
                  type='submit'
                  loading={isClarifying}
                  icon={<Sparkles className='h-4 w-4' />}
                  iconPosition='left'
                >
                  Generate draft
                </BoundlessButton>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
