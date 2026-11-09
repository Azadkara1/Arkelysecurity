# Brief Claude Code — Site ARKELYS SECURITY

Nov 9, 2026 · @Azad

## Comment t'en servir

Ce document **est** le prompt. Ne le colle pas en un bloc dans le chat : il est trop long pour un seul tour et Claude Code travaille mieux avec un brief qu'il peut relire à chaque étape.

La bonne méthode, en trois gestes :

1. Exporte ce doc en Markdown (menu du document, *Export → Markdown*) et enregistre-le à la racine de ton projet sous `BRIEF.md`.
2. Ouvre Claude Code dans le dossier du projet.
3. Premier message : `Lis BRIEF.md en entier, puis commence par l'étape 1 de la section « Ordre de construction ». Ne passe à l'étape suivante qu'après mon feu vert.`

À chaque nouvelle session, un simple `Relis BRIEF.md` remet tout le contexte en place. Et quand une décision est prise (une couleur arbitrée, un chiffre confirmé par le client), tu modifies `BRIEF.md` : le brief reste la source de vérité, pas l'historique du chat.

## Refonte du 9 novembre 2026 : le site devient une page unique

Cette section **prime sur tout ce qui suit**. Là où le reste du brief décrit
une arborescence de pages, c'est désormais caduc.

### Le principe

Le site est **une seule page**. Chaque bouton du bandeau fait défiler jusqu'à
une section de cette même page, par une ancre, avec un défilement fluide
désactivé sous `prefers-reduced-motion`. Aucun bouton ne mène vers une autre
route, et aucun ne mène vers une page qui n'existe plus.

### Les quatre sections, dans cet ordre

1. **Accueil** (`#accueil`) : le hero.
2. **Nos prestations** (`#prestations`) : les quatre métiers, une photo, un
   titre, une description. **Cartes non cliquables** : ni lien, ni bouton, ni
   page de détail.
3. **Secteurs** (`#secteurs`) : le bandeau de logos défilant.
4. **Contact** (`#contact`) : en dernier, formulaire compris.

*La section Dispositif (aperçu de couverture) a été retirée de la page.*

### Navigation

Bandeau **et** pied de page : Accueil, Nos prestations, Secteurs, Contact.
Rien d'autre.

Deux boutons permanents dans le bandeau, **tous les deux en doré plein** :

- **Contactez-nous** descend vers la section Contact. Idem pour le bouton du
  hero.
- **Devis** ne mène nulle part. Au clic, une infobulle accessible affiche
  « Évolution à venir ». C'est un `<button>`, pas un `<a>` : aucun clic milieu
  ne doit ouvrir une page inexistante.

**Le rond rouge à côté du logo a été retiré.** Le token `--color-signal`
n'existe plus. La règle « rien d'anxiogène » s'applique donc sans exception.

Un bouton **« Changer de thème »** bascule tout le site entre sombre (défaut)
et clair. Voir « Thèmes » plus bas. **Le bandeau reste noir dans les deux
thèmes** : le logo fourni a un fond noir opaque, il ne passe que sur du noir.

### Pages réellement existantes

| Route | Rôle |
| --- | --- |
| `/` | La page unique, quatre sections |
| `/mentions-legales` | Obligatoire, liée depuis le pied de page |
| `/politique-de-confidentialite` | Obligatoire, liée depuis le pied de page |
| `404` | Propose les ancres de l'accueil |
| `/sitemap.xml`, `/robots.txt` | Générés au build |
| `/styleguide` | Système de design, **développement uniquement** |

Tout le reste a été supprimé : détail des prestations, Secteurs, Méthode,
Entreprise, Recrutement, Dispositif (`/configurer`), Transparence, Contact,
Devis, Plan du site. Avec eux : les Content Collections, les drapeaux
`pagesActives`, et les composants devenus inutiles.

### Thèmes

Deux thèmes, pilotés par `data-theme` sur `<html>`, mémorisés dans
`localStorage` sous `arkelys-theme` (lecture et écriture dans un
`try/catch`). Défaut : **sombre**.

L'implémentation passe par des **tokens sémantiques** dans
`src/styles/global.css` (`surface`, `surface-2`, `texte`, `texte-doux`,
`filet`, `accent`, `accent-texte`, `accent-bord`, `bord-champ`, `focus`,
`sur-accent`), pas par des classes dupliquées. On adopte ou on retire l'essai
en changeant un bloc de variables, sans toucher à un composant.

