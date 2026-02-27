'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SafeImage } from './safe-image';

// Client-side only subscription for hydration
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  withText?: boolean;
  withCaption?: boolean;
  textClassName?: string;
  className?: string;
  animated?: boolean;
}

export const Logo = React.memo(function Logo({
  size = 'md',
  withText = false,
  withCaption = false,
  textClassName = '',
  className = '',
  animated = false,
}: LogoProps) {
  // Use useSyncExternalStore to safely detect client-side rendering
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  // Check motion preferences on client side only
  const prefersReducedMotion = useSyncExternalStore(
    emptySubscribe,
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );

  // Enhanced size mappings with more options and responsive classes
  const sizeMap = {
    xs: {
      container: 'h-6 w-6 sm:h-7 sm:w-7',
      logo: 'h-4 w-4 sm:h-5 sm:w-5',
      text: 'text-sm sm:text-base',
      caption: 'text-[8px] sm:text-[9px]',
    },
    sm: {
      container: 'h-8 w-8 sm:h-9 sm:w-9',
      logo: 'h-5 w-5 sm:h-6 sm:w-6',
      text: 'text-base sm:text-lg',
      caption: 'text-[9px] sm:text-xs',
    },
    md: {
      container: 'h-10 w-10 sm:h-12 sm:w-12',
      logo: 'h-7 w-7 sm:h-8 sm:w-8',
      text: 'text-lg sm:text-xl',
      caption: 'text-xs sm:text-sm',
    },
    lg: {
      container: 'h-14 w-14 sm:h-16 sm:w-16',
      logo: 'h-9 w-9 sm:h-10 sm:w-10',
      text: 'text-xl sm:text-2xl',
      caption: 'text-sm sm:text-base',
    },
    xl: {
      container: 'h-20 w-20 sm:h-24 sm:w-24',
      logo: 'h-12 w-12 sm:h-14 sm:w-14',
      text: 'text-2xl sm:text-3xl',
      caption: 'text-base sm:text-lg',
    },
    '2xl': {
      container: 'h-24 w-24 sm:h-28 sm:w-28',
      logo: 'h-14 w-14 sm:h-16 sm:w-16',
      text: 'text-3xl sm:text-4xl',
      caption: 'text-lg sm:text-xl',
    },
  };

  // Enhanced fallback image dimensions with responsive sizes
  const getImageDimension = (logoSize: string) => {
    const sizes = {
      'h-16 w-16': 64,
      'h-14 w-14': 56,
      'h-12 w-12': 48,
      'h-10 w-10': 40,
      'h-9 w-9': 36,
      'h-8 w-8': 32,
      'h-7 w-7': 28,
      'h-6 w-6': 24,
      'h-5 w-5': 20,
      'h-4 w-4': 16,
    };

    // Find the closest matching size
    const sizeKey = Object.keys(sizes).find((key) => logoSize.includes(key)) || 'h-7 w-7';
    return sizes[sizeKey as keyof typeof sizes];
  };

  // Animation variants - simplified for better performance
  const containerVariants = {
    initial: {
      scale: 0.95,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    hover: {
      scale: 1.03,
      transition: {
        duration: 0.2,
      },
    },
  };

  const ringVariants = {
    initial: {
      scale: 0.9,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.1,
        duration: 0.3,
      },
    },
    hover: {
      scale: 1.05,
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  const glowVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
    hover: {
      opacity: 0.8, // Reduced opacity for better performance
      transition: {
        duration: 0.3,
      },
    },
  };

  const textVariants = {
    initial: {
      opacity: 0,
      x: -5, // Reduced animation distance
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2,
        duration: 0.3,
      },
    },
  };

  // Disable animations if reduced motion is preferred or not mounted yet
  const shouldAnimate = mounted && animated && !prefersReducedMotion;

  // Prevent hydration mismatch - render simple version on server
  if (!mounted && animated) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative">
          <div
            className={`relative flex items-center justify-center ${sizeMap[size].container} transition-all duration-300`}
          >
            <div
              className={`${sizeMap[size].logo} bg-gradient-to-br from-muted to-muted rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 `}
            >
              <span className="text-xs sm:text-sm md:text-base lg:text-lg">BB</span>
            </div>
          </div>
        </div>
        {withText && (
          <div className="relative">
            <span
              className={`font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent ${sizeMap[size].text} ${textClassName}`}
            >
              Budget Buddy
            </span>
          </div>
        )}
      </div>
    );
  }

  const logoContent = (
    <div
      className={`relative z-10 flex items-center justify-center ${sizeMap[size].container} transition-all duration-300`}
    >
      {mounted ? (
        <SafeImage
          src="/logo.svg"
          alt="Budget Buddy Logo"
          width={getImageDimension(sizeMap[size].logo)}
          height={getImageDimension(sizeMap[size].logo)}
          className={`${sizeMap[size].logo} transition-all duration-300`}
          priority={size === 'lg' || size === 'xl' || size === '2xl'}
          fallback={
            <div
              className={`${sizeMap[size].logo} bg-gradient-to-br from-neutral-800 to-neutral-900 dark:from-neutral-100 dark:to-neutral-200 rounded-lg flex items-center justify-center font-bold transition-all duration-300 overflow-hidden`}
            >
              <svg viewBox="0 0 32 32" className="w-[70%] h-[70%] text-neutral-100 dark:text-neutral-900">
                <line x1="10" y1="8" x2="10" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 10.5,8 L 18,8 C 21,8 23,9.5 23,12 C 23,14.5 21,15.5 18,15.5 L 10.5,15.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                <path d="M 10.5,16.5 L 19,16.5 C 22,16.5 24,18 24,20.5 C 24,23 22,24 19,24 L 10.5,24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          }
        />
      ) : (
        <div
          className={`${sizeMap[size].logo} bg-gradient-to-br from-neutral-800 to-neutral-900 dark:from-neutral-100 dark:to-neutral-200 rounded-lg flex items-center justify-center font-bold transition-all duration-300 overflow-hidden`}
        >
          <svg viewBox="0 0 32 32" className="w-[70%] h-[70%] text-neutral-100 dark:text-neutral-900">
            <line x1="10" y1="8" x2="10" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 10.5,8 L 18,8 C 21,8 23,9.5 23,12 C 23,14.5 21,15.5 18,15.5 L 10.5,15.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            <path d="M 10.5,16.5 L 19,16.5 C 22,16.5 24,18 24,20.5 C 24,23 22,24 19,24 L 10.5,24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );

  // Render static version if animations are disabled
  if (!shouldAnimate) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative">
          {logoContent}
          <div className="absolute inset-0 rounded-lg bg-muted/30 blur-sm -z-10"></div>
        </div>
        {withText && (
          <div className="relative">
            <span
              className={`font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)] ${sizeMap[size].text} ${textClassName}`}
            >
              Budget Buddy
            </span>
            <div className="absolute -inset-1 bg-muted/10 blur-sm rounded-lg -z-10"></div>
          </div>
        )}
      </div>
    );
  }

  // Animated version
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        className="relative"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        {logoContent}
        <motion.div
          className="absolute inset-0 rounded-lg bg-muted/30 blur-sm -z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </motion.div>
      {withText && (
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <motion.span
            className={`font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)] ${sizeMap[size].text} ${textClassName}`}
            whileHover={{
              textShadow: '0 0 8px rgba(100, 100, 100, 0.3)',
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
          >
            Budget Buddy
          </motion.span>
          <motion.div
            className="absolute -inset-1 bg-muted/10 blur-sm rounded-lg -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          ></motion.div>
        </motion.div>
      )}
    </div>
  );
});

export default Logo;
