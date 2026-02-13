'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { FeatureItemProps, HoverLinkProps, ListItemProps } from './types';
import { springTransition } from './transitions';

export const ListItem: React.FC<ListItemProps> = ({
  setSelected,
  selected,
  element,
  children,
}) => {
  return (
    <div
      className='relative'
      onMouseEnter={() => setSelected(element)}
      onMouseLeave={(event) => {
        const dropdown = event.currentTarget.querySelector('.dropdown-content');
        if (!dropdown) return;

        const dropdownRect = dropdown.getBoundingClientRect();
        if (event.clientY < dropdownRect.top - 20) {
          setSelected(null);
        }
      }}
    >
      <motion.p
        transition={{ duration: 0.3 }}
        className='cursor-pointer font-medium text-base lg:text-lg whitespace-nowrap text-foreground/80 hover:text-foreground hover:opacity-[0.95] py-1'
      >
        {element}
      </motion.p>

      {selected !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={springTransition}
        >
          {selected === element && (
            <div className='absolute top-[calc(100%+0.65rem)] left-1/2 -translate-x-1/2 z-50'>
              <motion.div
                transition={springTransition}
                layoutId='selected'
                className='dropdown-content rounded-2xl overflow-hidden border border-foreground/10 bg-background/85 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/70'
                style={{ maxWidth: 'min(92vw, 420px)' }}
                onMouseEnter={() => setSelected(element)}
                onMouseLeave={() => setSelected(null)}
              >
                <motion.div layout className='w-max h-full p-4 min-w-48'>
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const HoverLink: React.FC<HoverLinkProps> = ({ url, children, onPress }) => {
  return (
    <a
      href={url}
      onClick={onPress}
      className='block px-4 py-2 rounded-lg text-foreground/75 hover:text-foreground hover:bg-foreground/5 transition-colors'
    >
      {children}
    </a>
  );
};

export const FeatureItem: React.FC<FeatureItemProps> = ({
  heading,
  url,
  info,
  onPress,
}) => {
  return (
    <a
      href={url}
      onClick={onPress}
      className='block p-3 rounded-lg transition-colors hover:bg-foreground/5'
    >
      <h4 className='font-medium text-foreground'>{heading}</h4>
      <p className='text-sm text-foreground/70 mt-1 leading-5'>{info}</p>
    </a>
  );
};
