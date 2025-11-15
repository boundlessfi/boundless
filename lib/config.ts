export const config = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    'https://staging-api.boundlessfi.xyz/api',
};

export const socialLinks = {
  x: 'https://x.com/boundless_fi',
  linkedin: 'https://www.linkedin.com/company/boundlesshq/',
  github: 'https://github.com/boundlessfi',
  discord: 'https://discord.gg/boundlessfi',
  telegram: 'https://t.me/boundlessfi',
  gmail: 'mailto:admin@boundlessfi.xyz',
};
export const ProfileSocialLinks = {
  discord: 'https://discord.gg/boundlessfi',
  telegram: 'https://t.me/boundlessfi',
  github: 'https://github.com/boundlessfi',
  linkedin: 'https://www.linkedin.com/company/boundlesshq/',
  x: 'https://x.com/boundless_fi',
};

export const backedBy = [
  {
    name: 'OnlyDust',
    image: '/onlydust.svg',
    url: 'https://app.onlydust.com/projects/boundless/overview',
  },
  {
    name: 'SDF',
    image: '/sdf.svg',
    url: 'https://stellar.org',
  },
  {
    name: 'Soroban',
    image: '/stellar.svg',
    url: 'https://stellar.org/',
  },
  {
    name: 'trustless work',
    image: '/trustless.svg',
    url: 'https://www.trustlesswork.com/',
  },
];
