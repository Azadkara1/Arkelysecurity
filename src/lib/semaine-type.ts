/**
 * Grille « semaine type » du formulaire de contact.
 *
 * 7 jours sur 24 heures. Le visiteur clique ou glisse pour colorer les heures
 * souhaitées. Rien d'autre : pas de nombre de postes, pas de calcul, pas de
 * résultat. C'est une information transmise avec le formulaire, pas un
 * configurateur.
 *
 * Accessibilité :
 *   chaque cellule est un <button aria-pressed>, le déplacement se fait aux
 *   flèches, Espace et Entrée basculent. Le glissement du doigt fonctionne
 *   aussi : les événements « pointer » couvrent souris, stylet et tactile, et
 *   `touch-action: none` sur la grille empêche le défilement de la page de
 *   voler le geste.
 *
 * Sortie vers le formulaire :
 *   - `semaine_type` : un résumé LISIBLE, pour que le courriel reçu se lise
 *     sans outil. Par exemple « Lun de 20 h à 8 h ; Mar de 8 h à 20 h ».
 *   - `semaine_type_json` : les mêmes données en brut, pour un traitement
 *     ultérieur.
 */

const JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

/** Index linéaire sur la semaine : jour × 24 + heure, de 0 à 167. */
type Creneau = number;

const TOTAL = 7 * 24;

/** Regroupe les créneaux sélectionnés en plages contiguës, bouclant sur la semaine. */
function plages(selection: Set<Creneau>): { debut: number; longueur: number }[] {
  if (selection.size === 0) return [];
  if (selection.size === TOTAL) return [{ debut: 0, longueur: TOTAL }];

  const resultat: { debut: number; longueur: number }[] = [];

  for (let creneau = 0; creneau < TOTAL; creneau += 1) {
    if (!selection.has(creneau)) continue;
    // On ne démarre une plage que sur un créneau dont le précédent est vide,
    // en tenant compte du bouclage dimanche 23 h vers lundi 0 h.
    const precedent = (creneau - 1 + TOTAL) % TOTAL;
    if (selection.has(precedent)) continue;

    let longueur = 0;
    while (longueur < TOTAL && selection.has((creneau + longueur) % TOTAL)) longueur += 1;
    resultat.push({ debut: creneau, longueur });
  }

  return resultat;
}

/** Résumé lisible, destiné au courriel reçu. */
export function resumeLisible(selection: Set<Creneau>): string {
  const liste = plages(selection);
  if (liste.length === 0) return 'Aucune plage indiquée.';
  if (liste.length === 1 && liste[0]?.longueur === TOTAL) {
    return 'Toute la semaine, 24 h sur 24.';
  }

  return liste
    .map(({ debut, longueur }) => {
      const jourDebut = Math.floor(debut / 24) % 7;
      const heureDebut = debut % 24;
      const fin = debut + longueur;
      const jourFin = Math.floor((fin % TOTAL) / 24) % 7;
      const heureFin = fin % 24;

      if (longueur <= 24) {
        // Une plage qui franchit minuit se lit « de 20 h à 8 h », ce qui est
        // exactement la façon dont on en parle au téléphone.
        const affichageFin = heureFin === 0 ? 24 : heureFin;
        return `${JOURS_COURTS[jourDebut]} de ${heureDebut} h à ${affichageFin} h`;
      }

      return `du ${JOURS_COURTS[jourDebut]} ${heureDebut} h au ${JOURS_COURTS[jourFin]} ${heureFin} h`;
    })
    .join(' ; ');
}

/** Données brutes, pour un traitement ultérieur. */
export function resumeJson(selection: Set<Creneau>): string {
  const parJour: { jour: number; heures: number[] }[] = [];

  for (let jour = 0; jour < 7; jour += 1) {
    const heures: number[] = [];
    for (let heure = 0; heure < 24; heure += 1) {
      if (selection.has(jour * 24 + heure)) heures.push(heure);
    }
    if (heures.length > 0) parJour.push({ jour, heures });
  }

  return JSON.stringify(parJour);
}

