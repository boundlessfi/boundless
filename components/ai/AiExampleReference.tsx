'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ExampleItem {
  id: string;
  label: string;
  /** The text fed to the model as a style reference when this item is picked. */
  example: string;
}

interface AiExampleReferenceProps {
  items: ExampleItem[];
  /** Selected item id, or null for none. */
  value: string | null;
  onChange: (id: string | null) => void;
  /** e.g. "bounty" | "hackathon". */
  noun: string;
}

const NONE = '__none__';

/**
 * Optional "use a past one as a style reference" picker for the Generate
 * dialogs. The chosen item's gist is passed to the model as `examples[]` so the
 * draft mirrors the organizer's house style. Renders nothing when there's
 * nothing to reference. Shared by both wizards.
 */
export default function AiExampleReference({
  items,
  value,
  onChange,
  noun,
}: AiExampleReferenceProps) {
  if (items.length === 0) return null;

  return (
    <div className='space-y-1.5'>
      <p className='text-sm font-medium'>
        Match a past {noun}{' '}
        <span className='text-muted-foreground font-normal'>(optional)</span>
      </p>
      <Select
        value={value ?? NONE}
        onValueChange={v => onChange(v === NONE ? null : v)}
      >
        <SelectTrigger className='h-10 rounded-lg border-zinc-800 bg-zinc-900/50 text-white'>
          <SelectValue placeholder={`Pick a past ${noun} to match its style`} />
        </SelectTrigger>
        <SelectContent className='border-zinc-800 bg-zinc-950 text-white'>
          <SelectItem value={NONE}>None</SelectItem>
          {items.map(item => (
            <SelectItem key={item.id} value={item.id}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className='text-muted-foreground text-xs'>
        We&apos;ll use its style as a reference — your brief still drives the
        content.
      </p>
    </div>
  );
}
