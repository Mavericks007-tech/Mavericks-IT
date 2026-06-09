export function RichBody({ html, markdown }: { html?: string; markdown?: string }) {
  const content = html || markdown || '';
  if (!content) return null;
  return (
    <div
      className="prose prose-invert max-w-none
        prose-headings:font-display prose-headings:text-white
        prose-h1:text-h2 prose-h2:text-h3 prose-h3:text-h4
        prose-p:text-soft-gray prose-p:leading-relaxed
        prose-a:text-electric-cyan prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white
        prose-li:text-soft-gray prose-li:marker:text-electric-cyan
        prose-blockquote:border-l-electric-cyan prose-blockquote:text-soft-gray
        prose-code:text-electric-cyan prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
