'use client';

import * as React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MinimalTiptapProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

function MinimalTiptap({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  className,
}: MinimalTiptapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          'min-h-[200px] border-0 p-4'
        ),
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border', className)}>
      <div className='flex flex-wrap items-center gap-1 border-b p-2'>
        <Toggle
          size='sm'
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <Bold className='h-4 w-4' />
        </Toggle>

        <Toggle
          size='sm'
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <Italic className='h-4 w-4' />
        </Toggle>

        <Toggle
          size='sm'
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
        >
          <Strikethrough className='h-4 w-4' />
        </Toggle>

        <Toggle
          size='sm'
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
        >
          <Code className='h-4 w-4' />
        </Toggle>

        <Separator orientation='vertical' className='h-6' />

        <Toggle
          size='sm'
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className='h-4 w-4' />
        </Toggle>

        <Toggle
          size='sm'
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className='h-4 w-4' />
        </Toggle>

        <Toggle
          size='sm'
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className='h-4 w-4' />
        </Toggle>

        <Separator orientation='vertical' className='h-6' />

        <Toggle
          size='sm'
          pressed={editor.isActive('bulletList')}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className='h-4 w-4' />
        </Toggle>

        <Toggle
          size='sm'
          pressed={editor.isActive('orderedList')}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className='h-4 w-4' />
        </Toggle>

        <Toggle
          size='sm'
          pressed={editor.isActive('blockquote')}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
        >
          <Quote className='h-4 w-4' />
        </Toggle>

        <Separator orientation='vertical' className='h-6' />

        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className='h-4 w-4' />
        </Button>

        <Separator orientation='vertical' className='h-6' />

        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <Undo className='h-4 w-4' />
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <Redo className='h-4 w-4' />
        </Button>
      </div>

      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}

export { MinimalTiptap, type MinimalTiptapProps };
