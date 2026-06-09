import { Container, Section } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { BlogList } from '@/components/blog/BlogList';
import { api } from '@/lib/api';

export const revalidate = 60;

export const metadata = {
  title: 'Insights From Our Engineers',
  description: 'Web development, custom software, SEO, cybersecurity, industry insights, case studies from Bangladesh tech experts.',
};

export default async function BlogPage() {
  const data = await api.blog();
  const posts = data?.results ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Insights From Our Engineers"
        subtitle="Web dev. Custom software. SEO. Cybersecurity. Industry insights. Real lessons from the trenches."
      />

      <Section className="pt-0">
        <Container>
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-soft-gray">No posts published yet. Check back soon.</p>
            </div>
          ) : (
            <BlogList posts={posts} />
          )}
        </Container>
      </Section>
    </>
  );
}
