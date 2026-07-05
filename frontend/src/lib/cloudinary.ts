/**
 * Cloudinary URL builder.
 *
 * Accepts either a full absolute URL (Cloudinary or otherwise) or a bare
 * public_id ("mavericks/uploads/hero.jpg") and returns a URL with the
 * requested transformations. Use this whenever rendering a MediaAsset the
 * backend surfaces as `cloudinary` provider.
 *
 * For non-Cloudinary sources the input is returned unchanged so callers can
 * blindly wrap every image URL.
 */

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD ?? '';

export type CloudinaryOptions = {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
  gravity?: 'auto' | 'face' | 'center';
  resource?: 'image' | 'video';
};

function isCloudinaryUrl(src: string): boolean {
  return /res\.cloudinary\.com/.test(src);
}

function isBarePublicId(src: string): boolean {
  return !!src && !src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:');
}

function buildTransform(opts: CloudinaryOptions): string {
  const parts: string[] = [
    `q_${opts.quality ?? 'auto'}`,
    `f_${opts.format ?? 'auto'}`,
  ];
  if (opts.width) parts.push(`w_${opts.width}`);
  if (opts.height) parts.push(`h_${opts.height}`);
  if (opts.width || opts.height) parts.push(`c_${opts.crop ?? 'fill'}`);
  if (opts.gravity) parts.push(`g_${opts.gravity}`);
  return parts.join(',');
}

export function cloudinaryUrl(src: string | null | undefined, opts: CloudinaryOptions = {}): string {
  if (!src) return '';
  const resource = opts.resource ?? 'image';

  if (isCloudinaryUrl(src)) {
    // Swap existing transformation segment for the requested one.
    return src.replace(
      /\/upload\/[^/]*\//,
      `/upload/${buildTransform(opts)}/`,
    );
  }

  if (isBarePublicId(src) && CLOUD) {
    return `https://res.cloudinary.com/${CLOUD}/${resource}/upload/${buildTransform(opts)}/${src}`;
  }

  return src;
}

/** Build a responsive srcset string for a Cloudinary-backed image. */
export function cloudinarySrcSet(src: string, widths: number[], base: CloudinaryOptions = {}): string {
  return widths
    .map((w) => `${cloudinaryUrl(src, { ...base, width: w })} ${w}w`)
    .join(', ');
}
