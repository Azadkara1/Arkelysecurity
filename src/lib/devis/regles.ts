/**
 * Futur devis : LA LOGIQUE DE DIMENSIONNEMENT, et rien d’autre.
 *
 * Ce fichier ne connaît ni le DOM, ni Astro, ni aucune classe CSS. Il prend
 * une `Configuration` et rend un `Dispositif`. C'est ce qui permet de le
 * tester seul (`node --test`) et d'ajuster les règles sans ouvrir un
 * composant.
 *
 * ────────────────────────────────────────────────────────────────────────
 * RÈGLE ABSOLUE : AUCUN MONTANT, NULLE PART.
 * Le configurateur rend un volume horaire et une composition d'équipe, puis
 * propose d'envoyer la configuration pour obtenir un devis. Un tarif affiché
 * en ligne est un engagement commercial et un cadeau fait à la concurrence.
 * ────────────────────────────────────────────────────────────────────────
 *
 * Les règles sont des DONNÉES (les tables ci-dessous), pas du code dispersé
 * dans des `if`. On doit pouvoir les ajuster en changeant un nombre.
 *
 * Toutes les sorties sont des ESTIMATIONS INDICATIVES, à confirmer après
 * visite du site. Aucune n'a de valeur contractuelle.
 */

import type {
  Configuration,
  Contrainte,
  Dispositif,
  Enjeu,
  Poste,
  Qualification,
  TypeEtablissement,
} from './types';

/* ═══════════════════════════════════════════════════════════════════════
   1. Tables de règles, ajustables sans toucher au code
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Surface couverte par un agent en ronde, en m², avant qu'un second poste
 * ne devienne nécessaire. Un entrepôt se parcourt vite, un hôtel occupé non.
 */
const SURFACE_PAR_AGENT: Record<TypeEtablissement, number> = {
  hotel: 6000,
  residence: 9000,
  restaurant: 4000,
  commerce: 5000,
  entrepot: 15000,
  chantier: 12000,
  evenement: 3000,
};

/** Nombre de bâtiments au-delà duquel un poste supplémentaire s'impose. */
const BATIMENTS_PAR_AGENT = 3;

/**
 * Rondes suggérées par vacation, selon le type d'établissement.
 * Une valeur basse n'est pas un moindre service : sur un site occupé, une
 * ronde trop fréquente dérange les occupants.
 */
const RONDES_PAR_VACATION: Record<TypeEtablissement, number> = {
  hotel: 3,
  residence: 3,
  restaurant: 2,
  commerce: 3,
  entrepot: 4,
  chantier: 4,
  evenement: 2,
};

/** Points de vigilance propres au type d'établissement. */
const VIGILANCE: Record<TypeEtablissement, string[]> = {
  hotel: [
    'Site occupé en continu : les rondes tiennent compte de la présence de clients.',
    'Circulations et dégagements régulièrement encombrés (bagages, entretien, livraisons).',
    'Locaux techniques à l’écart des flux, rarement visités.',
    'Accès hors heures de réception : arrivées tardives, livraisons matinales, intervenants.',
  ],
  residence: [
    'Parties communes et sous-sols : les deux points sensibles d’une résidence.',
    'Contrôle des accès visiteurs sans transformer l’entrée en sas.',
    'Stationnements et abords, souvent hors champ des caméras.',
  ],
  restaurant: [
    'Flux concentrés sur quelques heures, puis site quasi vide.',
    'Accès de service et livraisons, ouverts tôt et tard.',
    'Fin de service : sortie du personnel, fermeture, encaissements.',
  ],
  commerce: [
    'Démarque et flux de clientèle aux heures d’affluence.',
    'Réserves et quais de livraison.',
    'Ouverture et fermeture : les deux moments les plus exposés.',
  ],
  entrepot: [
    'Emprise étendue, périmètre extérieur long à parcourir.',
    'Quais et portails : les points d’entrée réels.',
    'Site souvent vide hors exploitation, levée de doute à organiser.',
  ],
  chantier: [
    'Matériel et matériaux stockés à l’air libre.',
    'Clôtures et accès provisoires, qui bougent au fil du chantier.',
    'Co-activité d’entreprises : la liste des intervenants change.',
  ],
  evenement: [
    'Points de filtrage et files d’attente : dimensionnement avant l’ouverture.',
    'Circulations et sorties de secours maintenues dégagées.',
    'Fin d’événement : la sortie est le moment le plus dense.',
  ],
};

