import {
  FileCode2,
  AppWindow,
  Package,
  ArrowLeftRight,
  PenLine,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WizardMilestone } from './NewCampaignWizard';

/**
 * Milestone templates tailored to Stellar projects.
 *
 * Boundless Crowdfunding v1 targets Stellar builders, so these scenarios cover
 * the shapes we see most: a Soroban contract, a Stellar dApp, a dev tool/SDK,
 * and an anchor/payments (SEP) integration. Each template prefills sensible
 * milestone copy and a delivery cadence. The builder edits everything after
 * applying. Funding releases equally across milestones, so templates do not set
 * percentages.
 */

export interface MilestoneTemplateStep extends Omit<
  WizardMilestone,
  'expectedDeliveryDate'
> {
  /** Days from today to suggest as the expected delivery date. */
  offsetDays: number;
}

export interface MilestoneTemplate {
  key: string;
  label: string;
  summary: string;
  icon: LucideIcon;
  milestones: MilestoneTemplateStep[];
}

export const MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  {
    key: 'soroban-contract',
    label: 'Soroban smart contract',
    summary: 'Contract MVP, testnet + tests, audit and mainnet.',
    icon: FileCode2,
    milestones: [
      {
        title: 'Contract MVP',
        description:
          'Build the core Soroban contract logic and primary entrypoints.',
        deliverable:
          'Compiled contract WASM with the core functions, source on a public GitHub repo.',
        successCriteria:
          'Contract compiles, unit tests pass, and the source is public.',
        offsetDays: 30,
      },
      {
        title: 'Testnet deployment and test suite',
        description:
          'Deploy to Stellar testnet and cover the contract with integration tests.',
        deliverable:
          'Deployed testnet contract ID, a passing test suite, and a coverage report.',
        successCriteria:
          'Live on testnet with over 80% test coverage and a working demo invocation.',
        offsetDays: 60,
      },
      {
        title: 'Audit and mainnet launch',
        description:
          'Resolve audit findings, deploy to mainnet, and publish integration docs.',
        deliverable:
          'Mainnet contract ID, an audit summary, and integration documentation.',
        successCriteria:
          'Live on mainnet, audit issues resolved, and docs published.',
        offsetDays: 90,
      },
    ],
  },
  {
    key: 'stellar-dapp',
    label: 'Stellar dApp',
    summary: 'Prototype, core flows on testnet, mainnet launch.',
    icon: AppWindow,
    milestones: [
      {
        title: 'Prototype and design',
        description:
          'Design the interface and build a clickable prototype wired to a Stellar wallet.',
        deliverable:
          'A clickable prototype and a repo scaffold with wallet connect working.',
        successCriteria:
          'Prototype demonstrates the core flow and connects to a Stellar wallet.',
        offsetDays: 21,
      },
      {
        title: 'Core features on testnet',
        description:
          'Implement the main user flows end to end against Stellar testnet.',
        deliverable:
          'A deployed testnet app with the core transaction flow working.',
        successCriteria: 'Users can complete the primary flow on testnet.',
        offsetDays: 56,
      },
      {
        title: 'Mainnet launch and docs',
        description:
          'Ship to production on mainnet with onboarding documentation.',
        deliverable: 'A live mainnet app URL and user-facing docs.',
        successCriteria:
          'Live on mainnet with first real transactions and docs published.',
        offsetDays: 90,
      },
    ],
  },
  {
    key: 'dev-tool',
    label: 'Developer tool or SDK',
    summary: 'Core library, docs and examples, v1.0 release.',
    icon: Package,
    milestones: [
      {
        title: 'Core library',
        description: 'Build the core API surface of the tool or library.',
        deliverable:
          'A pre-release package (npm or crates) exposing the core API.',
        successCriteria:
          'Package installs cleanly, the core API works, and examples run.',
        offsetDays: 30,
      },
      {
        title: 'Docs and examples',
        description:
          'Write documentation, a quickstart, and runnable example projects.',
        deliverable: 'A docs site and at least two runnable examples.',
        successCriteria:
          'A new developer can integrate in under 30 minutes following the quickstart.',
        offsetDays: 60,
      },
      {
        title: 'v1.0 release and integrations',
        description:
          'Stabilize the API and ship v1.0 with a real reference integration.',
        deliverable: 'A tagged v1.0 release and one reference integration.',
        successCriteria:
          'v1.0 is tagged, the reference integration is live, and a changelog is published.',
        offsetDays: 90,
      },
    ],
  },
  {
    key: 'anchor-sep',
    label: 'Anchor or payments (SEP)',
    summary: 'SEP implementation, testnet pilot, mainnet and compliance.',
    icon: ArrowLeftRight,
    milestones: [
      {
        title: 'SEP implementation',
        description:
          'Implement the relevant SEP flows (for example SEP-24 or SEP-31).',
        deliverable: 'Working SEP endpoints running on testnet.',
        successCriteria:
          'The SEP flow passes the anchor validation suite on testnet.',
        offsetDays: 35,
      },
      {
        title: 'Testnet pilot',
        description: 'Run a pilot with test users moving value end to end.',
        deliverable: 'A pilot report and a deployed testnet anchor.',
        successCriteria:
          'The pilot completes deposits and withdrawals successfully.',
        offsetDays: 70,
      },
      {
        title: 'Mainnet and compliance',
        description:
          'Go live on mainnet with compliance controls and monitoring in place.',
        deliverable:
          'A mainnet anchor, a compliance checklist, and monitoring.',
        successCriteria:
          'Live on mainnet with the compliance checklist complete.',
        offsetDays: 100,
      },
    ],
  },
  {
    key: 'custom',
    label: 'Start from scratch',
    summary: 'One blank milestone you define yourself.',
    icon: PenLine,
    milestones: [
      {
        title: '',
        description: '',
        deliverable: '',
        successCriteria: '',
        offsetDays: 30,
      },
    ],
  },
];

/**
 * Resolve a template's offset-based dates into concrete ISO dates (yyyy-mm-dd)
 * anchored to today, and shape them as wizard milestones with an equal split.
 */
export function instantiateTemplate(
  template: MilestoneTemplate
): WizardMilestone[] {
  const today = new Date();
  return template.milestones.map(({ offsetDays, ...rest }) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offsetDays);
    return {
      ...rest,
      expectedDeliveryDate: date.toISOString().split('T')[0],
    };
  });
}
