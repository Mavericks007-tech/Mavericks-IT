'use client';

import dynamic from 'next/dynamic';

const ServiceScene = dynamic(() => import('./ServiceScene').then(m => m.ServiceScene), {
  ssr: false,
});

export function ServiceSceneLazy({ slug }: { slug: string }) {
  return <ServiceScene slug={slug} />;
}
