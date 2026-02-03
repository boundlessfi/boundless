'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import MDEditor from '@uiw/react-md-editor';
import './md-editor-custom.css';

interface DetailsProps {
  onDataChange?: (data: DetailsFormData) => void;
  initialData?: Partial<DetailsFormData>;
}

export interface DetailsFormData {
  vision: string;
}

const detailsSchema = z.object({
  vision: z.string().trim().min(1, 'Vision is required'),
});

// Custom toolbar configuration options
// You can customize the toolbar in several ways:

// Option 1: Use default toolbar with custom styling (current approach)
// The toolbar will include: bold, italic, strikethrough, title, link, image, quote, code, list, undo, redo

// Option 2: Hide specific toolbar items using CSS
// Option 3: Use custom commands (requires importing command objects)
// Option 4: Completely custom toolbar with hideToolbar={true} and custom toolbar component

const Details = React.forwardRef<{ validate: () => boolean }, DetailsProps>(
  ({ onDataChange, initialData }, ref) => {
    const [vision, setVision] = useState(initialData?.vision || '');
    const [errors, setErrors] = useState<{ vision?: string }>({});
    const [submitted, setSubmitted] = useState(false);

    // Update form data when initialData changes
    React.useEffect(() => {
      if (initialData?.vision) {
        setVision(initialData.vision);
      }
    }, [initialData]);

    const handleVisionChange = (value?: string) => {
      const newValue = value || '';
      setVision(newValue);
      onDataChange?.({ vision: newValue });

      // Clear error when user starts typing
      if (errors.vision) {
        setErrors(prev => ({ ...prev, vision: undefined }));
      }
    };

    const validateForm = (): boolean => {
      setSubmitted(true);
      const parsed = detailsSchema.safeParse({ vision });
      if (parsed.success) {
        setErrors({});
        return true;
      }
      setErrors({
        vision: parsed.error.issues[0]?.message || 'Vision is required',
      });
      return false;
    };

    // Expose validation function to parent
    React.useImperativeHandle(ref, () => ({
      validate: validateForm,
    }));

    return (
      <div className='min-h-full space-y-6 text-white'>
        {/* Vision */}
        <div className='space-y-3'>
          <Label className='text-white'>
            Vision <span className='text-red-500'>*</span>
          </Label>

          {/* Markdown Editor */}
          <div className='space-y-3'>
            <div
              className={cn(
                'overflow-hidden rounded-lg border border-[#484848]',
                submitted && errors.vision && 'border-red-500'
              )}
            >
              <MDEditor
                value={vision}
                onChange={handleVisionChange}
                height={400}
                // minHeight={64}
                data-color-mode='dark'
                preview='edit'
                hideToolbar={false}
                visibleDragbar={true}
                textareaProps={{
                  placeholder:
                    "Tell your project's full story...\n\nUse text, images, links, or videos to bring your vision to life. Format freely with headings, lists, and more.",
                  style: {
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: '#ffffff',
                    backgroundColor: '#101010',
                    fontFamily: 'inherit',
                  },
                }}
                style={{
                  backgroundColor: '#101010',
                  color: '#ffffff',
                }}
                // toolbarHeight={64}
              />
            </div>
          </div>

          {submitted && errors.vision && (
            <p className='text-sm text-red-500'>{errors.vision}</p>
          )}
        </div>
      </div>
    );
  }
);

Details.displayName = 'Details';

export default Details;
