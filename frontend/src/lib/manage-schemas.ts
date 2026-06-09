/**
 * Field schemas for every CMS entity. Drives EntityForm rendering and EntityTable
 * column lists. Match Django model field names exactly.
 */
import type { Field } from '@/components/manage/EntityForm';

export const serviceFields: Field[] = [
  { name: 'title',              label: 'Title',             type: 'text', required: true },
  { name: 'slug',               label: 'Slug',              type: 'slug', help: 'Auto-filled if blank.' },
  { name: 'subtitle',           label: 'Subtitle',          type: 'text' },
  { name: 'simple_explanation', label: 'Simple Explanation', type: 'textarea', rows: 3 },
  { name: 'long_description',   label: 'Long Description',  type: 'rich', rows: 12 },
  { name: 'icon_name',          label: 'Icon Name',         type: 'text', placeholder: 'lucide icon name e.g. Code2' },
  { name: 'gradient_from',      label: 'Gradient From',     type: 'color' },
  { name: 'gradient_to',        label: 'Gradient To',       type: 'color' },
  { name: 'order',              label: 'Order',             type: 'number', defaultValue: 0 },
  { name: 'is_featured',        label: 'Featured',          type: 'boolean', defaultValue: true },
  { name: 'cta_link',           label: 'CTA Link',          type: 'url' },
  { name: 'starting_price',     label: 'Starting Price',    type: 'decimal' },
  { name: 'currency',           label: 'Currency',          type: 'text', defaultValue: 'BDT' },
];

export const industryFields: Field[] = [
  { name: 'name',             label: 'Name',             type: 'text', required: true },
  { name: 'slug',             label: 'Slug',             type: 'slug', help: 'Auto-filled if blank.' },
  { name: 'icon_name',        label: 'Icon',             type: 'text', placeholder: 'lucide icon name' },
  { name: 'description',      label: 'Short Description', type: 'textarea', rows: 3 },
  { name: 'long_description', label: 'Long Description',  type: 'rich' },
  { name: 'example_service',  label: 'Example Service',   type: 'text' },
  { name: 'order',            label: 'Order',             type: 'number', defaultValue: 0 },
  { name: 'is_active',        label: 'Active',            type: 'boolean', defaultValue: true },
];

export const testimonialFields: Field[] = [
  { name: 'client_name',    label: 'Client Name', type: 'text', required: true },
  { name: 'client_title',   label: 'Client Title', type: 'text' },
  { name: 'company',        label: 'Company',     type: 'text' },
  { name: 'avatar_url',     label: 'Avatar',      type: 'image' },
  { name: 'quote',          label: 'Quote',       type: 'textarea', rows: 4, required: true },
  { name: 'rating',         label: 'Rating (1-5)', type: 'number', defaultValue: 5 },
  { name: 'is_featured',    label: 'Featured',    type: 'boolean' },
  { name: 'order',          label: 'Order',       type: 'number', defaultValue: 0 },
];

export const blogPostFields: Field[] = [
  { name: 'title',          label: 'Title',         type: 'text', required: true },
  { name: 'slug',           label: 'Slug',          type: 'slug', required: true },
  { name: 'excerpt',        label: 'Excerpt',       type: 'textarea', rows: 3, required: true },
  { name: 'content',        label: 'Content',       type: 'rich', rows: 16 },
  { name: 'featured_image', label: 'Featured Image', type: 'image' },
  { name: 'author',         label: 'Author',        type: 'text', required: true },
  { name: 'author_avatar',  label: 'Author Avatar',  type: 'image' },
  { name: 'read_time',      label: 'Read Time (min)', type: 'number', defaultValue: 5 },
  { name: 'category',       label: 'Category',      type: 'text' },
  { name: 'tags',           label: 'Tags',          type: 'json', help: 'JSON array, e.g. ["Django","bKash"]' },
  { name: 'is_published',   label: 'Published',     type: 'boolean' },
  { name: 'published_at',   label: 'Published At',  type: 'datetime' },
];

export const pageFields: Field[] = [
  { name: 'slug',            label: 'Slug',             type: 'slug', required: true },
  { name: 'title',           label: 'Title',            type: 'text', required: true },
  { name: 'body',            label: 'Body (HTML)',      type: 'rich', rows: 18 },
  { name: 'status',          label: 'Status',           type: 'select', defaultValue: 'draft', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
      { value: 'archived', label: 'Archived' },
  ]},
  { name: 'show_in_sitemap', label: 'Show in sitemap',  type: 'boolean', defaultValue: true },
];

