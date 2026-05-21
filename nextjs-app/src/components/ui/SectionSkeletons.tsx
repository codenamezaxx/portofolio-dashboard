import React from 'react';
import { motion } from 'framer-motion';

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
    ease: 'linear',
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
      <div key={i} className="h-[400px] md:h-[450px] rounded-xl border border-hairline bg-surface-card overflow-hidden flex flex-col justify-end p-8 gap-4">
        <div className="absolute inset-0 z-0">
          <ShimmerBase className="w-full h-full" />
        </div>
        <div className="relative z-10 space-y-4">
          <ShimmerBase className="h-4 w-24 rounded" />
          <ShimmerBase className="h-8 w-3/4 rounded" />
          <div className="flex gap-2">
            <ShimmerBase className="h-6 w-16 rounded-full" />
            <ShimmerBase className="h-6 w-16 rounded-full" />
            <ShimmerBase className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex gap-3">
            <ShimmerBase className="h-10 w-28 rounded-md" />
            <ShimmerBase className="h-10 w-28 rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Achievement/Certificate Skeleton
 */
export const AchievementSkeleton = () => (
  <div className="flex gap-6 overflow-hidden py-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-[300px] md:w-[350px]">
        <div className="h-[400px] rounded-xl border border-hairline bg-surface-card flex flex-col p-6 gap-6">
          <ShimmerBase className="w-12 h-12 rounded-md" />
          <div className="flex-1 space-y-3">
            <ShimmerBase className="h-4 w-20 rounded" />
            <ShimmerBase className="h-6 w-full rounded" />
            <ShimmerBase className="h-4 w-3/4 rounded" />
          </div>
          <div className="pt-4 border-t border-hairline flex justify-between items-center">
            <ShimmerBase className="h-4 w-12 rounded" />
            <div className="flex gap-2">
              <ShimmerBase className="w-8 h-8 rounded-md" />
              <ShimmerBase className="w-8 h-8 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
