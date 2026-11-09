/**
 * Menu mobile : ouverture, fermeture à Échap, focus piégé dans le panneau.
 *
 * Exigences d'accessibilité du brief, toutes vérifiables au clavier :
 *   - le panneau se ferme à Échap ;
 *   - le focus ne peut pas sortir du panneau tant qu'il est ouvert ;
 *   - à la fermeture, le focus revient sur le bouton qui l'a ouvert ;
 *   - le reste de la page est masqué aux technologies d'assistance.
 *
 * Idempotent : rappelable après chaque transition de vue Astro.
 */

const FOCUSABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let detacher: (() => void) | null = null;

export function initialiserMenuMobile(): void {
  // On démonte l'instance précédente : sans ça, une transition de vue
  // empilerait les écouteurs sur document.
  detacher?.();
  detacher = null;

  const ouvrir = document.getElementById('ouvrir-menu');
  const fermer = document.getElementById('fermer-menu');
  const panneau = document.getElementById('panneau-menu');
  const bandeau = document.getElementById('bandeau');
  const principal = document.getElementById('contenu-principal');

  if (!ouvrir || !fermer || !panneau) return;

  let ouvert = false;

  function elementsFocusables(): HTMLElement[] {
    if (!panneau) return [];
    return Array.from(panneau.querySelectorAll<HTMLElement>(FOCUSABLES)).filter(
      (el) => el.offsetParent !== null,
    );
  }

  function basculer(versOuvert: boolean): void {
    if (!panneau || !ouvrir) return;
    ouvert = versOuvert;
    panneau.hidden = !versOuvert;
    ouvrir.setAttribute('aria-expanded', String(versOuvert));

    // Le défilement de l'arrière-plan est bloqué pendant l'ouverture.
    document.documentElement.style.overflow = versOuvert ? 'hidden' : '';

    // Le reste de la page sort de l'arbre d'accessibilité.
    for (const zone of [bandeau, principal]) {
      if (!zone) continue;
      if (versOuvert) zone.setAttribute('aria-hidden', 'true');
      else zone.removeAttribute('aria-hidden');
    }

    if (versOuvert) elementsFocusables()[0]?.focus();
    else ouvrir.focus();
  }

  function surClavier(evenement: KeyboardEvent): void {
    if (!ouvert) return;

    if (evenement.key === 'Escape') {
      evenement.preventDefault();
      basculer(false);
      return;
    }

    if (evenement.key !== 'Tab') return;

    // Piège à focus : Tab sur le dernier élément revient au premier, et
    // Maj+Tab sur le premier va au dernier.
    const focusables = elementsFocusables();
    const premier = focusables[0];
    const dernier = focusables[focusables.length - 1];
    if (!premier || !dernier) return;

    const actif = document.activeElement;
    if (evenement.shiftKey && actif === premier) {
      evenement.preventDefault();
      dernier.focus();
    } else if (!evenement.shiftKey && actif === dernier) {
      evenement.preventDefault();
      premier.focus();
    }
  }

  const surOuvrir = () => basculer(true);
  const surFermer = () => basculer(false);
  // Un clic sur un lien du panneau le referme avant la navigation.
  const surClicPanneau = (e: Event) => {
    if ((e.target as HTMLElement).closest('a[href]')) basculer(false);
  };

  ouvrir.addEventListener('click', surOuvrir);
  fermer.addEventListener('click', surFermer);
  panneau.addEventListener('click', surClicPanneau);
  document.addEventListener('keydown', surClavier);

  detacher = () => {
    ouvrir.removeEventListener('click', surOuvrir);
    fermer.removeEventListener('click', surFermer);
    panneau.removeEventListener('click', surClicPanneau);
    document.removeEventListener('keydown', surClavier);
    document.documentElement.style.overflow = '';
  };
}
