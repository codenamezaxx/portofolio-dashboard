import React from 'react';
import { motion } from 'framer-motion';
import { SkeletonCard } from './SkeletonCard';

/**
 * Shimmer animation variant
 */
const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear' as const,
  },
};

const ShimmerBase = ({ className = '' }: { className?: string }) => (
  <div 
    className={`bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden ${className}`}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
      style={{ backgroundSize: '200% 100%' }}
      {...shimmer}
    />
  </div>
);

/**
 * Journey Carousel Item Skeleton
 */
export const JourneySkeleton = () => (
  <div className="flex gap-6 overflow-hidden py-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-[280px] md:w-[320px]">
        <div className="p-6 h-[250px] rounded-xl border border-hairline bg-surface-card flex flex-col gap-4">
          <ShimmerBase className="h-8 w-20 rounded" />
          <div className="space-y-2">
            <ShimmerBase className="h-6 w-3/4 rounded" />
            <ShimmerBase className="h-4 w-full rounded" />
            <ShimmerBase className="h-4 w-full rounded" />
            <ShimmerBase className="h-4 w-2/3 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Tech Stack Grid Item Skeleton
 */
export const TechStackSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="p-4 rounded-xl border border-hairline bg-surface-card flex items-center gap-3">
        <ShimmerBase className="w-10 h-10 rounded-full flex-shrink-0" />
        <ShimmerBase className="h-4 w-16 rounded" />
      </div>
    ))}
  </div>
);

/**
 * Project Card Skeleton
 */
export const ProjectSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonCard key={i} showImage={true} lines={3} imageHeight="h-64" />
    ))}
  </div>
);

/**
 * Achievement/Certificate Skeleton
 */
export const AchievementSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonCard key={i} showImage={false} lines={2} />
    ))}
  </div>
);
