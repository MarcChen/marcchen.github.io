export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];

  // Provide your Cloudinary cloud name here
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';

  // The base URL of the website where images are hosted
  // If NEXT_PUBLIC_SITE_URL is not set, we'll assume relative paths
  // might break if Cloudinary tries to fetch them, so it's important
  // the site is deployed, and we construct absolute URLs.
  // We can use a trick: if it's a relative path, we append the site URL.
  // If no site URL is available, we fallback to just standard fetch,
  // but Cloudinary needs an absolute URL to fetch from.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://marcchen.github.io';

  let fullSrc = src;
  if (!src.startsWith('http://') && !src.startsWith('https://')) {
    // Make sure there is only one slash between siteUrl and src
    const baseUrl = siteUrl.replace(/\/+$/, '');
    const path = src.startsWith('/') ? src : `/${src}`;
    fullSrc = `${baseUrl}${path}`;
  }

  return `https://res.cloudinary.com/${cloudName}/image/fetch/${params.join(',')}/${fullSrc}`;
}
