import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  FileText,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function HowToWriteEvidencePage() {
  return (
    <div className='container mx-auto max-w-4xl px-4 py-12'>
      <div className='mb-8'>
        <h1 className='mb-4 text-4xl font-bold'>
          How to Write Milestone Evidence
        </h1>
        <p className='text-muted-foreground text-lg'>
          A comprehensive guide to documenting your milestone achievements
          effectively
        </p>
      </div>

      <div className='space-y-6'>
        {/* What is Evidence */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              What is Milestone Evidence?
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p>
              Milestone evidence is documentation that proves you have completed
              the work outlined in your milestone. It helps stakeholders,
              contributors, and reviewers verify that the milestone objectives
              have been met.
            </p>
            <Alert className='border-blue-500/30 bg-blue-500/10'>
              <AlertDescription>
                <strong>Pro Tip:</strong> Good evidence is specific, verifiable,
                and clearly demonstrates progress toward your milestone goals.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Key Components */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5' />
              Key Components of Good Evidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='border-primary border-l-4 pl-4'>
                <h3 className='mb-2 font-semibold'>1. Clear Description</h3>
                <p className='text-muted-foreground text-sm'>
                  Explain what was accomplished in clear, concise language.
                  Avoid jargon and assume your reader may not be familiar with
                  technical details.
                </p>
              </div>

              <div className='border-primary border-l-4 pl-4'>
                <h3 className='mb-2 font-semibold'>2. Deliverables</h3>
                <p className='text-muted-foreground text-sm'>
                  List specific deliverables that were completed. This could
                  include code, designs, documentation, or other tangible
                  outputs.
                </p>
              </div>

              <div className='border-primary border-l-4 pl-4'>
                <h3 className='mb-2 font-semibold'>3. Supporting Links</h3>
                <p className='text-muted-foreground text-sm'>
                  Include relevant links to GitHub commits, pull requests,
                  deployed demos, documents, or other resources that verify your
                  work.
                </p>
              </div>

              <div className='border-primary border-l-4 pl-4'>
                <h3 className='mb-2 font-semibold'>4. Metrics & Results</h3>
                <p className='text-muted-foreground text-sm'>
                  When applicable, include quantifiable results such as
                  performance improvements, test coverage, or other measurable
                  outcomes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Template */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <LinkIcon className='h-5 w-5' />
              Evidence Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='bg-muted/50 space-y-4 rounded-lg p-4 font-mono text-sm'>
              <div>
                <p className='mb-2 font-semibold'>## Summary</p>
                <p className='text-muted-foreground'>
                  Brief overview of what was accomplished in this milestone.
                </p>
              </div>

              <div>
                <p className='mb-2 font-semibold'>## Deliverables</p>
                <p className='text-muted-foreground'>
                  - Implemented user authentication system
                  <br />
                  - Created API documentation
                  <br />- Added unit tests with 85% coverage
                </p>
              </div>

              <div>
                <p className='mb-2 font-semibold'>## Links & Resources</p>
                <p className='text-muted-foreground'>
                  - GitHub PR: https://github.com/...
                  <br />
                  - Live Demo: https://demo.example.com
                  <br />- Documentation: https://docs.example.com
                </p>
              </div>

              <div>
                <p className='mb-2 font-semibold'>## Results</p>
                <p className='text-muted-foreground'>
                  - All acceptance criteria met
                  <br />
                  - 20% improvement in load time
                  <br />- Zero critical bugs in testing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-3'>
              <li className='flex items-start gap-3'>
                <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-green-500' />
                <div>
                  <p className='font-semibold'>Be Specific</p>
                  <p className='text-muted-foreground text-sm'>
                    Provide concrete examples and specific details rather than
                    vague statements
                  </p>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-green-500' />
                <div>
                  <p className='font-semibold'>Include Proof</p>
                  <p className='text-muted-foreground text-sm'>
                    Always link to verifiable sources like code repositories,
                    demos, or documents
                  </p>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-green-500' />
                <div>
                  <p className='font-semibold'>Keep It Professional</p>
                  <p className='text-muted-foreground text-sm'>
                    Use clear, professional language and proper formatting
                  </p>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-green-500' />
                <div>
                  <p className='font-semibold'>Address Challenges</p>
                  <p className='text-muted-foreground text-sm'>
                    If you faced obstacles, briefly mention them and how you
                    overcame them
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* What to Avoid */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-amber-500' />
              What to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-3'>
              <li className='flex items-start gap-3'>
                <span className='mt-0.5 font-bold text-red-500'>✗</span>
                <div>
                  <p className='font-semibold'>Vague Descriptions</p>
                  <p className='text-muted-foreground text-sm'>
                    &quot;Made some progress&quot; or &quot;Did some work&quot;
                    don&apos;t provide useful information
                  </p>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-0.5 font-bold text-red-500'>✗</span>
                <div>
                  <p className='font-semibold'>Missing Links</p>
                  <p className='text-muted-foreground text-sm'>
                    Evidence without verifiable links makes it difficult to
                    review your work
                  </p>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-0.5 font-bold text-red-500'>✗</span>
                <div>
                  <p className='font-semibold'>Excessive Length</p>
                  <p className='text-muted-foreground text-sm'>
                    Keep it concise - reviewers appreciate brevity and clarity
                  </p>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='mt-0.5 font-bold text-red-500'>✗</span>
                <div>
                  <p className='font-semibold'>Broken Links</p>
                  <p className='text-muted-foreground text-sm'>
                    Always verify that your links work before submitting
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className='bg-primary/10 border-primary/30'>
          <CardContent className='pt-6'>
            <div className='space-y-4 text-center'>
              <h3 className='text-xl font-semibold'>
                Ready to Submit Evidence?
              </h3>
              <p className='text-muted-foreground'>
                Use the template and guidelines above to document your milestone
                achievements.
              </p>
              <Link
                href='/me/crowdfunding'
                className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium'
              >
                Go to My Campaigns
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
