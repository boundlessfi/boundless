'use client';

import * as React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AnnouncementEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

function AnnouncementEditor({
  content = '',
  onChange,
  placeholder = 'Share important updates, reminders, or announcements with the community.',
  editable = true,
  className,
}: AnnouncementEditorProps) {
  const [linkUrl, setLinkUrl] = React.useState('');
  const [linkText, setLinkText] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [embedUrl, setEmbedUrl] = React.useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = React.useState(false);

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
          'min-h-[400px] border-0 p-6 text-white'
        ),
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  React.useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          ...editor.options.editorProps,
          handleDOMEvents: {
            ...editor.options.editorProps?.handleDOMEvents,
            drop: (view, event) => {
              const files = event.dataTransfer?.files;
              if (files && files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                  const reader = new FileReader();
                  reader.onload = e => {
                    const src = e.target?.result as string;
                    editor
                      .chain()
                      .focus()
                      .insertContent(
                        `<img src="${src}" alt="Image" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;" />`
                      )
                      .run();
                  };
                  reader.readAsDataURL(file);
                  return true;
                }
              }
              return false;
            },
          },
        },
      });
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const handleInsertLink = () => {
    if (linkUrl && linkText) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}" target="_blank">${linkText}</a>`)
        .run();
      setLinkUrl('');
      setLinkText('');
      setIsLinkDialogOpen(false);
    }
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      editor
        .chain()
        .focus()
        .insertContent(
          `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;" />`
        )
        .run();
      setImageUrl('');
      setIsImageDialogOpen(false);
    }
  };

  const handleInsertEmbed = () => {
    if (embedUrl) {
      editor
        .chain()
        .focus()
        .insertContent(
          `<iframe src="${embedUrl}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`
        )
        .run();
      setEmbedUrl('');
      setIsEmbedDialogOpen(false);
    }
  };

  return (
    <div
      className={cn(
        'bg-background-card overflow-hidden rounded-lg border border-gray-800',
        className
      )}
    >
      <div className='bg-background-card flex flex-wrap items-center gap-1 border-b border-gray-900 p-3'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className='h-8 w-8 p-0 text-gray-400 hover:bg-gray-800 hover:text-white'
        >
          <Undo className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className='h-8 w-8 p-0 text-gray-400 hover:bg-gray-800 hover:text-white'
        >
          <Redo className='h-4 w-4' />
        </Button>

        <Separator orientation='vertical' className='h-6 bg-gray-900' />

        <Select
          value={
            editor.isActive('heading', { level: 1 })
              ? 'h1'
              : editor.isActive('heading', { level: 2 })
                ? 'h2'
                : editor.isActive('heading', { level: 3 })
                  ? 'h3'
                  : 'normal'
          }
          onValueChange={value => {
            if (value === 'normal') {
              editor.chain().focus().setParagraph().run();
            } else if (value === 'h1') {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            } else if (value === 'h2') {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            } else if (value === 'h3') {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }
          }}
        >
          <SelectTrigger className='h-8 w-[100px] border-gray-800 bg-transparent text-gray-400 hover:bg-gray-800'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='bg-background-card border-gray-800 text-white'>
            <SelectItem value='normal'>Normal</SelectItem>
            <SelectItem value='h1'>Heading 1</SelectItem>
            <SelectItem value='h2'>Heading 2</SelectItem>
            <SelectItem value='h3'>Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation='vertical' className='h-6 bg-gray-900' />

        <Toggle
          size='sm'
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className='h-8 w-8 p-0 data-[state=on]:bg-gray-800 data-[state=on]:text-white'
        >
          <Bold className='h-4 w-4' />
        </Toggle>

        <Toggle
          size='sm'
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className='h-8 w-8 p-0 data-[state=on]:bg-gray-800 data-[state=on]:text-white'
        >
          <Italic className='h-4 w-4' />
        </Toggle>

        <Toggle
          size='sm'
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className='h-8 w-8 p-0 data-[state=on]:bg-gray-800 data-[state=on]:text-white'
        >
          <Strikethrough className='h-4 w-4' />
        </Toggle>

        <Toggle
          size='sm'
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className='h-8 w-8 p-0 data-[state=on]:bg-gray-800 data-[state=on]:text-white'
        >
          <Code className='h-4 w-4' />
        </Toggle>

        <Toggle
          size='sm'
          pressed={editor.isActive('blockquote')}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
          className='h-8 w-8 p-0 data-[state=on]:bg-gray-800 data-[state=on]:text-white'
        >
          <Quote className='h-4 w-4' />
        </Toggle>

        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0 text-gray-400 hover:bg-gray-800 hover:text-white'
            >
              <LinkIcon className='h-4 w-4' />
            </Button>
          </DialogTrigger>
          <DialogContent className='bg-background-card border-gray-800'>
            <DialogHeader>
              <DialogTitle className='text-white'>Insert Link</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='link-text' className='text-white'>
                  Link Text
                </Label>
                <Input
                  id='link-text'
                  value={linkText}
                  onChange={e => setLinkText(e.target.value)}
                  placeholder='Link text'
                  className='bg-background border-gray-800 text-white'
                />
              </div>
              <div>
                <Label htmlFor='link-url' className='text-white'>
                  URL
                </Label>
                <Input
                  id='link-url'
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder='https://example.com'
                  className='bg-background border-gray-800 text-white'
                />
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsLinkDialogOpen(false)}
                  className='border-gray-800 text-white hover:bg-gray-800'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInsertLink}
                  className='bg-primary hover:bg-primary/90 text-white'
                >
                  Insert
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0 text-gray-400 hover:bg-gray-800 hover:text-white'
            >
              <ImageIcon className='h-4 w-4' />
            </Button>
          </DialogTrigger>
          <DialogContent className='bg-background-card border-gray-800'>
            <DialogHeader>
              <DialogTitle className='text-white'>Insert Image</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='image-url' className='text-white'>
                  Image URL
                </Label>
                <Input
                  id='image-url'
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder='https://example.com/image.jpg'
                  className='bg-background border-gray-800 text-white'
                />
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsImageDialogOpen(false)}
                  className='border-gray-800 text-white hover:bg-gray-800'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInsertImage}
                  className='bg-primary hover:bg-primary/90 text-white'
                >
                  Insert
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEmbedDialogOpen} onOpenChange={setIsEmbedDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0 text-gray-400 hover:bg-gray-800 hover:text-white'
            >
              <Code2 className='h-4 w-4' />
            </Button>
          </DialogTrigger>
          <DialogContent className='bg-background-card border-gray-800'>
            <DialogHeader>
              <DialogTitle className='text-white'>Insert Embed</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='embed-url' className='text-white'>
                  Embed URL
                </Label>
                <Input
                  id='embed-url'
                  value={embedUrl}
                  onChange={e => setEmbedUrl(e.target.value)}
                  placeholder='https://example.com/embed'
                  className='bg-background border-gray-800 text-white'
                />
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsEmbedDialogOpen(false)}
                  className='border-gray-800 text-white hover:bg-gray-800'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInsertEmbed}
                  className='bg-primary hover:bg-primary/90 text-white'
                >
                  Insert
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className='bg-background-card relative'>
        <EditorContent
          editor={editor}
          className='[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:hover:text-primary/80 [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:p-6 [&_.ProseMirror]:text-white [&_.ProseMirror]:outline-none [&_.ProseMirror_a]:underline [&_.ProseMirror_iframe]:my-4 [&_.ProseMirror_iframe]:w-full [&_.ProseMirror_iframe]:rounded-lg [&_.ProseMirror_img]:my-4 [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg'
        />
        {(!editor.getHTML() || editor.getHTML() === '<p></p>') && (
          <div className='pointer-events-none absolute top-[72px] left-6 text-gray-500 opacity-50'>
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}

export { AnnouncementEditor, type AnnouncementEditorProps };
