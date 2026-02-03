import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { AmountFormData } from './Amount';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle, Pencil } from 'lucide-react';
import { Timeline, TimelineItemType } from '@/components/ui/timeline';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface ConfirmFormData {
  agreeToTerms?: boolean;
  agreeToPrivacy?: boolean;
}

export interface ConfirmHandle {
  validate?: () => boolean;
  markSubmitted?: () => void;
}

interface ConfirmProps {
  fundingData: AmountFormData;
  onDataChange?: (data: ConfirmFormData) => void;
  initialData?: Partial<ConfirmFormData>;
  project?: {
    _id: string;
    title: string;
    logo?: string;
    description?: string;
    creator?: {
      profile?: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
      };
    };
    milestones?: Array<{
      title: string;
      description: string;
      dueDate: string;
      amount: number;
      status: string;
    }>;
  };
}

const Confirm = forwardRef<ConfirmHandle, ConfirmProps>(
  ({ fundingData, onDataChange, initialData = {}, project }, ref) => {
    const [confirmData, setConfirmData] = React.useState<ConfirmFormData>({
      agreeToTerms: initialData.agreeToTerms || false,
      agreeToPrivacy: initialData.agreeToPrivacy || false,
    });

    const handleDataChange = (field: keyof ConfirmFormData, value: boolean) => {
      const newData = { ...confirmData, [field]: value };
      setConfirmData(newData);
      onDataChange?.(newData);
    };

    const milestones: TimelineItemType[] = useMemo(() => {
      if (project?.milestones && project.milestones.length > 0) {
        return project.milestones.map((milestone, index) => ({
          id: `milestone-${index + 1}`,
          title: milestone.title,
          description: milestone.description,
          dueDate: milestone.dueDate,
          amount: milestone.amount,
          percentage: Math.round(
            (milestone.amount /
              (project.milestones?.reduce((sum, m) => sum + m.amount, 0) ||
                1)) *
              100
          ),
          status:
            milestone.status === 'completed'
              ? 'approved'
              : (milestone.status as 'awaiting' | 'in-progress' | 'in-review'),
          feedbackDays: milestone.status === 'in-review' ? 3 : undefined,
        }));
      }

      // Fallback to default milestones if none provided
      return [
        {
          id: 'milestone-1',
          title: 'Project Development',
          description:
            'Core development and implementation of project features.',
          dueDate: 'TBD',
          amount: 0,
          percentage: 100,
          status: 'awaiting',
        },
      ];
    }, [project?.milestones]);

    const markSubmitted = () => {
      // Validation handled by parent component
    };

    useImperativeHandle(ref, () => ({
      validate: () => true,
      markSubmitted,
    }));

    const totalAmount = parseFloat(fundingData.amount || '0');

    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-3'>
          <div className='relative'>
            <div className='h-12 w-12 overflow-hidden rounded-full border-[0.5px] border-[#2B2B2B]'>
              <Image
                width={48}
                height={48}
                src={project?.creator?.profile?.avatar || '/avatar.png'}
                alt='Project owner'
                className='h-full w-full object-cover'
              />
            </div>
          </div>
          <div className='flex flex-col space-y-0.5'>
            <span className='text-base font-normal text-white'>
              {project?.creator?.profile?.firstName &&
              project?.creator?.profile?.lastName
                ? `${project.creator.profile.firstName} ${project.creator.profile.lastName}`
                : 'Project Owner'}
            </span>
            <span className='text-sm text-[#DBF936]'>PROJECT OWNER</span>
          </div>
        </div>

        <div className='space-y-3'>
          <h5 className='font-medium text-white'>
            {project?.title || 'Project'}
          </h5>
          <p className='leading-relaxed text-gray-400'>
            {project?.description ||
              'No description available for this project.'}
          </p>
          <Link
            href={
              typeof window !== 'undefined' ? window.location.pathname : '#'
            }
            className='text-primary flex items-center gap-2 text-sm font-medium hover:underline'
          >
            Learn More <ArrowUpRight className='h-4 w-4' />
          </Link>
        </div>

        <div className='space-y-4'>
          <h5 className='font-medium text-white'>Project Milestones</h5>
          <Timeline
            items={milestones}
            showConnector={true}
            variant='default'
            className='w-full'
            projectSlug='bitmed-health-protocol'
          />
        </div>

        <div className='space-y-2'>
          <h5 className='font-medium text-white'>Contribution Amount</h5>
          <div className='flex w-fit items-center justify-between'>
            <span className='font-medium tracking-[-0.48px] text-white'>
              ${totalAmount.toFixed(2)} {fundingData.currency}
            </span>
            <Button variant='link' className='text-primary'>
              Edit Amount <Pencil className='size-4' />
            </Button>
          </div>
          <div>
            <h5>Keep me anonymous?</h5>
            <div className='flex w-fit items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Switch checked={fundingData.keepAnonymous} disabled />
                <span className='text-sm text-white'>
                  {fundingData.keepAnonymous ? 'YES' : 'NO'}
                </span>
              </div>
              <Button variant='link' className='text-primary'>
                Edit <Pencil className='size-4' />
              </Button>
            </div>
          </div>
        </div>

        <Card className='border-blue-500/30 bg-blue-500/10 text-blue-200'>
          <CardContent className='p-4'>
            <div className='flex items-start space-x-3'>
              <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0' />
              <div>
                <h4 className='font-semibold'>Escrow Protection</h4>
                <p className='mt-1 text-sm'>
                  Your funds are held securely in a smart contract and will only
                  be released to the project team upon successful milestone
                  completion and approval. If milestones are not met, your
                  contribution will be automatically refunded.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='space-y-4'>
          <h5 className='font-medium text-white'>Agreements</h5>
          <div className='space-y-3'>
            <div className='flex items-start space-x-3'>
              <Switch
                checked={confirmData.agreeToTerms}
                onCheckedChange={checked =>
                  handleDataChange('agreeToTerms', checked)
                }
                className='mt-1'
              />
              <div className='flex-1'>
                <p className='text-sm text-white'>
                  I agree to the{' '}
                  <a
                    href='/terms'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary hover:underline'
                  >
                    Terms of Service
                  </a>
                </p>
              </div>
            </div>
            <div className='flex items-start space-x-3'>
              <Switch
                checked={confirmData.agreeToPrivacy}
                onCheckedChange={checked =>
                  handleDataChange('agreeToPrivacy', checked)
                }
                className='mt-1'
              />
              <div className='flex-1'>
                <p className='text-sm text-white'>
                  I agree to the{' '}
                  <a
                    href='/privacy'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary hover:underline'
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Confirm.displayName = 'Confirm';

export default Confirm;
