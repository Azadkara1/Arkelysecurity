# CLAUDE.md, site ARKELYS SECURITY

Document de reprise. À lire en entier avant la première modification, que la
reprise soit humaine ou par un agent.

**La source de vérité du projet est [`BRIEF.md`](BRIEF.md)**, et en
particulier sa section « Refonte du 9 novembre 2026 : le site devient une page
unique », qui prime sur le reste du document. Ce fichier-ci ne le remplace
pas : il dit où les choses sont, ce qui est fait, ce qui est décidé, ce qui
bloque. Quand une décision est prise, on modifie `BRIEF.md`, pas l'historique
d'une conversation.

---

## 1. Ce qu'est le projet

Site de **ARKELYS SECURITY**, société de sécurité privée française :
surveillance et gardiennage, sécurité incendie SSIAP, sécurité événementielle,
prestations cynophiles.

**C'est une page unique.** Quatre sections, quatre liens de navigation qui sont
des ancres, et deux pages légales obligatoires. Rien d'autre.

Registre visuel : haut de gamme discret. Noir, blanc cassé, or parcimonieux.
**Jamais** de dramatisation de la menace, d'esthétique militaire, de
gyrophare, aucune exception.

---

## 2. Démarrer

```bash
pnpm install
pnpm dev                # http://localhost:4321
pnpm run build:preprod  # build SANS le contrôle des placeholders, à utiliser pendant le développement
pnpm build              # build de production : échoue s'il reste des 'XX', un tiret long, ou si la plaquette manque
pnpm run check:xx       # données et fichiers en attente du client
pnpm run check:tirets   # interdit les tirets cadratins et demi-cadratins
pnpm check              # diagnostics TypeScript et Astro
pnpm test               # tests de la logique de devis (node --test, sans Vitest)
pnpm run assets:logo    # régénère favicons et icônes depuis Logo_ARKELYS.png
```

### Pièges d'environnement déjà rencontrés

| Symptôme | Cause | Ce qu'on fait |
| --- | --- | --- |
| `pnpm: command not found` | `corepack enable` échoue en `EPERM` sur ce poste | `npm i -g pnpm` |
| `ERR_PNPM_IGNORED_BUILDS` sur `esbuild` et `sharp` | pnpm n'exécute plus les postinstall sans accord | **Sans effet** : les deux résolvent leurs binaires via des dépendances optionnelles de plateforme. `pnpm approve-builds` (interactif) lève l'avertissement. |
| `astro check` plante sur l'API TypeScript | TypeScript 7.x n'expose plus l'API que `astro check` utilise | **TypeScript est épinglé en `^6`.** Ne pas passer en 7 tant qu'Astro n'a pas suivi. |
| Un build qui dure des heures | Premier passage de `sharp` sur ce poste, antivirus | Ponctuel. Les builds suivants tournent en 4 s. |

---

## 3. Stack, imposée

- **Astro 5**, sortie statique, TypeScript strict
- **Tailwind CSS v4**, configuré **uniquement** via `@theme` dans
  `src/styles/global.css`. **Il n'y a pas de `tailwind.config.js`** et il ne
  doit pas y en avoir.
- Interactivité en **vanilla TS**. **Pas de React, Vue ni Svelte.**
- **View Transitions** natives d'Astro
- Polices **auto-hébergées** via `@fontsource-variable`. **Aucun appel au CDN
  Google Fonts** : conformité RGPD et une requête externe en moins.
- Déploiement **Netlify**, formulaire via Netlify Forms avec honeypot
- **`pnpm`**

**Aucune autre dépendance sans accord explicite d'Azad.**

| Paquet | Rôle |
| --- | --- |
| `astro` | le framework |
| `tailwindcss`, `@tailwindcss/vite` | la CSS |
| `@fontsource-variable/fraunces`, `@fontsource-variable/inter` | polices auto-hébergées |
| `sharp` (dev) | `scripts/build-logo-assets.mjs`. Déjà transitive d'Astro. |
| `@astrojs/check`, `typescript` (dev) | le `astro check` exigé par « TypeScript strict » |
| `@types/node` (dev) | types pour les scripts et `node:test` |

