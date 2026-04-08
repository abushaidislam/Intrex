'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
  threshold?: number;
}

const getVariants = (direction: string, distance: number): Variants => {
  const directions: Record<string, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };
};

export function Reveal({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 24,
  once = true,
  threshold = 0.1,
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const variants = getVariants(direction, distance);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  threshold?: number;
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
  once = true,
  threshold = 0.1,
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
}

export function StaggerItem({
  children,
  className = '',
  direction = 'up',
  distance = 24,
  duration = 0.5,
}: StaggerItemProps) {
  const variants = getVariants(direction, distance);

  return (
    <motion.div
      variants={{
        hidden: variants.hidden,
        visible: {
          ...variants.visible,
          transition: {
            duration,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface GlowContainerProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  glowIntensity?: 'subtle' | 'medium' | 'strong';
}

export function GlowContainer({
  children,
  className = '',
  glowColor = 'hsl(var(--primary))',
  glowIntensity = 'subtle',
}: GlowContainerProps) {
  const intensityMap = {
    subtle: 'opacity-30 blur-3xl',
    medium: 'opacity-50 blur-2xl',
    strong: 'opacity-70 blur-xl',
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`absolute inset-0 -z-10 pointer-events-none ${intensityMap[glowIntensity]}`}
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor}, transparent 70%)`,
          transform: 'scale(1.5) translateY(-10%)',
        }}
      />
      {children}
    </div>
  );
}