/**
 * Enjeux qui imposent une qualification particulière.
 * `null` = l'enjeu est couvert par un agent APS.
 */
const QUALIFICATION_PAR_ENJEU: Record<Enjeu, Qualification | null> = {
  incendie: 'SSIAP 1',
  'controle-acces': null,
  surveillance: null,
  accueil: null,
  'flux-evenementiel': null,
};

/** Contraintes qui ajoutent un poste ou relèvent une qualification. */
const EFFET_CONTRAINTE: Record<
  Contrainte,
  { postesSupplementaires?: number; qualificationMinimale?: Qualification; note: string }
> = {
  'public-la-nuit': {
    postesSupplementaires: 1,
    note: 'La présence de public en dehors des heures d’exploitation impose un poste tenu, pas seulement des rondes.',
  },
  'locaux-techniques': {
    note: 'Les locaux techniques sont intégrés aux circuits de ronde et leur fermeture est vérifiée à chaque passage.',
  },
  'erp-classe': {
    qualificationMinimale: 'SSIAP 2',
    note: 'Le classement ERP conditionne la qualification SSIAP exigée ; elle se détermine sur la notice de sécurité.',
  },
  'exterieurs-etendus': {
    note: 'Les zones extérieures étendues sont le cas d’usage d’un binôme cynophile.',
  },
};

/** Surface au-delà de laquelle un binôme cynophile devient pertinent. */
const SURFACE_CYNOPHILE = 20000;

/** Semaines par mois, pour passer d'un volume hebdomadaire à un volume mensuel. */
const SEMAINES_PAR_MOIS = 4.33;

/* ═══════════════════════════════════════════════════════════════════════
   2. Calcul
   ═══════════════════════════════════════════════════════════════════════ */

/** Heures de présence par semaine = nombre de créneaux sélectionnés. */
export function heuresHebdomadaires(configuration: Configuration): number {
  // Un créneau = une case de la grille = une heure sur un jour donné.
  // Les doublons éventuels sont écartés : la grille peut renvoyer deux fois
  // la même case si l'utilisateur repasse dessus en glissant.
  const uniques = new Set(configuration.creneaux.map((c) => `${c.jour}-${c.heure}`));
  return uniques.size;
}

/** Nombre de postes simultanés, avant répartition par qualification. */
export function nombreDePostes(configuration: Configuration): number {
  const { etablissement, surfaceM2, nombreBatiments, contraintes } = configuration;
  if (!etablissement) return 0;

  let postes = 1;

  const surfaceReference = SURFACE_PAR_AGENT[etablissement];
  if (surfaceM2 && surfaceM2 > surfaceReference) {
    postes = Math.ceil(surfaceM2 / surfaceReference);
  }

  if (nombreBatiments > BATIMENTS_PAR_AGENT) {
    postes += Math.floor((nombreBatiments - 1) / BATIMENTS_PAR_AGENT);
  }

  for (const contrainte of contraintes) {
    postes += EFFET_CONTRAINTE[contrainte].postesSupplementaires ?? 0;
  }

  return postes;
}

/**
 * Composition de l'équipe.
 *
 * Principe : on part des enjeux pour déterminer les qualifications
 * nécessaires, puis on complète en APS jusqu'au nombre de postes calculé.
 */