---

## 4. Où sont les choses

```
ARKELYS/
├── BRIEF.md                    ← SOURCE DE VÉRITÉ. Lire la section « Refonte ».
├── CLAUDE.md                   ← ce fichier
├── Logo_ARKELYS.png            ← fichier client. NE PAS RETOUCHER.
├── netlify.toml                ← contient la doc complète du routage du formulaire
├── docs/LOGO.md                ← état du logo et limite bloquante
├── scripts/
│   ├── check-xx.mjs            ← placeholders 'XX' + fichiers attendus manquants
│   ├── check-tirets.mjs        ← interdit — et –
│   └── build-logo-assets.mjs   ← favicons, icônes, image Open Graph
├── public/
│   ├── theme-init.js           ← pose le thème avant le premier rendu
│   ├── photos/README.md        ← prises de vue à commander
│   └── favicon-*, og-defaut.jpg, site.webmanifest
└── src/
    ├── assets/logo/            ← logo complet + blason recadré
    ├── components/
    │   ├── Bandeau.astro       ← 4 ancres, 2 boutons dorés, TOUJOURS NOIR, bascule de thème
    │   ├── PiedDePage.astro    ← même navigation + liens légaux + CNAPS
    │   ├── Section.astro       ← alternance surface / surface-2
    │   ├── Bouton.astro        ← plein / contour / discret, + état désactivé
    │   ├── MotSymbole.astro    ← repli typographique du logo, À SUPPRIMER avec le SVG
    │   ├── BandeauLogos.astro  ← défilement de logos, CSS pur
        │   ├── SemaineType.astro   ← grille 7 × 24 du formulaire
    │   ├── PhotoPlaceholder.astro
    │   └── MentionCnaps.astro
    ├── data/
    │   ├── entreprise.ts       ← TOUTES les données d'entreprise
    │   ├── site.ts             ← navigation (ancres), boutons, routes du sitemap
    │   ├── prestations.ts      ← les 4 métiers
    │   ├── references.ts       ← logos clients, vide tant qu'aucun accord écrit
    │   └── agents.ts           ← STRUCTURE DE LA FUTURE FONCTION DEVIS, inutilisée
    ├── lib/
    │   ├── theme.ts            ← bascule sombre / clair
    │   ├── semaine-type.ts     ← grille du formulaire, souris, clavier, doigt
    │   ├── menu-mobile.ts      ← piège à focus, Échap
    │   ├── infobulle.ts        ← « Évolution à venir »
    │   ├── apparition.ts       ← apparition au scroll
    │   └── devis/              ← logique de dimensionnement + 20 tests. INUTILISÉE.
    ├── layouts/Base.astro
    ├── pages/
    │   ├── index.astro         ← LA page, quatre sections
    │   ├── mentions-legales.astro
    │   ├── politique-de-confidentialite.astro
    │   ├── 404.astro
    │   ├── sitemap.xml.ts, robots.txt.ts
    │   └── styleguide/[...rien].astro  ← développement uniquement
    └── styles/global.css       ← tokens, thèmes, base, utilitaires
```

---

## 5. Les règles qui ne se discutent pas

1. **N'inventer aucun fait.** Aucun chiffre d'effectif, d'ancienneté, de
   nombre de clients, de délai d'intervention, de certification, de nom de
   client. Donnée manquante → `'XX'`, visible à l'écran. Les documents sources
   **se contredisent** (de 35 à 110 agents) : matière première à vérifier,
   jamais source de vérité.
2. **Aucune promesse de résultat.** Jamais « sécurité garantie », « risque
   zéro », « intervention en moins de X minutes ». Le vocabulaire est celui du
   mémoire technique : *prévenir, détecter, transmettre, coordonner*.
3. **Aucun tarif affiché.** Voir `peutAfficherUnPrix()` dans
   `src/data/agents.ts` : c'est le seul point de décision, et il renvoie
   `false` tant que les taux ne sont pas renseignés.
