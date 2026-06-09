'use client';

import { Mail, CheckCircle2 } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { API_BASE } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const tokenFromUrl = params.get('token');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (tokenFromUrl) {
      localStorage.setItem('portal_token', tokenFromUrl);
      router.push('/portal/dashboard');
    }
  }, [tokenFromUrl, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch(`${API_BASE}/portal/request-access/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto glass rounded-2xl p-8 space-y-5">
      {status === 'success' ? (
        <div className="text-center py-6">
          <CheckCircle2 className="mx-auto text-aurora-green mb-4" size={56} />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Check your inbox</h2>
          <p className="text-soft-gray text-sm">
            If that email is registered, a portal link is on the way. Link expires after first use.
          </p>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-soft-gray mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-soft-gray/50 focus:outline-none focus:border-electric-cyan"
            />
          </div>
          {status === 'error' && <p className="text-crimson-red text-sm">Something went wrong. Try again.</p>}
          <Button type="submit" size="lg" disabled={status === 'submitting'} className="w-full">
            <Mail size={18} /> {status === 'submitting' ? 'Sending…' : 'Send Magic Link'}
          </Button>
          <p className="text-xs text-soft-gray text-center">
            Not a client? <a href="/contact" className="text-electric-cyan hover:underline">Schedule a consultation</a>
          </p>
        </>
      )}
    </form>
  );
}

export default function PortalLoginPage() {
  return (
    <>
      <PageHeader
        eyebrow="Client Portal"
        title="Access Your Portal"
        subtitle="Enter your email — we'll send a one-time secure link."
      />
      <section className="pb-20">
        <Container>
          <Suspense fallback={<div className="text-center text-soft-gray">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
