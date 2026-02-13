
'use client';

import { motion, useReducedMotion } from 'motion/react';

type AnimatedPath = {
  d: string;
  dash: string;
  duration: number;
  delay: number;
  opacity: number;
};

export function NavbarConnections() {
  const reducedMotion = useReducedMotion();

  const leftPaths: AnimatedPath[] = [
    {
      d: 'M 700 48 Q 520 30, 340 40 Q 220 35, 120 48',
      dash: '6 18',
      duration: 2.7,
      delay: 0.0,
      opacity: 0.55,
    },
    {
      d: 'M 700 44 Q 540 60, 360 52 Q 240 58, 130 44',
      dash: '4 16',
      duration: 3.1,
      delay: 0.15,
      opacity: 0.45,
    },
    {
      d: 'M 700 52 Q 500 24, 320 46 Q 210 32, 110 52',
      dash: '7 22',
      duration: 2.4,
      delay: 0.25,
      opacity: 0.4,
    },
  ];

  const rightPaths: AnimatedPath[] = [
    {
      d: 'M 700 48 Q 880 35, 1060 45 Q 1200 40, 1280 48',
      dash: '6 18',
      duration: 2.9,
      delay: 0.05,
      opacity: 0.55,
    },
    {
      d: 'M 700 44 Q 860 64, 1040 50 Q 1160 60, 1270 44',
      dash: '4 16',
      duration: 3.25,
      delay: 0.2,
      opacity: 0.45,
    },
    {
      d: 'M 700 52 Q 900 26, 1080 40 Q 1200 30, 1290 52',
      dash: '7 22',
      duration: 2.55,
      delay: 0.3,
      opacity: 0.4,
    },
  ];

  const allPaths = [...leftPaths, ...rightPaths];

  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className='absolute inset-0 w-full h-full z-0 pointer-events-none text-foreground/15'
      viewBox='0 0 1400 96'
      preserveAspectRatio='none'
      aria-hidden='true'
    >
      <defs>
        <filter id='connectionBlur'>
          <feGaussianBlur in='SourceGraphic' stdDeviation='2.5' />
        </filter>
        <linearGradient id='fade' x1='0%' y1='0%' x2='100%' y2='0%'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0' />
          <stop offset='50%' stopColor='currentColor' stopOpacity='1' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
        </linearGradient>
      </defs>

      {/* Base lines */}
      {allPaths.map((p, idx) => (
        <path
          key={`base-${p.d}-${idx}`}
          d={p.d}
          stroke='url(#fade)'
          strokeWidth='3'
          fill='none'
          opacity='0.55'
        />
      ))}

      {/* Moving dashes */}
      {allPaths.map((p, idx) => (
        <motion.path
          key={`dash-${p.d}-${idx}`}
          d={p.d}
          stroke='currentColor'
          strokeWidth='2.5'
          fill='none'
          opacity={p.opacity}
          strokeLinecap='round'
          strokeDasharray={p.dash}
          initial={{ strokeDashoffset: 0 }}
          animate={reducedMotion ? undefined : { strokeDashoffset: -60 }}
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: p.duration,
                  ease: 'linear',
                  repeat: Infinity,
                  delay: p.delay,
                }
          }
        />
      ))}

      <g filter='url(#connectionBlur)' opacity='0.35'>
        {allPaths.map((p, idx) => (
          <path
            key={`blur-${p.d}-${idx}`}
            d={p.d}
            stroke='currentColor'
            strokeWidth='4'
            fill='none'
          />
        ))}
      </g>
    </motion.svg>
  );
}