4. **Aucun nom ni logo de client** sans `autoriseNomPublic: true`, qui suppose
   un accord écrit et vaut `false` par défaut.
5. **Aucune image générée par IA**, aucune banque d'images générique, aucune
   photo d'une personne réelle sans autorisation signée.
6. **Rien de militaire ni d'anxiogène.** Aucune exception : le rond rouge
   à côté du logo a été retiré.
7. **Pas de dépendance hors stack** sans accord.
8. **Pas de faux-texte latin.** Un texte manquant s'écrit en vrai français
   provisoire, marqué `À VALIDER`.
9. **La nuit n'est jamais présentée comme une spécialité.** Les exemples
   montrent toujours des équipes de jour **et** de nuit.
10. **Aucun tiret cadratin ni demi-cadratin.** On reformule, on ne remplace
    pas par un trait d'union. `pnpm run check:tirets` le vérifie.
11. **Accessibilité WCAG 2.2 AA**, non négociable.

---

## 6. Le système de thème, à lire avant de toucher à une couleur

Deux niveaux de tokens dans `src/styles/global.css`, et c'est le cœur du
système :

1. La **palette** (`ink-900`, `bone`, `gold`...) donne les valeurs absolues.
   **On ne s'en sert plus directement dans les composants.**
2. Les **tokens sémantiques** décrivent un rôle. Ce sont eux qu'on utilise.

| Token | Rôle | Sombre | Clair |
| --- | --- | --- | --- |
| `surface` | fond principal | `#0B0B0C` | `#F4F1EA` |
| `surface-2` | cartes, sections creuses | `#141416` | `#EAE6DC` |
| `filet` | hairlines décoratives | `#232327` | `#D8D4CA` |
| `texte` | texte principal | `#F4F1EA` | `#0B0B0C` |
| `texte-doux` | texte secondaire | `#A5A199` | `#5A5752` |
| `accent` | **aplats** et filets d'accent | `#C8A765` | `#C8A765` |
| `accent-texte` | **texte** d'accent | `#C8A765` | `#5A5752` |
| `accent-bord` | **bordure** de composant | `#C8A765` | `#8A7340` |
| `bord-champ` | bordure de champ de formulaire | `#6B6871` | `#7D7971` |
| `focus` | anneau de focus | `#C8A765` | `#0B0B0C` |
| `sur-accent` | texte posé sur un aplat d'accent | `#0B0B0C` | `#0B0B0C` |

**Pourquoi quatre tokens d'accent et pas un seul.** Chaque usage a son seuil
de contraste, et l'or ne les tient pas tous sur fond clair :

| Usage | Seuil | Or sur crème | Décision |
| --- | --- | --- | --- |
| Aplat de bouton (encre dessus) | 4,5:1 | **8,6:1** | l'or convient |
| Texte d'accent | 4,5:1 | 2,0:1 ✗ | bascule sur `slate`, 6,4:1 |
| Bordure de composant | 3:1 | 2,0:1 ✗ | bascule sur `gold-dim`, 4,0:1 |
| Anneau de focus | 3:1 | 2,0:1 ✗ | bascule sur l'encre, 17,4:1 |

**Tous les contrastes des deux thèmes ont été calculés et tiennent.** Si vous
changez une couleur, recalculez. La règle pratique, en une ligne :
**pour du texte d'accent, toujours `text-accent-texte`, jamais `text-accent`.**

**La règle de l'or reste en vigueur :** moins de 5 % de la surface. Filets d'un
pixel, numéros de section, micro-libellés, une seule valeur mise en avant.
Jamais de dégradé doré, jamais de grand aplat.

**Surface toujours sombre.** Le bandeau reste noir même en thème clair, parce que le
logo fourni a un fond noir opaque. L'attribut `data-surface="sombre"` (bandeau et
panneau du menu mobile) redéfinit les tokens `--color-*` directement sur
l'élément. **Piège :** `--color-surface: var(--t-surface)` est résolu sur `:root`,
donc redéfinir `--t-surface` sur un enfant ne change rien, il faut redéfinir
`--color-surface` elle-même. Pour rendre un autre bloc sombre en thème clair,
il suffit de lui poser le même attribut.

