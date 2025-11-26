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
  { id: 'not-financial-advice', label: 'Not Financial Advice' },
  { id: 'not-a-bank', label: 'Not a Bank or Financial Institution' },
  { id: 'no-investment-guarantees', label: 'No Investment Guarantees' },
  { id: 'project-risks', label: 'Project Risks' },
  { id: 'bounties', label: 'Bounty Risks' },
  { id: 'blockchain-risks', label: 'Blockchain and Technology Risks' },
  { id: 'escrow-disclaimer', label: 'Escrow and Smart Contract Disclaimer' },
  { id: 'regulatory-compliance', label: 'Regulatory Compliance' },
  { id: 'third-party-services', label: 'Third-Party Services' },
  { id: 'limitation-of-liability', label: 'Limitation of Liability' },
  { id: 'no-warranties', label: 'No Warranties' },
  { id: 'indemnification', label: 'Indemnification' },
  { id: 'changes-to-platform', label: 'Changes to Platform' },
  { id: 'contact', label: 'Contact' },
];

const DisclaimerContent = () => {
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
            <h1 className='text-4xl font-normal md:text-5xl'>Disclaimer</h1>
            <p className='text-xs font-bold text-gray-400 italic'>
              LAST UPDATED: November 26, 2025
            </p>
            <p className='text-sm leading-relaxed text-gray-300'>
              This Disclaimer contains important information about the risks,
              limitations, and disclaimers associated with using the Boundless
              Platform. Please read this Disclaimer carefully before using our
              Platform. By using the Platform, you acknowledge that you have
              read, understood, and agree to be bound by this Disclaimer.
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
                  Boundless is a platform that enables innovators to validate
                  ideas, raise funds, and access grants, hackathons and bounties
                  using milestone-based funding, powered by the Stellar
                  blockchain and Trustless Work escrow APIs.
                </p>
                <p>
                  This Disclaimer outlines the risks, limitations, and important
                  information you need to understand before using our Platform.
                  The use of blockchain technology, cryptocurrencies, and
                  crowdfunding involves substantial risk of loss. You should
                  carefully consider whether using our Platform is suitable for
                  you in light of your circumstances, knowledge, and financial
                  resources.
                </p>
                <p>
                  <strong>
                    By using the Platform, you acknowledge that you understand
                    and accept all risks described in this Disclaimer.
                  </strong>
                </p>
              </div>
            </section>

            {/* Not Financial Advice */}
            <section
              id='not-financial-advice'
              ref={setSectionRef('not-financial-advice')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Not Financial Advice
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Boundless does not provide financial, investment, legal, or
                  tax advice. All information provided on the Platform is for
                  informational purposes only and should not be construed as:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>Investment advice or recommendations</li>
                  <li>Financial planning or advisory services</li>
                  <li>Legal or tax advice</li>
                  <li>
                    Endorsement of any project, creator, or investment
                    opportunity
                  </li>
                  <li>Guarantees of returns or project success</li>
                </ul>
                <p>
                  You should consult with qualified professionals, including
                  financial advisors, legal counsel, and tax advisors, before
                  making any financial decisions or contributions through the
                  Platform.
                </p>
              </div>
            </section>

            {/* Not a Bank */}
            <section
              id='not-a-bank'
              ref={setSectionRef('not-a-bank')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Not a Bank or Financial Institution
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Boundless is not a bank, credit union, or other financial
                  institution. We do not:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>Accept deposits or provide banking services</li>
                  <li>Provide loans or credit facilities</li>
                  <li>Offer interest on funds held</li>
                  <li>Provide FDIC insurance or similar protections</li>
                  <li>Act as a custodian of your funds or assets</li>
                </ul>
                <p>
                  Funds contributed through the Platform are not deposits and
                  are not insured by any government agency or insurance program.
                  Your contributions are held in escrow smart contracts on the
                  Stellar blockchain, not in traditional bank accounts.
                </p>
              </div>
            </section>

            {/* No Investment Guarantees */}
            <section
              id='no-investment-guarantees'
              ref={setSectionRef('no-investment-guarantees')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                No Investment Guarantees
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Contributions made through the Platform are not investments in
                  the traditional sense. Unless explicitly stated, contributions
                  do not:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>Grant you equity, ownership, or voting rights</li>
                  <li>Provide guaranteed returns or financial gains</li>
                  <li>Create a debtor-creditor relationship</li>
                  <li>Constitute securities or investment contracts</li>
                  <li>Offer any form of financial return</li>
                </ul>
                <p>
                  Projects may fail, milestones may not be completed, and you
                  may lose all or part of your contribution. There are no
                  guarantees that:
                </p>
                <ul className='mt-2 ml-6 list-disc space-y-2'>
                  <li>Projects will be completed as described</li>
                  <li>Milestones will be achieved</li>
                  <li>You will receive any rewards or benefits</li>
                  <li>You will receive a refund of your contribution</li>
                </ul>
              </div>
            </section>

            {/* Project Risks */}
            <section
              id='project-risks'
              ref={setSectionRef('project-risks')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Project Risks
              </h2>
              <div className='space-y-6 text-sm leading-relaxed text-gray-300'>
                <p>
                  Contributing to projects on Boundless involves significant
                  risks:
                </p>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Project Failure Risk
                  </h3>
                  <p>
                    Projects may fail to deliver on their promises, milestones
                    may not be completed, or projects may be abandoned entirely.
                    You may lose your entire contribution with no recourse.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Fraud and Misrepresentation Risk
                  </h3>
                  <p>
                    While we take measures to verify projects, there is a risk
                    that project creators may misrepresent their intentions,
                    capabilities, or use of funds. We do not guarantee the
                    accuracy of project information or the legitimacy of
                    creators.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    No Refund Policy
                  </h3>
                  <p>
                    Contributions are generally non-refundable. Once funds are
                    released from escrow to project creators, they cannot be
                    recovered. Disputes are resolved according to our Terms of
                    Service, but there is no guarantee of refunds.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Market and Execution Risk
                  </h3>
                  <p>
                    Even legitimate projects face market risks, execution
                    challenges, competition, and other factors that may prevent
                    success. Past performance or promises do not guarantee
                    future results.
                  </p>
                </div>
              </div>
            </section>

            {/* Bounty Risks */}
            <section
              id='bounties'
              ref={setSectionRef('bounties')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Bounty Risks
              </h2>
              <div className='space-y-6 text-sm leading-relaxed text-gray-300'>
                <p>
                  Participating in bounties involves specific risks that you
                  should understand:
                </p>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Bounty Creator Risks
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>
                      Bounty hunters may submit incomplete or substandard work
                    </li>
                    <li>
                      Multiple submissions may require time to review and
                      evaluate
                    </li>
                    <li>
                      Disputes may arise about whether work meets requirements
                    </li>
                    <li>
                      Funds are locked in escrow until completion or
                      cancellation
                    </li>
                    <li>
                      Platform fees apply even if no satisfactory submission is
                      received
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Bounty Hunter Risks
                  </h3>
                  <ul className='ml-6 list-disc space-y-2'>
                    <li>
                      You may complete work that does not meet the creator's
                      expectations
                    </li>
                    <li>
                      Your submission may be rejected even if you believe it
                      meets requirements
                    </li>
                    <li>
                      Other hunters may submit work before you, potentially
                      claiming the reward
                    </li>
                    <li>
                      Bounties may be cancelled before you complete your work
                    </li>
                    <li>
                      You may not receive payment if disputes are resolved
                      against you
                    </li>
                    <li>
                      Time invested in completing bounties may not result in
                      payment
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    No Guarantees
                  </h3>
                  <p>Boundless does not guarantee:</p>
                  <ul className='mt-2 ml-6 list-disc space-y-2'>
                    <li>That bounty creators will approve your submission</li>
                    <li>
                      That bounty hunters will complete tasks satisfactorily
                    </li>
                    <li>That disputes will be resolved in your favor</li>
                    <li>That bounties will be completed or rewards paid</li>
                    <li>The quality or timeliness of submissions</li>
                  </ul>
                </div>
                <p>
                  <strong>
                    You participate in bounties at your own risk. Boundless is
                    not responsible for the quality of work submitted, approval
                    decisions, or payment disputes between bounty creators and
                    hunters.
                  </strong>
                </p>
              </div>
            </section>

            {/* Blockchain Risks */}
            <section
              id='blockchain-risks'
              ref={setSectionRef('blockchain-risks')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Blockchain and Technology Risks
              </h2>
              <div className='space-y-6 text-sm leading-relaxed text-gray-300'>
                <p>Using blockchain technology involves unique risks:</p>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Irreversible Transactions
                  </h3>
                  <p>
                    Blockchain transactions are generally irreversible. If you
                    send funds to the wrong address or make an error, you may
                    not be able to recover your funds.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Private Key Security
                  </h3>
                  <p>
                    You are solely responsible for securing your private keys
                    and seed phrases. If you lose your keys or they are stolen,
                    you will lose access to your funds permanently. We cannot
                    recover lost keys or restore access to wallets.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Network and Technical Risks
                  </h3>
                  <p>
                    Blockchain networks may experience congestion, forks,
                    attacks, or technical failures. Smart contracts may contain
                    bugs or vulnerabilities. These issues could result in loss
                    of funds or inability to access the Platform.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Regulatory Risk
                  </h3>
                  <p>
                    Cryptocurrency and blockchain regulations are evolving and
                    vary by jurisdiction. Changes in regulations could affect
                    the Platform's operation or your ability to use it.
                  </p>
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-white'>
                    Volatility Risk
                  </h3>
                  <p>
                    Cryptocurrency values are highly volatile. The value of your
                    contributions may fluctuate significantly, and you may
                    experience substantial losses.
                  </p>
                </div>
              </div>
            </section>

            {/* Escrow Disclaimer */}
            <section
              id='escrow-disclaimer'
              ref={setSectionRef('escrow-disclaimer')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Escrow and Smart Contract Disclaimer
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Our Platform uses smart contract escrow services provided by
                  Trustless Work on the Stellar blockchain. Important
                  disclaimers:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>
                    Smart contracts are code-based and operate automatically. We
                    do not control the execution of smart contracts.
                  </li>
                  <li>
                    Smart contracts may contain bugs, vulnerabilities, or
                    unexpected behavior that could result in loss of funds.
                  </li>
                  <li>
                    We are not responsible for the operation, security, or
                    functionality of smart contracts or the Trustless Work
                    platform.
                  </li>
                  <li>
                    Escrow releases are based on milestone completion and
                    approval processes. Disputes may arise, and resolution is
                    not guaranteed.
                  </li>
                  <li>
                    We do not guarantee that escrow services will be available,
                    uninterrupted, or error-free.
                  </li>
                </ul>
              </div>
            </section>

            {/* Regulatory Compliance */}
            <section
              id='regulatory-compliance'
              ref={setSectionRef('regulatory-compliance')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Regulatory Compliance
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  You are responsible for ensuring that your use of the Platform
                  complies with all applicable laws and regulations in your
                  jurisdiction, including:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>Securities laws and regulations</li>
                  <li>
                    Anti-money laundering (AML) and know-your-customer (KYC)
                    requirements
                  </li>
                  <li>Tax laws and reporting obligations</li>
                  <li>Consumer protection laws</li>
                  <li>Export control and sanctions regulations</li>
                </ul>
                <p>
                  Boundless may be required to comply with regulatory
                  requirements, including reporting, record-keeping, and
                  restrictions on certain users or transactions. We reserve the
                  right to restrict or terminate access to comply with legal
                  obligations.
                </p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section
              id='third-party-services'
              ref={setSectionRef('third-party-services')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Third-Party Services
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  Our Platform integrates with third-party services, including:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>
                    <strong>Stellar Network:</strong> Blockchain infrastructure
                    and transaction processing
                  </li>
                  <li>
                    <strong>Trustless Work:</strong> Escrow and smart contract
                    services
                  </li>
                  <li>
                    <strong>Wallet Providers:</strong> Third-party wallet
                    services for connecting to the Platform
                  </li>
                  <li>
                    <strong>Other Service Providers:</strong> Hosting,
                    analytics, and other technical services
                  </li>
                </ul>
                <p>
                  We are not responsible for the availability, security, or
                  functionality of third-party services. Your use of third-party
                  services is subject to their respective terms of service and
                  privacy policies. We do not endorse or guarantee any
                  third-party service.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section
              id='limitation-of-liability'
              ref={setSectionRef('limitation-of-liability')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Limitation of Liability
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, BOUNDLESS
                  AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS,
                  AND LICENSORS SHALL NOT BE LIABLE FOR:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>
                    Any indirect, incidental, special, consequential, or
                    punitive damages
                  </li>
                  <li>
                    Loss of profits, revenue, data, or use, incurred by you or
                    any third party
                  </li>
                  <li>
                    Loss of funds due to project failure, fraud, or
                    misrepresentation
                  </li>
                  <li>
                    Loss of funds due to user error, lost keys, or wrong
                    addresses
                  </li>
                  <li>
                    Loss of funds due to blockchain network issues, smart
                    contract bugs, or technical failures
                  </li>
                  <li>
                    Loss of funds due to regulatory actions or changes in law
                  </li>
                  <li>
                    Any damages resulting from your use or inability to use the
                    Platform
                  </li>
                </ul>
                <p>
                  Our total liability to you for all claims arising from or
                  related to the Platform shall not exceed the amount you paid
                  to us in the twelve (12) months preceding the claim, or $100,
                  whichever is greater.
                </p>
              </div>
            </section>

            {/* No Warranties */}
            <section
              id='no-warranties'
              ref={setSectionRef('no-warranties')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                No Warranties
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                  WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING
                  BUT NOT LIMITED TO:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>
                    WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                    PURPOSE, AND NON-INFRINGEMENT
                  </li>
                  <li>
                    WARRANTIES THAT THE PLATFORM WILL BE UNINTERRUPTED,
                    ERROR-FREE, OR SECURE
                  </li>
                  <li>
                    WARRANTIES THAT DEFECTS WILL BE CORRECTED OR THAT THE
                    PLATFORM IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS
                  </li>
                  <li>
                    WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR
                    AVAILABILITY OF ANY INFORMATION ON THE PLATFORM
                  </li>
                  <li>
                    WARRANTIES REGARDING PROJECT SUCCESS, MILESTONE COMPLETION,
                    OR FUND RECOVERY
                  </li>
                </ul>
                <p>
                  We do not warrant that the Platform will meet your
                  requirements or that the operation of the Platform will be
                  uninterrupted or error-free.
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section
              id='indemnification'
              ref={setSectionRef('indemnification')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Indemnification
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  You agree to indemnify, defend, and hold harmless Boundless
                  and its affiliates, officers, directors, employees, agents,
                  and licensors from and against any and all claims, damages,
                  losses, liabilities, costs, and expenses (including reasonable
                  attorneys' fees) arising from or related to:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>Your use of the Platform</li>
                  <li>Your violation of these Terms or any applicable law</li>
                  <li>Your violation of any rights of another party</li>
                  <li>Your projects, content, or contributions</li>
                  <li>Your interactions with other users</li>
                </ul>
              </div>
            </section>

            {/* Changes to Platform */}
            <section
              id='changes-to-platform'
              ref={setSectionRef('changes-to-platform')}
              className='scroll-mt-24'
            >
              <h2 className='mb-4 text-2xl font-semibold text-white'>
                Changes to Platform
              </h2>
              <div className='space-y-4 text-sm leading-relaxed text-gray-300'>
                <p>
                  We reserve the right to modify, suspend, or discontinue the
                  Platform, or any part thereof, at any time without notice. We
                  may:
                </p>
                <ul className='ml-6 list-disc space-y-2'>
                  <li>
                    Change, suspend, or discontinue features or functionality
                  </li>
                  <li>
                    Modify or update the Platform's terms, policies, or
                    procedures
                  </li>
                  <li>Restrict access to certain users or regions</li>
                  <li>
                    Terminate or suspend accounts that violate our policies
                  </li>
                </ul>
                <p>
                  We are not liable to you or any third party for any
                  modification, suspension, or discontinuation of the Platform.
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
                  If you have questions about this Disclaimer, please contact
                  us:
                </p>
                <div className='flex flex-col gap-3'>
                  <a
                    href='mailto:collins@boundlessfi.xyz?cc=benjamin@boundlessfi.xyz&subject=Disclaimer%20Inquiry'
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

export default DisclaimerContent;
