# Logo ARKELYS — état du fichier fourni et limite à lever

## Ce qu'on a

`Logo_ARKELYS.png` à la racine du projet.

| Caractéristique | Valeur |
| --- | --- |
| Format | PNG matriciel |
| Dimensions | 1115 × 1411 px |
| Profondeur | 8 bits |
| Type de couleur | **2 — RVB, sans couche alpha** |
| Fond | Noir pur `#000000`, **opaque et incrusté dans l'image** |
| Poids | 1,07 Mo |

Composition, de haut en bas (boîtes englobantes relevées au seuil de luminance 28/255) :

| Élément | x | y |
| --- | --- | --- |
| Blason (aigle dans un écu) | 207 → 918 | 83 → 844 |
| Mot « ARKELYS » | 33 → 1080 | 884 → 1029 |
| Mot « SECURITY » et ses filets | 35 → 1077 | 1062 → 1139 |
| Signature « VOTRE SÉCURITÉ, NOTRE ENGAGEMENT. » | 38 → 1076 | 1183 → 1215 |

## Le problème, et pourquoi il n'a pas été contourné

**Le logo ne peut pas être posé sur une section claire (`bone`, `#F4F1EA`).**
Le fond noir fait partie de l'image : il n'y a pas de transparence à exploiter.
Collé sur `bone`, le logo apparaît dans un rectangle noir.

Le brief interdit de retoucher le fichier (« ne le redessine pas, ne le
recolore pas, ne le déforme pas ») et demande explicitement de signaler le cas
plutôt que de bricoler. Un détourage automatique par seuil de luminance
abîmerait les dégradés or et chrome du blason et laisserait un halo sombre
autour des lettres : ce serait visiblement raté sur fond clair, et ce serait
une altération de la marque décidée par le prestataire, pas par le client.

Deux autres points, moins bloquants :

- **Verrouillage vertical.** Le blason est au-dessus du mot-symbole. Dans un
  bandeau de 72 à 80 px de haut, cette composition réduit le logo à une
  vignette illisible. Un verrouillage horizontal (blason à gauche,
  mot-symbole à droite) serait nécessaire.
- **Poids et netteté.** 1,07 Mo en matriciel. Astro le recompresse, mais un
  tracé vectoriel resterait net à toutes les tailles et pèserait quelques
  kilo-octets.

## Ce qu'il faut demander au client

Par ordre d'utilité :

1. **Le logo en SVG vectoriel**, fond transparent. Règle les trois points d'un
   coup. C'est le fichier qu'a forcément le graphiste qui a produit le PNG.
2. À défaut, **un PNG à fond transparent** en 2000 px de large minimum.
3. **Un verrouillage horizontal** (blason + mot-symbole sur une ligne), pour le
   bandeau de navigation.
4. **Une déclinaison pour fond clair** si le dégradé chrome du mot « ARKELYS »
   ne tient pas sur `bone` — à vérifier une fois le fichier transparent reçu :
   un chrome clair sur fond crème passe mal.

## Ce qui a été produit en attendant

`pnpm run assets:logo` dérive, **par recadrage et redimensionnement
uniquement** (aucune recolorisation, aucun détourage, aucune déformation) :

| Fichier | Rôle |
| --- | --- |
| `src/assets/logo/arkelys-logo-complet.png` | Copie conforme de l'original |
| `src/assets/logo/arkelys-blason.png` | Blason seul, recadrage carré |
| `public/favicon-16.png`, `-32`, `-48` | Favicons |
| `public/apple-touch-icon.png` | Icône iOS, 180 px |
| `public/icone-192.png`, `icone-512.png` | Icônes de manifeste |
| `public/og-defaut.jpg` | Image Open Graph 1200 × 630, logo centré sur noir |
| `public/site.webmanifest` | Manifeste d'application |

Ces dérivés vivent tous sur fond noir, ce qui convient : favicons, icônes et
carte Open Graph s'accommodent d'un fond sombre, et c'est cohérent avec la
charte.

## Règle provisoire pour les sections claires

Tant qu'on n'a pas de fichier transparent, **les sections `bone` n'affichent
pas le logo**. Elles utilisent le mot-symbole typographique prévu par le
brief : « ARKELYS » en `ink-900`, « SECURITY » en `gold-dim`, espacé, composé
en Inter capitales.

Le bandeau de navigation étant sur `ink-900`, il peut accueillir le blason
recadré. L'écart entre le noir pur du fichier (`#000000`) et `ink-900`
(`#0B0B0C`) représente moins de 1 % de luminance : invisible à l'œil, mais à
vérifier sur écran large une fois le bandeau construit (étape 3).

Dès réception du SVG : remplacer `Logo_ARKELYS.png`, relancer
`pnpm run assets:logo`, puis supprimer la règle provisoire ci-dessus.