/** Branche une grille présente dans le DOM. Idempotent. */
export function initialiserSemaineType(): void {
  for (const grille of document.querySelectorAll<HTMLElement>('[data-semaine-type]')) {
    if (grille.dataset['pret'] === 'oui') continue;
    grille.dataset['pret'] = 'oui';

    const cellules = Array.from(grille.querySelectorAll<HTMLButtonElement>('button[data-creneau]'));
    const racine = grille.closest<HTMLElement>('[data-semaine-type-bloc]') ?? document.body;
    const champLisible = racine.querySelector<HTMLInputElement>('[data-semaine-lisible]');
    const champJson = racine.querySelector<HTMLInputElement>('[data-semaine-json]');
    const apercu = racine.querySelector<HTMLElement>('[data-semaine-apercu]');
    const effacer = racine.querySelector<HTMLButtonElement>('[data-semaine-effacer]');

    const selection = new Set<Creneau>();
    let enGlissement = false;
    let valeurGlissement = true;

    function publier(): void {
      const lisible = resumeLisible(selection);
      if (champLisible) champLisible.value = lisible;
      if (champJson) champJson.value = resumeJson(selection);
      if (apercu) apercu.textContent = lisible;
    }

    function appliquer(cellule: HTMLButtonElement, actif: boolean): void {
      const creneau = Number(cellule.dataset['creneau']);
      cellule.setAttribute('aria-pressed', String(actif));
      if (actif) selection.add(creneau);
      else selection.delete(creneau);
      publier();
    }

    for (const cellule of cellules) {
      cellule.addEventListener('pointerdown', (evenement) => {
        evenement.preventDefault();
        enGlissement = true;
        valeurGlissement = cellule.getAttribute('aria-pressed') !== 'true';
        appliquer(cellule, valeurGlissement);
        // Sans capture, le navigateur réaffecte les événements suivants à la
        // première cellule au doigt : le glissement ne peindrait qu'une case.
        cellule.releasePointerCapture?.(evenement.pointerId);
      });

      cellule.addEventListener('pointerenter', () => {
        if (enGlissement) appliquer(cellule, valeurGlissement);
      });

      // Au doigt, `pointerenter` ne se déclenche pas : on retrouve la cellule
      // sous le doigt à chaque déplacement.
      cellule.addEventListener('pointermove', (evenement) => {
        if (!enGlissement) return;
        const sous = document.elementFromPoint(evenement.clientX, evenement.clientY);
        const voisine = sous?.closest<HTMLButtonElement>('button[data-creneau]');
        if (voisine) appliquer(voisine, valeurGlissement);
      });

      cellule.addEventListener('keydown', (evenement) => {
        const creneau = Number(cellule.dataset['creneau']);
        const jour = Math.floor(creneau / 24);
        const heure = creneau % 24;
        let cible: number | null = null;

        switch (evenement.key) {
          case ' ':
          case 'Enter':
            evenement.preventDefault();
            appliquer(cellule, cellule.getAttribute('aria-pressed') !== 'true');
            return;
          case 'ArrowRight':
            if (heure < 23) cible = creneau + 1;
            break;
          case 'ArrowLeft':
            if (heure > 0) cible = creneau - 1;
            break;
          case 'ArrowDown':
            if (jour < 6) cible = creneau + 24;
            break;
          case 'ArrowUp':
            if (jour > 0) cible = creneau - 24;
            break;
          default:
            return;
        }

        if (cible === null) return;
        evenement.preventDefault();
        grille.querySelector<HTMLButtonElement>(`[data-creneau="${cible}"]`)?.focus();
      });
    }

    const arreter = () => {
      enGlissement = false;
    };
    document.addEventListener('pointerup', arreter);
    document.addEventListener('pointercancel', arreter);

    effacer?.addEventListener('click', () => {
      for (const cellule of cellules) cellule.setAttribute('aria-pressed', 'false');
      selection.clear();
      publier();
    });

    publier();
  }
}
