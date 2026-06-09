import { Home, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function NotFound() {
  return (
    <section className="min-h-[80vh] flex items-center pt-32 pb-20">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-mono text-electric-cyan mb-4">404 — PAGE NOT FOUND</p>
          <h1 className="font-display text-h1 text-white mb-6 text-balance">
            Oops! This Page <span className="text-gradient">Took A Vacation.</span>
          </h1>
          <p className="text-body-lg text-soft-gray mb-10">
            Don&apos;t worry — let&apos;s get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/" size="lg"><Home size={18} /> Homepage</Button>
            <Button href="/services" variant="secondary" size="lg">Services <ArrowRight size={18} /></Button>
            <Button href="/contact" variant="ghost" size="lg">Contact</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
