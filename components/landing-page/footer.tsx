'use client';
import Link from 'next/link';
import Image from 'next/image';
import { socialLinks } from '@/lib/config';
import { usePathname } from 'next/navigation';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  if (pathname.startsWith('/organizations')) {
    return null;
  }
  return (
    <footer
      className='z-30 border-t border-[#2B2B2B] bg-black'
      role='contentinfo'
    >
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='hidden items-start justify-between md:flex'>
          <div className='flex flex-col space-y-4'>
            <Link href='/' aria-label='Boundless homepage'>
              <Image
                src='/footer/logo.svg'
                alt='Boundless logo'
                width={120}
                height={40}
                className='mb-14 w-14'
                priority
              />
            </Link>
            <p className='text-sm text-[#B5B5B5]'>
              © {currentYear} Boundless — Transparent, Community-Driven,
              Web3-Native Funding.
            </p>
          </div>

          <div className='flex flex-col items-end space-y-6'>
            <nav
              className='mb-14 grid grid-cols-2 gap-x-8 gap-y-4 text-center sm:text-left'
              aria-label='Legal links'
            >
              <Link
                href='/terms'
                className='hover:text-primary rounded text-sm text-[#B5B5B5] transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none'
              >
                Terms of Service
              </Link>
              <Link
                href='/privacy'
                className='hover:text-primary rounded text-sm text-[#B5B5B5] transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none'
              >
                Privacy Policy
              </Link>
              <Link
                href='/code-of-conduct'
                className='hover:text-primary ml-10 rounded text-sm text-[#B5B5B5] transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none'
              >
                Code of Conduct
              </Link>
              <Link
                href='/disclaimer'
                className='hover:text-primary ml-5 rounded text-sm text-[#B5B5B5] transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none'
              >
                Disclaimer
              </Link>
            </nav>

            <nav
              className='flex items-center space-x-4'
              aria-label='Social media links'
            >
              {Object.entries(socialLinks).map(([name, href], index) => (
                <div key={name} className='flex items-center'>
                  <Link
                    href={href}
                    className='rounded transition-opacity hover:opacity-80 focus:ring-2 focus:ring-white/50 focus:outline-none'
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={`Follow us on ${name}`}
                  >
                    <Image
                      src={`/footer/${name}.svg`}
                      alt={`${name} icon`}
                      width={24}
                      height={24}
                      className={`${name === 'gmail' ? 'h-18 w-18' : 'h-6 w-6'}`}
                    />
                  </Link>
                  {index < Object.keys(socialLinks).length - 1 && (
                    <div
                      className='ml-4 h-6 w-0.5 bg-[#2B2B2B]'
                      aria-hidden='true'
                    />
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile version */}
        <div className='flex flex-col items-center space-y-6 md:hidden'>
          <Link href='/' aria-label='Boundless homepage'>
            <Image
              src='/footer/logo.svg'
              alt='Boundless logo'
              width={120}
              height={40}
              className='h-10 w-auto'
              priority
            />
          </Link>

          <nav
            className='mb-14 grid grid-cols-2 gap-x-8 gap-y-4 text-center sm:text-left'
            aria-label='Legal links'
          >
            <Link
              href='/terms'
              className='hover:text-primary rounded text-sm text-[#B5B5B5] transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none'
            >
              Terms of Service
            </Link>
            <Link
              href='/privacy'
              className='hover:text-primary rounded text-sm text-[#B5B5B5] transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none'
            >
              Privacy Policy
            </Link>
            <Link
              href='/code-of-conduct'
              className='hover:text-primary ml-10 rounded text-sm text-[#B5B5B5] transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none'
            >
              Code of Conduct
            </Link>
            <Link
              href='/disclaimer'
              className='hover:text-primary ml-5 rounded text-sm text-[#B5B5B5] transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none'
            >
              Disclaimer
            </Link>
          </nav>

          <nav
            className='flex items-center space-x-4'
            aria-label='Social media links'
          >
            {Object.entries(socialLinks).map(([name, href], index) => (
              <div key={name} className='flex items-center'>
                <Link
                  href={href}
                  className='rounded transition-opacity hover:opacity-80 focus:ring-2 focus:ring-white/50 focus:outline-none'
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={`Follow us on ${name}`}
                >
                  <Image
                    src={`/footer/${name}.svg`}
                    alt={`${name} icon`}
                    width={24}
                    height={24}
                    className='h-6 w-6'
                  />
                </Link>
                {index < Object.keys(socialLinks).length - 1 && (
                  <div
                    className='ml-4 h-6 w-0.5 bg-[#2B2B2B]'
                    aria-hidden='true'
                  />
                )}
              </div>
            ))}
          </nav>

          <p className='text-center text-sm text-[#B5B5B5]'>
            © {currentYear} Boundless — Transparent,
            <br />
            Community-Driven, Web3-Native Funding.
          </p>
        </div>
      </div>
    </footer>
  );
}
