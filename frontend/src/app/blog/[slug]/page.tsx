import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { RichBody } from '@/components/ui/RichBody';
import { api } from '@/lib/api';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await api.blogPost(slug);
  if (!post) return { title: 'Post Not Found' };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await api.blogPost(slug);
  if (!post) notFound();

  const all = (await api.blog())?.results ?? [];
  const sameCategory = all
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);
  const fallback = all.filter((p) => p.slug !== post.slug).slice(0, 3);
  const related = sameCategory.length > 0 ? sameCategory : fallback;

  return (
    <article className="pt-32 pb-20">
      <Container>
        <div className="max-w-3xl mx-auto mb-6">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.title },
            ]}
          />
        </div>

        <Link href="/blog" className="inline-flex items-center gap-2 text-soft-gray hover:text-electric-cyan transition mb-8">
          <ArrowLeft size={16} /> All Articles
        </Link>

        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-electric-cyan">{post.category}</span>
          <h1 className="font-display text-h1 text-white mt-3 mb-6 text-balance">{post.title}</h1>
          <p className="text-body-lg text-soft-gray mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-soft-gray pb-8 mb-8 border-b border-white/10">
            <span>By {post.author}</span>
            <span className="inline-flex items-center gap-1"><Calendar size={14} /> {new Date(post.published_at).toLocaleDateString()}</span>
            <span className="inline-flex items-center gap-1"><Clock size={14} /> {post.read_time} min</span>
          </div>

          {post.featured_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.featured_image} alt={post.title} loading="lazy" className="w-full rounded-2xl mb-10" />
          )}

          <RichBody html={post.content} />
        </div>

        {related.length > 0 && (
          <aside className="max-w-5xl mx-auto mt-20 pt-12 border-t border-white/10">
            <h2 className="font-display text-h3 text-white mb-6">Keep reading</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="group glass rounded-xl overflow-hidden hover:shadow-glow-cyan transition-all">
                  {p.featured_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.featured_image} alt={p.title} loading="lazy" className="w-full h-36 object-cover" />
                  )}
                  <div className="p-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-electric-cyan">{p.category}</span>
                    <h3 className="font-display text-base font-bold text-white mt-1.5 mb-1 line-clamp-2 group-hover:text-electric-cyan transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-soft-gray text-xs line-clamp-2">{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </Container>
    </article>
  );
}
