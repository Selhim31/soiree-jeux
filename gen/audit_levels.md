# Audit des niveaux — proposition (rien n'est appliqué)

Date : 30/10/2026. Contenu audité : 11 676 cartes, 29 jeux. **Aucune modification live.** Script : `gen/apply_audit.py` (simulation par défaut).

## Méthode
1. Tri automatique de toutes les cartes par intensité (mots explicites / coquins / neutres) pour isoler les candidates : 446 cartes « sensibles » en niveau tout public, 170 cartes très chaudes en Coquin, 1 459 cartes « sans mot chaud » en Hot/Hard/Explicite.
2. Lecture humaine de toutes ces candidates (et des niveaux Extrême en entier), jugement au cas par cas. La très grande majorité est bien placée (ex. les Hot « sans mot-clé » sont en fait bien hot : « ta zone la plus sensible ? », « as-tu déjà simulé ? »).

## Définition des niveaux retenue
- Classique / Léger / Profond / Entre amis / Halloween / Culture G : tout public, rien de sexuel.
- Coquin / Intime / Entre amis coquin : séduction, flirt, allusions, sans acte sexuel explicite.
- Hot / Hard / Explicite : sexuel, de suggestif (Hot) à cru (Explicite).
- **Défis « Extrême »** : en réalité des gages délirants/gênants non sexuels (balai-guitare, moutarde, accent italien…). Le nom trompe.

## Renommages proposés
| Jeu | Niveau actuel | Nouveau nom | Pourquoi |
|---|---|---|---|
| Défis | Extrême | **Délirant** | gages absurdes et gênants, rien de sexuel |
| Action ou vérité | Extrême | scindé : Actions → **Délirant** (149), Vérités → restent **Extrême** (119, vraiment hard) | aujourd'hui le niveau mélange des actions délirantes et des vérités très sexuelles |
| Pureté | Classique | **18+** | le jeu est déjà 18+ et contient « Fait un 69 », « Essayé la sodomie »… ; « Classique » induit en erreur |
| Débats | Hard | **Couple & société** | infidélité, mariage, ghosting : piquant mais pas sexuel |