Le thème est posé sur `<html>` par `public/theme-init.js`, chargé sans `defer`
dans le `<head>` pour éviter le clignotement. Ce fichier est **séparé** et non
inline : un script inline obligerait à ouvrir `'unsafe-inline'` dans la
politique de sécurité du contenu.

### Utilitaires maison

`.contenu` · `.section-y` · `.mesure` · `.micro` · `.filet` · `.grain` ·
`.apparition` · `.lien-evitement` · `.puce-filet`

`.puce-filet` remplace les tirets décoratifs des listes : un trait dessiné en
CSS, qui ne tombe pas sous l'interdiction des tirets longs.

---

## 7. Données et placeholders

### `src/data/entreprise.ts`

Source unique. **Rien en dur dans une page.** Les valeurs encore à arbitrer
(`pnpm run check:xx`) : forme juridique, capital, RCS, SIRET, adresse,
**autorisation CNAPS**, directeur de publication, interlocuteur, téléphone,
zone d'intervention.

### `src/data/site.ts`

Navigation, boutons, routes du sitemap. **Il n'y a plus de drapeaux
`pagesActives`** : il n'y a plus de page à activer ou désactiver.

### `src/data/agents.ts`

**Ne sert encore à rien à l'écran, et c'est voulu.** Structure de la future
fonction « Devis ». `tauxHoraire` vaut `null` partout et doit le rester tant
que le client n'a pas arbitré ses tarifs.

### `src/lib/devis/`

La logique de dimensionnement de l'ancien configurateur, avec ses 20 tests.
**Elle n'est utilisée par aucune page.** Elle a été conservée plutôt que
supprimée parce qu'elle est la base de la future fonction « Devis » décrite
dans `BRIEF.md`, et que le projet n'est pas sous git : une suppression serait
irréversible. **Si elle n'est pas voulue, c'est un `rm -rf src/lib/devis` et
une ligne de moins dans `pnpm test`.**

---

## 8. État

| Mesure | Valeur |
| --- | --- |
| Pages générées | 3, plus la 404 |
| `astro check` | 0 erreur, 0 avertissement |
| `pnpm run check:tirets` | 0 tiret long sur 36 fichiers |
| Tests unitaires | 20 / 20 (`pnpm test`) |
| Contrastes WCAG 2.2 AA | tenus dans les deux thèmes, calculés |
| Placeholders `XX` restants | 12 |

### Ce qui reste en suspens

1. **Logo, bloquant.** Voir `docs/LOGO.md`. Le PNG fourni est sans couche
   alpha, fond noir opaque incrusté : il ne peut pas être posé sur une surface
   claire, ce qui est maintenant un problème puisque le site a un thème clair.
   Demander le **SVG vectoriel** au client, et un **verrouillage horizontal**
   pour le bandeau. En attendant, `MotSymbole.astro` rend le mot-symbole
   typographique prévu par le brief. **Supprimer ce composant le jour où le
   SVG arrive.**
2. **12 placeholders `XX`** en attente d'arbitrage client.
3. **Plaquette PDF** : `public/plaquette-arkelys-security.pdf` est attendue.
   Tant qu'elle manque, le bouton de téléchargement reste visible mais
   désactivé, et `check:xx` le signale.
4. **Photos** : aucune. Tous les emplacements affichent `PhotoPlaceholder`.
   Liste de commande dans `public/photos/README.md`.
5. **Logos clients** : aucun. Le bandeau affiche huit cases en pointillés.
6. **Audits non faits** : Lighthouse et lecteur d'écran se font sur le site
   déployé. Le clavier a été câblé partout (menu mobile avec piège à focus,
   grille 7 × 24 aux flèches, infobulles) mais n'a pas été audité par un tiers.
7. **Netlify** : `netlify.toml` est prêt, aucun déploiement n'a été fait. La
   commande de build y est `pnpm run build:preprod`, **à basculer sur
   `pnpm build` avant la mise en ligne définitive**.

---

## 9. Conventions de code

