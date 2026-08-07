/**
 * Security & Anti-Steganography / Anti-SQLi Utility for Digital Wardrobe
 */

// Known trusted domains for clothing image imports
const TRUSTED_DOMAINS = [
  'pinterest.com',
  'pinimg.com',
  'amazon.com',
  'amazon.in',
  'media-amazon.com',
  'flipkart.com',
  'flixcart.com',
  'google.com',
  'googleusercontent.com',
];

/**
 * Sanitizes URL to prevent XSS, HTML injection, and SQL injection payloads
 */
export const sanitizeUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  let cleaned = rawUrl.trim();

  // Strip dangerous protocol prefixes (javascript:, data:text/html, etc.)
  if (
    cleaned.toLowerCase().startsWith('javascript:') ||
    cleaned.toLowerCase().startsWith('vbscript:') ||
    cleaned.toLowerCase().startsWith('data:text/html')
  ) {
    return '';
  }

  // Remove potential HTML/script tags
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Remove dangerous SQL injection keywords embedded in raw string
  const sqlPayloads = [/UNION\s+SELECT/gi, /DROP\s+TABLE/gi, /DELETE\s+FROM/gi, /INSERT\s+INTO/gi, /EXEC\s*\(/gi];
  sqlPayloads.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });

  return cleaned;
};

/**
 * Scans an imported URL for steganography threat indicators, executable extensions, and SQLi
 */
export const scanUrlForThreats = (url) => {
  const flags = [];
  let riskLevel = 'SAFE';

  if (!url || typeof url !== 'string') {
    return { riskLevel: 'HIGH', flags: ['Empty or invalid URL input'] };
  }

  const lowercaseUrl = url.toLowerCase();

  // Check 1: Non-HTTP protocol
  if (!lowercaseUrl.startsWith('http://') && !lowercaseUrl.startsWith('https://')) {
    flags.push('Unsafe Protocol (Not HTTP/HTTPS)');
    riskLevel = 'HIGH';
  }

  // Check 2: Executable file extensions appended to image URLs (Polyglot / Steganography threat)
  const dangerousExts = ['.exe', '.php', '.sh', '.bat', '.cmd', '.vbs', '.js', '.jar', '.py', '.phtml', '.asp'];
  dangerousExts.forEach((ext) => {
    if (lowercaseUrl.includes(ext)) {
      flags.push(`Executable File Extension Detected (${ext})`);
      riskLevel = 'HIGH';
    }
  });

  // Check 3: Suspicious base64 / eval / script payload in query string
  if (
    lowercaseUrl.includes('eval(') ||
    lowercaseUrl.includes('base64_decode') ||
    lowercaseUrl.includes('<script') ||
    lowercaseUrl.includes('system(')
  ) {
    flags.push('Malicious Script Execution Payload Detected');
    riskLevel = 'HIGH';
  }

  // Check 4: SQL Injection patterns (strictly match SQL syntax, not common English words like 'select')
  if (
    /\bunion\s+select\b/i.test(lowercaseUrl) ||
    /\bdrop\s+table\b/i.test(lowercaseUrl) ||
    /\bdelete\s+from\b/i.test(lowercaseUrl) ||
    /--/.test(lowercaseUrl) ||
    /1=1/.test(lowercaseUrl)
  ) {
    flags.push('SQL Injection Syntax Detected in Query Parameters');
    if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
  }

  // Check 5: Domain Trust Analysis
  const isTrustedDomain = TRUSTED_DOMAINS.some((domain) => lowercaseUrl.includes(domain));
  if (!isTrustedDomain && riskLevel === 'SAFE') {
    flags.push('External / Unverified Third-Party Domain');
    riskLevel = 'MEDIUM';
  }

  return {
    riskLevel,
    flags: flags.length > 0 ? flags : ['Passed Security Sanitization Checks'],
    isTrustedDomain,
  };
};

/**
 * Auto-extracts direct high-res product image URL from Flipkart, Amazon, Pinterest product webpage URLs
 */
export const resolveProductImageUrl = async (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  let cleanUrl = rawUrl.trim();

  // 1. If it's already a direct CDN image link (Flipkart, Amazon, Pinterest, or ends with image extension)
  if (
    cleanUrl.includes('rukminim1.flixcart.com') ||
    cleanUrl.includes('rukminim2.flixcart.com') ||
    cleanUrl.includes('media-amazon.com') ||
    cleanUrl.includes('images-amazon.com') ||
    cleanUrl.includes('pinimg.com') ||
    cleanUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i)
  ) {
    return cleanUrl;
  }

  // 2. If it's a product page URL (e.g. flipkart.com/p/itm... or dl.flipkart.com/s/...), attempt auto-extraction
  try {
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    if (res.ok) {
      const htmlText = await res.text();

      // OpenGraph meta tag (og:image)
      const ogMatch =
        htmlText.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        htmlText.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

      if (ogMatch && ogMatch[1]) {
        return ogMatch[1].replace(/&amp;/g, '&');
      }

      // Flipkart CDN pattern match (rukminim1 / rukminim2)
      const flipkartMatch = htmlText.match(/https:\/\/rukminim[12]\.flixcart\.com\/image\/[^\s"']+/i);
      if (flipkartMatch && flipkartMatch[0]) {
        return flipkartMatch[0].replace(/&amp;/g, '&');
      }

      // Twitter image meta tag
      const twitterMatch =
        htmlText.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
        htmlText.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

      if (twitterMatch && twitterMatch[1]) {
        return twitterMatch[1].replace(/&amp;/g, '&');
      }
    }
  } catch (e) {
    console.warn('Auto-extract product image failed, falling back to original URL:', e);
  }

  return cleanUrl;
};
