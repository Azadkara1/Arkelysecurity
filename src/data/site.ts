/**
 * ARKELYS SECURITY, structure du site.
 *
 * LE SITE EST UNE PAGE UNIQUE. Chaque entrée du bandeau est une ancre vers
 * une section de l'accueil, pas une route. Les seules autres pages sont les
 * deux pages légales obligatoires et la 404, liées depuis le pied de page.
 *
 * Il n'y a donc plus de drapeaux `pagesActives` : il n'y a plus de page à
 * activer ou désactiver.
 */

/** Une entrée du bandeau : toujours une ancre de l'accueil. */
export interface LienNavigation {
  readonly libelle: string;
  /** Ancre, de la forme `#section`. */
  readonly href: string;
}

/**
 * Navigation du bandeau ET du pied de page, dans cet ordre.
 * Quatre entrées, rien d'autre.
 */
export const navigation: readonly LienNavigation[] = [
  { libelle: 'Accueil', href: '#accueil' },
  { libelle: 'Nos prestations', href: '#prestations' },
  { libelle: 'Secteurs', href: '#secteurs' },
  { libelle: 'Contact', href: '#contact' },
] as const;

/**
 * Les deux boutons permanents du bandeau, tous les deux en doré plein.
 *
 * « Contactez-nous » descend vers la section Contact.
 * « Devis » ne mène nulle part : au clic, il affiche une infobulle
 * « Évolution à venir ». Il n'a volontairement pas de `href`, pour qu'aucun
 * clic milieu ou Ctrl+clic n'ouvre une page inexistante.
 */
export const actionsBandeau = {
  principale: { libelle: 'Contactez-nous', href: '#contact' },
  secondaire: { libelle: 'Devis', message: 'Évolution à venir' },
} as const;

/** Pages réelles, hors accueil. Liées uniquement depuis le pied de page. */
export const liensLegaux: readonly LienNavigation[] = [
  { libelle: 'Mentions légales', href: '/mentions-legales' },
  { libelle: 'Politique de confidentialité', href: '/politique-de-confidentialite' },
] as const;

/** Toutes les URL réelles du site, pour `sitemap.xml`. */
export const routesSitemap: readonly { href: string; priorite: number }[] = [
  { href: '/', priorite: 1 },
  { href: '/mentions-legales', priorite: 0.3 },
  { href: '/politique-de-confidentialite', priorite: 0.3 },
] as const;

/** Mesure d'audience. Pas de Google Analytics par défaut (brief : RGPD). */
export const mesureAudience = {
  fournisseur: 'aucun' as 'aucun' | 'plausible' | 'umami',
} as const;
