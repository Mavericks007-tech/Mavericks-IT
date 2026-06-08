import { fetchSite } from '@/lib/api';
import { NavbarClient } from './NavbarClient';

export async function Navbar() {
  const site = await fetchSite();
  return (
    <NavbarClient
      navItems={site?.header_nav ?? []}
      siteName={site?.settings?.site_name ?? 'Mavericks Tech'}
      logoUrl={site?.settings?.logo ?? null}
    />
  );
}
