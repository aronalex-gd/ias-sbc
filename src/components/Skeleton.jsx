import React from 'react';

export const SkeletonBox = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const EventCardSkeleton = ({ featured = false }) => (
  <div className={`rounded-3xl border border-white/5 bg-zinc-900/40 overflow-hidden ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}>
    <div className={`skeleton ${featured ? 'aspect-[16/9]' : 'aspect-video'} w-full`} />
    <div className="p-8 space-y-4">
      <div className="flex justify-between">
        <SkeletonBox className="h-3 w-20" />
        <SkeletonBox className="h-3 w-16" />
      </div>
      <SkeletonBox className={`h-6 ${featured ? 'w-3/4' : 'w-2/3'}`} />
      <SkeletonBox className="h-4 w-full" />
      <SkeletonBox className="h-4 w-4/5" />
      <SkeletonBox className="h-12 w-full rounded-xl mt-4" />
    </div>
  </div>
);

export const MemberCardSkeleton = () => (
  <div className="w-full max-w-xs aspect-[1.618/1] rounded-3xl border border-white/5 bg-zinc-900/40 p-8">
    <div className="flex justify-between items-start mb-12">
      <div className="space-y-2">
        <SkeletonBox className="h-2 w-24" />
        <SkeletonBox className="h-7 w-40" />
      </div>
      <SkeletonBox className="h-8 w-12" />
    </div>
    <SkeletonBox className="h-2 w-20 mb-2" />
    <SkeletonBox className="h-8 w-48" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="flex flex-col items-center gap-8 pt-40 pb-20 px-6 min-h-screen">
    <div className="text-center space-y-3">
      <SkeletonBox className="h-14 w-64 mx-auto" />
      <SkeletonBox className="h-3 w-48 mx-auto" />
    </div>
    <MemberCardSkeleton />
    <div className="flex flex-col items-center gap-4 mt-8">
      <SkeletonBox className="h-4 w-40" />
      <SkeletonBox className="h-10 w-36 rounded-full" />
    </div>
  </div>
);
