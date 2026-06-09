'use client';

import {
  LayoutDashboard, Users, Briefcase, FileText, Receipt,
  Mail, BarChart3, Settings, LogOut, Menu, X, Building2, History,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/cn';
import { manage, type AdminUser } from '@/lib/manage-api';

const NAV = [
  { href: '/manage/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/manage/leads', label: 'Leads', icon: Users },
  { href: '/manage/clients', label: 'Clients', icon: Building2 },
  { href: '/manage/projects', label: 'Projects', icon: Briefcase },
  { href: '/manage/quotes', label: 'Quotes', icon: FileText },
  { href: '/manage/invoices', label: 'Invoices', icon: Receipt },
  { href: '/manage/email', label: 'Email', icon: Mail },
  { href: '/manage/reports', label: 'Reports', icon: BarChart3 },
  { href: '/manage/audit', label: 'Audit Log', icon: History },
  { href: '/manage/settings', label: 'Settings', icon: Settings },
];

export function ManageShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    manage.me()
      .then((u) => setUser(u))
      .catch(() => router.push('/manage/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const onLogout = async () => {
    try { await manage.logout(); } catch {}
    router.push('/manage/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-soft-gray font-mono text-sm">Loading…</p>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col glass-strong border-r border-white/5 fixed inset-y-0 left-0 z-40">
        <SidebarBody user={user} pathname={pathname} onLogout={onLogout} />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 glass-strong border-r border-white/5 flex flex-col">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white p-2">
              <X size={22} />
            </button>
            <SidebarBody user={user} pathname={pathname} onLogout={onLogout} onNav={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 glass-strong border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-2">
            <Menu size={22} />
          </button>
          <Logo size={28} showText />
          <div className="w-9" />
        </header>

        <main className="p-4 sm:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarBody({ user, pathname, onLogout, onNav }: {
  user: AdminUser; pathname: string; onLogout: () => void; onNav?: () => void;
}) {
  return (
    <>
      <div className="p-6 border-b border-white/5">
        <Logo size={36} showText />
        <p className="mt-3 text-xs font-mono uppercase tracking-widest text-electric-cyan">Admin Console</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onNav}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-electric-cyan/15 text-electric-cyan'
                  : 'text-soft-gray hover:text-white hover:bg-white/5',
              )}
            >
              <Icon size={18} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-semibold text-white truncate">{user.full_name || user.username}</p>
          <p className="text-xs text-soft-gray truncate">{user.email || user.username}</p>
          {user.groups.length > 0 && (
            <p className="text-xs text-electric-cyan mt-1 font-mono">{user.groups.join(', ')}</p>
          )}
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-soft-gray hover:text-crimson-red hover:bg-white/5 transition"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </>
  );
}
