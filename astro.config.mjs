// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import { entreprise } from './src/data/entreprise.ts';

// https://astro.build/config
export default defineConfig({
  site: `https://www.${entreprise.domaine}`,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'directory',
    // Les styles critiques restent inlinés sous 4 Ko : une requête de moins sur le LCP.
    inlineStylesheets: 'auto',
  },
  image: {
    // AVIF + repli WebP gérés par le composant <Image /> d'Astro (sharp).
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  devToolbar: { enabled: false },
});
