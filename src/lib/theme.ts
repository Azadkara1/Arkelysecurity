/**
 * Bascule de thème, sombre ou clair.
 *
 * Essai demandé pour juger du rendu. Tout repose sur les tokens sémantiques
 * de global.css : on change `data-theme` sur <html>, huit variables sont
 * redéfinies, et le site entier suit. Aucune classe dupliquée, aucun
 * composant à modifier. Si l'essai n'est pas retenu, il suffit de figer le
 * thème sombre et de retirer le bouton.
 *
 * Défaut : sombre.
 */

export type Theme = 'sombre' | 'clair';

const CLE = 'arkelys-theme';
const DEFAUT: Theme = 'sombre';

/**
 * Lit le choix mémorisé.
 * localStorage peut lever : navigation privée, stockage bloqué, iframe
 * cloisonnée. On retombe alors sur le thème par défaut.
 */
export function themeMemorise(): Theme | null {
  try {
    const valeur = window.localStorage.getItem(CLE);
    return valeur === 'clair' || valeur === 'sombre' ? valeur : null;
  } catch {
    return null;
  }
}

function memoriser(theme: Theme): void {
  try {
    window.localStorage.setItem(CLE, theme);
  } catch {
    // Choix non mémorisé : sans conséquence, le site reste utilisable.
  }
}

export function themeActuel(): Theme {
  return document.documentElement.dataset['theme'] === 'clair' ? 'clair' : 'sombre';
}

export function appliquerTheme(theme: Theme): void {
  document.documentElement.dataset['theme'] = theme;

  // La couleur de la barre d'adresse mobile suit le thème.
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'clair' ? '#f4f1ea' : '#0b0b0c';

  for (const bouton of document.querySelectorAll<HTMLElement>('[data-bascule-theme]')) {
    const versClair = theme === 'sombre';
    bouton.setAttribute(
      'aria-label',
      versClair ? 'Passer au thème clair' : 'Passer au thème sombre',
    );
    bouton.setAttribute('aria-pressed', String(theme === 'clair'));
  }
}

/** Branche les boutons de bascule. Idempotent. */
export function initialiserTheme(): void {
  appliquerTheme(themeMemorise() ?? DEFAUT);

  for (const bouton of document.querySelectorAll<HTMLElement>('[data-bascule-theme]')) {
    if (bouton.dataset['pret'] === 'oui') continue;
    bouton.dataset['pret'] = 'oui';

    bouton.addEventListener('click', () => {
      const suivant: Theme = themeActuel() === 'sombre' ? 'clair' : 'sombre';
      appliquerTheme(suivant);
      memoriser(suivant);
    });
  }
}