- **Tout en français** : noms de fichiers, de variables, de fonctions, de
  routes, commentaires.
- Les commentaires expliquent **pourquoi**, pas **quoi**.
- Alias d'import : `@/`, `@data/`, `@components/`, `@layouts/`, `@lib/`,
  `@assets/`. Pas de `../../..`.
- Un bouton qui ne mène nulle part est un `<button>`, **jamais** un `<a>` : un
  clic milieu ouvrirait une page inexistante.
- Toute image passe par `<Image />` d'Astro : AVIF avec repli WebP,
  dimensions explicites pour un CLS à zéro, **texte alternatif rédigé, jamais
  vide, jamais « photo »**.

---

## 9 bis. Mobile : ce qui a été testé, et les pièges

Testé en émulation tactile (Edge piloté par le protocole de débogage) à 320,
360, 375, 390 et 430 px : la mise en page fait exactement la largeur de
l'écran, aucun défilement latéral. Glissement du doigt sur la grille, appui
sur « Devis », menu et lien d'ancre vérifiés. **Un vrai téléphone reste à
essayer** : l'émulation ne remplace ni le clavier virtuel ni le défilement
inertiel.

Trois pièges déjà rencontrés, à ne pas reproduire :

1. **Une grille sans `grid-cols-1` s'élargit à son contenu.** Sa piste est
   « auto », donc aussi large que son plus large enfant. Un enfant de 640 px
   agrandissait toute la page, que son parent soit `overflow-x-auto` ou non.
   Toute `grid` doit porter un `grid-cols-*` explicite, et les enfants qui
   contiennent du contenu large un `min-w-0`.
2. **`hidden` perd contre le `inline-flex` de base de `Bouton`** (même niveau
   de priorité). Pour masquer un bouton à une largeur donnée, utiliser une
   variante responsive : `max-md:hidden`, `md:hidden`. Elles l'emportent
   toujours.
3. **`touch-action: none` empêche de faire défiler.** Il est posé uniquement
   sur les cases de la semaine type (`touch-none`), nécessaire pour peindre au
   doigt, et surtout pas sur le bloc entier.

La grille semaine type passe sous 640 px de 24 colonnes à 8 colonnes sur 3
lignes par jour, avec l'heure écrite dans chaque case : des cases de 35 px au
lieu de 11, au-dessus du minimum WCAG 2.2 pour une cible tactile (24 px). Le
bandeau est compacté de la même façon (boutons plus petits, menu en icône
seule sous 640 px) pour tenir dans 320 px.

---

## 10. Conformité

- **Mention CNAPS obligatoire** : numéro d'autorisation et mention précisant
  que cette autorisation **ne confère aucune prérogative de puissance
  publique**. Composant `MentionCnaps`, dans le pied de page de toutes les
  pages. **Formulation à valider par le conseil juridique du client.**
- Case de consentement explicite, jamais pré-cochée, sur le formulaire.
- **Aucune police, aucune carte, aucun script chargé depuis un domaine
  tiers.** La politique de sécurité du contenu dans `netlify.toml` est
  stricte : `script-src 'self'`.
- Mesure d'audience : **pas de Google Analytics par défaut**. Plausible ou
  Umami, sans cookie, donc sans bannière.
- Le choix de thème est le seul élément stocké côté navigateur. Il ne permet
  pas d'identifier le visiteur, et il est mentionné dans la politique de
  confidentialité.

### Cibles de performance

Lighthouse 95+ · LCP sous 1,8 s en 4G simulée · CLS à zéro · **moins de
150 Ko de JavaScript**.

---

## 11. Si vous reprenez le projet

1. Lire `BRIEF.md`, en commençant par la section « Refonte du 9 novembre
   2026 ». Elle prime sur le reste du document.
2. Lire `docs/LOGO.md` : la limite y est documentée et elle contraint la
   maquette.
3. Lire le § 6 de ce fichier avant de toucher à une couleur.
4. Lancer `pnpm install`, puis `pnpm run check:xx` et `pnpm run check:tirets`
   pour voir ce qui manque.
