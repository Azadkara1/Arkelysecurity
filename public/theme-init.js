/*
 * Pose le thème AVANT le premier rendu, sinon la page clignote en sombre
 * avant de passer en clair.
 *
 * POURQUOI UN FICHIER SÉPARÉ ET PAS UN SCRIPT INLINE : un script inline
 * obligerait à autoriser 'unsafe-inline' dans la politique de sécurité du
 * contenu, ce qui ouvrirait la porte à toute injection de script. Un fichier
 * servi depuis notre propre domaine passe avec un simple 'self'.
 *
 * Il est chargé sans defer ni async dans le <head> : son exécution bloque le
 * rendu, ce qui est exactement ce qu'on veut ici. Il pèse moins d'un demi
 * kilo-octet.
 *
 * La logique complète de bascule est dans src/lib/theme.ts. Ce fichier n'en
 * reprend que la lecture initiale. Si la clé de stockage change là-bas, la
 * changer ici aussi.
 */
(function () {
  try {
    var choix = window.localStorage.getItem('arkelys-theme');
    if (choix !== 'clair' && choix !== 'sombre') return;
    document.documentElement.dataset.theme = choix;
    if (choix === 'clair') {
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '#f4f1ea');
    }
  } catch (e) {
    /* Stockage indisponible : on reste sur le thème sombre par défaut. */
  }
})();
