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
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use', label: 'How We Use Your Information' },
  { id: 'information-sharing', label: 'Information Sharing and Disclosure' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'your-rights', label: 'Your Rights and Choices' },
  { id: 'bounties', label: 'Bounties and Task-Based Work' },
  { id: 'cookies', label: 'Cookies and Tracking Technologies' },
  { id: 'third-party', label: 'Third-Party Services' },
  { id: 'children-privacy', label: "Children's Privacy" },
  { id: 'international-transfers', label: 'International Data Transfers' },
  { id: 'changes', label: 'Changes to This Privacy Policy' },
  { id: 'contact', label: 'Contact Us' },
];

const PrivacyContent = () => {
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
            <h1 className='text-4xl font-normal md:text-5xl'>Privacy Policy</h1>
            <p className='text-xs font-bold text-gray-400 italic'>
              LAST UPDATED: November 26, 2025
            </p>
            <p className='text-sm leading-relaxed text-gray-300'>
              This Privacy Policy ("Policy") describes how Boundless ("we,"
              "our," or "us") collects, uses, and protects your personal
              information when you use our Platform. By using the Platform, you
              agree to the collection and use of information in accordance with
              this Policy.
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
                  At Boundless, we are committed to protecting your privacy and
                  ensuring the security of your personal information. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our Platform, which
                  includes our website, mobile applications, and related
                  services.
                </p>
                <p>
                  We operate a platform that enables innovators to validate
                  ideas, raise funds, and access grants, hackathons and bounties
                  using milestone-based funding, powered by the Stellar
                  blockchain and Trustless Work escrow APIs.
                </p>
                <p>
                  By using our Platform, you consent to the data practices
                  described in this Policy. If you do not agree with the
                  practices described in this Policy, please do not use our
                  Platform.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section
              id='information-we-collect'
              ref={setSectionRef('information-we-collect')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Information We Collect
              </h2>
              <div className='space-y-6 text-sm leading-relaxed text-gray-300'>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Information You Provide
                  </h3>
                  <p>We collect information that you provide directly to us:</p>
                  <ul className='mt-2 ml-6 list-disc space-y-2'>
                    <li>
                      Account information: name, email address, username,
                      password, and profile information
                    </li>
                    <li>
                      Project information: project descriptions, milestones,
                      funding goals, and related content
                    </li>
                    <li>
                      Payment information: wallet addresses, transaction
                      details, and payment preferences
                    </li>
                    <li>
                      Communication data: messages, comments, feedback, and
                      correspondence with us or other users
                    </li>
                    <li>
                      Profile data: profile pictures, biography, social media
                      links, and other information you choose to share
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Automatically Collected Information
                  </h3>
                  <p>
                    When you use our Platform, we automatically collect certain
                    information:
                  </p>
                  <ul className='mt-2 ml-6 list-disc space-y-2'>
                    <li>
                      Usage data: pages visited, features used, time spent on
                      the Platform, and navigation patterns
                    </li>
                    <li>
                      Device information: IP address, browser type, operating
                      system, device identifiers, and mobile network information
                    </li>
                    <li>
                      Log data: access times, error logs, and system activity
                    </li>
                    <li>
                      Location data: general location information based on IP
                      address (with your consent)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Blockchain Information
                  </h3>
                  <p>
                    As a blockchain-based platform, certain information is
                    publicly available on the Stellar blockchain:
                  </p>
                  <ul className='mt-2 ml-6 list-disc space-y-2'>
                    <li>
                      Transaction data: public wallet addresses, transaction
                      amounts, and transaction hashes
                    </li>
                    <li>
                      Smart contract interactions: escrow contract addresses and
                      milestone completion data
                    </li>
                    <li>
                      On-chain activity: public records of funding activities
                      and project milestones
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section
              id='how-we-use'
              ref={setSectionRef('how-we-use')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                How We Use Your Information
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  We use the information we collect for the following purposes:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>
                    To provide, maintain, and improve our Platform and services
                  </li>
                  <li>
                    To process transactions, manage escrow contracts, and
                    facilitate milestone-based funding
                  </li>
                  <li>
                    To create and manage your account, authenticate your
                    identity, and provide customer support
                  </li>
                  <li>
                    To communicate with you about your account, projects,
                    updates, and important Platform changes
                  </li>
                  <li>
                    To personalize your experience and deliver relevant content
                    and recommendations
                  </li>
                  <li>
                    To detect, prevent, and address fraud, security issues, and
                    other technical problems
                  </li>
                  <li>
                    To comply with legal obligations, enforce our Terms of
                    Service, and protect our rights
                  </li>
                  <li>
                    To conduct analytics, research, and improve our Platform's
                    functionality and user experience
                  </li>
                  <li>
                    To send you marketing communications (with your consent)
                    about new features, projects, and opportunities
                  </li>
                </ul>
              </div>
            </section>

            {/* Information Sharing and Disclosure */}
            <section
              id='information-sharing'
              ref={setSectionRef('information-sharing')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Information Sharing and Disclosure
              </h2>
              <div className='space-y-6 text-sm leading-relaxed text-gray-300'>
                <p>
                  We do not sell your personal information. We may share your
                  information in the following circumstances:
                </p>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Public Information
                  </h3>
                  <p>
                    Certain information is publicly visible on the Platform:
                  </p>
                  <ul className='mt-2 ml-6 list-disc space-y-2'>
                    <li>Your username and public profile information</li>
                    <li>
                      Project descriptions, milestones, and funding progress
                    </li>
                    <li>Public comments and interactions on the Platform</li>
                    <li>
                      Blockchain transaction data (wallet addresses and
                      transaction details)
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Service Providers
                  </h3>
                  <p>
                    We may share information with third-party service providers
                    who perform services on our behalf:
                  </p>
                  <ul className='mt-2 ml-6 list-disc space-y-2'>
                    <li>Cloud hosting and infrastructure providers</li>
                    <li>Payment processors and blockchain network providers</li>
                    <li>Analytics and data analysis services</li>
                    <li>Customer support and communication tools</li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Legal Requirements
                  </h3>
                  <p>
                    We may disclose information if required by law or in
                    response to valid legal requests, such as:
                  </p>
                  <ul className='mt-2 ml-6 list-disc space-y-2'>
                    <li>Court orders, subpoenas, or legal processes</li>
                    <li>Government investigations or regulatory inquiries</li>
                    <li>To protect our rights, property, or safety</li>
                    <li>To prevent fraud or illegal activities</li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Business Transfers
                  </h3>
                  <p>
                    In the event of a merger, acquisition, or sale of assets,
                    your information may be transferred to the acquiring entity,
                    subject to the same privacy protections.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section
              id='data-security'
              ref={setSectionRef('data-security')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Data Security
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  We implement appropriate technical and organizational measures
                  to protect your personal information:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>
                    Encryption: We use industry-standard encryption for data in
                    transit and at rest
                  </li>
                  <li>
                    Access controls: We limit access to personal information to
                    authorized personnel only
                  </li>
                  <li>
                    Security monitoring: We continuously monitor for security
                    threats and vulnerabilities
                  </li>
                  <li>
                    Regular audits: We conduct security audits and assessments
                    regularly
                  </li>
                </ul>
                <p>
                  However, no method of transmission over the internet or
                  electronic storage is 100% secure. While we strive to protect
                  your information, we cannot guarantee absolute security. You
                  are responsible for maintaining the confidentiality of your
                  account credentials and wallet keys.
                </p>
                <p>
                  <strong>Important:</strong> We do not store your private keys
                  or seed phrases. You are solely responsible for securing your
                  blockchain wallet and private keys. We cannot recover lost
                  keys or restore access to wallets.
                </p>
              </div>
            </section>

            {/* Your Rights and Choices */}
            <section
              id='your-rights'
              ref={setSectionRef('your-rights')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Your Rights and Choices
              </h2>
              <div className='space-y-6 text-sm leading-relaxed text-gray-300'>
                <p>
                  Depending on your location, you may have certain rights
                  regarding your personal information:
                </p>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Access and Portability
                  </h3>
                  <p>
                    You can access, update, or export your personal information
                    through your account settings or by contacting us.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Correction and Deletion
                  </h3>
                  <p>
                    You can correct inaccurate information or request deletion
                    of your personal data, subject to legal and contractual
                    obligations.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Opt-Out Rights
                  </h3>
                  <p>You can opt out of:</p>
                  <ul className='mt-2 ml-6 list-disc space-y-2'>
                    <li>
                      Marketing communications by clicking unsubscribe links or
                      updating your preferences
                    </li>
                    <li>
                      Certain tracking technologies through your browser
                      settings
                    </li>
                    <li>
                      Cookies through our cookie consent banner or browser
                      settings
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Account Deletion
                  </h3>
                  <p>
                    You can request account deletion, but note that some
                    information may remain in our records for legal or
                    operational purposes, and blockchain transaction data is
                    immutable and cannot be deleted.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Data Processing Objection
                  </h3>
                  <p>
                    You have the right to object to certain processing of your
                    personal information, including processing for direct
                    marketing purposes.
                  </p>
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
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  When you participate in bounties on Boundless, we collect and
                  process additional information:
                </p>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Bounty Creator Information
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>
                      Bounty descriptions, requirements, and completion criteria
                    </li>
                    <li>Escrow contract addresses and reward amounts</li>
                    <li>Review and approval decisions on submissions</li>
                    <li>Communication with bounty hunters</li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Bounty Hunter Information
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>Submissions, deliverables, and proof of completion</li>
                    <li>Claim history and completion records</li>
                    <li>Wallet addresses for receiving rewards</li>
                    <li>
                      Reputation and rating data based on completed bounties
                    </li>
                  </ul>
                </div>
                <p>
                  Bounty-related information is used to facilitate task
                  completion, verify work, process payments, and build
                  reputation systems. Some bounty information, such as task
                  descriptions and completion status, may be publicly visible on
                  the Platform.
                </p>
              </div>
            </section>

            {/* Cookies and Tracking Technologies */}
            <section
              id='cookies'
              ref={setSectionRef('cookies')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Cookies and Tracking Technologies
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  We use cookies and similar tracking technologies to collect
                  and store information about your use of our Platform:
                </p>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Types of Cookies
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>
                      Essential cookies: Required for the Platform to function
                      properly
                    </li>
                    <li>
                      Analytics cookies: Help us understand how users interact
                      with the Platform
                    </li>
                    <li>
                      Functional cookies: Remember your preferences and settings
                    </li>
                    <li>
                      Marketing cookies: Used to deliver relevant advertisements
                    </li>
                  </ul>
                </div>
                <p>
                  You can control cookies through your browser settings.
                  However, disabling certain cookies may limit your ability to
                  use some features of the Platform.
                </p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section
              id='third-party'
              ref={setSectionRef('third-party')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Third-Party Services
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Our Platform integrates with third-party services that have
                  their own privacy policies:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>
                    <strong>Stellar Network:</strong> Blockchain transactions
                    are processed on the public Stellar blockchain
                  </li>
                  <li>
                    <strong>Trustless Work:</strong> Escrow services are
                    provided through Trustless Work APIs
                  </li>
                  <li>
                    <strong>Wallet Providers:</strong> When you connect a
                    wallet, you interact with third-party wallet services
                  </li>
                  <li>
                    <strong>Analytics Services:</strong> We use analytics tools
                    to understand Platform usage
                  </li>
                </ul>
                <p>
                  We are not responsible for the privacy practices of
                  third-party services. We encourage you to review their privacy
                  policies.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section
              id='children-privacy'
              ref={setSectionRef('children-privacy')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Children's Privacy
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Our Platform is not intended for individuals under the age of
                  18. We do not knowingly collect personal information from
                  children under 18. If you are a parent or guardian and believe
                  your child has provided us with personal information, please
                  contact us immediately.
                </p>
                <p>
                  If we discover that we have collected information from a child
                  under 18, we will delete that information promptly.
                </p>
              </div>
            </section>

            {/* International Data Transfers */}
            <section
              id='international-transfers'
              ref={setSectionRef('international-transfers')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                International Data Transfers
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Your information may be transferred to and processed in
                  countries other than your country of residence. These
                  countries may have data protection laws that differ from those
                  in your country.
                </p>
                <p>
                  By using our Platform, you consent to the transfer of your
                  information to these countries. We take appropriate safeguards
                  to ensure your information receives adequate protection in
                  accordance with this Privacy Policy.
                </p>
              </div>
            </section>

            {/* Changes to This Privacy Policy */}
            <section
              id='changes'
              ref={setSectionRef('changes')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Changes to This Privacy Policy
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices, technology, legal requirements, or
                  other factors. We will notify you of material changes by:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>Posting the updated Policy on our Platform</li>
                  <li>
                    Updating the "Last Updated" date at the top of this Policy
                  </li>
                  <li>
                    Sending you an email notification (for significant changes)
                  </li>
                  <li>
                    Displaying a prominent notice on the Platform (for major
                    changes)
                  </li>
                </ul>
                <p>
                  Your continued use of the Platform after the effective date of
                  any changes constitutes your acceptance of the updated Privacy
                  Policy. We encourage you to review this Policy periodically.
                </p>
              </div>
            </section>

            {/* Contact Us */}
            <section
              id='contact'
              ref={setSectionRef('contact')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Contact Us
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  If you have questions, concerns, or requests regarding this
                  Privacy Policy or our data practices, please contact us:
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
                <p className='mt-4'>
                  For users in the European Economic Area (EEA), you also have
                  the right to lodge a complaint with your local data protection
                  authority if you believe we have not addressed your concerns
                  adequately.
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

export default PrivacyContent;
