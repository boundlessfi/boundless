const CROWDFUND_ERROR_MESSAGES: Record<number, string> = {
  800: 'Contract is already initialized',
  801: 'Contract is not initialized',
  802: 'You are not authorized to perform this action',
  803: 'Campaign not found on-chain',
  804: 'Campaign deadline has passed',
  805: 'Campaign is not in the funding phase',
  806: 'Amount is below the minimum pledge (1 USDC)',
  807: 'Invalid campaign state for this action',
  808: 'Milestone is not in a pending state',
  809: 'Milestone not found',
  810: 'Milestone has not been submitted yet',
  811: 'Campaign is already fully funded',
  812: 'Campaign is still active',
  813: 'No pledge found for your address',
  814: 'Pledge has already been refunded',
  815: 'Only the campaign owner can perform this action',
  816: 'Invalid milestone configuration',
  817: 'All refund batches have been processed',
  818: 'Campaign deadline has not passed yet',
  819: 'Amount must be positive',
  820: 'Numeric overflow occurred',
  821: 'Milestone is not overdue',
  822: 'Only campaign backers can perform this action',
  823: 'Campaign must be in draft state',
  824: 'Campaign has not been submitted',
  825: 'Vote threshold has not been met',
  826: 'No vote session exists for this campaign',
};

export function parseCrowdfundError(error: unknown): string {
  let message: string;
  if (error instanceof Error) {
    message = error.message;
    if (error.cause) message += ' ' + String(error.cause);
  } else if (typeof error === 'object' && error !== null) {
    message = JSON.stringify(error);
  } else {
    message = String(error ?? 'Unknown error');
  }

  console.error('[CrowdfundContract] Raw error:', error);

  const codeMatch = message.match(
    /(?:Error\(Contract,\s*#|contract\s*error\s*|#|"contractError"\s*:\s*)(\d{3})/i
  );
  if (codeMatch) {
    const code = parseInt(codeMatch[1], 10);
    if (CROWDFUND_ERROR_MESSAGES[code]) {
      return CROWDFUND_ERROR_MESSAGES[code];
    }
  }

  if (message.includes('invalid version byte')) {
    return 'Wallet address format error. Please try reconnecting your wallet.';
  }

  if (
    message.includes('simulation') &&
    message.toLowerCase().includes('fail')
  ) {
    const reasonMatch = message.match(
      /(?:result|error|reason|diagnostic)[:\s]+["']?([^"'\n]{10,200})/i
    );
    if (reasonMatch) {
      return `Contract error: ${reasonMatch[1].trim()}`;
    }
    return 'Transaction simulation failed. The contract rejected this action. Check the browser console for details.';
  }

  if (
    message.includes('User rejected') ||
    message.includes('user denied') ||
    message.includes('cancelled')
  ) {
    return 'Transaction was cancelled by the user.';
  }

  if (message.includes('Wallet not connected')) {
    return 'Please connect your wallet to continue.';
  }

  return message;
}
