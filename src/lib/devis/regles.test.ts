/**
 * Tests unitaires des règles du configurateur.
 *
 * Exécutés par le lanceur de tests intégré de Node (`node --test`), sans
 * aucune dépendance supplémentaire, le brief interdit d'ajouter une
 * librairie sans accord, et `node:test` suffit largement ici.
 *
 *   pnpm test
 *
 * Ces tests gardent trois promesses faites au client :
 *   1. aucun montant n'apparaît jamais dans un résultat ;
 *   2. ce qui reste à confirmer est toujours dit ;
 *   3. les volumes horaires suivent bien les créneaux sélectionnés.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import {
  calculerDispositif,
  composerEquipe,
  configurationInitiale,
  heuresHebdomadaires,
  nombreDePostes,
  MENTION_ESTIMATION,
} from './regles.ts';
import type { Configuration, Creneau } from './types.ts';

/** Fabrique une plage de créneaux pour un jour donné. */
function plage(jour: number, debut: number, fin: number): Creneau[] {
  const creneaux: Creneau[] = [];
  for (let heure = debut; heure < fin; heure += 1) creneaux.push({ jour, heure });
  return creneaux;
}

function configuration(partiel: Partial<Configuration> = {}): Configuration {
  return { ...configurationInitiale(), ...partiel };
}

describe('heuresHebdomadaires', () => {
  it('compte une heure par créneau', () => {
    const c = configuration({ creneaux: plage(0, 8, 20) });
    assert.equal(heuresHebdomadaires(c), 12);
  });

  it('écarte les doublons, car un glissement de souris repasse sur les mêmes cases', () => {
    const c = configuration({ creneaux: [...plage(0, 8, 20), ...plage(0, 8, 20)] });
    assert.equal(heuresHebdomadaires(c), 12);
  });

  it('additionne les jours', () => {
    const c = configuration({ creneaux: [...plage(0, 8, 20), ...plage(1, 8, 20)] });
    assert.equal(heuresHebdomadaires(c), 24);
  });
});

describe('nombreDePostes', () => {
  it('renvoie zéro tant que le type d’établissement n’est pas choisi', () => {
    assert.equal(nombreDePostes(configuration()), 0);
  });

  it('reste à un poste pour un petit site', () => {
    const c = configuration({ etablissement: 'hotel', surfaceM2: 3000 });
    assert.equal(nombreDePostes(c), 1);
  });

  it('augmente avec la surface, selon la table du type d’établissement', () => {
    // Hôtel : 6000 m² par agent. 13 000 m² → 3 postes.
    const c = configuration({ etablissement: 'hotel', surfaceM2: 13000 });
    assert.equal(nombreDePostes(c), 3);
  });

  it('ajoute un poste au-delà de trois bâtiments', () => {
    const c = configuration({ etablissement: 'residence', surfaceM2: 2000, nombreBatiments: 4 });
    assert.equal(nombreDePostes(c), 2);
  });

  it('ajoute un poste tenu quand du public est présent la nuit', () => {
    const c = configuration({
      etablissement: 'hotel',
      surfaceM2: 2000,
      contraintes: ['public-la-nuit'],
    });
    assert.equal(nombreDePostes(c), 2);
  });
});

describe('composerEquipe', () => {
  it('affecte un SSIAP 1 dès que l’enjeu incendie est retenu', () => {
    const c = configuration({ etablissement: 'hotel', surfaceM2: 2000, enjeux: ['incendie'] });
    const equipe = composerEquipe(c);
    assert.ok(equipe.some((p) => p.qualification === 'SSIAP 1'));
  });

  it('relève en SSIAP 2 pour un ERP classé', () => {
    const c = configuration({
      etablissement: 'hotel',
      surfaceM2: 2000,
      enjeux: ['incendie'],
      contraintes: ['erp-classe'],
    });
    const equipe = composerEquipe(c);
    assert.ok(equipe.some((p) => p.qualification === 'SSIAP 2'));
    assert.ok(!equipe.some((p) => p.qualification === 'SSIAP 1'));
  });

  it('propose un binôme cynophile sur des extérieurs étendus', () => {
    const c = configuration({
      etablissement: 'entrepot',
      surfaceM2: 8000,
      contraintes: ['exterieurs-etendus'],
    });
    const equipe = composerEquipe(c);
    assert.ok(equipe.some((p) => p.qualification === 'Maître-chien'));
  });

  it('complète en APS et ne dépasse jamais le nombre de postes calculé', () => {
    const c = configuration({
      etablissement: 'hotel',
      surfaceM2: 13000,
      enjeux: ['incendie', 'accueil'],
    });
    const equipe = composerEquipe(c);
    const total = equipe.reduce((s, p) => s + p.nombre, 0);
    assert.equal(total, nombreDePostes(c));
    assert.ok(equipe.some((p) => p.qualification === 'APS'));
  });

  it('justifie chaque poste : rien n’est proposé sans explication', () => {
    const c = configuration({ etablissement: 'commerce', surfaceM2: 1200, enjeux: ['accueil'] });
    for (const poste of composerEquipe(c)) {
      assert.ok(poste.justification.length > 20, 'justification trop courte');
    }
  });
});

