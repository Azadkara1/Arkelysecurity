/**
 * Apparition au scroll.
 *
 * Opacité plus translation verticale de 12 px maximum. Rien d'autre : pas de
 * parallaxe, pas de rebond, pas d'échelle. Le mouvement doit se remarquer
 * après coup, pas pendant.
 *
 * Le style vit dans `@utility apparition` (src/styles/global.css) ; ce module
 * ne fait que poser `data-visible="true"` quand l'élément entre dans le
 * champ. Si le JavaScript ne s'exécute pas, `initialiserApparitions` n'est
 * jamais appelé, d'où le repli : les éléments sont rendus visibles
 * immédiatement par la règle `.no-js` posée côté serveur.
 *
 * `prefers-reduced-motion: reduce` est respecté sans condition : on révèle
 * tout d'un coup, sans observer quoi que ce soit.
 */

const SELECTEUR = '[data-apparition]';
const MARGE = '0px 0px -10% 0px';

let observateur: IntersectionObserver | null = null;

function reveler(element: Element): void {
  element.setAttribute('data-visible', 'true');
}

function mouvementReduit(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Observe les éléments portant `data-apparition` et les révèle à l'entrée
 * dans le champ. Idempotent : peut être rappelé après chaque transition de
 * vue Astro sans accumuler d'observateurs.
 */
export function initialiserApparitions(racine: ParentNode = document): void {
  const elements = Array.from(racine.querySelectorAll(SELECTEUR));
  if (elements.length === 0) return;

  // Mouvement réduit, ou navigateur sans IntersectionObserver : tout visible.
  if (mouvementReduit() || !('IntersectionObserver' in window)) {
    elements.forEach(reveler);
    return;
  }

  observateur ??= new IntersectionObserver(
    (entrees, obs) => {
      for (const entree of entrees) {
        if (!entree.isIntersecting) continue;
        reveler(entree.target);
        obs.unobserve(entree.target);
      }
    },
    { rootMargin: MARGE, threshold: 0.01 },
  );

  for (const element of elements) {
    if (element.getAttribute('data-visible') === 'true') continue;
    observateur.observe(element);
  }
}

/** Libère l'observateur, appelé avant une transition de vue. */
export function arreterApparitions(): void {
  observateur?.disconnect();
  observateur = null;
}
