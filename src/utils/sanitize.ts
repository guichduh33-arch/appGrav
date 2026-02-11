/**
 * HTML Sanitization Utilities
 *
 * Provides escaping functions to prevent XSS when building HTML strings.
 */

/**
 * Escape a string for safe interpolation into HTML content.
 *
 * Replaces the five characters that have special meaning in HTML:
 *   & < > " '
 *
 * @param unsafe - The untrusted string (may contain HTML/script injection)
 * @returns A safe string with HTML entities escaped
 *
 * @example
 * ```ts
 * const safe = escapeHtml('<script>alert("xss")</script>');
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
