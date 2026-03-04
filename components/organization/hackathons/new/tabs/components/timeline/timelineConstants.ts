export const TIMELINE_FIELD_TOOLTIPS = {
  startDate:
    'The date and time when the hackathon officially begins. Participants can join from this date onward (if registration is open).',
  submissionDeadline:
    'The final date and time when teams can submit their projects. Submissions after this deadline will not be accepted.',
  timezone:
    'The timezone used for all dates and times in this hackathon. All deadlines and phases are interpreted in this timezone.',
  registrationDeadline:
    'Optional. Set a specific date and time when pre-registration closes. If not set, registration remains open until the submission deadline.',
  judgingDeadline:
    'Optional. The date and time by which all judging must be completed. Must be on or after the submission deadline.',
  phases:
    'Optional. Define custom lifecycle phases (e.g., "Kickoff", "Development", "Final Submissions") with specific start/end dates to structure the hackathon timeline.',
};

// Common timezones organized by region
export const TIMEZONES = [
  // UTC
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  // Americas - North America
  { label: 'EST (Eastern Standard Time)', value: 'America/New_York' },
  { label: 'US Central Standard Time (CST)', value: 'America/Chicago' },
  { label: 'MST (Mountain Standard Time)', value: 'America/Denver' },
  { label: 'PST (Pacific Standard Time)', value: 'America/Los_Angeles' },
  { label: 'AKST (Alaska Standard Time)', value: 'America/Anchorage' },
  { label: 'HST (Hawaii Standard Time)', value: 'Pacific/Honolulu' },

  // Americas - Central & South America
  { label: 'BRT (Brasília Time)', value: 'America/Sao_Paulo' },
  { label: 'ART (Argentina Time)', value: 'America/Argentina/Buenos_Aires' },
  { label: 'CLT (Chile Standard Time)', value: 'America/Santiago' },
  { label: 'COT (Colombia Time)', value: 'America/Bogota' },

  // Europe
  { label: 'GMT (Greenwich Mean Time)', value: 'Europe/London' },
  { label: 'CET (Central European Time)', value: 'Europe/Paris' },
  { label: 'EET (Eastern European Time)', value: 'Europe/Athens' },
  { label: 'MSK (Moscow Standard Time)', value: 'Europe/Moscow' },

  // Middle East & Africa
  { label: 'EAT (East Africa Time)', value: 'Africa/Nairobi' },
  { label: 'WAT (West Africa Time)', value: 'Africa/Lagos' },
  { label: 'SAST (South Africa Standard Time)', value: 'Africa/Johannesburg' },
  { label: 'GST (Gulf Standard Time)', value: 'Asia/Dubai' },

  // Asia
  { label: 'ICT (Indochina Time)', value: 'Asia/Bangkok' },
  { label: 'IST (India Standard Time)', value: 'Asia/Kolkata' },
  { label: 'SGT (Singapore Time)', value: 'Asia/Singapore' },
  { label: 'HKT (Hong Kong Time)', value: 'Asia/Hong_Kong' },
  { label: 'China Standard Time (CST)', value: 'Asia/Shanghai' },
  { label: 'JST (Japan Standard Time)', value: 'Asia/Tokyo' },
  { label: 'KST (Korea Standard Time)', value: 'Asia/Seoul' },

  // Oceania
  { label: 'AEST (Australian Eastern Time)', value: 'Australia/Sydney' },
  { label: 'AWST (Australian Western Time)', value: 'Australia/Perth' },
  { label: 'NZST (New Zealand Standard Time)', value: 'Pacific/Auckland' },
  { label: 'FIJI (Fiji Time)', value: 'Pacific/Fiji' },
];
