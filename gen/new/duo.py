import json,itertools
S=lambda s:[x.strip() for x in s.split('|') if x.strip()]
def pairs(groups,lim):
  out=[]
  for q,items in groups:
    for a,b in itertools.combinations(S(items),2): out.append(f"{q} ||| {a} ||| {b}")
  return out
C=[("Destination de vacances idéale à deux ?","la plage|la montagne|une grande ville|la campagne|une croisière|un road trip"),
("Soirée parfaite ?","un resto|un film à la maison|une fête|un jeu de société|un concert|une balade de nuit"),
("Petit-déjeuner du dimanche ?","croissants|pancakes|œufs brouillés|un bol de céréales|un brunch au café|rien, on dort"),
("Animal de compagnie à adopter ensemble ?","un chat|un chien|un lapin|des poissons|un perroquet|aucun"),
("Plat à cuisiner ensemble ?","pizza maison|raclette|sushis|lasagnes|couscous|tacos"),
("Saison préférée pour un week-end ?","le printemps|l'été|l'automne|l'hiver"),
("Qui devrait gérer l'argent du foyer ?","{p}|{q}|les deux ensemble|un tableur partagé"),
("Film à regarder ce soir ?","une comédie|un film d'horreur|un film d'action|un dessin animé|un documentaire|une romance"),
("Logement de rêve ?","un loft en ville|une maison avec jardin|un chalet|une péniche|une maison sur la plage"),
("Qui ronfle le plus ?","{p}|{q}|personne|les deux"),
("Sport à faire à deux ?","la course|le yoga|la natation|le vélo|l'escalade|la danse"),
("Meilleur cadeau surprise ?","un voyage|un bijou|un dîner|une expérience insolite|un objet fait main|des fleurs"),
("Qui choisit la musique en voiture ?","{p}|{q}|à tour de rôle|la radio"),
("Boisson de l'apéro ?","du vin|de la bière|un cocktail|un soft|du champagne"),
("Qui est le plus bordélique ?","{p}|{q}|égalité")]
K=[("Premier rendez-vous idéal ?","un dîner aux chandelles|un pique-nique|un musée|un bar à cocktails|une balade au coucher du soleil|un escape game"),
("Endroit préféré pour un bisou ?","sur le front|dans le cou|sur la main|sur les lèvres|sur la joue"),
("Qui fait le premier pas ?","{p}|{q}|personne|les deux en même temps"),
("Surnom le plus mignon ?","mon cœur|bébé|chéri(e)|mon chat|un surnom inventé"),
("Tenue de séduction ?","chemise ou robe chic|jean et t-shirt|tenue de sport|pyjama|tout en noir"),
("Câlin préféré ?","en cuillère|face à face|sur le canapé|debout dans la cuisine|sous la couette"),
("Message du matin idéal ?","un emoji cœur|un vocal|un long texto|une photo|rien, on se voit"),
("Qui est le plus jaloux ?","{p}|{q}|les deux|aucun"),
("Chanson pour un slow ?","une ballade pop|un vieux tube français|du jazz|du R&B|un classique des années 80"),
("Week-end en amoureux ?","un spa|un hôtel en ville|une cabane dans les arbres|un camping|chez soi sans téléphone"),
("Déclaration idéale ?","en tête-à-tête|par écrit|en public|par un geste|en chanson"),
("Qui embrasse le mieux ?","{p}|{q}|égalité parfaite"),
("Moment le plus romantique de la journée ?","le réveil|le déjeuner|le coucher du soleil|tard le soir"),
("Qui drague le mieux ?","{p}|{q}|personne"),
("Rencard surprise ?","un cours de cuisine|une soirée karaoké|un atelier poterie|une montgolfière|un bowling|un concert surprise"),
("Ce qui fait craquer en premier ?","le sourire|le regard|la voix|l'humour|le parfum|le style"),
("Qui rougit le plus vite ?","{p}|{q}|égalité")]
H=[("Moment préféré pour un câlin coquin ?","le matin|la sieste|le soir|en pleine nuit"),
("Lieu le plus excitant ?","la douche|la cuisine|une chambre d'hôtel|la voiture|en pleine nature|le canapé"),
("Qui prend le plus souvent l'initiative ?","{p}|{q}|à égalité"),
("Accessoire à tester ?","un bandeau|des menottes douces|de l'huile de massage|une plume|des glaçons|un jouet"),
("Ambiance idéale ?","bougies|lumière tamisée|noir complet|en plein jour|musique douce"),
("Préliminaires ?","longs et lents|courts et intenses|un massage|des baisers partout|des mots doux"),
("Tenue qui fait craquer ?","lingerie ou boxer sexy|une chemise ouverte|rien du tout|un uniforme|un peignoir"),
("Qui est le plus bruyant ?","{p}|{q}|égalité|aucun"),
("Fantasme à réaliser en premier ?","un jeu de rôle|un lieu insolite|un strip-tease|une nuit sans dormir|un week-end au lit"),
("Rythme préféré ?","doux et tendre|passionné|joueur|ça dépend du jour"),
("Qui domine ?","{p}|{q}|à tour de rôle|personne"),
("Après l'amour ?","un câlin|une douche|manger quelque chose|dormir|recommencer"),
("Sexto idéal ?","une photo suggestive|un message très cru|un vocal chuchoté|un emoji évocateur|une promesse pour ce soir"),
("Où un baiser rend fou ?","la nuque|le ventre|l'oreille|l'intérieur du poignet|le creux des reins|l'épaule"),
("Qui craque en premier ?","{p}|{q}|égalité"),
("Partie du corps préférée de l'autre ?","les lèvres|le cou|les mains|les fesses|les yeux|le dos")]
lv={'Classique':pairs(C,0),'Coquin':pairs(K,0),'Hot':pairs(H,0)}
json.dump({'name':'Débat en couple','desc':'Deux joueurs répondent en secret : êtes-vous sur la même longueur d\'onde ?','adult':False,'kind':'duo','img':'/img/duo.webp','levels':lv},open('../../content/duo.json','w'),ensure_ascii=False,indent=1)
print({k:len(v) for k,v in lv.items()})
