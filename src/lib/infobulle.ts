/**
 * Infobulle « Évolution à venir », pour les commandes encore inertes.
 *
 * Le bouton « Devis » du bandeau s'en sert. Il ne mène nulle part : ce sont des boutons, pas des liens, pour qu'un clic milieu ou
 * un Ctrl+clic n'ouvre jamais une page inexistante.
 *
 * Accessibilité :
 *   - le message est dans le DOM dès le départ, relié au bouton par
 *     `aria-describedby` : un lecteur d'écran l'annonce au moment où le
 *     bouton prend le focus, sans attendre le clic ;
 *   - le conteneur est en `role="status"`, donc annoncé aussi à l'affichage ;
 *   - Échap referme, un clic ailleurs referme, le focus perdu referme.
 */

const DUREE_AFFICHAGE = 4000;

export function initialiserInfobulles(): void {
  for (const bouton of document.querySelectorAll<HTMLElement>('[data-infobulle]')) {
    if (bouton.dataset['pret'] === 'oui') continue;
    bouton.dataset['pret'] = 'oui';

    const identifiant = bouton.getAttribute('aria-describedby');
    const bulle = identifiant ? document.getElementById(identifiant) : null;
    if (!bulle) continue;

    let minuterie: number | undefined;

    const masquer = () => {
      bulle.dataset['visible'] = 'non';
      window.clearTimeout(minuterie);
    };

    const afficher = () => {
      bulle.dataset['visible'] = 'oui';
      window.clearTimeout(minuterie);
      minuterie = window.setTimeout(masquer, DUREE_AFFICHAGE);
    };

    bouton.addEventListener('click', (evenement) => {
      evenement.preventDefault();
      afficher();
    });

    bouton.addEventListener('blur', masquer);

    bouton.addEventListener('keydown', (evenement) => {
      if (evenement.key === 'Escape') masquer();
    });

    document.addEventListener('click', (evenement) => {
      if (!bouton.contains(evenement.target as Node)) masquer();
    });
  }
}
