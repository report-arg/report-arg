'use client';

import dynamic from 'next/dynamic';

const HeroProvider = dynamic(
  () => import('@/components/providers/HeroProvider'),
  { ssr: false }
);

export default function DynamicHeroProvider({ children }) {
  return <HeroProvider>{children}</HeroProvider>;
}