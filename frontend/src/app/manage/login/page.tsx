'use client';

import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { manage } from '@/lib/manage-api';

export default function ManageLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    manage.csrf();
    manage.me().then(() => router.push('/manage/dashboard')).catch(() => {});
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await manage.csrf();
      await manage.login(username, password);
      router.push('/manage/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message.includes('401')) setError('Invalid username or password.');
      else if (message.includes('403')) setError('Staff access required.');
      else setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <a href="/" aria-label="Home" className="inline-block mb-6">
            <Logo size={56} showText />
          </a>
          <h1 className="font-display text-h2 text-white">Admin Console</h1>
          <p className="text-soft-gray mt-2">Sign in to manage Mavericks Tech.</p>
        </div>

        <form onSubmit={submit} className="glass rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-soft-gray mb-1.5">Username</label>
            <input
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-soft-gray/50 focus:outline-none focus:border-electric-cyan"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-soft-gray mb-1.5">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-soft-gray/50 focus:outline-none focus:border-electric-cyan"
            />
          </div>
          {error && (
            <p className="text-crimson-red text-sm bg-crimson-red/10 border border-crimson-red/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" disabled={loading} className="w-full">
            <LogIn size={18} /> {loading ? 'Signing in…' : 'Sign In'}
          </Button>
          <p className="text-center text-xs text-soft-gray">
            Forgot password? Contact{' '}
            <a href="mailto:hello@maverickstech.com.bd" className="text-electric-cyan hover:underline">
              support
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
