/**
 * sitemap.xml, généré au build.
 *
 * Le site est une page unique : il n'y a que trois URL réelles, déclarées
 * dans src/data/site.ts. Les ancres de l'accueil ne sont pas des URL et n'ont
 * rien à faire ici.
 */
import type { APIRoute } from 'astro';
import { routesSitemap } from '@data/site';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? '';
  const date = new Date().toISOString().slice(0, 10);

  const corps = routesSitemap
    .map(
      (route) => `  <url>
    <loc>${base}${route.href === '/' ? '' : route.href}</loc>
    <lastmod>${date}</lastmod>
    <priority>${route.priorite.toFixed(1)}</priority>
  </url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${corps}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
