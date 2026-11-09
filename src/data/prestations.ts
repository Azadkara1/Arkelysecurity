/**
 * Les quatre métiers, pour la section « Nos prestations » de l'accueil.
 *
 * Ces données remplacent l'ancienne Content Collection : il n'y a plus de
 * page de détail par métier, donc plus besoin d'un chargeur Markdown, d'un
 * schéma Zod ni de métadonnées de référencement par entrée.
 *
 * Les cartes ne sont PAS cliquables : ni lien, ni bouton, ni page de détail.
 * Une photo, un titre, une description. Rien de plus.
 *
 * Textes provisoires, marqués `À VALIDER` dans le suivi : écrits en vrai
 * français pour qu'on juge de la longueur réelle, jamais en faux-texte.
 */

export interface Prestation {
  readonly titre: string;
  readonly description: string;
  /** Nom du fichier attendu dans public/photos/. Voir le README de ce dossier. */
  readonly photo: string;
  /** Cadrage demandé au photographe, et texte alternatif une fois la photo livrée. */
  readonly cadrage: string;
}

export const prestations: readonly Prestation[] = [
  {
    titre: 'Surveillance et gardiennage',
    description:
      'Postes fixes et rondes sur des circuits arrêtés avec vous, contrôle des accès, vérification des points sensibles. Chaque vacation s’ouvre sur une prise de poste formalisée et se termine par une relève consignée, dans une main courante horodatée que vous pouvez relire.',
    photo: 'hero-ronde-jour.jpg',
    cadrage:
      'Agent de dos en ronde extérieure le long d’un bâtiment, de jour, lumière naturelle.',
  },
  {
    titre: 'Sécurité incendie, SSIAP',
    description:
      'Tenue du poste de sécurité, exploitation du système de sécurité incendie, rondes de prévention et vérification des moyens de secours. Nous affectons la qualification qu’exige le classement de votre établissement, après lecture de votre notice de sécurité.',
    photo: 'ssiap-ssi.jpg',
    cadrage: 'Agent SSIAP devant le tableau de signalisation d’un système de sécurité incendie.',
  },
  {
    titre: 'Sécurité événementielle',
    description:
      'Un événement ne se sécurise pas le jour même. Nous reconnaissons le lieu, proposons les points de filtrage et les circuits, remettons les consignes avant l’ouverture, puis transmettons un compte rendu de dispositif une fois l’événement terminé.',
    photo: 'evenementiel.jpg',
    cadrage: 'Dispositif de sécurité discret en périphérie d’un événement, vu de loin.',
  },
  {
    titre: 'Prestations cynophiles',
    description:
      'Le binôme maître-chien couvre ce qu’un agent seul couvre mal : une emprise étendue, un périmètre extérieur, un site isolé. Le chien est un moyen de détection et de dissuasion, jamais un moyen de contrainte, et le binôme travaille à l’écart des flux de public.',
    photo: 'cynophile.jpg',
    cadrage: 'Binôme maître-chien en position de travail, chien calme au pied de l’agent.',
  },
] as const;
