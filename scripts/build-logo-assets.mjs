#!/usr/bin/env node
/**
 * build-logo-assets — dérive les déclinaisons du logo fourni par le client.
 *
 * SOURCE : Logo_ARKELYS.png à la racine du projet.
 *          PNG 1115 × 1411, RGB **sans couche alpha**, fond noir pur opaque.
 *
 * RÈGLE DU BRIEF : le logo s'utilise tel quel. On ne le redessine pas, on ne
 * le recolore pas, on ne le déforme pas. Ce script ne fait donc QUE :
 *   - des recadrages aux pixels exacts (aucune interpolation de couleur),
 *   - des redimensionnements proportionnels (aucune déformation),
 *   - des compositions sur fond noir, la couleur de fond déjà incrustée
 *     dans le fichier d'origine.
 *
 * Aucun détourage, aucun passage en alpha, aucune recolorisation.
 *
 * LIMITE CONNUE — voir docs/LOGO.md :
 *   le fond noir étant opaque, aucune déclinaison ne peut être posée sur un
 *   fond clair (`bone`). Il faut demander au client un SVG vectoriel ou un
 *   PNG à fond transparent. Tant qu'on ne l'a pas, les sections claires
 *   utilisent le mot-symbole typographique décrit dans le brief.
 *
 * Usage : pnpm run assets:logo
 */

import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SOURCE = join(RACINE, 'Logo_ARKELYS.png');
const SORTIE_ASSETS = join(RACINE, 'src', 'assets', 'logo');
const SORTIE_PUBLIC = join(RACINE, 'public');

/**
 * Boîtes englobantes relevées sur le fichier d'origine
 * (scripts d'analyse : seuil de luminance 28/255).
 *
 *   blason                            x 207..918   y   83..844
 *   mot « ARKELYS »                   x  33..1080  y  884..1029
 *   mot « SECURITY » et ses filets    x  35..1077  y 1062..1139
 *   signature « VOTRE SÉCURITÉ… »     x  38..1076  y 1183..1215
 */
const BLASON = { x0: 207, y0: 83, x1: 918, y1: 844 };

/** Recadrage carré centré sur le blason, avec 8 % de marge. */
function cadreBlason() {
  const l = Math.max(BLASON.x1 - BLASON.x0 + 1, BLASON.y1 - BLASON.y0 + 1);
  const cote = Math.round(l * 1.08);
  const cx = Math.round((BLASON.x0 + BLASON.x1) / 2);
  const cy = Math.round((BLASON.y0 + BLASON.y1) / 2);
  return {
    left: Math.max(0, cx - Math.round(cote / 2)),
    top: Math.max(0, cy - Math.round(cote / 2)),
    width: cote,
    height: cote,
  };
}

/** Fond noir pur : la couleur déjà présente dans le fichier d'origine. */
const NOIR = { r: 0, g: 0, b: 0, alpha: 1 };

async function principal() {
  await mkdir(SORTIE_ASSETS, { recursive: true });
  await mkdir(SORTIE_PUBLIC, { recursive: true });

  const meta = await sharp(SOURCE).metadata();
  if (meta.hasAlpha) {
    console.warn(
      '\n  Le fichier source a désormais une couche alpha : relire docs/LOGO.md,\n' +
        '  les déclinaisons pour fond clair deviennent possibles.\n',
    );
  }

  // 1. Le logo complet, tel quel. Aucune transformation.
  await copyFile(SOURCE, join(SORTIE_ASSETS, 'arkelys-logo-complet.png'));

  // 2. Le blason seul — recadrage exact, pour les petits formats
  //    (favicon, icône d'application, pastille du bandeau).
  const cadre = cadreBlason();
  const blason = sharp(SOURCE).extract(cadre);
  await blason.clone().png({ compressionLevel: 9 }).toFile(join(SORTIE_ASSETS, 'arkelys-blason.png'));

  // 3. Favicons et icônes d'application, dérivés du blason.
  const tailles = [
    { nom: 'favicon-16.png', px: 16 },
    { nom: 'favicon-32.png', px: 32 },
    { nom: 'favicon-48.png', px: 48 },
    { nom: 'apple-touch-icon.png', px: 180 },
    { nom: 'icone-192.png', px: 192 },
    { nom: 'icone-512.png', px: 512 },
  ];
  for (const { nom, px } of tailles) {
    await sharp(SOURCE)
      .extract(cadre)
      .resize(px, px, { fit: 'cover', kernel: 'lanczos3' })
      .flatten({ background: NOIR })
      .png({ compressionLevel: 9 })
      .toFile(join(SORTIE_PUBLIC, nom));
  }

  // 4. Image Open Graph par défaut : le logo complet centré sur fond noir,
  //    au format 1200 × 630 attendu par les réseaux.
  const OG = { w: 1200, h: 630 };
  const logoOg = await sharp(SOURCE)
    .resize({ height: Math.round(OG.h * 0.78), fit: 'inside', kernel: 'lanczos3' })
    .toBuffer();
  await sharp({
    create: { width: OG.w, height: OG.h, channels: 3, background: NOIR },
  })
    .composite([{ input: logoOg, gravity: 'centre' }])
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
    .toFile(join(SORTIE_PUBLIC, 'og-defaut.jpg'));

  // 5. Manifeste d'application.
  await writeFile(
    join(SORTIE_PUBLIC, 'site.webmanifest'),
    `${JSON.stringify(
      {
        name: 'ARKELYS SECURITY',
        short_name: 'ARKELYS',
        icons: [
          { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: '#0b0b0c',
        background_color: '#0b0b0c',
        display: 'standalone',
        start_url: '/',
        lang: 'fr-FR',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log('\n  Déclinaisons du logo générées.');
  console.log('    src/assets/logo/arkelys-logo-complet.png  (original, intact)');
  console.log('    src/assets/logo/arkelys-blason.png        (recadrage du blason)');
  console.log('    public/favicon-{16,32,48}.png, apple-touch-icon.png, icone-{192,512}.png');
  console.log('    public/og-defaut.jpg, public/site.webmanifest');
  console.log('\n  Rappel : aucune déclinaison ne passe sur fond clair. Voir docs/LOGO.md.\n');
}

principal().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});
