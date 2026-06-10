'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

/**
 * Skip Navbar/Footer on /manage routes (admin has its own shell).
 */
export function ChromeWrapper({ navbar, footer, children }: {
  navbar: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/manage');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      <main id="main">{children}</main>
      {footer}
    </>
  );
}
