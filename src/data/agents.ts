/**
 * Types d'agents, pour la future fonction « Devis ».
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CE FICHIER NE SERT ENCORE À RIEN À L'ÉCRAN. C'est voulu.
 *
 * Il prépare la structure de données de l'évolution décrite dans BRIEF.md :
 * à la fin du parcours de configuration, le client choisira lui-même le
 * nombre d'agents et leur type. Plus tard, ARKELYS saisira un taux horaire
 * par type d'agent, et c'est seulement à ce moment-là qu'un prix pourra être
 * calculé.
 *
 * `tauxHoraire` vaut `null` pour tous les types, et doit le rester tant que
 * le client n'a pas arbitré ses tarifs.
 *
 * RÈGLE EN VIGUEUR : AUCUN PRIX N'EST AFFICHÉ, NULLE PART.
 * Elle ne sera levée qu'au moment où la fonction Devis sera construite, et
 * seulement si les taux sont renseignés. `peutAfficherUnPrix()` est le seul
 * point de décision : tant qu'il renvoie `false`, aucun montant ne doit
 * apparaître à l'écran ni dans un document généré.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type CodeAgent = 'aps' | 'ssiap1' | 'ssiap2' | 'cynophile';

export interface TypeAgent {
  readonly code: CodeAgent;
  /** Libellé affiché au client. */
  readonly libelle: string;
  /** Ce que fait concrètement ce type d'agent, en une phrase. */
  readonly role: string;
  /**
   * Taux horaire en euros, hors taxes.
   * `null` tant que le client ne l'a pas arbitré. NE PAS inventer de valeur :
   * un tarif affiché est un engagement commercial.
   */
  readonly tauxHoraire: number | null;
}

export const typesAgents: readonly TypeAgent[] = [
  {
    code: 'aps',
    libelle: 'Agent de prévention et de sécurité',
    role: 'Postes fixes, rondes, contrôle des accès, levée de doute.',
    tauxHoraire: null,
  },
  {
    code: 'ssiap1',
    libelle: 'SSIAP 1',
    role: 'Poste de sécurité incendie, rondes de prévention, guidage des secours.',
    tauxHoraire: null,
  },
  {
    code: 'ssiap2',
    libelle: 'SSIAP 2',
    role: 'Chef d’équipe de sécurité incendie, encadrement du poste.',
    tauxHoraire: null,
  },
  {
    code: 'cynophile',
    libelle: 'Maître-chien',
    role: 'Rondes sur emprises étendues, périmètres extérieurs, sites isolés.',
    tauxHoraire: null,
  },
] as const;

/**
 * Ce que le client choisira à la fin du parcours : combien d'agents, de
 * quels types. Aucun calcul n'est fait aujourd'hui.
 */
export interface ChoixAgents {
  readonly code: CodeAgent;
  readonly nombre: number;
}

/**
 * Seul point de décision sur l'affichage d'un prix.
 * Renvoie `true` uniquement quand TOUS les types d'agents ont un taux
 * horaire renseigné. Tant que c'est faux, rien de chiffré ne sort.
 */
export function peutAfficherUnPrix(): boolean {
  return typesAgents.every((type) => typeof type.tauxHoraire === 'number');
}
