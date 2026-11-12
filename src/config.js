/**
 * Connection is Admin-only: Restaurant Admin → Settings → Website Connection
 * must use this same site slug. No INGEST_SECRET / .env required on this site.
 */
export const SITE_SLUG = 'jaathara';

/** Restaurant Server public API (browser calls /api/public/website/:slug/*). */
export const RESTAURANT_API_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:4000'
  : 'https://restaurantapi.d3e.studio';