export function composerEquipe(configuration: Configuration): Poste[] {
  const { etablissement, enjeux, contraintes, surfaceM2 } = configuration;
  if (!etablissement) return [];

  const total = nombreDePostes(configuration);
  const postes: Poste[] = [];
  let restants = total;

  const prendre = (
    qualification: Qualification,
    nombre: number,
    justification: string,
  ): void => {
    if (nombre <= 0) return;
    const effectif = Math.min(nombre, Math.max(restants, 1));
    postes.push({ qualification, nombre: effectif, justification });
    restants -= effectif;
  };

  // 1. Sécurité incendie : un SSIAP dès que l'enjeu est retenu.
  if (enjeux.includes('incendie')) {
    const erp = contraintes.includes('erp-classe');
    prendre(
      erp ? 'SSIAP 2' : (QUALIFICATION_PAR_ENJEU.incendie ?? 'SSIAP 1'),
      1,
      erp
        ? 'Établissement recevant du public classé : la qualification SSIAP exacte se détermine sur la notice de sécurité.'
        : 'Tenue du poste de sécurité incendie, levée de doute sur alarme et guidage des secours.',
    );
  }

  // 2. Binôme cynophile : surface étendue ou extérieurs étendus.
  const cynophilePertinent =
    contraintes.includes('exterieurs-etendus') || (surfaceM2 ?? 0) >= SURFACE_CYNOPHILE;
  if (cynophilePertinent && restants > 0) {
    prendre(
      'Maître-chien',
      1,
      'Emprise ou périmètre extérieur étendus : le binôme réduit le temps de levée de doute.',
    );
  }

  // 3. Le reste en APS.
  if (restants > 0) {
    const motifs: string[] = [];
    if (enjeux.includes('accueil')) motifs.push('accueil');
    if (enjeux.includes('controle-acces')) motifs.push('contrôle d’accès');
    if (enjeux.includes('flux-evenementiel')) motifs.push('encadrement des flux');
    if (enjeux.includes('surveillance') || motifs.length === 0) motifs.push('rondes et surveillance générale');

    prendre(
      'APS',
      restants,
      `Agents de prévention et de sécurité pour ${motifs.join(', ')}.`,
    );
  }

  return postes;
}

/** Ce qui ne peut pas être estimé depuis un formulaire. */
export function pointsAConfirmer(configuration: Configuration): string[] {
  const aConfirmer = [
    'Les circuits de ronde et les points de passage, qui se définissent sur place.',
    'Les interlocuteurs et le circuit d’alerte.',
    'La tenue, arrêtée avec vous selon le contexte de l’établissement.',
  ];

  if (configuration.contraintes.includes('erp-classe')) {
    aConfirmer.push(
      'La qualification SSIAP exigée, qui dépend du classement et de l’effectif de l’établissement : elle se lit sur la notice de sécurité.',
    );
  }

  if (configuration.saisonnalite === 'pics') {
    aConfirmer.push(
      'Le dimensionnement en période de pic, qui peut différer sensiblement du régime courant.',
    );
  }

  if (!configuration.surfaceM2) {
    aConfirmer.push('La surface réelle du site, non renseignée dans cette configuration.');
  }

  aConfirmer.push(
    'Le volume horaire définitif, après visite. Aucun montant n’est communiqué avant.',
  );

  return aConfirmer;
}

/** Point d'entrée : une configuration, un dispositif. */
export function calculerDispositif(configuration: Configuration): Dispositif {
  const heuresSemaine = heuresHebdomadaires(configuration);
  const postes = composerEquipe(configuration);
  const simultanes = postes.reduce((somme, poste) => somme + poste.nombre, 0);

  // Le volume horaire tient compte du nombre de postes tenus simultanément :
  // 2 agents sur une plage de 12 h représentent 24 heures de présence.
  const heuresPresence = heuresSemaine * Math.max(simultanes, 1);

  return {
    postes,
    heuresHebdomadaires: heuresPresence,
    // Arrondi à la dizaine : un volume mensuel au décimal près donnerait une
    // fausse impression de précision sur une estimation.
    heuresMensuelles: Math.round((heuresPresence * SEMAINES_PAR_MOIS) / 10) * 10,
    rondesParVacation: configuration.etablissement
      ? RONDES_PAR_VACATION[configuration.etablissement]
      : 0,
    pointsDeVigilance: configuration.etablissement
      ? [...VIGILANCE[configuration.etablissement]]
      : [],
    aConfirmer: pointsAConfirmer(configuration),
  };
}

/** Configuration vide, point de départ du parcours. */
export function configurationInitiale(): Configuration {
  return {
    etablissement: null,
    surfaceM2: null,
    nombreBatiments: 1,
    creneaux: [],
    enjeux: [],
    contraintes: [],
    saisonnalite: 'constante',
  };
}

/**
 * Mention obligatoire, affichée avec tout résultat et reprise dans le PDF.
 * Elle n'est pas masquable : c'est une protection contractuelle, pas une
 * formule de politesse.
 */
export const MENTION_ESTIMATION =
  'Estimation indicative à confirmer après visite du site, sans valeur contractuelle. Aucun montant n’est communiqué à ce stade.';
