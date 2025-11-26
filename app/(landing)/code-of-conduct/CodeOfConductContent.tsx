'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Search, Mail, Globe } from 'lucide-react';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';

const testimonials = [
  {
    id: 1,
    name: 'Amira',
    username: 'amira123',
    message:
      'Raising funds on Boundless was simple, transparent, and faster than I imagined.',
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: 2,
    name: 'Sofia',
    username: 'sofia_ui',
    message:
      'The milestone-based escrow changed everything. Backers trusted us because they know funds would only unlock on real progress. That accountability made our campaign stronger.',
    avatarUrl: 'https://i.pravatar.cc/150?img=44',
  },
  {
    id: 3,
    name: 'James',
    username: 'james_dev',
    message:
      'Community voting gave us early validation before launch. It felt amazing to know backers believed in our vision from day one.',
    avatarUrl: 'https://i.pravatar.cc/150?img=22',
  },
  {
    id: 4,
    name: 'Omari',
    username: 'omari_innovates',
    message: 'It feels like the future of crowdfunding.',
    avatarUrl: 'https://i.pravatar.cc/150?img=10',
  },
  {
    id: 5,
    name: 'James',
    username: 'james_builds',
    message:
      'Before Boundless, raising funds was overwhelming. Now, I can focus on building while the platform handles transparency.',
    avatarUrl: 'https://i.pravatar.cc/150?img=22',
  },
  {
    id: 6,
    name: 'Winston',
    username: 'winston_design',
    message: 'Every startup needs this kind of system.',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: 7,
    name: 'Team Lead',
    username: 'team_lead',
    message:
      'Boundless gave our team the confidence to launch. The milestone-based funding kept us accountable every step of the way.',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
  },
];

const tableOfContents = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'our-pledge', label: 'Our Pledge' },
  { id: 'expected-behavior', label: 'Expected Behavior' },
  { id: 'unacceptable-behavior', label: 'Unacceptable Behavior' },
  { id: 'bounties', label: 'Bounties and Task-Based Work' },
  { id: 'enforcement', label: 'Enforcement Responsibilities' },
  { id: 'scope', label: 'Scope' },
  { id: 'reporting', label: 'Reporting Violations' },
  { id: 'enforcement-guidelines', label: 'Enforcement Guidelines' },
  { id: 'attribution', label: 'Attribution' },
  { id: 'contact', label: 'Contact' },
];

const CodeOfConductContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('introduction');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const section of tableOfContents) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const targetPosition = element.offsetTop - 100;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  };

  const setSectionRef = (sectionId: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[sectionId] = el;
  };

  const filteredTOC = tableOfContents.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='relative min-h-screen bg-black text-white'>
      {/* Header Background */}
      <div className='absolute top-0 left-0 max-h-[132px] w-2/5'>
        <Image
          src='/grid-bg.svg'
          alt='Background'
          width={1000}
          height={132}
          className='max-h-[132px] min-w-2/5 object-cover'
          loading='lazy'
        />
      </div>

      {/* Main Content */}
      <div className='relative mx-auto max-w-[1440px] px-5 pt-10 pb-20 md:px-[50px] lg:px-[100px]'>
        {/* Header Section */}
        <div className='mb-16 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between'>
          <div className='w-full space-y-4 lg:w-[429px]'>
            <h1 className='text-4xl font-normal md:text-5xl'>
              Code of Conduct
            </h1>
            <p className='text-xs font-bold text-gray-400 italic'>
              LAST UPDATED: November 26, 2025
            </p>
            <p className='text-sm leading-relaxed text-gray-300'>
              This Code of Conduct outlines our expectations for all
              participants in the Boundless community, including creators,
              backers, contributors, and visitors. We are committed to providing
              a welcoming and inclusive environment for everyone.
            </p>
          </div>
          <div className='relative flex-1 lg:flex lg:justify-end'>
            <div className='relative z-10'>
              <Image
                src='/sheets-of-documents.svg'
                alt='Documents'
                width={331}
                height={300}
                className='h-auto w-full max-w-[331px] object-cover'
                loading='lazy'
              />
            </div>
            <div className='absolute -right-8 -bottom-8 -z-0 max-h-[132px] w-full opacity-50'>
              <Image
                src='/grid-bg.svg'
                alt='Background'
                width={1000}
                height={132}
                className='max-h-[132px] w-full object-cover'
                loading='lazy'
              />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className='flex flex-col gap-8 lg:flex-row'>
          {/* Left Column - Table of Contents */}
          <aside className='w-full lg:sticky lg:top-24 lg:h-fit lg:w-64 lg:flex-shrink-0'>
            <div className='space-y-6'>
              {/* Search Bar */}
              <div className='relative'>
                <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search keyword'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full rounded-lg border border-[#2B2B2B] bg-[#101010] py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-gray-500 focus:border-[#A7F950] focus:ring-1 focus:ring-[#A7F950] focus:outline-none'
                />
              </div>

              {/* Table of Contents */}
              <div className='space-y-2'>
                <h2 className='text-lg font-semibold text-white'>
                  Table of Contents
                </h2>
                <nav className='space-y-1'>
                  {filteredTOC.length > 0 ? (
                    filteredTOC.map(item => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`block w-full rounded px-3 py-2 text-left text-sm transition-colors hover:bg-[#1a1a1a] ${
                          activeSection === item.id
                            ? 'bg-[#1a1a1a] text-[#A7F950]'
                            : 'text-gray-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))
                  ) : (
                    <p className='px-3 py-2 text-sm text-gray-500'>
                      No results found
                    </p>
                  )}
                </nav>
              </div>
            </div>
          </aside>

          {/* Right Column - Main Content */}
          <main className='flex-1 space-y-12'>
            {/* Introduction */}
            <section
              id='introduction'
              ref={setSectionRef('introduction')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Introduction
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Boundless is committed to fostering a positive, inclusive, and
                  respectful community where innovators can collaborate, share
                  ideas, and build meaningful projects. This Code of Conduct
                  applies to all participants in our community, including but
                  not limited to:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>Project creators and team members</li>
                  <li>Backers and supporters</li>
                  <li>Contributors to open-source projects</li>
                  <li>Hackathon and grant participants</li>
                  <li>Community moderators and administrators</li>
                  <li>Boundless team members and staff</li>
                  <li>All visitors and users of the Platform</li>
                </ul>
                <p>
                  By participating in the Boundless community, you agree to
                  abide by this Code of Conduct. Violations may result in
                  warnings, temporary suspensions, or permanent bans from the
                  Platform.
                </p>
              </div>
            </section>

            {/* Our Pledge */}
            <section
              id='our-pledge'
              ref={setSectionRef('our-pledge')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Our Pledge
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  We pledge to make participation in our community a
                  harassment-free experience for everyone, regardless of:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>Age, body size, or appearance</li>
                  <li>Disability or ability</li>
                  <li>Ethnicity, nationality, or race</li>
                  <li>Gender identity and expression</li>
                  <li>Level of experience or expertise</li>
                  <li>Education or socioeconomic status</li>
                  <li>Personal appearance or style</li>
                  <li>Religion or belief system</li>
                  <li>Sexual identity and orientation</li>
                  <li>Technology choices or preferences</li>
                </ul>
                <p>
                  We are committed to creating an environment where diverse
                  perspectives are welcomed, respected, and valued. We believe
                  that innovation thrives when people from different backgrounds
                  and experiences come together.
                </p>
              </div>
            </section>

            {/* Expected Behavior */}
            <section
              id='expected-behavior'
              ref={setSectionRef('expected-behavior')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Expected Behavior
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  The following behaviors are expected and requested of all
                  community members:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>
                    <strong>Be respectful and inclusive:</strong> Use welcoming
                    and inclusive language. Be respectful of differing
                    viewpoints and experiences.
                  </li>
                  <li>
                    <strong>Be collaborative:</strong> Work together to build
                    something greater than any individual contribution. Share
                    knowledge and help others learn.
                  </li>
                  <li>
                    <strong>Be honest and transparent:</strong> Provide accurate
                    information about projects, milestones, and use of funds. Be
                    upfront about challenges and setbacks.
                  </li>
                  <li>
                    <strong>Be constructive:</strong> When providing feedback or
                    criticism, focus on being helpful and constructive rather
                    than destructive.
                  </li>
                  <li>
                    <strong>Be accountable:</strong> Take responsibility for
                    your actions and their consequences. Acknowledge mistakes
                    and work to correct them.
                  </li>
                  <li>
                    <strong>Be professional:</strong> Maintain professional
                    standards in all interactions, whether public or private.
                  </li>
                  <li>
                    <strong>Respect privacy:</strong> Respect others' privacy
                    and personal boundaries. Do not share private information
                    without consent.
                  </li>
                  <li>
                    <strong>Follow Platform rules:</strong> Adhere to our Terms
                    of Service, Privacy Policy, and all Platform guidelines.
                  </li>
                </ul>
              </div>
            </section>

            {/* Unacceptable Behavior */}
            <section
              id='unacceptable-behavior'
              ref={setSectionRef('unacceptable-behavior')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Unacceptable Behavior
              </h2>
              <div className='space-y-6 text-sm leading-relaxed text-gray-300'>
                <p>
                  The following behaviors are considered harassment and are
                  unacceptable in our community:
                </p>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Harassment and Discrimination
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>
                      The use of sexualized language or imagery, and sexual
                      attention or advances of any kind
                    </li>
                    <li>
                      Trolling, insulting or derogatory comments, and personal
                      or political attacks
                    </li>
                    <li>
                      Public or private harassment, stalking, or following
                    </li>
                    <li>
                      Publishing others' private information, such as physical
                      or electronic addresses, without explicit permission
                    </li>
                    <li>
                      Discriminatory jokes, language, or imagery related to
                      race, gender, religion, nationality, disability, sexual
                      orientation, or other protected characteristics
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Fraud and Misrepresentation
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>
                      Creating fraudulent, misleading, or deceptive projects or
                      campaigns
                    </li>
                    <li>
                      Misrepresenting your identity, credentials, or
                      affiliations
                    </li>
                    <li>
                      Providing false information about project progress,
                      milestones, or use of funds
                    </li>
                    <li>
                      Impersonating other users, organizations, or public
                      figures
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Spam and Abuse
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>
                      Spamming, including unsolicited promotional messages or
                      repetitive content
                    </li>
                    <li>Manipulating votes, reviews, or engagement metrics</li>
                    <li>
                      Creating multiple accounts to circumvent restrictions or
                      penalties
                    </li>
                    <li>
                      Attempting to hack, disrupt, or compromise Platform
                      security
                    </li>
                    <li>
                      Exploiting bugs or vulnerabilities for personal gain
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Other Unacceptable Behaviors
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>Threats of violence or incitement to violence</li>
                    <li>Encouraging or facilitating illegal activities</li>
                    <li>Sharing malicious code, links, or content</li>
                    <li>Violating intellectual property rights or copyright</li>
                    <li>
                      Any other conduct that could reasonably be considered
                      inappropriate in a professional setting
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Bounties and Task-Based Work */}
            <section
              id='bounties'
              ref={setSectionRef('bounties')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Bounties and Task-Based Work
              </h2>
              <div className='space-y-6 text-sm leading-relaxed text-gray-300'>
                <p>
                  Bounties on Boundless are task-specific opportunities where
                  creators post specific tasks and offer rewards for completion.
                  All participants in the bounty system must adhere to this Code
                  of Conduct.
                </p>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Bounty Creator Expectations
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>
                      Provide clear, detailed task descriptions and requirements
                    </li>
                    <li>Set fair and reasonable reward amounts</li>
                    <li>
                      Review submissions promptly and provide constructive
                      feedback
                    </li>
                    <li>
                      Approve and pay for completed work that meets requirements
                    </li>
                    <li>Communicate respectfully with bounty hunters</li>
                    <li>
                      Do not cancel bounties unfairly or after work has been
                      completed
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Bounty Hunter Expectations
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>Only claim bounties you can reasonably complete</li>
                    <li>
                      Deliver work that meets or exceeds the stated requirements
                    </li>
                    <li>
                      Submit original work and disclose any third-party
                      dependencies
                    </li>
                    <li>
                      Respond professionally to feedback and revision requests
                    </li>
                    <li>Do not submit plagiarized or stolen work</li>
                    <li>Do not claim multiple bounties for the same task</li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Unacceptable Bounty Practices
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>Creating bounties for illegal or harmful tasks</li>
                    <li>Posting misleading or deceptive bounty descriptions</li>
                    <li>
                      Refusing to pay for completed work that meets requirements
                    </li>
                    <li>Submitting incomplete or substandard work</li>
                    <li>Claiming bounties without intent to complete them</li>
                    <li>Colluding to manipulate bounty outcomes</li>
                    <li>Using multiple accounts to claim the same bounty</li>
                  </ul>
                </div>
                <p>
                  Violations of bounty-related conduct may result in warnings,
                  temporary bans, or permanent removal from the bounty system.
                </p>
              </div>
            </section>

            {/* Enforcement Responsibilities */}
            <section
              id='enforcement'
              ref={setSectionRef('enforcement')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Enforcement Responsibilities
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Community leaders, moderators, and Boundless team members are
                  responsible for clarifying and enforcing our standards of
                  acceptable behavior. They will take appropriate and fair
                  corrective action in response to any behavior that they deem
                  inappropriate, threatening, offensive, or harmful.
                </p>
                <p>
                  Community leaders have the right and responsibility to remove,
                  edit, or reject comments, commits, code, wiki edits, issues,
                  and other contributions that are not aligned with this Code of
                  Conduct, or to ban temporarily or permanently any contributor
                  for other behaviors they deem inappropriate, threatening,
                  offensive, or harmful.
                </p>
              </div>
            </section>

            {/* Scope */}
            <section
              id='scope'
              ref={setSectionRef('scope')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>Scope</h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  This Code of Conduct applies within all community spaces, and
                  also applies when an individual is officially representing the
                  community in public spaces. Examples of representing our
                  community include:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>Using an official Boundless email address</li>
                  <li>Posting via an official social media account</li>
                  <li>
                    Acting as an appointed representative at an online or
                    offline event
                  </li>
                  <li>
                    Participating in Boundless-sponsored hackathons, grants, or
                    events
                  </li>
                  <li>Representing Boundless in public forums or media</li>
                </ul>
                <p>
                  Representation of a project may be further defined and
                  clarified by community leaders and Boundless administrators.
                </p>
              </div>
            </section>

            {/* Reporting Violations */}
            <section
              id='reporting'
              ref={setSectionRef('reporting')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Reporting Violations
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Instances of abusive, harassing, or otherwise unacceptable
                  behavior may be reported to the community leaders responsible
                  for enforcement. All complaints will be reviewed and
                  investigated promptly and fairly.
                </p>
                <p>When reporting a violation, please provide:</p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>Your contact information (for follow-up)</li>
                  <li>Names and usernames of individuals involved</li>
                  <li>
                    Description of the incident, including date, time, and
                    location
                  </li>
                  <li>Any relevant screenshots, links, or evidence</li>
                  <li>
                    Witnesses or other individuals who can provide context
                  </li>
                </ul>
                <p>
                  All reports will be kept confidential to the extent possible
                  while allowing for a thorough investigation. We are committed
                  to protecting the privacy and safety of those who report
                  violations.
                </p>
                <p>
                  <strong>Important:</strong> If you believe someone is in
                  immediate danger, contact local law enforcement immediately.
                </p>
              </div>
            </section>

            {/* Enforcement Guidelines */}
            <section
              id='enforcement-guidelines'
              ref={setSectionRef('enforcement-guidelines')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Enforcement Guidelines
              </h2>
              <div className='space-y-6 text-sm leading-relaxed text-gray-300'>
                <p>
                  Community leaders will follow these Community Impact
                  Guidelines in determining the consequences for any action they
                  deem in violation of this Code of Conduct:
                </p>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    1. Correction
                  </h3>
                  <p>
                    <strong>Community Impact:</strong> Use of inappropriate
                    language or other behavior deemed unprofessional or
                    unwelcome in the community.
                  </p>
                  <p>
                    <strong>Consequence:</strong> A private, written warning
                    from community leaders, providing clarity around the nature
                    of the violation and an explanation of why the behavior was
                    inappropriate. A public apology may be requested.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    2. Warning
                  </h3>
                  <p>
                    <strong>Community Impact:</strong> A violation through a
                    single incident or series of actions.
                  </p>
                  <p>
                    <strong>Consequence:</strong> A warning with consequences
                    for continued behavior. No interaction with the people
                    involved, including unsolicited interaction with those
                    enforcing the Code of Conduct, for a specified period of
                    time. This includes avoiding interactions in community
                    spaces as well as external channels like social media.
                    Violating these terms may lead to a temporary or permanent
                    ban.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    3. Temporary Ban
                  </h3>
                  <p>
                    <strong>Community Impact:</strong> A serious violation of
                    community standards, including sustained inappropriate
                    behavior.
                  </p>
                  <p>
                    <strong>Consequence:</strong> A temporary ban from any sort
                    of interaction or public communication with the community
                    for a specified period of time. No public or private
                    interaction with the people involved, including unsolicited
                    interaction with those enforcing the Code of Conduct, is
                    allowed during this period. Violating these terms may lead
                    to a permanent ban.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    4. Permanent Ban
                  </h3>
                  <p>
                    <strong>Community Impact:</strong> Demonstrating a pattern
                    of violation of community standards, including sustained
                    inappropriate behavior, harassment of an individual, or
                    aggression toward or disparagement of classes of
                    individuals.
                  </p>
                  <p>
                    <strong>Consequence:</strong> A permanent ban from any sort
                    of public interaction within the community.
                  </p>
                </div>
              </div>
            </section>

            {/* Attribution */}
            <section
              id='attribution'
              ref={setSectionRef('attribution')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Attribution
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  This Code of Conduct is adapted from the Contributor Covenant,
                  version 2.
                </p>
                <p>
                  For answers to common questions about this code of conduct,
                  see{' '}
                  <a
                    href='https://www.contributor-covenant.org/faq'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[#A7F950] hover:underline'
                  >
                    https://www.contributor-covenant.org/faq
                  </a>
                </p>
                <p>
                  This Code of Conduct has been customized for the Boundless
                  community to address our specific needs as a blockchain-based
                  crowdfunding platform.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section
              id='contact'
              ref={setSectionRef('contact')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Contact
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  If you have questions about this Code of Conduct or need to
                  report a violation, please contact us:
                </p>
                <div className='flex flex-col gap-3'>
                  <a
                    href='mailto:collins@boundlessfi.xyz?cc=benjamin@boundlessfi.xyz&subject=Code%20of%20Conduct%20Inquiry'
                    className='flex items-center gap-2 text-[#A7F950] hover:underline'
                  >
                    <Mail className='h-4 w-4' />
                    <span>collins@boundlessfi.xyz</span>
                  </a>
                  <a
                    href='https://boundlessfi.xyz'
                    className='flex items-center gap-2 text-[#A7F950] hover:underline'
                  >
                    <Globe className='h-4 w-4' />
                    <span>https://boundlessfi.xyz</span>
                  </a>
                </div>
                <p className='mt-4'>
                  For urgent matters or immediate safety concerns, please
                  contact your local law enforcement authorities.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
      <TestimonialsSection testimonials={testimonials} />
    </div>
  );
};

export default CodeOfConductContent;
