const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

export const isDevelopment =
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname.includes('puter.site') ||
  hostname.includes('puter.app') ||
  hostname.includes('puter.com');

export const isProduction = !isDevelopment;


export const POLICY_STORAGE_KEYS = Object.freeze({
  draft: "nisai:policy:draft:v1",
  published: "nisai:policy:published:v1",
});
