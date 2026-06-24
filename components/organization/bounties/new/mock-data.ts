import type { BountyFormData } from './constants';

/** A `datetime-local` string (YYYY-MM-DDTHH:mm) `days` from now. */
function futureLocal(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * A complete, publish-valid bounty configuration for the dev-only "Fill with
 * mock" button. Uses the simplest valid mode (open, single claim) so every
 * section passes its schema and the publish gate. Development category, so the
 * GitHub issue URL is present; reputation matches the development floor.
 */
export function buildMockBountyData(): BountyFormData {
  return {
    scope: {
      title: 'Build a Soroban faucet bot',
      description:
        '## Overview\n\nMock bounty generated for local testing.\n\n' +
        '### What needs to be built\n\n' +
        '- A Telegram bot that drips testnet XLM\n' +
        '- Rate limiting per user\n' +
        '- A simple `/faucet` command\n\n' +
        '**Done looks like:** a deployed bot with a short README.',
      category: 'DEVELOPMENT',
      country: 'United States',
      githubIssueUrl: 'https://github.com/boundlessfi/boundless/issues/1',
      projectId: null,
      bountyWindowId: null,
    },
    mode: {
      entryType: 'OPEN',
      claimType: 'SINGLE_CLAIM',
      winnerCount: 1,
    },
    submission: {
      submissionDeadline: futureLocal(30),
      submissionVisibility: 'ORGANIZER_ONLY',
      reputationMinimum: 50,
      applicationWindowCloseAt: null,
      maxApplicants: null,
      shortlistSize: null,
      applicationCreditCost: null,
    },
    reward: {
      rewardCurrency: 'USDC',
      prizeTiers: [{ position: 1, amount: '100', passMark: null }],
    },
    resources: {
      resources: [
        {
          id: 'resource-mock-1',
          link: 'https://developers.stellar.org/docs',
          description: 'Stellar developer documentation',
          file: undefined,
        },
      ],
    },
  };
}
