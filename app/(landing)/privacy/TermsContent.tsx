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
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'accounts', label: 'Accounts & Acceptable Use' },
  { id: 'funding', label: 'Funding & Projects' },
  { id: 'bounties', label: 'Bounties' },
  { id: 'backer-rights', label: 'Backer Rights' },
  { id: 'hackathons', label: 'Hackathons & Grants' },
  { id: 'liability', label: 'Liability & Disclaimers' },
  { id: 'governing-law', label: 'Governing Law' },
  { id: 'contact', label: 'Contact' },
];

const TermsContent = () => {
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
              Terms of Service
            </h1>
            <p className='text-xs font-bold text-gray-400 italic'>
              LAST UPDATED: November 26, 2025
            </p>
            <p className='text-sm leading-relaxed text-gray-300'>
              These Terms of Service ("Terms") govern your access to and use of
              the Platform, including any content, functionality, and services
              offered on or through the Platform (collectively, the "Platform").
              Please read them carefully. If you do not agree, you may not use
              the Platform.
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
                  Welcome to Boundless! We are a platform that empowers
                  innovators to validate ideas, raise funds, and access grants,
                  hackathons and bounties using milestone-based funding, powered
                  by the Stellar blockchain and Trustless Work escrow APIs.
                </p>
                <p>
                  By accessing or using our Platform, you agree to be bound by
                  these Terms. If you do not agree to these Terms, you may not
                  use the Platform.
                </p>
              </div>
            </section>

            {/* Eligibility */}
            <section
              id='eligibility'
              ref={setSectionRef('eligibility')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Eligibility
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  You must be at least 18 years old or the legal age of majority
                  in your jurisdiction to use the Platform. By using the
                  Platform, you represent and warrant that you are capable of
                  entering into a binding contract.
                </p>
              </div>
            </section>

            {/* Accounts & Acceptable Use */}
            <section
              id='accounts'
              ref={setSectionRef('accounts')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Accounts & Acceptable Use
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  To create projects, apply for grants, or participate in
                  hackathons, you must create an account. You agree to provide
                  accurate, current, and complete information during
                  registration and to update such information to keep it
                  accurate, current, and complete.
                </p>
                <p>You agree not to:</p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>
                    Create fraudulent, misleading, or deceptive projects or
                    campaigns
                  </li>
                  <li>
                    Use the Platform to spam, harass, or exploit other users
                  </li>
                  <li>
                    Use the Platform in any way that could harm, disable, or
                    impair the Platform or interfere with any other party's use
                    of the Platform
                  </li>
                  <li>
                    Use the Platform for any unlawful purpose or in violation of
                    any applicable laws or regulations
                  </li>
                </ul>
                <p>
                  Boundless reserves the right to suspend or terminate your
                  account if you violate these Terms or engage in any activity
                  that we determine, in our sole discretion, is harmful to the
                  Platform or other users.
                </p>
              </div>
            </section>

            {/* Funding & Projects */}
            <section
              id='funding'
              ref={setSectionRef('funding')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Funding & Projects
              </h2>
              <div className='space-y-6 text-sm leading-relaxed text-gray-300'>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Project Creator Responsibilities
                  </h3>
                  <p>
                    Project creators are responsible for providing accurate
                    project information, setting realistic milestones, and
                    delivering on their commitments. You must clearly
                    communicate your project goals, timeline, and use of funds.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Escrow Model
                  </h3>
                  <p>
                    Funds are held in escrow using milestone-based funding.
                    Funds are released only upon proof-of-work completion and
                    approval. This ensures accountability and protects both
                    creators and backers.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Not a Bank
                  </h3>
                  <p>
                    Boundless is not a bank, financial institution, or
                    investment advisor. Contributions made through the Platform
                    are not deposits, investments, or loans. We do not provide
                    financial advice or guarantee returns.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Risk Disclosure
                  </h3>
                  <p>
                    Projects may fail, and there are no guarantees that projects
                    will be completed or that backers will receive any rewards
                    or returns. You acknowledge and accept these risks when
                    using the Platform.
                  </p>
                </div>
              </div>
            </section>

            {/* Backer Rights */}
            <section
              id='backer-rights'
              ref={setSectionRef('backer-rights')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Backer Rights
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Contributions are voluntary and made at your own risk. Unless
                  explicitly stated, contributions do not grant you equity,
                  ownership, or financial returns. Boundless does not guarantee
                  project outcomes or provide refunds.
                </p>
              </div>
            </section>

            {/* Hackathons & Grants */}
            <section
              id='hackathons'
              ref={setSectionRef('hackathons')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Hackathons & Grants
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Hackathons and grant programs may have multiple winners, and
                  prize pools are distributed according to the specific program
                  rules. By participating, you agree to the rules and terms
                  specific to each program.
                </p>
                <p>
                  Boundless reserves the right to verify eligibility, disqualify
                  entries that violate program rules, and modify program terms
                  as necessary.
                </p>
              </div>
            </section>

            {/* Liability & Disclaimers */}
            <section
              id='liability'
              ref={setSectionRef('liability')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Liability & Disclaimers
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  The Platform is provided "as is" and "as available" without
                  warranties of any kind, either express or implied. Boundless
                  does not warrant that the Platform will be uninterrupted,
                  error-free, or secure.
                </p>
                <p>Boundless disclaims liability for:</p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>Project failures or non-delivery</li>
                  <li>Fraudulent or misrepresented projects</li>
                  <li>Blockchain or network issues</li>
                  <li>API failures or technical problems</li>
                  <li>
                    Loss of funds due to user error (e.g., lost keys, wrong
                    addresses)
                  </li>
                  <li>
                    Indirect, incidental, or consequential damages arising from
                    use of the Platform
                  </li>
                </ul>
              </div>
            </section>

            {/* Governing Law */}
            <section
              id='governing-law'
              ref={setSectionRef('governing-law')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Governing Law
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  These Terms are governed by the laws of [Insert Jurisdiction]
                  (e.g., Delaware, USA), without regard to its conflict of law
                  provisions.
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
                  If you have questions about these Terms, please contact us:
                </p>
                <div className='flex flex-col gap-3'>
                  <a
                    href='mailto:collins@boundlessfi.xyz?cc=benjamin@boundlessfi.xyz'
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
              </div>
            </section>
          </main>
        </div>
      </div>
      <TestimonialsSection testimonials={testimonials} />
    </div>
  );
};

export default TermsContent;
