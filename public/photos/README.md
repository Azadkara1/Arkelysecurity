# Photos : liste de prises de vue à commander

La photo est le premier poste de crédibilité du site. Un agent en
costume-cravate sur fond de gratte-ciel, acheté sur une banque d'images, dit au
visiteur que l'entreprise n'a rien de réel à montrer.

**Trois règles, sans exception.**

1. Pas d'images générées par IA. Elles se repèrent et elles décrédibilisent.
2. Pas de banque d'images générique.
3. Toute photo d'un agent identifiable exige une **autorisation de droit à
   l'image signée**, conservée par le client.

Tant que les vraies photos manquent, le site affiche des blocs de placeholder :
un aplat `ink-800` au bon format, portant le nom du fichier attendu et la
description du cadrage. C'est laid, c'est voulu : ça force la commande du
shooting.

---

## Liste de prises de vue

Une demi-journée de photographe suffit, en conditions réelles.

| Fichier | Sujet | Format | Page |
| --- | --- | --- | --- |
| `hero-ronde-nuit.jpg` | Agent de dos en ronde extérieure, lampe allumée, nuit | 21:9 | Accueil |
| `hero-ronde-jour.jpg` | Même cadrage, de jour | 21:9 | Accueil, Surveillance |
| `pc-securite.jpg` | Poste de contrôle, écrans, main courante ouverte | 3:2 | Méthode, Transparence |
| `prise-de-poste.jpg` | Deux agents en relève, échange de consignes | 3:2 | Méthode |
| `ssiap-ssi.jpg` | Agent SSIAP devant un tableau de sécurité incendie | 4:5 | Prestation SSIAP |
| `vehicule-serigraphie.jpg` | Véhicule marqué, de trois quarts, nuit | 16:9 | Moyens, Entreprise |
| `vehicule-serigraphie-jour.jpg` | Même cadrage, de jour | 16:9 | Moyens, Entreprise |
| `cynophile.jpg` | Binôme maître-chien, chien calme en position de travail | 4:5 | Prestation cynophile |
| `tenues.jpg` | Les trois tenues côte à côte sur fond neutre | 3:2 | Entreprise |
| `accueil-filtrage.jpg` | Agent à un point d'accueil, attitude de service | 3:2 | Secteur hôtellerie |
| `equipe-direction.jpg` | Portraits de l'encadrement, même lumière, même fond | 1:1 | Entreprise |
| `evenementiel.jpg` | Dispositif sur un événement, de loin, discret | 16:9 | Prestation événementiel |

---

## Direction photo

- Lumière naturelle, ou lumière du site. **Jamais de flash frontal.**
- Les agents **travaillent**, ils ne posent pas et ne regardent pas l'objectif.
- Aucune arme, aucune posture d'intimidation, aucun cadrage en contre-plongée
  héroïque. Le message est la maîtrise, pas la force.
- Traitement légèrement désaturé et contrasté, pour cohabiter avec le noir et
  l'or de la charte.

## Équilibre jour et nuit, point validé avec le client

Plusieurs scènes de la liste sont des scènes de nuit. **Chacune doit avoir son
équivalent de jour**, commandé dans la même demi-journée. Le site ne doit jamais
laisser penser qu'ARKELYS SECURITY n'intervient que de nuit : les visuels de
jour sont aussi nombreux que ceux de nuit, sur toutes les pages.

## Contraintes techniques

- Livraison en JPEG qualité maximale, **3000 px sur le grand côté minimum**,
  sans recadrage préalable : le recadrage se fait au build.
- Toutes les images passent par le composant `<Image />` d'Astro : AVIF avec
  repli WebP, `loading="lazy"` sauf le visuel d'en-tête, dimensions explicites
  pour un CLS à zéro.
- **Texte alternatif rédigé pour chaque image**, jamais vide, jamais « photo ».
  Il est porté par le frontmatter des Content Collections (`photoAlt`) ou par
  l'appel au composant.

## Où déposer les fichiers

Dans ce dossier (`public/photos/`), au nom exact du tableau ci-dessus. Le
placeholder correspondant disparaît automatiquement.

Les autorisations de droit à l'image signées **ne vont pas dans le dépôt** :
elles restent chez le client.
