/**
 * ARKELYS SECURITY, données d'entreprise.
 *
 * SOURCE UNIQUE DE VÉRITÉ. Aucune de ces valeurs ne doit être écrite en dur
 * dans une page ou un composant.
 *
 * Tout ce qui vaut 'XX' est un placeholder non arbitré par le client. Il
 * s'affiche TEL QUEL à l'écran, volontairement, pour qu'on ne l'oublie pas.
 * `pnpm run check:xx` les recense et échoue s'il en subsiste.
 *
 * Règle absolue du brief : n'inventer aucun chiffre (effectif, ancienneté,
 * nombre de clients, délai d'intervention, certification). En cas de doute,
 * mettre 'XX'.
 */

export const entreprise = {
  nom: 'ARKELYS SECURITY',
  domaine: 'arkelyssecurity.fr',
  baseline: 'votre sécurité, notre engagement', // figure dans le logo fourni par le client

  // ── Identité légale, À CONFIRMER PAR LE CLIENT ────────────────────────────
  formeJuridique: 'XX',
  capital: 'XX',
  rcs: 'XX',
  siret: 'XX',
  adresse: { rue: 'XX', cp: 'XX', ville: 'XX' },

  /**
   * Numéro d'autorisation CNAPS. Obligatoire sur tous les documents
   * commerciaux d'une activité de sécurité privée, accompagné de la mention
   * « ne confère aucune prérogative de puissance publique ».
   * Voir le composant MentionCnaps.
   */
  autorisationCnaps: 'XX',

  /** Directeur de la publication, pour les mentions légales. À confirmer. */
  directeurPublication: 'XX',

  /** Hébergeur, pour les mentions légales. Netlify tant que le déploiement
   *  ne change pas. */
  hebergeur: {
    nom: 'Netlify, Inc.',
    adresse: '512 2nd Street, Suite 200, San Francisco, CA 94107, États-Unis',
    url: 'https://www.netlify.com',
  },

  // ── Contact ───────────────────────────────────────────────────────────────
  contact: {
    /** Personne référente affichée sur le site. À confirmer. */
    interlocuteur: 'XX',
    /** Numéro de la personne référente, fourni plus tard. Affiché tel quel. */
    telephone: 'XX XX XX XX XX',
    email: 'contact@arkelyssecurity.fr',
  },

  /**
   * Zone d'intervention, utilisée par les données structurées `areaServed`.
   * Tant que les départements valent 'XX', le champ est omis du JSON-LD :
   * publier une couverture factice serait pire que de ne rien publier.
   */
  zoneIntervention: {
    /** Codes INSEE des départements couverts, par exemple ['83', '06']. */
    departements: ['XX'],
    libelle: 'XX',
  },
} as const;

export type Entreprise = typeof entreprise;

/** `true` si la valeur est un placeholder non arbitré. */
export function estPlaceholder(valeur: unknown): boolean {
  return typeof valeur === 'string' && /\bXX\b/.test(valeur);
}

/**
 * Formate un numéro de téléphone en lien `tel:`.
 * Renvoie `null` tant que le numéro est un placeholder : on affiche alors le
 * texte brut sans en faire un lien mort.
 */
export function lienTelephone(numero: string = entreprise.contact.telephone): string | null {
  if (estPlaceholder(numero)) return null;
  return `tel:+33${numero.replace(/\D/g, '').replace(/^0/, '')}`;
}
