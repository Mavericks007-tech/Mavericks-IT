import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console',
  robots: { index: false, follow: false },
};

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
