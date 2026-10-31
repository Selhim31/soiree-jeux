/**
 * Soirée Jeux — journal de sécurité (Google Apps Script lié à une Google Sheet).
 * Reçoit des lots d'événements du serveur (POST JSON {token, rows}) et les ajoute à l'onglet « Journal ».
 * Conservation : 90 jours (fonction purgerAnciennesLignes à déclencher chaque jour).
 * Le jeton secret est stocké dans Propriétés du script → JOURNAL_TOKEN (jamais dans ce code).
 */
var ONGLET = 'Journal';
var JOURS = 90;
var ENTETES = ['Horodatage (UTC)', 'Événement', 'Salle', 'Pseudo', 'ID joueur', 'IP', 'Jeu', 'Niveau', 'Carte', 'Détail / réponse', 'Destinataire', 'Type'];

function feuille_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ONGLET) || ss.insertSheet(ONGLET);
  if (sh.getLastRow() === 0) { sh.appendRow(ENTETES); sh.setFrozenRows(1); }
  return sh;
}

function reponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var attendu = PropertiesService.getScriptProperties().getProperty('JOURNAL_TOKEN');
    var corps = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!attendu || corps.token !== attendu) return reponse_({ ok: false, err: 'forbidden' });
    var lignes = Array.isArray(corps.rows) ? corps.rows : [];
    if (!lignes.length) return reponse_({ ok: true, n: 0 });
    var propres = lignes.slice(0, 1000).map(function (l) {
      var r = [];
      for (var i = 0; i < ENTETES.length; i++) {
        var v = l[i] === undefined || l[i] === null ? '' : String(l[i]);
        if (/^[=+\-@]/.test(v)) v = "'" + v;          // évite l'injection de formules
        r.push(v.slice(0, 2000));
      }
      return r;
    });
    var verrou = LockService.getScriptLock();
    verrou.waitLock(20000);
    try {
      var sh = feuille_();
      sh.getRange(sh.getLastRow() + 1, 1, propres.length, ENTETES.length).setValues(propres);
    } finally { verrou.releaseLock(); }
    return reponse_({ ok: true, n: propres.length });
  } catch (err) {
    return reponse_({ ok: false, err: String(err) });
  }
}

/** À déclencher chaque jour (Déclencheurs → Basé sur le temps → Quotidien). Supprime les lignes de plus de 90 jours. */
function purgerAnciennesLignes() {
  var sh = feuille_();
  var n = sh.getLastRow() - 1;
  if (n <= 0) return;
  var limite = new Date(Date.now() - JOURS * 24 * 3600 * 1000);
  var dates = sh.getRange(2, 1, n, 1).getValues();
  var aSupprimer = 0;
  for (var i = 0; i < dates.length; i++) {
    var d = new Date(dates[i][0]);
    if (!isNaN(d) && d < limite) aSupprimer++; else break;   // lignes ajoutées dans l'ordre chronologique
  }
  if (aSupprimer > 0) sh.deleteRows(2, aSupprimer);
}

/** Test manuel depuis l'éditeur : ajoute une ligne factice. */
function testerAjout() {
  feuille_().appendRow([new Date().toISOString(), 'test', 'TEST', 'Testeur', '', '', '', '', '', 'ligne de test', '', '']);
}
