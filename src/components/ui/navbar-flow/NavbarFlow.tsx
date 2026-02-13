'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import {
  Menu as List,
  X as Close,
  ChevronDown as ArrowDown,
  ChevronUp as ArrowUp,
} from 'lucide-react';

import type { NavbarFlowProps } from './types';
import { ListItem } from './items';
import { NavbarConnections } from './connections';

const DESKTOP_BREAKPOINT = 768;

function SubmenuClickWrapper({
  children,
  onAnyItemClick,
}: {
  children?: React.ReactNode;
  onAnyItemClick: () => void;
}) {
  if (!children) return null;

  return React.Children.map(children, (child, index) => (
    <div key={index} onClick={onAnyItemClick}>
      {child}
    </div>
  ));
}

const NavbarFlow: React.FC<NavbarFlowProps> = ({
  emblem,
  links = [],
  extraIcons = [],
  styleName = '',
  rightComponent,
}) => {
  const reducedMotion = useReducedMotion();

  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [selectedSubmenu, setSelectedSubmenu] = useState<string | null>(null);
  const [openedSections, setOpenedSections] = useState<Record<string, boolean>>(
    {},
  );

  const navMotion = useAnimation();
  const emblemMotion = useAnimation();
  const switchMotion = useAnimation();
  const svgMotion = useAnimation();

  useEffect(() => {
    const detectMobile = () => {
      setMobileView(window.innerWidth < DESKTOP_BREAKPOINT);
    };

    detectMobile();
    window.addEventListener('resize', detectMobile);
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  useEffect(() => {
    const runSequence = async () => {
      if (reducedMotion) {
        emblemMotion.set({ opacity: 1, x: 0 });
        navMotion.set({ opacity: 1, width: 'auto' });
        switchMotion.set({ opacity: 1, x: 0 });
        svgMotion.set({ opacity: 1 });
        return;
      }

      if (mobileView) {
        await Promise.all([
          emblemMotion.start({
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
          }),
          navMotion.start({
            opacity: 1,
            transition: { duration: 0.5, ease: 'easeOut' },
          }),
          switchMotion.start({
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
          }),
        ]);
      } else {
        await navMotion.start({
          width: 'auto',
          padding: '10px 28px',
          opacity: 1,
          transition: { duration: 0.7, ease: 'easeOut' },
        });

        await svgMotion.start({ opacity: 1, transition: { duration: 0.45 } });

        await Promise.all([
          emblemMotion.start({
            opacity: 1,
            x: 0,
            transition: { duration: 0.55, ease: 'easeOut' },
          }),
          switchMotion.start({
            opacity: 1,
            x: 0,
            transition: { duration: 0.55, ease: 'easeOut' },
          }),
        ]);
      }
    };

    runSequence();
  }, [mobileView, reducedMotion, navMotion, emblemMotion, switchMotion, svgMotion]);

  const toggleMobileMenu = () => setMobileMenuVisible((v) => !v);

  const toggleSection = (text: string) => {
    setOpenedSections((prev) => ({ ...prev, [text]: !prev[text] }));
  };

  const hideMobileMenu = () => setMobileMenuVisible(false);

  return (
    <div className={`sticky top-0 z-50 w-full ${styleName}`}>
      <div className='hidden md:block'>
        <div className='relative mx-auto w-full max-w-6xl h-24 flex items-center justify-between px-4 sm:px-6'>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={emblemMotion}
            className='bg-background/80 text-foreground px-5 lg:px-7 py-3 lg:py-4 rounded-full font-semibold text-lg z-10 shrink-0 border border-foreground/10 backdrop-blur supports-[backdrop-filter]:bg-background/65'
          >
            {emblem}
          </motion.div>

          <motion.nav
            initial={{ width: '120px', padding: '8px 18px', opacity: 0 }}
            animate={navMotion}
            className='bg-background/80 rounded-full flex items-center justify-center gap-6 lg:gap-10 z-10 shrink-0 border border-foreground/10 backdrop-blur supports-[backdrop-filter]:bg-background/65'
            onMouseLeave={() => setSelectedSubmenu(null)}
            aria-label='Navegación principal'
          >
            {links.map((element) => (
              <div key={element.text}>
                {element.submenu ? (
                  <ListItem
                    setSelected={setSelectedSubmenu}
                    selected={selectedSubmenu}
                    element={element.text}
                  >
                    <SubmenuClickWrapper onAnyItemClick={hideMobileMenu}>
                      {element.submenu}
                    </SubmenuClickWrapper>
                  </ListItem>
                ) : (
                  <a
                    href={element.url || '#'}
                    className='font-medium text-base lg:text-lg whitespace-nowrap text-foreground/80 hover:text-foreground transition-colors py-1'
                  >
                    {element.text}
                  </a>
                )}
              </div>
            ))}
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={switchMotion}
            className='bg-background/80 rounded-full p-2 lg:p-3 z-10 shrink-0 flex items-center gap-2 lg:gap-3 border border-foreground/10 backdrop-blur supports-[backdrop-filter]:bg-background/65'
          >
            {extraIcons.map((icon, idx) => (
              <div key={idx} className='flex items-center justify-center'>
                {icon}
              </div>
            ))}

            {rightComponent ? (
              <div className='flex items-center justify-center'>{rightComponent}</div>
            ) : null}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={svgMotion}>
            <NavbarConnections />
          </motion.div>
        </div>
      </div>

      <div className='block md:hidden'>
        <div className='relative w-full border-b border-foreground/10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70'>
          <div className='mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={emblemMotion}
              className='mr-3 shrink-0'
            >
              <div className='bg-foreground/5 text-foreground px-4 py-2 rounded-full font-semibold text-base border border-foreground/10'>
                {emblem}
              </div>
            </motion.div>

            <div className='flex flex-1 items-center justify-end gap-2'>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={switchMotion}
                className='flex items-center gap-2'
              >
                {extraIcons.map((icon, idx) => (
                  <div key={idx} className='flex items-center justify-center'>
                    {icon}
                  </div>
                ))}

                {rightComponent ? (
                  <div className='flex items-center justify-center'>{rightComponent}</div>
                ) : null}
              </motion.div>

              <button
                type='button'
                onClick={toggleMobileMenu}
                className='flex items-center justify-center w-10 h-10 rounded-full border border-foreground/10 bg-foreground/5 text-foreground/80 hover:text-foreground transition-colors'
              >
                {mobileMenuVisible ? (
                  <Close className='h-5 w-5' />
                ) : (
                  <List className='h-5 w-5' />
                )}
                <span className='sr-only'>Abrir menú</span>
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{
              opacity: mobileMenuVisible ? 1 : 0,
              maxHeight: mobileMenuVisible ? '80vh' : 0,
            }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
            className='absolute left-0 right-0 top-full z-40 overflow-y-auto border-t border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'
          >
            <div className='mx-auto max-w-6xl py-4 px-4 sm:px-6'>
              <nav className='flex flex-col space-y-3' aria-label='Navegación móvil'>
                {links.map((element) => (
                  <div key={element.text} className='space-y-2'>
                    {element.submenu ? (
                      <>
                        <button
                          type='button'
                          className='flex items-center justify-between w-full font-medium text-base py-2 px-3 rounded-xl hover:bg-foreground/5 transition-colors border border-foreground/10'
                          onClick={() => toggleSection(element.text)}
                        >
                          <span className='text-foreground'>{element.text}</span>
                          <span className='text-foreground/70'>
                            {openedSections[element.text] ? (
                              <ArrowUp className='h-4 w-4' />
                            ) : (
                              <ArrowDown className='h-4 w-4' />
                            )}
                          </span>
                        </button>

                        {openedSections[element.text] ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: reducedMotion ? 0 : 0.2 }}
                            className='pl-2 space-y-1 overflow-hidden'
                          >
                            <SubmenuClickWrapper onAnyItemClick={hideMobileMenu}>
                              {element.submenu}
                            </SubmenuClickWrapper>
                          </motion.div>
                        ) : null}
                      </>
                    ) : (
                      <a
                        href={element.url || '#'}
                        onClick={hideMobileMenu}
                        className='font-medium text-base py-2 px-3 rounded-xl hover:bg-foreground/5 transition-colors border border-foreground/10 block text-foreground'
                      >
                        {element.text}
                      </a>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NavbarFlow;
