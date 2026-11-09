/**
 * robots.txt, généré au build.
 *
 * `/styleguide` n'existe pas en production (sa route n'est pas générée),
 * mais on l'exclut quand même : une page d'outillage qui réapparaîtrait par
 * mégarde ne doit pas se retrouver indexée.
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? '';

  return new Response(
    `User-agent: *
Allow: /
Disallow: /styleguide

Sitemap: ${base}/sitemap.xml
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