describe('calculerDispositif', () => {
  it('multiplie les heures de présence par le nombre de postes simultanés', () => {
    const c = configuration({
      etablissement: 'hotel',
      surfaceM2: 13000, // 3 postes
      creneaux: plage(0, 8, 20), // 12 heures
    });
    const d = calculerDispositif(c);
    assert.equal(d.heuresHebdomadaires, 36);
  });

  it('arrondit le volume mensuel à la dizaine, pour ne pas simuler une précision absente', () => {
    const c = configuration({ etablissement: 'hotel', surfaceM2: 2000, creneaux: plage(0, 8, 20) });
    const d = calculerDispositif(c);
    assert.equal(d.heuresMensuelles % 10, 0);
  });

  it('dit toujours ce qui reste à confirmer', () => {
    const c = configuration({ etablissement: 'hotel', surfaceM2: 2000, creneaux: plage(0, 8, 20) });
    const d = calculerDispositif(c);
    assert.ok(d.aConfirmer.length >= 3);
  });

  it('signale la surface manquante plutôt que de l’inventer', () => {
    const c = configuration({ etablissement: 'hotel', creneaux: plage(0, 8, 20) });
    const d = calculerDispositif(c);
    assert.ok(d.aConfirmer.some((p) => p.includes('surface')));
  });

  it('porte les points de vigilance du secteur choisi', () => {
    const c = configuration({ etablissement: 'entrepot', surfaceM2: 5000 });
    const d = calculerDispositif(c);
    assert.ok(d.pointsDeVigilance.length > 0);
  });

  /**
   * Le test qui compte le plus : le brief interdit tout montant, partout.
   * On balaie l'intégralité du résultat sérialisé à la recherche d'un prix.
   */
  it('n’émet JAMAIS de montant', () => {
    const cas: Configuration[] = [
      configuration({ etablissement: 'hotel', surfaceM2: 13000, creneaux: plage(0, 0, 24) }),
      configuration({
        etablissement: 'entrepot',
        surfaceM2: 40000,
        enjeux: ['incendie', 'surveillance'],
        contraintes: ['erp-classe', 'exterieurs-etendus', 'public-la-nuit'],
        saisonnalite: 'pics',
        creneaux: plage(5, 0, 24),
      }),
      configuration({ etablissement: 'evenement', surfaceM2: 900, creneaux: plage(6, 14, 23) }),
    ];

    /**
     * Motifs resserrés. Un premier jet attrapait « extérieur », qui contient
     * « eur » : les limites de mot doivent encadrer les deux côtés, et les
     * sigles rester sensibles à la casse.
     *
     * Le mot « montant » seul n'est pas interdit : « aucun montant n'est
     * communiqué » est précisément la phrase qu'on veut voir. Ce qu'on
     * traque, c'est un montant CHIFFRÉ.
     */
    const interdits: RegExp[] = [
      /€/,
      /\d[\d\s.,]*\s*(€|\beuros?\b)/i,
      /\beuros?\b/i,
      /\btarifs?\b/i,
      /\bprix\b/i,
      /\bdevis chiffré\b/i,
      /\bHT\b/,
      /\bTTC\b/,
    ];

    for (const c of cas) {
      const serialise = JSON.stringify(calculerDispositif(c));
      for (const motif of interdits) {
        assert.ok(
          !motif.test(serialise),
          `mention tarifaire (${motif}) dans le résultat : ${serialise}`,
        );
      }
    }
  });

  it('la mention d’estimation reste sans ambiguïté', () => {
    assert.match(MENTION_ESTIMATION, /sans valeur contractuelle/);
    assert.match(MENTION_ESTIMATION, /après visite/);
  });
});
