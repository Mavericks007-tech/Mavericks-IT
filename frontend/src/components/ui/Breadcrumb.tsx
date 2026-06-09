import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-soft-gray">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-soft-gray/50" aria-hidden />}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="hover:text-cyan transition-colors">
                {c.label}
              </Link>
            ) : (
              <span className={i === items.length - 1 ? 'text-white' : 'text-soft-gray'}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
