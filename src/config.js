/**
 * Connection is Admin-only: Restaurant Admin → Settings → Website Connection
 * must use this same site slug. No INGEST_SECRET / .env required on this site.
 */
export const SITE_SLUG = 'jaathara';

/** Restaurant Server public API (browser calls /api/public/website/:slug/*). */
/** Uses the live server by default. To test against a local server, set
 *  VITE_RESTAURANT_API_URL=http://127.0.0.1:4000 in .env.local and restart npm run dev. */
export const RESTAURANT_API_URL =
  import.meta.env.VITE_RESTAURANT_API_URL || 'https://restaurantapi.d3e.studio';