export const heroFields: Field[] = [
  { name: 'eyebrow',        label: 'Eyebrow',          type: 'text' },
  { name: 'headline',       label: 'Headline',         type: 'text', required: true },
  { name: 'sub_headline',   label: 'Sub-headline',     type: 'textarea', rows: 3 },
  { name: 'primary_cta_text', label: 'Primary CTA Label', type: 'text' },
  { name: 'primary_cta_link', label: 'Primary CTA Link', type: 'text' },
  { name: 'secondary_cta_text', label: 'Secondary CTA Label', type: 'text' },
  { name: 'secondary_cta_link', label: 'Secondary CTA Link', type: 'text' },
  { name: 'is_active',      label: 'Active',           type: 'boolean', defaultValue: true },
];

export const ctaFields: Field[] = [
  { name: 'headline',           label: 'Headline',           type: 'text', required: true },
  { name: 'subtext',            label: 'Subtext',            type: 'textarea', rows: 3 },
  { name: 'primary_cta_text',   label: 'Primary CTA Text',   type: 'text' },
  { name: 'primary_cta_link',   label: 'Primary CTA Link',   type: 'text' },
  { name: 'secondary_cta_text', label: 'Secondary CTA Text', type: 'text' },
  { name: 'secondary_cta_link', label: 'Secondary CTA Link', type: 'text' },
  { name: 'background_gradient_start', label: 'Gradient Start', type: 'color' },
  { name: 'background_gradient_end',   label: 'Gradient End',   type: 'color' },
  { name: 'is_active',          label: 'Active',             type: 'boolean', defaultValue: true },
];

export const redirectFields: Field[] = [
  { name: 'from_path',  label: 'From path', type: 'text', required: true, placeholder: '/old-url' },
  { name: 'to_path',    label: 'To path',   type: 'text', required: true, placeholder: '/new-url or https://…' },
  { name: 'status_code', label: 'Status code', type: 'select', defaultValue: 301, options: [
      { value: 301, label: '301 Permanent' },
      { value: 302, label: '302 Temporary' },
  ]},
  { name: 'is_active',  label: 'Active', type: 'boolean', defaultValue: true },
];

export const metaTagFields: Field[] = [
  { name: 'path',                label: 'Path',                type: 'text', required: true, placeholder: '/services/web-development' },
  { name: 'title',               label: 'Title (≤60)',         type: 'text', required: true },
  { name: 'description',         label: 'Description (≤155)',  type: 'textarea', rows: 3, required: true },
  { name: 'canonical_url',       label: 'Canonical URL',       type: 'url' },
  { name: 'robots',              label: 'Robots',              type: 'select', defaultValue: 'index,follow', options: [
      { value: 'index,follow', label: 'index, follow' },
      { value: 'noindex,follow', label: 'noindex, follow' },
      { value: 'index,nofollow', label: 'index, nofollow' },
      { value: 'noindex,nofollow', label: 'noindex, nofollow' },
  ]},
  { name: 'og_title',            label: 'OG Title',            type: 'text' },
  { name: 'og_description',      label: 'OG Description',      type: 'textarea', rows: 2 },
  { name: 'og_image',            label: 'OG Image',            type: 'image' },
  { name: 'twitter_title',       label: 'Twitter Title',       type: 'text' },
  { name: 'twitter_description', label: 'Twitter Description', type: 'textarea', rows: 2 },
  { name: 'twitter_image',       label: 'Twitter Image',       type: 'image' },
  { name: 'primary_keywords',    label: 'Primary Keywords',    type: 'json' },
  { name: 'secondary_keywords',  label: 'Secondary Keywords',  type: 'json' },
];

