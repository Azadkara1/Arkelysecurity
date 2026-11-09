/**
 * Futur devis : types partagés.
 *
 * La logique vit dans `regles.ts`, l'interface dans `/configurer`. Les deux
 * ne se parlent qu'à travers ces types : on doit pouvoir réécrire l'interface
 * sans toucher aux règles, et ajuster les règles sans toucher à l'interface.
 */

export type TypeEtablissement =
  | 'hotel'
  | 'residence'
  | 'restaurant'
  | 'commerce'
  | 'entrepot'
  | 'chantier'
  | 'evenement';

export type Enjeu =
  | 'incendie'
  | 'controle-acces'
  | 'surveillance'
  | 'accueil'
  | 'flux-evenementiel';

export type Contrainte =
  | 'public-la-nuit'
  | 'locaux-techniques'
  | 'erp-classe'
  | 'exterieurs-etendus';

export type Saisonnalite = 'constante' | 'pics';

export type Qualification = 'APS' | 'SSIAP 1' | 'SSIAP 2' | 'Maître-chien';

/** Une case de la grille 7 jours × 24 heures. */
export interface Creneau {
  /** 0 = lundi … 6 = dimanche. */
  jour: number;
  /** 0 à 23. */
  heure: number;
}

/** Ce que le prospect a renseigné. */
export interface Configuration {
  etablissement: TypeEtablissement | null;
  surfaceM2: number | null;
  nombreBatiments: number;
  /** Créneaux sélectionnés sur la grille 7 × 24. */
  creneaux: Creneau[];
  enjeux: Enjeu[];
  contraintes: Contrainte[];
  saisonnalite: Saisonnalite;
}

/** Un poste recommandé. */
export interface Poste {
  qualification: Qualification;
  /** Nombre de postes simultanés de cette qualification. */
  nombre: number;
  /** Pourquoi ce poste est proposé, affiché au prospect. */
  justification: string;
}

/** Le résultat rendu au prospect. */
export interface Dispositif {
  postes: Poste[];
  /** Heures de présence par semaine, toutes qualifications confondues. */
  heuresHebdomadaires: number;
  /** Estimation mensuelle, arrondie à la dizaine. */
  heuresMensuelles: number;
  /** Rondes suggérées par vacation. */
  rondesParVacation: number;
  /** Points de vigilance propres au type d'établissement choisi. */
  pointsDeVigilance: string[];
  /**
   * Ce qui ne peut PAS être estimé depuis un formulaire et demande une
   * visite. C'est le meilleur argument de la maison : on distingue ce qui
   * est chiffré de ce qui reste à confirmer.
   */
  aConfirmer: string[];
}

/** Libellés affichables, pour ne pas disperser le vocabulaire dans l'interface. */
export const LIBELLES = {
  etablissement: {
    hotel: 'Hôtel',
    residence: 'Résidence',
    restaurant: 'Restaurant',
    commerce: 'Commerce',
    entrepot: 'Entrepôt',
    chantier: 'Chantier',
    evenement: 'Événement',
  } satisfies Record<TypeEtablissement, string>,

  enjeu: {
    incendie: 'Sécurité incendie',
    'controle-acces': 'Contrôle d’accès',
    surveillance: 'Surveillance générale',
    accueil: 'Accueil',
    'flux-evenementiel': 'Flux événementiel',
  } satisfies Record<Enjeu, string>,

  contrainte: {
    'public-la-nuit': 'Présence de public la nuit',
    'locaux-techniques': 'Locaux techniques',
    'erp-classe': 'ERP classé',
    'exterieurs-etendus': 'Zones extérieures étendues',
  } satisfies Record<Contrainte, string>,

  saisonnalite: {
    constante: 'Activité constante',
    pics: 'Pics saisonniers',
  } satisfies Record<Saisonnalite, string>,
} as const;

export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const;
