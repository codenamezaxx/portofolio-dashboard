/**
 * Input Sanitization Utilities
 * Prevents XSS and basic SQL injection by sanitizing user input.
 */

/**
 * Sanitizes a string to prevent XSS attacks.
 * Removes potentially malicious HTML content by stripping all tags.
 * For the current use cases (name, email, role, tagline), we don't expect any HTML.
 * @param dirty The string to sanitize.
 * @returns The sanitized string.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return dirty;
  }
  // Strip all HTML tags as a safety measure
  return dirty.replace(/<[^>]*>/g, '');
}

/**
 * Basic sanitization for SQL injection prevention.
 * Escapes single quotes and removes common SQL keywords.
 * This is a basic measure and should always be combined with parameterized queries
 * when interacting with a database.
 * @param input The string to sanitize.
 * @returns The sanitized string.
 */
export function sanitizeSql(input: string): string {
  if (!input || typeof input !== 'string') {
    return input;
  }
  // Escape single quotes
  let sanitized = input.replace(/'/g, "''");

  // Remove or replace common SQL injection keywords (case-insensitive)
  // This list is not exhaustive and parameterized queries are the primary defense
  const sqlKeywords = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/ig,
    /(\%3B)|(;)/ig,
    /select|union|insert|drop|delete|update|alter|create|truncate|exec|xp_cmdshell|declare|cast|convert/ig,
  ];

  sqlKeywords.forEach(regex => {
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized;
}

/**
 * Sanitizes a URL to ensure it's safe for display or linking.
 * Removes potential script injections in URL schemes.
 * @param url The URL string to sanitize.
 * @returns The sanitized URL string.
 */
export function sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      return url;
    }
    // Remove leading/trailing whitespace
    const trimmedUrl = url.trim();

    try {
        const parsedUrl = new URL(trimmedUrl);
        // Only allow http, https, ftp, mailto, tel schemes
        if (!['http:', 'https:', 'ftp:', 'mailto:', 'tel:'].includes(parsedUrl.protocol)) {
            return ''; // Invalid protocol, return empty string
        }
        return parsedUrl.toString();
    } catch (e) {
        // If URL parsing fails, it's likely an invalid URL
        return '';
    }
}

/**
 * Strips all HTML tags from a string.
 * @param html The HTML string to strip tags from.
 * @returns The plain text string.
 */
export function stripHtmlTags(html: string): string {
  if (!html || typeof html !== 'string') {
    return html;
  }
  return html.replace(/<[^>]*>/g, '');
}