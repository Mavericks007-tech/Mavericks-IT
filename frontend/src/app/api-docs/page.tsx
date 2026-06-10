import type { Metadata } from 'next';
import Link from 'next/link';

import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = {
  title: 'API Documentation',
  description: 'OpenAPI 3 reference for the Mavericks Tech backend.',
  robots: { index: false, follow: false },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

export default function ApiDocsPage() {
  return (
    <>
      <PageHeader eyebrow="Developers" title="API Documentation">
        <p className="text-soft-gray">
          OpenAPI 3 reference for every endpoint exposed by the Mavericks Tech backend.
        </p>
      </PageHeader>

      <Section className="pt-0">
        <Container>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card label="Swagger UI" href={`${API_BASE}/api/docs/`}
                    desc="Try every endpoint right in the browser." />
              <Card label="ReDoc" href={`${API_BASE}/api/redoc/`}
                    desc="Three-pane long-form reference." />
              <Card label="Raw schema" href={`${API_BASE}/api/schema/`}
                    desc="Download openapi.yaml for codegen." />
            </div>

            <article className="glass rounded-2xl p-6 sm:p-8 space-y-4 text-soft-gray text-sm">
              <h2 className="font-display text-h3 text-white">Auth</h2>
              <p>
                Public site reads anonymously via <code>/api/v1/site/</code>, <code>/api/v1/seo/</code>, etc.
                CRM, manage and portal endpoints require either Django session cookies
                (set by <code>/api/v1/auth/login/</code>) or a portal token via{' '}
                <code>Authorization: Bearer &lt;token&gt;</code>.
              </p>

              <h2 className="font-display text-h3 text-white">Rate limits</h2>
              <p>
                DRF throttles: <code>60/min</code> anon, <code>1000/hr</code> auth,
                <code>5/min</code> login, <code>10/hr</code> public lead submission,
                <code>5/hr</code> portal magic link.
              </p>

              <h2 className="font-display text-h3 text-white">Conventions</h2>
              <ul className="list-disc list-inside space-y-1 marker:text-electric-cyan">
                <li>JSON only; UTF-8.</li>
                <li>Trailing slashes required.</li>
                <li>UUID primary keys on every entity.</li>
                <li>Paginated lists return <code>{`{count,next,previous,results}`}</code>.</li>
                <li>State-changing requests need <code>X-CSRFToken</code> header.</li>
              </ul>
            </article>

            <p className="text-soft-gray text-sm text-center">
              For partner integrations please <Link href="/contact" className="text-electric-cyan hover:underline">contact us</Link>.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Card({ label, href, desc }: { label: string; href: string; desc: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
       className="glass rounded-2xl p-5 hover:border-electric-cyan/40 transition-colors block">
      <p className="font-display font-bold text-white">{label}</p>
      <p className="text-soft-gray text-xs mt-1">{desc}</p>
      <p className="text-electric-cyan text-xs mt-3">Open →</p>
    </a>
  );
}
