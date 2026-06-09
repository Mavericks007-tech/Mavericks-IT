import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Container, Section } from '@/components/ui/Container';
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

  return (
    <article className="pt-32 pb-20">
      <Container>
        <a href="/blog" className="inline-flex items-center gap-2 text-soft-gray hover:text-electric-cyan transition mb-8">
          <ArrowLeft size={16} /> All Articles
        </a>

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
            <img src={post.featured_image} alt={post.title} className="w-full rounded-2xl mb-10" />
          )}

          <RichBody html={post.content} />
        </div>
      </Container>
    </article>
  );
}
