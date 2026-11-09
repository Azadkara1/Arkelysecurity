#!/usr/bin/env node
/**
 * check:xx, recense ce qui attend encore un arbitrage ou une livraison du
 * client.
 *
 * Deux choses :
 *   1. les placeholders 'XX', qui doivent s'afficher tels quels à l'écran
 *      pour qu'on ne les oublie pas ;
 *   2. les FICHIERS ATTENDUS mais absents (la plaquette PDF, les photos).
 *
 * Le script sort en code d'erreur s'il reste des 'XX' ou si un fichier
 * obligatoire manque. Il est branché sur le build de production.
 *
 * Pendant le développement, utiliser `pnpm run build:preprod`, ou poser
 * AUTORISER_XX=1 devant la commande.
 */

import { readFile, readdir, access } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const CIBLES = ['src', 'public'];
const IGNORES = new Set(['node_modules', 'dist', '.astro', '.git', '.netlify']);
const EXTENSIONS = new Set(['.ts', '.tsx', '.astro', '.md', '.mdx', '.json', '.css', '.html']);

/** Un placeholder : 'XX' isolé, pas le XX d'un mot. */
const MOTIF = /\bXX\b/g;

/**
 * Marqueurs rédactionnels, signalés sans faire échouer le build.
 * Pas de `\b` devant « À » : en JavaScript les limites de mot sont ASCII et
 * ne reconnaissent pas les lettres accentuées.
 */
const MOTIF_REDACTION = /(À RÉDIGER|À VALIDER|TODO\b)/g;

/** Lignes de commentaire dans un fichier de code : elles parlent des
 *  placeholders, elles n'en sont pas. Ne s'applique pas au Markdown. */
const MOTIF_COMMENTAIRE = /^\s*(\/\/|\/?\*|<!--)/;
const EXTENSIONS_CODE = new Set(['.ts', '.tsx', '.astro', '.mjs', '.js', '.css']);

/**
 * Fichiers que le client doit fournir.
 * `bloquant` : son absence fait échouer le build de production.
 */
const FICHIERS_ATTENDUS = [
  {
    chemin: 'public/plaquette-arkelys-security.pdf',
    role: 'Plaquette commerciale, bouton de téléchargement de la section Contact',
    bloquant: true,
  },
];

const GRAS = (s) => `\u001b[1m${s}\u001b[0m`;
const ROUGE = (s) => `\u001b[31m${s}\u001b[0m`;
const JAUNE = (s) => `\u001b[33m${s}\u001b[0m`;
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

async function analyser(chemin) {
  const contenu = await readFile(chemin, 'utf8');
  const lignes = contenu.split(/\r?\n/);
  const estCode = EXTENSIONS_CODE.has(extname(chemin));
  const occurrences = [];

  lignes.forEach((texte, index) => {
    MOTIF.lastIndex = 0;
    MOTIF_REDACTION.lastIndex = 0;
    if (estCode && MOTIF_COMMENTAIRE.test(texte)) return;
    if (MOTIF.test(texte)) {
      occurrences.push({ ligne: index + 1, texte: texte.trim(), type: 'xx' });
    } else if (MOTIF_REDACTION.test(texte)) {
      occurrences.push({ ligne: index + 1, texte: texte.trim(), type: 'redaction' });
    }
  });

  return occurrences;
}

async function existe(chemin) {
  try {
    await access(join(RACINE, chemin));
    return true;
  } catch {
    return false;
  }
}

async function principal() {
  const listes = await Promise.all(CIBLES.map((c) => fichiers(join(RACINE, c))));
  const tous = listes.flat().sort();

  let nbXx = 0;
  let nbRedaction = 0;
  const sortieXx = [];
  const sortieRedaction = [];

  for (const chemin of tous) {
    const occurrences = await analyser(chemin);
    if (occurrences.length === 0) continue;
    const court = relative(RACINE, chemin).replaceAll('\\', '/');

    for (const o of occurrences) {
      const extrait = o.texte.length > 96 ? `${o.texte.slice(0, 96)}...` : o.texte;
      const ligne = `  ${GRIS(`${court}:${o.ligne}`)}  ${extrait}`;
      if (o.type === 'xx') {
        nbXx += 1;
        sortieXx.push(ligne);
      } else {
        nbRedaction += 1;
        sortieRedaction.push(ligne);
      }
    }
  }

  const manquants = [];
  for (const attendu of FICHIERS_ATTENDUS) {
    if (!(await existe(attendu.chemin))) manquants.push(attendu);
  }

  console.log('');
  console.log(GRAS('check:xx, données et fichiers en attente du client'));
  console.log('');

  if (nbXx === 0) {
    console.log(VERT('  Aucun placeholder XX.'));
  } else {
    console.log(ROUGE(`${GRAS(String(nbXx))} placeholder(s) XX à arbitrer :`));
    console.log(sortieXx.join('\n'));
  }

  if (manquants.length > 0) {
    console.log('');
    console.log(ROUGE(`${GRAS(String(manquants.length))} fichier(s) attendu(s) manquant(s) :`));
    for (const m of manquants) {
      console.log(`  ${GRIS(m.chemin)}`);
      console.log(`      ${m.role}`);
    }
  }

  if (nbRedaction > 0) {
    console.log('');
    console.log(JAUNE(`${GRAS(String(nbRedaction))} marqueur(s) rédactionnel(s) (informatif) :`));
    console.log(sortieRedaction.join('\n'));
  }

  console.log('');

  const bloque = nbXx > 0 || manquants.some((m) => m.bloquant);
  if (bloque && !process.env['AUTORISER_XX']) {
    console.log(
      GRIS('  Build de production bloqué. Utiliser `pnpm run build:preprod` en attendant.'),
    );
    console.log('');
    process.exit(1);
  }
}

principal().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});