export const siteSettingsFields: Field[] = [
  { name: 'site_name',         label: 'Site Name',        type: 'text', required: true },
  { name: 'tagline',           label: 'Tagline',          type: 'text' },
  { name: 'logo',              label: 'Logo',             type: 'image' },
  { name: 'favicon',           label: 'Favicon',          type: 'image' },
  { name: 'og_default_image',  label: 'OG default image (1200×630)', type: 'image' },
  { name: 'contact_email',     label: 'Contact Email',    type: 'email', required: true },
  { name: 'contact_phone',     label: 'Contact Phone',    type: 'text' },
  { name: 'whatsapp_number',   label: 'WhatsApp',         type: 'text' },
  { name: 'office_address',    label: 'Office Address',   type: 'textarea', rows: 3 },
  { name: 'office_hours',      label: 'Office Hours',     type: 'text' },
  { name: 'linkedin_url',      label: 'LinkedIn',         type: 'url' },
  { name: 'facebook_url',      label: 'Facebook',         type: 'url' },
  { name: 'instagram_url',     label: 'Instagram',        type: 'url' },
  { name: 'youtube_url',       label: 'YouTube',          type: 'url' },
  { name: 'twitter_url',       label: 'X / Twitter',      type: 'url' },
  { name: 'google_analytics_id',  label: 'GA4 ID',         type: 'text', placeholder: 'G-XXXXXXX' },
  { name: 'google_tag_manager_id', label: 'GTM ID',        type: 'text', placeholder: 'GTM-XXXXX' },
  { name: 'facebook_pixel_id', label: 'Facebook Pixel',   type: 'text' },
  { name: 'gsc_verification',  label: 'Google Search Console token', type: 'text' },
  { name: 'bing_verification', label: 'Bing site-verification', type: 'text' },
  { name: 'default_currency',  label: 'Default Currency', type: 'text', defaultValue: 'BDT' },
  { name: 'vat_percent',       label: 'VAT %',            type: 'decimal', defaultValue: 15 },
];

export const emailSettingsFields: Field[] = [
  { name: 'smtp_host',     label: 'SMTP Host',     type: 'text' },
  { name: 'smtp_port',     label: 'SMTP Port',     type: 'number', defaultValue: 587 },
  { name: 'smtp_username', label: 'SMTP Username', type: 'text' },
  { name: 'smtp_password', label: 'SMTP Password', type: 'password' },
  { name: 'use_tls',       label: 'Use TLS',       type: 'boolean', defaultValue: true },
  { name: 'from_email',    label: 'From Email',    type: 'email' },
  { name: 'from_name',     label: 'From Name',     type: 'text' },
  { name: 'reply_to',      label: 'Reply-To',      type: 'email' },
  { name: 'is_active',     label: 'Active',        type: 'boolean', defaultValue: true },
];

export const caseStudyFields: Field[] = [
  { name: 'title',              label: 'Project Title',       type: 'text', required: true },
  { name: 'client_name',        label: 'Client Name',         type: 'text', required: true },
  { name: 'industry',           label: 'Industry',            type: 'text', help: 'Free-text label shown on card, e.g. Garments/RMG' },
  { name: 'metric',             label: 'Headline Metric',     type: 'text', placeholder: '42%' },
  { name: 'metric_description', label: 'Metric Description',  type: 'text', placeholder: 'reduction in monthly closing time' },
  { name: 'description',        label: 'Short Description',   type: 'textarea', rows: 3, required: true },
  { name: 'challenge',          label: 'Challenge',           type: 'textarea', rows: 4 },
  { name: 'solution',           label: 'Solution',            type: 'textarea', rows: 4 },
  { name: 'results',            label: 'Results',             type: 'json', help: 'JSON array of strings, e.g. ["Month-end close cut from 5d to 7h", "BSCI audit prep halved"]' },
  { name: 'image_url',          label: 'Cover Image URL',     type: 'image' },
  { name: 'logo_url',           label: 'Client Logo URL',     type: 'image' },
  { name: 'testimonial_quote',  label: 'Testimonial Quote',   type: 'textarea', rows: 3 },
  { name: 'testimonial_author', label: 'Testimonial Author',  type: 'text' },
  { name: 'testimonial_title',  label: 'Author Title',        type: 'text', placeholder: 'CFO, Dhaka Garments Group' },
  { name: 'technologies',       label: 'Technologies',        type: 'json', help: 'JSON array, e.g. ["Django","PostgreSQL","React"]' },
  { name: 'is_featured',        label: 'Featured on homepage', type: 'boolean' },
  { name: 'order',              label: 'Order',               type: 'number', defaultValue: 0 },
];

export const emailTemplateFields: Field[] = [
  { name: 'name',     label: 'Name',     type: 'text', required: true },
  { name: 'key',      label: 'Key',      type: 'text', required: true, help: 'Programmatic key, e.g. lead_welcome' },
  { name: 'subject',  label: 'Subject',  type: 'text', required: true },
  { name: 'body_html', label: 'HTML body', type: 'rich', rows: 16 },
  { name: 'body_text', label: 'Plain text fallback', type: 'textarea', rows: 6 },
  { name: 'is_active', label: 'Active', type: 'boolean', defaultValue: true },
];
