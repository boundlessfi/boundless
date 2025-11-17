/**
 * Utility functions for handling Cloudinary URLs
 */

/**
 * Normalizes a Cloudinary URL to use the correct resource type for images
 * Converts /raw/upload/ to /image/upload/ for image URLs
 *
 * @param url - The Cloudinary URL to normalize
 * @returns The normalized URL with correct resource type
 */
export function normalizeCloudinaryImageUrl(
  url: string | null | undefined
): string {
  if (!url) {
    return '/placeholder.svg';
  }

  // If it's already a valid image URL or not a Cloudinary URL, return as-is
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  // Fix /raw/upload/ to /image/upload/ for images
  // This handles cases where images were incorrectly uploaded as "raw" resources
  if (url.includes('/raw/upload/')) {
    return url.replace('/raw/upload/', '/image/upload/');
  }

  return url;
}

/**
 * Checks if a URL is a valid Cloudinary image URL
 */
export function isValidCloudinaryImageUrl(url: string): boolean {
  if (!url || !url.includes('res.cloudinary.com')) {
    return false;
  }

  // Valid image URLs should use /image/upload/ not /raw/upload/
  return url.includes('/image/upload/') || url.includes('/raw/upload/');
}
