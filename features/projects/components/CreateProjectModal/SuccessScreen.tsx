import { BoundlessButton } from '@/components/buttons';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const SuccessScreen = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <div className='flex h-[70vh] w-screen items-center justify-center bg-[#030303] px-10'>
      <div className='mx-auto flex max-w-[400px] flex-col items-center gap-10'>
        {/* <Image
          src='/Success@4x.png'
          alt='Green good mark'
          width={120}
          height={120}
          className='max-h-[150px] max-w-[150px]'
        /> */}
        <div className='relative flex h-[125px] max-h-[125px] w-[125px] max-w-[125px] items-center justify-center'>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              opacity: [0, 1, 1],
            }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: 'easeOut',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              <Check className='h-10 w-10 text-[#0F973D]' />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1, 1.1, 1],
              opacity: [0, 1, 1, 1],
            }}
            transition={{
              duration: 1.5,
              ease: 'easeOut',
              times: [0, 0.3, 0.7, 1],
            }}
            className='absolute inset-0 top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2'
          >
            <motion.svg
              xmlns='http://www.w3.org/2000/svg'
              width='125'
              height='125'
              viewBox='0 0 216 216'
              fill='none'
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <g opacity='0.2' filter='url(#filter0_f_5702_15569)'>
                <circle cx='108' cy='108' r='62.3955' fill='#0F973D' />
                <circle
                  cx='108'
                  cy='108'
                  r='61.9409'
                  stroke='url(#paint0_radial_5702_15569)'
                  stroke-opacity='0.98'
                  stroke-width='0.909091'
                />
              </g>
              <defs>
                <filter
                  id='filter0_f_5702_15569'
                  x='0.149948'
                  y='0.150436'
                  width='215.7'
                  height='215.7'
                  filterUnits='userSpaceOnUse'
                  color-interpolation-filters='sRGB'
                >
                  <feFlood flood-opacity='0' result='BackgroundImageFix' />
                  <feBlend
                    mode='normal'
                    in='SourceGraphic'
                    in2='BackgroundImageFix'
                    result='shape'
                  />
                  <feGaussianBlur
                    stdDeviation='22.7273'
                    result='effect1_foregroundBlur_5702_15569'
                  />
                </filter>
                <radialGradient
                  id='paint0_radial_5702_15569'
                  cx='0'
                  cy='0'
                  r='1'
                  gradientUnits='userSpaceOnUse'
                  gradientTransform='translate(102.404 43.7251) rotate(87.5684) scale(128.932 141.269)'
                >
                  <stop stop-color='white' stop-opacity='0.48' />
                  <stop offset='1' stop-color='white' stop-opacity='0.08' />
                </radialGradient>
              </defs>
            </motion.svg>
          </motion.div>
        </div>
        <motion.div
          className='flex flex-col gap-3 text-center text-white'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.h2
            className='text-[20px] font-medium'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Submission Successful!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            Your project has been sent for admin review and will be processed
            within 72 hours. You can track its status anytime on the{' '}
            <span className='font-medium text-[#A7F950] underline'>
              Projects Page
            </span>
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <BoundlessButton onClick={onContinue}>Continue</BoundlessButton>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessScreen;
