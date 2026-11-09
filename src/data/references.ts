/**
 * Références clients, pour le bandeau de logos défilant.
 *
 * Remplace l'ancienne Content Collection `references`, devenue inutile avec
 * la suppression des pages de cas clients.
 *
 * RÈGLE INCHANGÉE ET NON NÉGOCIABLE : un logo ou un nom de client ne
 * s'affiche QUE si `autoriseNomPublic` vaut `true`, ce qui suppose un accord
 * écrit. La valeur par défaut est `false`, et ce n'est pas au site de
 * présumer l'accord. Un logo est une marque déposée : il s'affiche tel que
 * fourni, sans passage en monochrome sans autorisation.
 *
 * Tant que ce tableau est vide, le bandeau affiche huit cases en pointillés
 * « Logo client, sur accord écrit ».
 */

export interface Reference {
  /** Nom réel. N'est JAMAIS affiché si `autoriseNomPublic` est false. */
  readonly nom: string;
  /** Formulation anonymisée, par exemple « un hôtel 5 étoiles du Var ». */
  readonly libelleAnonyme: string;
  /** Accord écrit du client pour afficher son nom et son logo. */
  readonly autoriseNomPublic: boolean;
  /** Chemin du logo dans public/logos-clients/. Ignoré sans accord. */
  readonly logo?: string;
  readonly ordre: number;
}

export const references: readonly Reference[] = [] as const;

/** Les seules références affichables : celles qui portent un accord écrit. */
export function referencesPubliables(): readonly Reference[] {
  return references
    .filter((r) => r.autoriseNomPublic && r.logo)
    .slice()
    .sort((a, b) => a.ordre - b.ordre);
}