Alternative pour Défis Extrême : garder le nom mais le rendre vraiment extrême (gages d'endurance/humiliation plus forts, toujours sans danger). Je recommande le renommage + un futur niveau « Extrême » à écrire.

⚠ Si av Extrême est scindé, la règle des couples (actuellement sur « actions Extrême ») porterait sur des actions délirantes : à déplacer sur Hot/Explicite uniquement, ou à garder pour « Délirant » si Selim le souhaite.

## Déplacements et suppressions proposés
- MOVE 7sec: Classique -> Coquin: {p}, cite 3 choses qu'on fait au lit (soyons sages) !
- MOVE defis: Classique -> Coquin: {p}, envoie à {q} un vocal où tu lis ta dernière note de téléphone d'une voix sensuelle.
- MOVE av: Classique -> Coquin: Action : {p}, envoie à {q} un vocal où tu lis ta dernière note de téléphone d'une voix sensuelle.
- MOVE couple: Coquin -> Hot: {p}, quel sous-vêtement de {q} préfères-tu ?
- MOVE av: Hot -> Coquin: Vérité : {p}, qui ici a le plus beau sourire selon toi ?
- MOVE defis: Hot -> Coquin: {p}, décris ton parfum préféré sur quelqu'un, enregistre-toi et envoie le vocal à {q}, la personne de ton choix (envoi hors appli).
- MOVE av: Hot -> Coquin: Action : {p}, décris ton parfum préféré sur quelqu'un, enregistre-toi et envoie le vocal à {q}, la personne de ton choix (envoi hors appli).
- MOVE connaitre: Hot -> Intime: Qu'est-ce qui t'attire chez quelqu'un au-delà du physique ?
- MOVE connaitre: Hot -> Intime: Quel vêtement te donne le plus confiance ?
- MOVE connaitre: Hot -> Intime: Qu'est-ce que tu adores qu'on remarque chez toi ?
- MOVE coquin: Hot -> Coquin: {p}, quel est le compliment physique qui te met le plus en confiance ?
- MOVE coquin: Hot -> Coquin: {p}, qu'est-ce qui t'attire chez quelqu'un de mystérieux ?
- MOVE coquin: Hot -> Coquin: {p}, as-tu déjà été attiré(e) par une voix au téléphone ?
- MOVE defis: Explicite -> Hot: {p}, mange une banane ou un fruit de manière ultra suggestive.
- MOVE defis: Explicite -> Hot: {p}, fais un twerk ou un déhanché lascif de 20 secondes face caméra.
- MOVE defis: Explicite -> Hot: {p}, envoie à {q} une photo de tes lèvres mordues (envoi hors appli).
- MOVE defis: Explicite -> Hot: {p}, envoie un vocal à {q} où tu dis « viens » de 5 façons différentes (envoi hors appli).
- MOVE av: Explicite -> Hot: Action : {p}, mange une banane ou un fruit de manière ultra suggestive.
- MOVE av: Explicite -> Hot: Action : {p}, fais un twerk ou un déhanché lascif de 20 secondes face caméra.
- MOVE av: Explicite -> Hot: Action : {p}, envoie à {q} une photo de tes lèvres mordues (envoi hors appli).
- MOVE av: Explicite -> Hot: Action : {p}, envoie un vocal à {q} où tu dis « viens » de 5 façons différentes (envoi hors appli).
- MOVE defis: Extrême -> Hot: {p}, fais un strip-tease de 20 secondes jusqu'à ce que tu le décides, caméra on.
- MOVE defis: Extrême -> Hot: {p}, décris ton fantasme numéro un comme une bande-annonce de film.
- MOVE av: Extrême -> Hot: Action : {p}, fais un strip-tease de 20 secondes jusqu'à ce que tu le décides, caméra on.
- MOVE av: Extrême -> Hot: Action : {p}, décris ton fantasme numéro un comme une bande-annonce de film.
- REMOVE tupreferes/Classique: Tu préfères connaître la date de ta mort ||| la cause ?
- REMOVE tupreferes/Classique: Tu préfères rester coincé dans un ascenseur avec ton ex ||| avec ton boss ?
- REMOVE hot/Hot: {p}, enlève un accessoire ou un vêtement (chaussette, montre, pull…).
- REMOVE hot/Hot: {p}, décris en détail une tenue que tu aimerais voir sur {q}.
- REMOVE hot/Hot: {p}, dis à voix haute le compliment le plus osé que tu peux pour {q}.
- REMOVE hot/Hot: {p}, fais monter la température en 3 phrases à la caméra.
- REMOVE hot/Hot: {p}, garde un glaçon dans ta main ou sur ta nuque 20 secondes.
- REMOVE hot/Hot: {p}, choisis quelqu'un ici pour une nuit fictive et explique ton programme (soft).
- REMOVE hot/Hot: {p}, retire ton haut si tu portes un tee-shirt dessous.
- REMOVE hot/Hot: {p}, chuchote ce que tu ferais à {q} sur une île déserte.
- SPLIT av Extrême: 149 actions -> Délirant
- NEW HOT 7sec: 14 cartes
- NEW HOT cestun10: 19 cartes
- NEW HOT imposteur: 7 cartes
- NEW HOT ouinon: 5 cartes
- NEW HOT mime: 3 cartes
- RENAME defis: Extrême -> Délirant
- RENAME purete: Classique -> 18+
- RENAME debats: Hard -> Couple & société

## Option : créer un niveau « Hot » dans les jeux qui n'ont que Classique + Coquin
Leur niveau Coquin contient des cartes franchement sexuelles. Script : `--new-hot`. Cartes concernées (48) :
- 7sec : « {p}, cite 3 positions de câlin ! »
- 7sec : « {p}, cite 3 positions du Kamasutra ! »
- 7sec : « {p}, cite 3 lieux insolites pour faire l'amour ! »
- 7sec : « {p}, cite 3 préliminaires ! »
- 7sec : « {p}, cite 3 façons d'envoyer un nude classe ! »
- 7sec : « {p}, cite 3 mots pour désigner faire l'amour ! »
- 7sec : « {p}, cite 3 films érotiques connus ! »
- 7sec : « {p}, cite 3 bruits qui gênent pendant l'acte ! »
- 7sec : « {p}, cite 3 chansons qui parlent de sexe ! »
- 7sec : « {p}, cite 3 pièces de la maison pour faire l'amour ! »
- 7sec : « {p}, cite 3 choses qu'on dit pendant l'orgasme ! »
- 7sec : « {p}, cite 3 noms de positions inventées ! »
- 7sec : « {p}, cite 3 marques de préservatifs ! »
- 7sec : « {p}, cite 3 endroits pour un week-end libertin ! »
- cestun10 : « C'est un 10 mais il/elle parle de sa mère pendant les préliminaires. »
- cestun10 : « C'est un 10 mais il/elle commente tout pendant l'acte comme au foot. »
- cestun10 : « C'est un 10 mais il/elle fait l'amour en 2 minutes chrono. »
- cestun10 : « C'est un 10 mais il/elle regarde son téléphone pendant l'acte. »
- cestun10 : « C'est un 10 mais il/elle veut un plan à trois dès la première semaine. »
- cestun10 : « C'est un 10 mais il/elle veut toujours faire l'amour dans le même ordre. »
- cestun10 : « C'est un 10 mais il/elle déteste les préliminaires. »
- cestun10 : « C'est un 10 mais il/elle veut toujours les préliminaires et jamais la suite. »
- cestun10 : « C'est un 10 mais il/elle ne veut faire l'amour que le mardi. »
- cestun10 : « C'est un 10 mais il/elle veut toujours payer la moitié du préservatif. »
- cestun10 : « C'est un 10 mais il/elle s'endort pendant les préliminaires. »
- cestun10 : « C'est un 10 mais il/elle fait du yoga au milieu de l'acte. »
- cestun10 : « C'est un 10 mais il/elle chante pendant l'acte. »
- cestun10 : « C'est un 10 mais il/elle parle à son reflet pendant l'acte. »
- cestun10 : « C'est un 10 mais il/elle fait des listes de positions à essayer. »
- cestun10 : « C'est un 10 mais il/elle dit « on verra » à chaque proposition coquine. »
- cestun10 : « C'est un 10 mais il/elle fait l'amour en chaussures. »
- cestun10 : « C'est un 10 mais il/elle ne fait l'amour qu'avec la télé allumée. »
- cestun10 : « C'est un 10 mais il/elle garde ses écouteurs pendant les préliminaires. »
- imposteur : « Ex|Plan cul »
- imposteur : « String|Culotte »
- imposteur : « Sextoy|Vibromasseur »
- imposteur : « Préservatif|Lubrifiant »
- imposteur : « Orgasme|Extase »
- imposteur : « Fantasme|Rêve érotique »
- imposteur : « Sex friend|Ami avec avantages »
- ouinon : « Tu as déjà fait l'amour en extérieur ? ||| Oui ||| Non »
- ouinon : « Tu as un jouet coquin ? ||| Oui ||| Non »
- ouinon : « Tu ferais un plan à trois ? ||| Oui ||| Non »
- ouinon : « Tu as déjà embrassé quelqu'un du même sexe ? ||| Oui ||| Non »
- ouinon : « Tu as déjà eu un rêve érotique cette semaine ? ||| Oui ||| Non »
- mime : « {p}, mime quelqu'un qui envoie un nude par erreur (sans rien montrer), les autres devinent. »
- mime : « {p}, mime quelqu'un qui envoie un nude par erreur, les autres devinent. »
- mime : « {p}, mime quelqu'un qui choisit des préservatifs à la pharmacie, les autres devinent. »

Ces nouveaux niveaux Hot seraient très en dessous de 150 (3 à 19 cartes) : il faudrait les compléter, sinon garder les cartes en Coquin et renommer le niveau en « Coquin & Hot ».

## Formulation des défis d'envoi
- 396 cartes contiennent « {q}, la personne de ton choix » et 24 « {q} (la personne de ton choix) » : redondant, puisque le joueur choisit déjà le destinataire dans l'appli et que le nom est ensuite affiché.
- 471 cartes ont « (envoi hors appli) », 12 « (hors appli) », 4 « (appel hors appli) » : jargon technique.
- Avant le choix, l'écran affiche « envoie la vidéo à … » : le « … » ressemble à un bug.

Proposition (option `--phrasing`, 483 cartes) :
- « filme-toi et envoie la vidéo à {q}, la personne de ton choix (envoi hors appli). » → « filme-toi et envoie la vidéo à {q} (par ta messagerie). »
- « (envoi hors appli, avec son accord) » → « (par ta messagerie, avec son accord) » ; « (appel hors appli) » → « (par ton téléphone) ».
- Changement de code à faire (server.js, non fait) : avant le choix, remplacer `{q}` par « un joueur de ton choix » au lieu de « … » ; après le choix, mettre le prénom (déjà le cas).
  Exemple : « Alice, imite une star de rock en concert avec un balai, filme-toi et envoie la vidéo à un joueur de ton choix (par ta messagerie). » puis « … à Bob (par ta messagerie). »

## Autres problèmes relevés
- Qui a écrit ça ? (Classique) : faute de grammaire générée « Invente une règle absurde à propos de les lundis matins » (frame « à propos de {x} » + article) : 54 cartes à corriger en « à propos des / du ».
- Soft « Entre amis coquin » : « qui ici enverrait le meilleur sexto ? », « … le plus doué pour un strip-tease ? », « … sur une plage nudiste ? » sont limites pour Coquin, mais le jeu n'a pas de niveau Hot : laissés en place.
- Pureté : un seul niveau, le score est calculé sur `levels.Classique` dans server.js ; un renommage impose de modifier server.js.
- Défis/AV Hot et Explicite : contenus bien placés dans l'ensemble ; Explicite reste cru mais à distance et consenti.

## Niveaux qui passeraient sous 150 (application par défaut)
- SOUS 150 : ouinon/Coquin = 145
- SOUS 150 : ouinon/Hot = 5
- SOUS 150 : hot/Hot = 149
- SOUS 150 : av/Extrême = 119
- SOUS 150 : av/Délirant = 149
- SOUS 150 : imposteur/Coquin = 149
- SOUS 150 : imposteur/Hot = 7
- SOUS 150 : 7sec/Coquin = 142
- SOUS 150 : 7sec/Hot = 14
- SOUS 150 : defis/Délirant = 149
- SOUS 150 : defis/Explicite = 146
- SOUS 150 : cestun10/Coquin = 133
- SOUS 150 : cestun10/Hot = 19
- SOUS 150 : mime/Coquin = 149
- SOUS 150 : mime/Hot = 3

Ces niveaux devraient être complétés de quelques cartes (1 à 31) avant application, ou les déplacements concernés abandonnés.
