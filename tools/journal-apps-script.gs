/**
 * Soirée Jeux — journal de sécurité (Google Apps Script lié à une Google Sheet).
 * Reçoit des lots d'événements du serveur (POST JSON {token, rows}) et les ajoute à l'onglet « Journal ».
 * Conservation : 90 jours (fonction purgerAnciennesLignes à déclencher chaque jour).
 * Onglet « État » : sauvegarde des classements de groupe et des salles (clé/valeur, découpée en morceaux), relue au redémarrage du serveur.
 * Le jeton secret est stocké dans Propriétés du script → JOURNAL_TOKEN (jamais dans ce code).
 */
var ONGLET = 'Journal';
var JOURS = 90;
var DOSSIER = 'Soirée Jeux — Médias';
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
    if (corps.media) return archiverMedia_(corps.media);
    if (corps.kv) return etat_(corps.kv);
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

var ONGLET_ETAT = 'État';
var MORCEAU = 45000;   // une cellule Google Sheets accepte 50 000 caractères au maximum

/** Sauvegarde clé/valeur (classements de groupe, salles) : {op:'get'|'set', key, value}. Aucune donnée média ici. */
function etat_(o) {
  var cle = String((o && o.key) || '');
  if (!/^[a-z0-9_-]{1,40}$/.test(cle)) return reponse_({ ok: false, err: 'clé invalide' });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ONGLET_ETAT) || ss.insertSheet(ONGLET_ETAT);
  if (sh.getLastRow() === 0) { sh.appendRow(['Clé', 'Morceau', 'Valeur', 'Mis à jour (UTC)']); sh.setFrozenRows(1); }
  var n = sh.getLastRow() - 1;
  if (o.op === 'get') {
    if (n <= 0) return reponse_({ ok: true, value: null });
    var lignes = sh.getRange(2, 1, n, 3).getValues().filter(function (l) { return l[0] === cle; });
    if (!lignes.length) return reponse_({ ok: true, value: null });
    lignes.sort(function (a, b) { return a[1] - b[1]; });
    return reponse_({ ok: true, value: lignes.map(function (l) { return String(l[2]); }).join('') });
  }
  if (o.op === 'set') {
    var v = String(o.value || '');
    if (v.length > 5000000) return reponse_({ ok: false, err: 'trop gros' });
    var verrou = LockService.getScriptLock();
    verrou.waitLock(20000);
    try {
      n = sh.getLastRow() - 1;
      if (n > 0) {
        var cles = sh.getRange(2, 1, n, 1).getValues();
        for (var i = cles.length - 1; i >= 0; i--) if (cles[i][0] === cle) sh.deleteRow(i + 2);
      }
      var t = new Date().toISOString(), lot = [];
      for (var k = 0, j = 0; k < v.length || j === 0; k += MORCEAU, j++) lot.push([cle, j, "'" + v.slice(k, k + MORCEAU), t]);
      sh.getRange(sh.getLastRow() + 1, 1, lot.length, 4).setValues(lot);
    } finally { verrou.releaseLock(); }
    return reponse_({ ok: true, key: cle, n: lot.length });
  }
  return reponse_({ ok: false, err: 'op inconnue' });
}

function dossier_() {
  var it = DriveApp.getFoldersByName(DOSSIER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(DOSSIER);   // dossier privé (jamais partagé)
}

/** Archive un média d'un défi Fun non intime (AoV ex-Classique, Défis ex-Classique/Délirant). Le serveur n'envoie jamais les médias « vue unique » ni Coquin/Hot/Explicite/Hard/18+. */
function archiverMedia_(m) {
  var types = { 'image/jpeg': 1, 'video/mp4': 1, 'video/webm': 1, 'video/quicktime': 1 };
  if (!m || !types[m.mime] || !m.base64) return reponse_({ ok: false, err: 'media invalide' });
  var PERIM = { av: ['Classique'], defis: ['Classique', 'Délirant'] };   // défis Fun non intimes uniquement
  if (!PERIM[m.game] || PERIM[m.game].indexOf(m.level) < 0) return reponse_({ ok: false, err: 'hors périmètre' });
  var nom = String(m.name || ('media_' + Date.now())).replace(/[^\w.\-]/g, '_').slice(0, 120);
  var blob = Utilities.newBlob(Utilities.base64Decode(m.base64), m.mime, nom);
  var f = dossier_().createFile(blob);
  f.setDescription('Salle ' + (m.room || '') + ' · ' + (m.sender || '') + (m.recipient ? ' → ' + m.recipient : '') + ' · ' + (m.type || '') + ' · ' + (m.ts || ''));
  var verrou = LockService.getScriptLock();
  verrou.waitLock(20000);
  try {
    feuille_().appendRow([new Date().toISOString(), 'media_archive', m.room || '', m.sender || '', '', '', m.game || '', m.level || '', '', 'Drive id : ' + f.getId(), m.recipient || '', m.type || '']);
  } finally { verrou.releaseLock(); }
  return reponse_({ ok: true, id: f.getId() });
}

/** À déclencher chaque jour (Déclencheurs → Basé sur le temps → Quotidien). Supprime les lignes de plus de 90 jours. */
function purgerAnciennesLignes() {
  var sh = feuille_();
  var n = sh.getLastRow() - 1;
  var limite = new Date(Date.now() - JOURS * 24 * 3600 * 1000);
  if (n <= 0) { purgerMedias_(limite); return; }
  var dates = sh.getRange(2, 1, n, 1).getValues();
  var aSupprimer = 0;
  for (var i = 0; i < dates.length; i++) {
    var d = new Date(dates[i][0]);
    if (!isNaN(d) && d < limite) aSupprimer++; else break;   // lignes ajoutées dans l'ordre chronologique
  }
  if (aSupprimer > 0) sh.deleteRows(2, aSupprimer);
  purgerMedias_(limite);
}

function purgerMedias_(limite) {
  var it = DriveApp.getFoldersByName(DOSSIER);
  if (!it.hasNext()) return;
  var fichiers = it.next().getFiles();
  while (fichiers.hasNext()) {
    var f = fichiers.next();
    if (f.getDateCreated() < limite) f.setTrashed(true);
  }
}

/** Test manuel depuis l'éditeur : ajoute une ligne factice. */
/** Test manuel depuis l'éditeur : vérifie l'accès au dossier Drive (autorise Drive au premier lancement). */
function testerDrive() {
  var f = dossier_().createFile(Utilities.newBlob('test', 'text/plain', 'test_' + Date.now() + '.txt'));
  f.setTrashed(true);
  Logger.log('Dossier OK : ' + DOSSIER);
}

function testerAjout() {
  feuille_().appendRow([new Date().toISOString(), 'test', 'TEST', 'Testeur', '', '', '', '', '', 'ligne de test', '', '']);
}
