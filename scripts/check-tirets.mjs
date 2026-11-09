#!/usr/bin/env node
/**
 * check:tirets, interdit les tirets cadratins et demi-cadratins.
 *
 * Décision client : plus aucun tiret long dans ce qui est visible ou lu par
 * un moteur. Textes, titres de page, descriptions de référencement, textes
 * alternatifs, libellés d'accessibilité, données structurées.
 *
 * On ne remplace pas par un trait d'union : on reformule. Virgule,
 * deux-points, point, ou « à » pour les plages (« de 20 h à 8 h »).
 *
 * Les traits d'union des mots composés (maître-chien, sous-traitant) ne sont
 * PAS concernés : ce sont des U+002D, pas des tirets longs.
 *
 * Le contrôle porte sur l'intégralité de src/ et public/, commentaires
 * compris. C'est volontaire : une règle qu'on applique partout est une règle
 * qu'on n'a pas besoin de discuter.
 *
 * Usage : node scripts/check-tirets.mjs
 */

import { readFile, readdir } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const CIBLES = ['src', 'public'];
const IGNORES = new Set(['node_modules', 'dist', '.astro', '.git', '.netlify']);
const EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.astro',
  '.md',
  '.mdx',
  '.json',
  '.css',
  '.html',
  '.mjs',
  '.js',
  '.txt',
  '.webmanifest',
]);

/**
 * U+2014 tiret cadratin, U+2013 tiret demi-cadratin.
 * On attrape aussi U+2012 (tiret numéral) et U+2015 (barre horizontale),
 * qui se glissent dans les copier-coller et produisent le même effet.
 */
const TIRETS = /[‒–—―]/g;

const NOMS = {
  '‒': 'tiret numéral',
  '–': 'tiret demi-cadratin',
  '—': 'tiret cadratin',
  '―': 'barre horizontale',
};

const GRAS = (s) => `\u001b[1m${s}\u001b[0m`;
const ROUGE = (s) => `\u001b[31m${s}\u001b[0m`;
const VERT = (s) => `\u001b[32m${s}\u001b[0m`;
const GRIS = (s) => `\u001b[90m${s}\u001b[0m`;

async function fichiers(dossier) {
  const trouves = [];
  let entrees;
  try {
    entrees = await readdir(dossier, { withFileTypes: true });
  } catch {
    return trouves;
  }
  for (const entree of entrees) {
    if (IGNORES.has(entree.name)) continue;
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) trouves.push(...(await fichiers(chemin)));
    else if (EXTENSIONS.has(extname(entree.name))) trouves.push(chemin);
  }
  return trouves;
}

async function principal() {
  const listes = await Promise.all(CIBLES.map((c) => fichiers(join(RACINE, c))));
  const tous = listes.flat().sort();

  const occurrences = [];

  for (const chemin of tous) {
    const contenu = await readFile(chemin, 'utf8');
    const lignes = contenu.split(/\r?\n/);
    const court = relative(RACINE, chemin).replaceAll('\\', '/');

    lignes.forEach((texte, index) => {
      TIRETS.lastIndex = 0;
      let trouve;
      while ((trouve = TIRETS.exec(texte)) !== null) {
        occurrences.push({
          fichier: court,
          ligne: index + 1,
          colonne: trouve.index + 1,
          caractere: trouve[0],
          extrait: texte.trim().slice(0, 100),
        });
      }
    });
  }

  console.log('');
  console.log(GRAS('check:tirets, tirets cadratins et demi-cadratins'));
  console.log('');

  if (occurrences.length === 0) {
    console.log(VERT(`  Aucun tiret long dans ${tous.length} fichiers.`));
    console.log('');
    return;
  }

  console.log(ROUGE(`${GRAS(String(occurrences.length))} tiret(s) long(s) à reformuler :`));
  for (const o of occurrences) {
    console.log(
      `  ${GRIS(`${o.fichier}:${o.ligne}:${o.colonne}`)}  ${NOMS[o.caractere]}\n      ${o.extrait}`,
    );
  }
  console.log('');
  console.log(
    GRIS('  Reformuler plutôt que remplacer par un trait d’union : virgule,'),
  );
  console.log(GRIS('  deux-points, point, ou « à » pour les plages horaires.'));
  console.log('');
  process.exit(1);
}

principal().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});