**En thème clair, l'or ne sert qu'aux filets et aux aplats, jamais au texte**
(2,0:1 contre le crème). Trois conséquences portées par les tokens :
`accent-texte` bascule sur `slate`, `accent-bord` sur `gold-dim` (4,0:1, au
dessus du seuil de 3:1 d'une bordure), et l'anneau de `focus` sur l'encre
(17,4:1). Tous les contrastes des deux thèmes ont été calculés et tiennent le
4,5:1 pour le texte et le 3:1 pour les éléments d'interface.

### Tirets

**Plus aucun tiret cadratin ni demi-cadratin** dans ce qui est visible ou lu
par un moteur : textes, titres, descriptions de référencement, textes
alternatifs, libellés d'accessibilité, données structurées. On **reformule**
au lieu de remplacer par un trait d'union : virgule, deux-points, point, ou
« à » pour les plages (« de 20 h à 8 h »). Les traits d'union des mots
composés restent.

`pnpm run check:tirets` échoue si un tiret long subsiste dans `src/` ou
`public/`, commentaires compris.

### La future fonction « Devis »

Le bouton **« Devis »** du bandeau est inerte et affiche « Évolution à venir ».
La section Dispositif, qui devait l'illustrer, a été retirée de la page.

L'évolution n'est pas construite. Seule la structure de données est prête,
dans `src/data/agents.ts` : les types APS, SSIAP 1, SSIAP 2 et maître-chien,
avec `tauxHoraire` à `null`.

**Ce qui est prévu, le jour venu :** à la fin du parcours, le client choisira
lui-même le nombre d'agents et leur type. Plus tard, ARKELYS saisira un taux
horaire par type d'agent, et c'est alors seulement qu'un prix pourra être
calculé.

**Aucun prix n'est affiché pour l'instant.** La règle « aucun tarif affiché »
ne sera levée qu'à ce moment-là, et seulement quand les taux seront
renseignés. `peutAfficherUnPrix()` dans `src/data/agents.ts` est le seul point
de décision : tant qu'il renvoie `false`, aucun montant ne sort, ni à l'écran
ni dans un document généré.

La logique de dimensionnement écrite pour l'ancien configurateur est conservée
dans `src/lib/devis/`, avec ses 20 tests. Elle ne sert encore à aucune page.

### La section Contact

Le formulaire est **directement dans la section**, pas derrière un bouton ni
sur une page séparée. Aux champs existants s'ajoutent :

- **Type de missions**, champ libre multiligne, `type_missions` ;
- une **semaine type**, grille 7 jours sur 24 heures, même langage visuel que
  une grille compacte aux couleurs du site. Le visiteur clique ou glisse
  pour colorer les heures. Rien d'autre : pas de nombre de postes, pas de
  calcul, pas de résultat. Bouton « Tout effacer ». Utilisable au clavier
  (chaque cellule est un bouton `aria-pressed`, déplacement aux flèches) et au
  doigt.

Les deux partent avec le formulaire : `type_missions`, `semaine_type` (résumé
lisible du type « Lun de 20 h à 8 h ; Mar de 8 h à 20 h ») et
`semaine_type_json` (données brutes). **Le courriel reçu doit se lire sans
outil.**

Tout en bas de la section : **« Télécharger la plaquette (PDF) »**, vers
`public/plaquette-arkelys-security.pdf`, avec l'attribut `download`. Le fichier
est fourni par le client. Tant qu'il manque, le bouton reste visible mais
désactivé, accompagné de « Plaquette bientôt disponible », et
`pnpm run check:xx` signale le fichier absent.

### Où part le courriel du formulaire

**Netlify Forms**, pas le site. Les envois sont stockés dans
`Site > Forms > contact`. La notification par courriel se règle dans
l'interface Netlify, `Site configuration > Notifications > Form notifications`.
**Le destinataire n'est écrit nulle part dans le dépôt**, et c'est voulu :
changer l'adresse ne doit pas demander un redéploiement.

**En local, aucun courriel ne part** : `pnpm dev` sert un site statique, le
POST retombe en 404. La détection de formulaire se fait au déploiement, donc
seule une prévisualisation de branche permet de tester de bout en bout. Détail
complet en tête de `netlify.toml`.

## Décisions validées avec le client

Ces points ont été tranchés après la première maquette de l'accueil. En cas de contradiction avec la suite de ce brief, **ils priment**.

- **Marque : ARKELYS SECURITY.** Une seule marque, sur tout le site.
- **Le site ne fait jamais de la nuit une spécialité.** Un titre comme « une nuit sûre se prépare … » laisse croire que l'entreprise ne travaille que de nuit : interdit. Les exemples de dispositif montrent toujours des équipes de jour et de nuit, les grilles de couverture d'exemple affichent les deux, et les visuels de jour sont aussi nombreux que ceux de nuit.
- **Bandeau de navigation fixe**, toujours visible au défilement, avec le logo (clic = retour en haut). Détail dans « Direction artistique ».
- **Navigation, dans cet ordre :** Accueil, Nos prestations, Secteurs, Méthode, Entreprise, Recrutement, Contact.
- **Deux boutons permanents dans le bandeau :** « Contactez-nous », avec le numéro de l'interlocuteur en seconde ligne, et « Devis ». Le bouton « Configurer un dispositif » disparaît de la navigation. Le seul bouton plein doré de l'accueil est « Contactez-nous » dans le hero ; « Devis » est en contour or.
- **Numéro de téléphone :** celui de la personne référente, fourni plus tard. Tant qu'il manque : `XX XX XX XX XX`, affiché tel quel.
- **Devis :** une extension viendra plus tard. En attendant, le bouton mène à `/devis`, une page provisoire (une phrase d'explication, les coordonnées, un lien vers le contact), structurée pour accueillir ensuite le module.
- **Secteurs :** un bandeau de logos de clients qui défile **de gauche à droite**, pas une liste de cartes. Voir module 7.
- **Recrutement :** pas de liste d'offres. Un bouton « Candidature spontanée » qui ouvre un e-mail vers une adresse dédiée à créer (`recrutement@arkelyssecurity.fr`, à confirmer).
- **Pages validées :** Accueil, Nos prestations, Entreprise, Contact.
- **Pages « à confirmer » par le client :** Méthode, Recrutement, et la partie Dispositif (qui pourrait devenir le devis). Construis-les, mais derrière un drapeau dans `src/data/site.ts` pour pouvoir les retirer de la navigation d'un seul changement. Voir « Données et placeholders ».
- **Logo :** fichier fourni par le client, à la racine du projet. Voir « Direction artistique ».
- **Maquette :** si un dossier `maquette/` ou des captures d'écran sont présents à la racine, suis-les pour la mise en page de l'accueil.

## Le projet

Tu construis le site d'ARKELYS SECURITY, une société de sécurité privée française : surveillance et gardiennage, sécurité incendie SSIAP, sécurité événementielle, prestations cynophiles. Clients visés : hôtellerie et résidences de prestige, restauration, retail, événementiel, logistique, collectivités.

### Le parti pris

Ce n'est pas un site vitrine. 95 % des sites de sécurité privée français sont le même site : un bandeau avec un agent en costume, quatre cartes de prestations, un formulaire de contact. On fait l'inverse.

Le site doit **donner à voir la méthode**, pas la décrire. Un prospect doit pouvoir, sans parler à personne, configurer un dispositif pour son site, voir à quoi ressemble une nuit de surveillance heure par heure, et comprendre exactement ce qu'il recevra comme reporting. C'est ça, l'innovation attendue : rendre manipulable un métier qu'on vend d'habitude en PDF.

Le registre visuel est celui du haut de gamme discret : noir, blanc cassé, un or utilisé avec parcimonie. Précision, calme, maîtrise. Jamais de dramatisation de la menace, jamais d'esthétique militaire ou paramilitaire, jamais de gyrophare.

### Stack imposée

- **Astro 5** en mode statique, TypeScript strict
- **Tailwind CSS v4** (configuration via `@theme` dans le CSS, pas de `tailwind.config.js`)
- **Content Collections** typées pour les secteurs, références, cas clients et offres d'emploi
- Interactivité en **vanilla TS** dans des Astro islands (`client:visible`). Pas de React, Vue ou Svelte : aucun des modules ne le justifie et le poids de page compte.
- **View Transitions** natives d'Astro pour les changements de page
- Déploiement **Netlify**, formulaires via Netlify Forms (avec honeypot anti-spam)
- `pnpm` comme gestionnaire de paquets

Aucune autre dépendance sans me demander. Si tu penses qu'une librairie est indispensable, explique pourquoi avant de l'installer.

## Direction artistique

### Palette

Declare ces tokens dans `src/styles/global.css` via `@theme`, et n'utilise jamais de couleur en dur ailleurs.

| Token | Valeur | Usage |
| --- | --- | --- |
| `--color-ink-900` | `#0B0B0C` | Fond des sections sombres |
| `--color-ink-800` | `#141416` | Cartes et surfaces sur fond sombre |
| `--color-ink-700` | `#232327` | Bordures sur fond sombre |
| `--color-bone` | `#F4F1EA` | Fond des sections claires, texte sur fond sombre |
| `--color-bone-dim` | `#A5A199` | Texte secondaire sur fond sombre |
| `--color-slate` | `#5A5752` | Texte secondaire sur fond clair |
| `--color-gold` | `#C8A765` | Accent unique |
| `--color-gold-dim` | `#8A7340` | Filets, bordures, états survol |

**La règle de l'or : moins de 5 % de la surface.** L'or sert aux filets d'un pixel, aux numéros de section, aux micro-libellés en capitales, à l'état actif d'un onglet, à une seule valeur mise en avant dans un bloc. Jamais de dégradé doré, jamais de grand aplat, jamais de bouton entièrement doré sauf l'action principale unique de la page. Si une maquette ressemble à un carton d'invitation de mariage, c'est raté.

### Rythme sombre / clair

Le site alterne. Accueil, secteurs, dispositif et contact sur fond `ink-900` ; prestations, méthode et transparence sur fond `bone`. Le passage de l'un à l'autre se fait par un filet `gold-dim` d'un pixel, jamais par un dégradé. Cette alternance structure la lecture mieux que n'importe quelle animation.

### Typographie

- **Display — Fraunces** (variable, axes `opsz` et `SOFT` à 0). Titres de page et de section, chiffres-clés. Graisse 400 à 600, jamais plus. Interlignage serré : `leading-[0.95]` sur les grands titres.
- **Texte et interface — Inter**. Corps à 17 px, interlignage 1.65, largeur de colonne limitée à 68 caractères.
- **Micro-libellés** — Inter, 11 px, capitales, `letter-spacing: 0.14em`, couleur `gold` ou `bone-dim`. Pour numéroter les sections, nommer les catégories, légender les blocs.

Les deux familles sont **auto-hébergées** via `@fontsource-variable`. Aucun appel au CDN Google Fonts : c'est un point de conformité RGPD régulier en France, et ça coûte une requête externe.

### Grille et espace

Largeur maximale 1280 px, gouttière 24 px en mobile et 40 px au-delà. Douze colonnes. Les respirations verticales sont généreuses : 96 px entre sections en mobile, 160 px en desktop. L'espace vide est l'outil principal de la montée en gamme, avant la couleur et avant la typographie.

### Mouvement

- Durées 400 à 700 ms, courbe `cubic-bezier(0.16, 1, 0.3, 1)`
- Apparition au scroll : opacité plus translation verticale de 12 px maximum. Rien d'autre.
- Aucun parallaxe sur du texte, aucun rebond, aucun carrousel qui défile tout seul, aucun compteur qui s'incrémente
- `prefers-reduced-motion: reduce` désactive toutes les transformations, sans exception. À tester.

Le mouvement doit se remarquer après coup, pas pendant. Une société de sécurité vend du calme.

### Texture

Un grain très léger sur les sections sombres : `feTurbulence` SVG en overlay, opacité 0.025, `pointer-events: none`. Il casse le noir plat et donne de la matière. Au-delà de 0.04 ça devient visible et sale.

### Bandeau de navigation fixe

Le bandeau reste en haut de l'écran pendant tout le défilement, sur toutes les pages : `position: sticky; top: 0` avec un `z-index` élevé. Fond `ink-900` à 94 % d'opacité avec un léger flou d'arrière-plan, filet `ink-700` en bas. Il ne se masque jamais au défilement.

Contenu, de gauche à droite : le logo, les sept liens de navigation, puis les boutons « Contactez-nous » (numéro en seconde ligne) et « Devis ». Cliquer sur le logo ramène tout en haut de l'accueil, ou à `/` depuis une autre page. Hauteur 72 à 80 px, jamais plus. Les ancres internes compensent sa hauteur avec `scroll-margin-top`.

Sous 1024 px, les liens se replient dans un menu : bouton « Menu », panneau plein écran, fermeture à Échap, focus piégé dans le panneau. Les deux boutons « Contactez-nous » et « Devis » restent visibles hors du panneau.

### Logo

Le logo ARKELYS fourni par le client est à la racine du projet : cherche un fichier `logo*`, SVG de préférence, sinon PNG. Utilise-le **tel quel** : ne le redessine pas, ne le recolore pas, ne le déforme pas.

Copie-le dans `src/assets/` et dérive-en ce qu'il faut à partir du fichier d'origine : favicon, icône d'application, version pour fond sombre et version pour fond clair. S'il n'existe qu'en une couleur et ne passe pas sur `ink-900`, dis-le-moi au lieu de le retoucher. En attendant le fichier, la maquette utilise un mot-symbole texte : « ARKELYS » en blanc cassé, « SECURITY » en or, espacé.

## Arborescence

**Caduque.** Voir « Refonte du 9 novembre 2026 : le site devient une page
unique », qui prime. Le site ne compte plus que trois pages réelles, l'accueil
et les deux pages légales obligatoires, plus la 404.

## Les six modules qui font la différence

C'est la partie qui distingue ce site d'une vitrine. Les modules 1, 2 et 6 dépendent d'une confirmation du client : construis-les, mais derrière le drapeau `pagesActives` pour qu'on puisse les retirer sans toucher au code. Si le budget temps se réduit, les modules 4 et 7 sont les plus sûrs à livrer en premier.

### 1. Le configurateur de dispositif — `/configurer`

Le module central. Un prospect décrit son site, le configurateur lui compose un dispositif et le lui montre.

**Statut : à confirmer.** Le client hésite à faire de cette partie le parcours de devis. Pour l'instant, garde-la telle quelle, sur `/configurer`, et fais pointer le bouton « Devis » du bandeau vers `/devis` (page provisoire). Ne supprime rien : si le client valide, on rapprochera les deux.

**Le parcours**, une question par écran, barre de progression discrète, retour arrière possible à tout moment :

1. Type d'établissement — hôtel, résidence, restaurant, commerce, entrepôt, chantier, événement
2. Surface approximative et nombre de bâtiments
3. Plages à couvrir — sélecteur visuel sur une grille 7 jours × 24 heures, par glissement de souris
4. Enjeux prioritaires — sécurité incendie, contrôle d'accès, surveillance générale, accueil, flux événementiel
5. Contraintes du site — présence de public la nuit, locaux techniques, ERP classé, zones extérieures étendues
6. Saisonnalité — activité constante ou pics saisonniers

**Le résultat** s'affiche sur une seule page, sans rechargement : le nombre de postes recommandés et leur qualification (APS, SSIAP 1, SSIAP 2, maître-chien), le volume horaire mensuel estimé, les rondes suggérées, les points de vigilance propres au secteur choisi, et les éléments qui restent à confirmer après visite.

Cette dernière ligne est importante : elle reprend l'honnêteté de la page 9 du mémoire technique, qui distingue ce qui est chiffré de ce qui doit être validé. C'est le meilleur argument de la maison.

**La logique** vit dans un seul fichier `src/lib/configurateur/regles.ts`, séparée de l'interface, avec des tests unitaires. Les règles sont des données, pas du code dispersé : on doit pouvoir les ajuster sans toucher aux composants.

**Prudence absolue sur le prix.** Le configurateur n'affiche **jamais** de montant. Il affiche un volume horaire et une composition d'équipe, puis propose d'envoyer la configuration pour obtenir un devis. Mention visible et non masquable : *estimation indicative à confirmer après visite du site, sans valeur contractuelle*. Un tarif affiché en ligne est un engagement commercial et un cadeau fait à la concurrence.

**La sortie** est un formulaire court — nom, société, téléphone, e-mail — pré-rempli avec le résumé de la configuration en champ caché. Le prospect peut aussi télécharger la synthèse en PDF (générée côté client) sans donner ses coordonnées : ça paraît contre-intuitif, ça construit la confiance, et le PDF porte les coordonnées d'ARKELYS.

### 2. La méthode en six étapes — `/notre-methode` (page à confirmer)

Six étapes cliquables : analyse du besoin, définition du dispositif, consignes et circuits d'alerte, validation avant démarrage, transmission aux équipes, vérification des moyens. Un onglet par étape ; le panneau en dessous affiche le titre et la description de l'étape choisie.

Le contenu existe déjà, mot pour mot, en page 13 du mémoire technique (partie « Préparation de la prestation »), avec sa ligne de vérifications avant la première vacation : consignes accessibles, affectations connues, moyens identifiés, circuit d'alerte défini. La maquette de l'accueil reprend ce texte.

Techniquement : onglets ARIA (`role="tablist"`, flèches gauche et droite, `aria-selected`), une seule étape visible à la fois. Le vocabulaire reste neutre — « vacation », jamais « nuit » — car la méthode vaut pour toute mission. La séquence 20 h – 8 h du mémoire est un exemple de dispositif, pas la méthode.

### 3. La grille de vigilance par secteur — `/secteurs/[slug]`

Chaque page secteur porte sa propre grille de points de vigilance. Celle de l'hôtellerie existe déjà à la page 5 du mémoire : présence d'occupants la nuit, circulations et dégagements, locaux techniques, flux nocturnes, détection et mise en sécurité, liaison avec les secours.

Présentée comme une grille dépliable, chaque point ouvrant sur deux lignes : le risque, et ce qu'ARKELYS met en place. C'est le contenu qui fera venir le trafic de recherche, et c'est celui qui prouve l'expertise sectorielle.

Pour les secteurs non encore rédigés, prévois la structure et mets des points marqués `À RÉDIGER` visibles en développement mais exclus du build de production.

**Statut : secondaire, après feu vert.** Ces pages servent surtout au référencement. La page `/secteurs` est d'abord le bandeau de logos (module 7) ; ne construis les pages secteur qu'une fois le client d'accord. Drapeau `pagesActives.secteursDetail`, à `false` par défaut.

### 4. La démonstration de reporting — `/transparence`

La page que personne ne fait. Elle montre, avec des données fictives clairement étiquetées comme telles, ce que le client reçoit : un extrait de main courante horodatée, une fiche de prise de poste et de relève remplie, un tableau de suivi qualité mensuel, un rapport d'incident type.

Les annexes A et B du mémoire technique donnent déjà les modèles. Il s'agit de les mettre en page proprement, en lecture seule, avec un bandeau **Exemple — données fictives** impossible à confondre avec du réel.

Pourquoi ça marche : l'acheteur de sécurité a déjà été déçu par un prestataire opaque. Montrer le livrable avant la signature règle sa première objection.

### 5. La zone d'intervention — `/notre-entreprise`

Une carte de France ou de la région en SVG, sobre, avec les départements couverts en `gold` à faible opacité et les implantations en points. Au survol, le nom du département. Pas de Google Maps : une carte statique SVG est plus légère, plus élégante, et n'envoie rien à un tiers.

Zone exacte à confirmer par le client — placeholder `XX` en attendant.

### 6. Recrutement et candidature spontanée — `/recrutement` (page à confirmer)

Pour l'instant, un seul geste : un bouton **Candidature spontanée** qui ouvre un e-mail vers l'adresse dédiée, `entreprise.contact.emailRecrutement` (`recrutement@arkelyssecurity.fr`, à créer par le client). Sous le bouton, l'adresse en clair et la liste des pièces à joindre (CV, carte professionnelle, qualifications), parce que le lien `mailto:` ne fonctionne pas pour tout le monde. Pas de liste d'offres tant que le client n'en publie pas.

Le recrutement est un enjeu permanent dans ce métier. Plus tard, si le client le valide : un test d'éligibilité en quatre questions (carte professionnelle en cours de validité, qualification, mobilité, disponibilité) et des offres au format `JobPosting`. Ne les construis pas maintenant, mais laisse la collection `offres` et la route `/recrutement/[slug]` prêtes, désactivées.

### 7. Défilement de logos clients — `/secteurs` et accueil

Un bandeau horizontal de logos de clients qui défile **de gauche à droite**, en boucle continue, sous le titre « Ils nous font confiance ». Il sert d'entrée principale de la page Secteurs et apparaît aussi sur l'accueil.

Technique : une liste `<ul>` de logos dupliquée une fois, translatée de -50 % à 0 en CSS pur (animation linéaire de 40 à 50 secondes, aucun JavaScript). Les logos ont une marge droite et non un `gap`, pour que la boucle soit sans à-coup. Masque en dégradé sur les deux bords. Pause au survol et au focus clavier. La copie de la liste porte `aria-hidden="true"`.

Avec `prefers-reduced-motion: reduce`, l'animation s'arrête et le bandeau devient une rangée défilable à la main. Chaque logo a un texte alternatif : le nom du client.

Les logos viennent de la collection `references` : un logo n'apparaît que si `autoriseNomPublic` vaut `true`. Tant qu'aucun logo n'est fourni, affiche huit cases en pointillés « Logo client — sur accord écrit », comme dans la maquette. Logos affichés tels que fournis : pas de passage en monochrome sans l'accord du client, un logo est une marque déposée.

## Données et placeholders

Plusieurs informations ne sont pas encore arbitrées par le client. Elles vivent **toutes** dans un seul fichier, `src/data/entreprise.ts`, jamais en dur dans une page. Quand le client répond, on modifie ce fichier et le site entier se met à jour.

Tout ce qui vaut `'XX'` doit s'afficher tel quel à l'écran, visiblement, pour qu'on ne l'oublie pas. Ajoute un script `pnpm run check:xx` qui liste les placeholders restants et sort en code d'erreur — à brancher sur le build de production.

```typescript
// src/data/entreprise.ts
export const entreprise = {
  nom: 'ARKELYS SECURITY',
  domaine: 'arkelyssecurity.fr',

  // À confirmer par le client
  formeJuridique: 'XX',
  capital: 'XX',
  rcs: 'XX',
  siret: 'XX',
  adresse: { rue: 'XX', cp: 'XX', ville: 'XX' },
  autorisationCnaps: 'XX',

  contact: {
    interlocuteur: 'XX',
    telephone: 'XX XX XX XX XX', // numéro de la personne référente, fourni plus tard
    email: 'contact@arkelyssecurity.fr',
    emailRecrutement: 'recrutement@arkelyssecurity.fr', // adresse à créer
  },

  // Variable selon la saison et les missions : on affiche une fourchette,
  // jamais un chiffre précis invendable. Mettre 'XX' tant que non arbitré.
  effectif: {
    mode: 'fourchette' as const,
    libelle: 'Effectif adapté à chaque mission',
    agents: 'XX',
    ssiap: 'XX',
    cynophiles: 'XX',
  },

  zoneIntervention: {
    departements: ['XX'],
    libelle: 'XX',
  },
} as const;

// src/data/site.ts — pages à confirmer par le client
export const pagesActives = {
  methode: true,
  recrutement: true,
  dispositif: true,
  secteursDetail: false,
  references: false,
  transparence: true,
} as const;
```

Une page dont le drapeau vaut `false` n'apparaît ni dans le bandeau, ni dans le pied de page, ni dans `sitemap.xml`, et sa route renvoie une 404. Le client confirmera Méthode, Recrutement et Dispositif : on retire une page en changeant une valeur, sans toucher aux composants.

### Mention légale obligatoire

Pour une activité de sécurité privée, le numéro d'autorisation CNAPS doit figurer sur les documents commerciaux, accompagné de la mention précisant que cette autorisation ne confère aucune prérogative de puissance publique. Prévois un composant `<MentionCnaps />` dans le pied de page de toutes les pages, alimenté par `entreprise.autorisationCnaps`. La formulation exacte doit être validée par le client ou son conseil — mets un commentaire `TODO` dans le composant.

### Les chiffres interdits

Ne reprends **aucun** chiffre que tu trouverais dans un document fourni : effectifs, ancienneté, nombre de clients. Les documents sources se contredisent entre eux (de 35 à 110 agents selon la source) et l'arbitrage n'est pas fait. Tant que `entreprise.effectif.agents` vaut `'XX'`, les blocs de chiffres-clés affichent le placeholder, ou se masquent si la mise en page le permet mieux.

### Les références clients

Chaque entrée de la collection `references` porte un booléen `autoriseNomPublic`. Si `false`, le site affiche une formulation anonymisée du type *un hôtel 5 étoiles du Golfe de Saint-Tropez*. Valeur par défaut : `false`. Un nom de client ne s'affiche qu'avec un accord écrit, et ce n'est pas au site de le présumer.

## Photos

La photo est le premier poste de crédibilité du site, et le plus souvent bâclé. Un agent en costume-cravate sur fond de gratte-ciel, acheté sur une banque d'images, dit au visiteur que l'entreprise n'a rien de réel à montrer.

**Trois règles.** Pas d'images générées par IA, elles se repèrent et elles décrédibilisent. Pas de banque d'images générique. Et toute photo d'un agent identifiable exige une autorisation de droit à l'image signée, conservée par le client.

En attendant les vraies photos, construis avec des blocs de placeholder : un aplat `ink-800` au bon format, le nom du fichier attendu et la description du cadrage inscrits dessus en `bone-dim`. C'est laid, c'est voulu : ça force la commande du shooting. Crée un `public/photos/README.md` qui reprend la liste ci-dessous.

### Liste de prises de vue à commander

Une demi-journée de photographe suffit, en conditions réelles, de préférence de nuit pour la moitié des plans.

| Fichier | Sujet | Format | Page |
| --- | --- | --- | --- |
| `hero-ronde-nuit.jpg` | Agent de dos en ronde extérieure, lampe allumée, nuit | 21:9 | Accueil |
| `pc-securite.jpg` | Poste de contrôle, écrans, main courante ouverte | 3:2 | Méthode, Transparence |
| `prise-de-poste.jpg` | Deux agents en relève, échange de consignes | 3:2 | Méthode |
| `ssiap-ssi.jpg` | Agent SSIAP devant un tableau de sécurité incendie | 4:5 | Prestation SSIAP |
| `vehicule-serigraphie.jpg` | Véhicule marqué, de trois quarts, nuit | 16:9 | Moyens, Entreprise |
| `cynophile.jpg` | Binome maître-chien, chien calme en position de travail | 4:5 | Prestation cynophile |
| `tenues.jpg` | Les trois tenues côte à côte sur fond neutre | 3:2 | Entreprise |
| `accueil-filtrage.jpg` | Agent à un point d'accueil, attitude de service | 3:2 | Secteur hôtellerie |
| `equipe-direction.jpg` | Portraits de l'encadrement, même lumière, même fond | 1:1 | Entreprise |
| `evenementiel.jpg` | Dispositif sur un événement, de loin, discret | 16:9 | Prestation événementiel |

**Direction photo.** Lumière naturelle ou lumière du site, jamais de flash frontal. Les agents travaillent, ils ne posent pas et ne regardent pas l'objectif. Aucune arme, aucune posture d'intimidation, aucun cadrage en contre-plongée héroïque. Le message est la maîtrise, pas la force. Traitement légèrement désaturé et contrasté, cohabitant avec le noir et l'or.

**Équilibre jour et nuit.** Plusieurs scènes de la liste ci-dessus sont des scènes de nuit. Commandé en doublon, chacune doit avoir son équivalent de jour, pour que le site ne laisse jamais penser que l'entreprise n'intervient que de nuit.

**Technique.** Toutes les images passent par le composant `<Image />` d'Astro, format AVIF avec repli WebP, `loading="lazy"` sauf le visuel d'en-tête, dimensions explicites pour éviter tout décalage de mise en page. Texte alternatif rédigé pour chaque image, jamais vide, jamais « photo ».

## Conformité, référencement, accessibilité

### Légal

- Mentions légales complètes : dénomination, forme, capital, RCS, SIRET, siège, directeur de publication, hébergeur, **autorisation CNAPS** et sa mention associée
- Politique de confidentialité : finalités des formulaires, durées de conservation, droits d'accès et de suppression, destinataires
- Case de consentement explicite sur chaque formulaire, jamais pré-cochée, avec lien vers la politique
- Pas de Google Analytics par défaut. Si une mesure d'audience est voulue : Plausible ou Umami, sans cookie, donc sans bannière. Si le client exige GA4, alors bannière de consentement conforme et aucun script avant acceptation.
- Aucune police, aucune carte, aucun script chargé depuis un domaine tiers

### Référencement local

C'est là que se joue l'acquisition. La structure `secteur × ville` est le moteur : `/secteurs/hotellerie` d'abord, puis des pages locales quand la zone sera confirmée.

- Un `<title>` et une `<meta description>` uniques par page, rédigés, jamais générés automatiquement
- Données structurées JSON-LD : `SecurityService` ou `LocalBusiness` avec `areaServed`, `FAQPage` sur les pages secteur, `JobPosting` sur chaque offre, `BreadcrumbList` partout
- `sitemap.xml` et `robots.txt` générés au build
- Open Graph et Twitter Card avec une image dédiée par type de page
- URLs en français, sans accent, séparées par des tirets
- Une FAQ par page secteur : trois à cinq questions réelles d'acheteurs, c'est ce qui capte les recherches longues

### Accessibilité

Niveau **WCAG 2.2 AA**, non négociable — et pas seulement par principe : une partie des prospects sont des collectivités et des établissements publics qui le vérifient.

- Contraste minimum 4,5:1 pour le texte. **Attention à l'or** : `#C8A765` sur `#0B0B0C` passe largement, mais `#C8A765` sur `#F4F1EA` échoue. Sur fond clair, l'or ne sert qu'aux filets et aux aplats, jamais au texte.
- Navigation complète au clavier, focus visible et dessiné, lien d'évitement en début de page
- Le configurateur et le test d'éligibilité sont utilisables entièrement au clavier, avec annonces `aria-live` à chaque étape
- Hiérarchie de titres correcte, un seul `h1` par page
- Chaque champ de formulaire a un `<label>` visible, pas un simple placeholder

### Performance

Cibles : Lighthouse 95+ sur les quatre axes, LCP sous 1,8 s en 4G simulée, CLS à zéro, moins de 150 Ko de JavaScript sur la page d'accueil. Astro en statique rend ça atteignable si on ne charge pas de framework inutile — d'où le vanilla TS.

## Règles strictes

Ces points-là ne se discutent pas. Si l'un d'eux te gêne pour avancer, arrête-toi et demande.

- **N'invente aucun fait.** Pas de chiffre d'effectif, d'ancienneté, de nombre de clients, de délai d'intervention, de certification, de nom de client. Si une donnée manque, mets `XX` et continue. Un site de sécurité qui annonce un chiffre faux, c'est un problème contractuel, pas une coquille.
- **Aucune promesse de résultat.** On n'écrit jamais « sécurité garantie », « risque zéro », « intervention en moins de X minutes ». Le vocabulaire est celui du mémoire technique : *prévenir, détecter, transmettre, coordonner*, et ce qui reste à confirmer est dit comme tel.
- **Aucun tarif affiché.** Ni dans le configurateur, ni ailleurs.
- **Aucun nom de client sans le drapeau `autoriseNomPublic`** à `true`.
- **Aucune image générée par IA**, aucune banque d'images générique, aucune photo d'une personne réelle sans autorisation.
- **Aucun logo de client ou de partenaire** sans accord écrit. En attendant, des blocs de placeholder.
- **Rien de militaire ni d'anxiogène.** Pas de camouflage, pas de silhouettes armées, pas de compteur de cambriolages, pas de fond de scanner rouge. La sécurité haut de gamme se vend par le calme.
- **Pas de dépendance non prévue** dans la stack sans me demander d'abord.
- **Pas de contenu de remplissage latin.** Si un texte manque, écris un vrai texte provisoire en français, marqué `À VALIDER`, pour qu'on juge de la longueur réelle.

Un dernier point de méthode : les documents sources que je pourrai te transmettre contiennent des erreurs connues et des informations contradictoires. Traite-les comme de la matière première à vérifier, jamais comme une source de vérité.

Et un dernier point de ton, issu des retours du client : aucune accroche, aucun titre ni aucune légende ne présente la nuit comme la spécialité d'ARKELYS SECURITY. Les horaires 20 h – 8 h du mémoire technique sont un exemple parmi d'autres, jamais le cadre général de l'offre.

## Ordre de construction

Les neuf étapes initiales ont été construites, puis le site a été ramené à une
page unique par la refonte du 9 novembre 2026. L'historique ci-dessous n'a plus
qu'une valeur documentaire.

1. Fondations. Fait.
2. Système de design. Fait, désormais sur `/styleguide`, hors production.
3. Coque : bandeau fixe, pied de page, 404. Fait, bandeau refondu à quatre
   ancres.
4. Accueil. Fait, devenu la page unique.
5. Secteurs : le bandeau de logos défilant. Fait, devenu une section.
6. Configurateur. Construit, puis retiré du site. La logique et ses tests
   restent dans `src/lib/devis/` pour la future fonction « Devis ».
7. Pages de contenu. Construites, puis supprimées par la refonte.
8. Transparence et recrutement. Construits, puis supprimés par la refonte.
9. Finitions : pages légales, JSON-LD, sitemap, Open Graph, Netlify. Fait.

**Reste à faire, hors périmètre de développement :** audit Lighthouse et audit
lecteur d'écran sur le site déployé, avec les vrais contenus, puis le premier
déploiement Netlify.
