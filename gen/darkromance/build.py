import json
S=lambda s:[x.strip() for x in s.strip().split('\n') if x.strip()]
def ver(L):
  out=[]
  for i,x in enumerate(L):
    f=['avoue au groupe','confie à {q}','raconte au groupe'][i%3] if not x.startswith('!') else None
    out.append('Vérité : {p}, '+(x[1:] if f is None else f+' '+x))
  return out
act=lambda L:['Action : {p}, '+x for x in L]
CV=S("""
quel méchant de roman ou de série t'a fait craquer malgré toi
le personnage toxique dont tu es tombé(e) amoureux ou amoureuse en lisant
le trope de dark romance qui te fait le plus d'effet (ennemis devenus amants, mafieux, prisonnier de son charme…)
la scène de livre ou de film que tu as relue ou revue en cachette
la fois où tu as trouvé la jalousie de quelqu'un flatteuse
le regard le plus intense qu'on t'ait lancé
le moment où tu as été attiré(e) par quelqu'un qu'il ne fallait pas
la phrase de méchant romantique qui te donnerait des frissons
ce qui t'attire chez les personnages froids et inaccessibles
si tu serais plutôt le prédateur charmant ou la proie consentante d'une histoire
la couverture de livre qui t'a donné envie de lire un roman interdit
ton plus gros « red flag » qui te plaît quand même
le personnage d'ici que tu vois en anti-héros de roman
la fois où tu as joué les mystérieux ou mystérieuses pour séduire
la tension la plus électrique que tu aies vécue sans qu'il se passe rien
l'interdit qui t'a le plus tenté(e) dans ta vie
le moment où tu as aimé être « réclamé(e) » par quelqu'un
ce que tu ferais si un milliardaire ténébreux te proposait un contrat
la saga dark romance que tu recommanderais à tout le monde ici
la scène de jalousie que tu as déjà faite et dont tu as un peu honte
ce que tu trouves sexy dans un personnage qui protège jusqu'à l'obsession
ton méchant de dessin animé préféré, honnêtement
l'histoire d'amour impossible qui te ferait tout quitter
le mot qui te ferait fondre s'il était murmuré d'une voix grave
la fois où tu as été jaloux ou jalouse sans aucun droit de l'être
ton fantasme de bal masqué où personne ne sait qui tu es
le genre d'ennemi que tu pourrais finir par aimer
ce que tu ferais si tu découvrais que ton crush mène une double vie
le décor parfait pour une histoire sombre : château, manoir, penthouse ou cabane perdue
le serment le plus fou que tu ferais par amour
la chose que tu interdirais à ton ou ta partenaire par jalousie
la fois où tu as voulu qu'on se batte pour toi (au sens figuré)
si tu préfères être le secret de quelqu'un ou avoir un secret
la lettre d'amour la plus sombre que tu pourrais écrire
le personnage de vampire, démon ou loup-garou qui te ferait céder
ce qui te plaît dans le côté « tu es à moi » des romans
la plus grosse obsession amoureuse de ta vie
la fois où tu as surveillé les réseaux de quelqu'un un peu trop longtemps
la promesse de vengeance la plus romantique que tu imagines
la tenue qui te donnerait l'air de sortir d'une dark romance
si tu pourrais tomber amoureux ou amoureuse de ton geôlier dans une histoire
ce que tu trouves irrésistible chez quelqu'un de dangereux en apparence
le personnage de cette partie qui serait le plus possessif selon toi
le rôle que tu voudrais jouer dans un roman : l'héritière, le mafieux, le garde du corps, l'espion
le moment où tu as aimé ne pas avoir le contrôle d'une situation
la musique parfaite pour une scène de dark romance
la fois où tu as craqué pour quelqu'un de beaucoup plus froid que toi
ce que tu penses vraiment des héros possessifs : fantasme ou alerte rouge
la réplique la plus culte d'un anti-héros selon toi
le sacrifice le plus fou que tu ferais pour la bonne personne
si tu as déjà été attiré(e) par quelqu'un uniquement parce qu'il t'ignorait
le pire rival amoureux que tu aies eu
ce qui te ferait sentir « choisi(e) » plus que tout
la fois où tu as provoqué la jalousie exprès
ce que tu ferais pour reconquérir quelqu'un dans une histoire sombre
le personnage qui te ressemble le plus dans les romans que tu lis
le côté sombre de toi que peu de gens connaissent
ta réaction si quelqu'un d'ici t'écrivait une lettre d'amour obsessionnelle (dans le jeu)
la chose la plus intense qu'on t'ait dite en te regardant dans les yeux
si tu préfères une histoire lente et brûlante ou un coup de foudre violent
ce que tu écrirais dans le journal intime d'un méchant amoureux de toi
le pire « non » que tu aies transformé en « peut-être »
la règle que tu briserais pour la bonne personne
ce qui te fait le plus peur et le plus envie dans un amour fusionnel
la fois où tu t'es senti(e) observé(e) et que ça t'a plu
le pacte que tu signerais pour une nuit avec ton personnage préféré
la qualité « dark » que tu cherches chez un ou une partenaire
le moment où un regard t'a fait perdre tes moyens
ton personnage de série le plus manipulateur et pourtant adoré
ce que tu ferais si tu étais enfermé(e) une nuit dans une bibliothèque avec ton crush
la scène de baiser sous la pluie version dark que tu imagines
le titre du roman dark romance qui raconterait ta vie amoureuse
la jalousie la plus mignonne que quelqu'un t'ait montrée
la chose que tu n'avoues jamais sur tes goûts en romance
ce que tu ressentirais si quelqu'un d'ici te disait « tu m'appartiens » pour jouer
la ville parfaite pour une histoire d'amour interdite
le duel verbal le plus intense que tu aies eu avec quelqu'un qui te plaisait
l'objet qui serait le symbole de ton histoire d'amour sombre
ce qui t'attire chez les gens qui ne sourient presque jamais
le cliché de dark romance qui te fait lever les yeux au ciel
le moment où tu as su que tu étais « foutu(e) » face à quelqu'un
le cadeau le plus possessif qu'on puisse offrir selon toi
le personnage que tu sauverais en premier dans un roman, même s'il est le méchant
la confession la plus sombre que tu pourrais faire à voix basse ce soir
ce qui t'a le plus troublé(e) dans un livre ou un film interdit aux moins de 18 ans
ton plus beau souvenir d'attirance secrète
la fois où tu as obéi à quelqu'un juste pour voir jusqu'où ça irait
le jeu de regards le plus long que tu aies tenu avec quelqu'un
ce que tu trouves romantique dans une rivalité
""")
CA=S("""
lis une réplique de méchant romantique de ton invention, voix grave, face caméra.
fais une déclaration d'amour à {q} façon anti-héros ténébreux, 20 secondes.
regarde la caméra sans sourire pendant 15 secondes avec ton regard le plus froid.
improvise la première phrase d'un roman dark romance dont {q} est le héros.
annonce à {q} « tu ne m'échapperas pas » de la façon la plus théâtrale possible.
mets une musique sombre et fais une entrée de méchant face caméra.
décris {q} comme le personnage principal d'une dark romance, en trois phrases.
écris un serment de loyauté éternelle à {q} et lis-le à voix haute.
joue une scène de rivaux qui se détestent et s'attirent avec {q}, 30 secondes, en vocal.
porte quelque chose de noir jusqu'à la fin du tour et justifie ton look de méchant.
choisis un surnom de personnage sombre pour chaque joueur.
invente le titre et la quatrième de couverture d'un roman sur toi et {q}.
murmure au micro la réplique la plus possessive (mais tendre) que tu puisses imaginer.
mime une scène de bal masqué où tu repères {q} dans la foule.
lis un extrait de message comme si c'était une lettre interdite du XIXe siècle.
fais le portrait-robot du parfait méchant romantique, face caméra.
écris à {q} un mot doux version dark romance et lis-le au groupe.
donne un ordre gentiment autoritaire à {q} pour le prochain tour (il/elle peut refuser).
joue un garde du corps qui protège {q} d'un danger imaginaire, 20 secondes.
fais semblant de signer un contrat secret avec {q} et lis-en les trois clauses.
raconte en 30 secondes la scène où tu enlèves (pour de faux) {q} d'un bal pour le/la sauver.
fais ton meilleur regard « je sais tout de toi » à {q} pendant 10 secondes.
invente le blason de ta famille de vampires et présente-le.
chuchote le prénom de {q} comme un méchant qui vient de le/la retrouver.
improvise un monologue de jaloux dramatique sur un rival imaginaire de {q}.
décris ton repaire secret de personnage sombre.
joue un duel verbal avec {q} : chacun lance une pique élégante, trois fois.
imite la voix off d'une bande-annonce de dark romance sur la soirée.
choisis la chanson du générique de ton histoire avec {q} et chante le refrain.
déclare à la caméra pourquoi {q} est ton « ennemi préféré ».
écris trois red flags romantiques que tu assumes et lis-les.
fais la scène du méchant qui tend la main à {q} pour danser, face caméra.
annonce les règles de ton royaume imaginaire où {q} est ta prisonnière ou ton prisonnier d'honneur (pour rire).
invente la phrase que ton personnage tatouerait pour {q}.
décris le moment où ton personnage sombre tombe enfin amoureux, voix tremblante.
lis la première ligne de ton journal intime de méchant, face caméra.
joue un espion qui découvre que sa cible ({q}) est l'amour de sa vie, 20 secondes.
prends une pose de couverture de dark romance, prends-toi en photo et envoie-la à {q} (par ta messagerie).
enregistre-toi en train de dire « tu es à moi… pour ce jeu » de ta voix la plus grave et envoie le vocal à {q} (par ta messagerie).
filme-toi en train d'allumer une bougie dans le noir avec un regard intense et envoie la vidéo à {q} (par ta messagerie).
invente une malédiction romantique qui lie ton destin à celui de {q}.
fais une révérence de comte ou de comtesse ténébreuse à chaque joueur.
décris en 20 secondes la cape, le masque ou l'arme de ton personnage.
choisis qui ici serait ton rival et qui serait ton âme damnée, et explique.
raconte la fin tragique (mais belle) de ton histoire avec {q}.
improvise une scène d'interrogatoire romantique : pose trois questions à {q} d'un ton glacial.
joue la scène où tu refuses d'avouer tes sentiments à {q} alors que tout te trahit.
fais un toast sombre et élégant à la soirée.
écris un poème de quatre vers sur l'obsession et lis-le.
imite un majordome inquiétant qui annonce l'arrivée de {q}.
lis à voix haute un faux avis de recherche romantique concernant {q}.
décris le pacte de sang (symbolique, pas de vrai sang) que vous signeriez avec {q}.
mets un fond sombre derrière toi et joue le méchant d'une scène pendant 15 secondes.
déclame la réplique « tu aurais dû fuir quand il était encore temps » à {q}.
choisis un joueur qui devient ton protégé jusqu'à la fin de la partie et présente-le.
""")
KV=S("""
si tu préfères donner les ordres ou les recevoir dans un jeu de séduction
la règle que tu imposerais à {q} pour une soirée où tu as le pouvoir
le moment où tu as adoré perdre le contrôle face à quelqu'un
ce que ça te fait quand quelqu'un te dit « obéis » à l'oreille
le jeu de pouvoir le plus excitant que tu aies déjà joué
le mot de sécurité que tu choisirais pour un jeu de rôle
la chose que tu aimerais qu'on t'interdise pour mieux la désirer
ce que tu ressens quand quelqu'un est jaloux de toi avec intensité
le rôle que tu prendrais dans un jeu de domination : le maître du jeu ou celui qui se laisse guider
la phrase possessive qui te fait plus d'effet qu'elle ne devrait
la fois où tu as testé les limites de quelqu'un en flirtant
ce qui te fait céder plus vite : un ordre, un regard ou un murmure
la punition (douce et coquine) que tu donnerais à {q} pour avoir triché au jeu
si tu aimerais qu'on te fasse attendre longtemps avant un baiser
le jeu de rôle dark romance que tu proposerais à quelqu'un d'ici : mafieux, prince, voleur, garde du corps
ce que tu ferais si {q} te donnait un ordre coquin maintenant (tu peux refuser)
ton plus gros fantasme de jalousie mise en scène
la façon dont tu aimes qu'on te « réclame » en soirée
le geste de possession qui te fait fondre : main sur la nuque, au creux des reins, sur la mâchoire
si tu as déjà joué au chat et à la souris avec quelqu'un pendant des semaines
le pouvoir que tu aimes avoir sur quelqu'un qui te désire
le moment où tu as fait exprès de rendre quelqu'un fou de jalousie
ce que tu porterais pour asseoir ton autorité dans un jeu de séduction
si tu aimes être regardé(e) sans avoir le droit de toucher
la chose la plus audacieuse qu'on t'ait ordonnée en jouant
la limite que tu poses toujours, même dans les jeux les plus fous
ce qui rend un rival amoureux excitant à tes yeux
si tu préfères être désiré(e) en secret ou exhibé(e) fièrement
l'endroit où tu aimerais être plaqué(e) doucement contre un mur
si tu as déjà été attiré(e) par quelqu'un qui te commandait au travail
le défi que tu lancerais à {q} pour prouver sa loyauté
ce qui te fait le plus d'effet : la voix basse, le silence ou un ordre sec
la tenue de {q} qui te donnerait envie de le/la « garder pour toi »
le contrat de séduction que tu ferais signer à ton crush : trois clauses
la fois où tu as obéi à un regard sans un mot
ton plus grand plaisir dans un jeu de pouvoir : gagner ou céder
ce que tu ferais d'une soirée entière où {q} doit dire oui à tout (dans tes limites et les siennes)
la jalousie que tu trouves sexy et celle qui te refroidit
si tu as déjà demandé à quelqu'un de te supplier pour un baiser
le surnom de domination (gentil) que tu donnerais à {q}
ce qui te trouble le plus dans les scènes de soumission des romans
la fois où tu as testé ton pouvoir de séduction sur quelqu'un d'inaccessible
si tu aimerais être attaché(e) avec un ruban de soie pour un jeu sage
la règle que tu briserais exprès pour être « puni(e) » gentiment
ce que tu ressens quand on te tient fermement la main pour te guider
si tu préfères mener la danse ou te laisser emporter
la chose qui te ferait dire « oui, maître » ou « oui, maîtresse » en riant
le jeu de regards le plus troublant que tu aies eu avec quelqu'un ici
si tu as déjà eu envie d'être kidnappé(e) par ton crush pour un week-end surprise (organisé et consenti)
le genre de jaloux ou jalouse que tu es vraiment
l'ordre coquin que tu donnerais à toute la table si tu étais roi ou reine de la soirée
si les mots « tu es à moi » te font fondre ou fuir
le cadeau que tu offrirais pour marquer ton territoire (avec humour)
ta réaction si {q} te bandait les yeux pour une surprise
la phrase qui te ferait abandonner toute résistance
ce que tu aimes dans l'attente et la frustration en séduction
la tension la plus forte que tu aies ressentie avec un « ennemi »
le jeu de rôle prisonnier / geôlier que tu imagines (tout en douceur)
ce que tu ferais si tu avais {q} à ta merci pour un jeu de questions
le compliment possessif le plus troublant qu'on t'ait fait
si tu as déjà provoqué quelqu'un exprès pour qu'il ou elle te « remette à ta place »
la règle d'or de ton jeu de pouvoir idéal
ce que tu ressentirais si on te donnait des ordres par messages toute une soirée
le personnage dominant de roman qui te ferait obéir sans discuter
le moment où tu as compris que tu aimais un peu la soumission (ou pas du tout)
ce qui te rend le plus possessif ou possessive
la façon dont tu aimes qu'on te fasse comprendre que tu plais
si tu préfères une guerre de séduction ou une capitulation immédiate
la chose que tu ferais pour que {q} soit jaloux ou jalouse ce soir (dans le jeu)
le geste qui prouverait ta loyauté à ton partenaire de jeu
si tu as déjà eu un crush sur quelqu'un qui jouait les intouchables
le scénario de bal masqué coquin que tu imagines
ce qui te fait le plus d'effet : être choisi(e) ou choisir
si tu aimerais qu'on décide de ta tenue pour un rendez-vous
le pouvoir secret que tu as sur les gens qui te plaisent
ton plus grand plaisir coupable en matière de jalousie
la réponse que tu donnerais si {q} te demandait « à qui appartiens-tu ce soir ? »
le jeu interdit que tu as toujours voulu tester
ce que tu ferais si tu étais le ou la seule à connaître le secret de {q}
la fois où tu as aimé être défié(e) par quelqu'un qui te plaisait
""")
KA=S("""
donne trois ordres coquins à {q} ; il/elle en choisit un à faire face caméra (ou refuse et boit).
regarde {q} dans la caméra et dis « à genoux… devant ton clavier » le plus sérieusement possible.
pendant un tour, {q} décide de chacune de tes réponses par « oui » ou « non ».
joue 30 secondes le mafieux jaloux qui découvre que {q} a souri à quelqu'un d'autre.
mets-toi dans la peau d'un geôlier charmant et négocie avec {q} les conditions de sa « libération ».
laisse {q} choisir la façon dont tu t'assieds jusqu'au prochain tour (dans les limites du raisonnable).
murmure à {q} trois règles qu'il/elle devra respecter jusqu'à la fin de la partie (il/elle peut refuser).
fais une démonstration de regard dominant puis de regard soumis face caméra, 5 secondes chacun.
écris un contrat de séduction à trois clauses pour {q} et lis-le.
dis à {q} ce que tu lui ferais faire si tu étais son maître ou sa maîtresse de jeu pour une soirée (version coquine).
bande-toi les yeux avec un foulard pendant un tour et laisse {q} te guider à la voix.
joue une scène d'interrogatoire coquin avec {q} : il/elle t'accuse d'avoir volé son cœur.
enregistre-toi en train de dire « c'est moi qui décide ce soir » d'une voix basse et envoie le vocal à {q} (par ta messagerie).
prends une photo de ta main posée sur ta nuque de façon possessive et envoie-la à {q} (par ta messagerie).
filme ton regard le plus provocateur 10 secondes et envoie la vidéo à {q} (par ta messagerie).
obéis à un ordre (sage) de chaque joueur jusqu'à ton prochain tour.
choisis un joueur qui devient ton « garde du corps » et doit te complimenter à chaque tour.
mime la scène où tu plaques doucement {q} contre un mur imaginaire, face caméra.
pendant 1 minute, réponds à {q} uniquement par « oui » ou par « à vos ordres ».
fais une crise de jalousie théâtrale à {q} pendant 20 secondes.
noue un ruban, une cravate ou un foulard à ton poignet et garde-le jusqu'à la fin, signe que tu « appartiens » à {q} pour la partie.
laisse {q} te donner un surnom de soumis(e) ou de dominant(e) que tout le monde utilise jusqu'à la fin.
joue le rôle d'un prince ou d'une princesse qui exige un baiser (virtuel) de {q}.
demande à {q} de te supplier pour un compliment, puis fais-le attendre 10 secondes.
fais à {q} une liste de ce qu'il/elle n'a « pas le droit » de faire ce soir, pour rire.
déclare à la caméra pourquoi {q} est désormais « sous ta protection ».
pose ta main sur ton cœur et fixe la caméra 5 secondes comme une héroïne ou un héros de roman.
laisse {q} choisir une phrase que tu dois répéter à chaque tour.
joue un duel de regards avec {q} : le premier qui baisse les yeux obéit à un gage coquin de l'autre.
mords-toi la lèvre en regardant {q} et dis « tu n'as aucune idée de ce que je pense ».
raconte à {q} la nuit où ton personnage de mafieux le/la ramène chez lui pour le/la protéger.
prends la pose de la proie et celle du prédateur face caméra, et laisse le groupe voter.
joue un roi ou une reine qui choisit son favori parmi les joueurs.
fais lire à {q} une phrase possessive de ton choix, à toi, face caméra.
pendant un tour, appelle {q} « mon trésor » d'une voix menaçante et tendre.
laisse {q} fixer la durée de ton prochain regard caméra sans cligner.
enregistre un vocal où tu donnes à {q} trois ordres coquins pour demain et envoie-le (par ta messagerie).
retire un accessoire lentement sur ordre de {q}, face caméra.
joue la scène où tu attrapes le poignet de {q} pour l'empêcher de partir d'un bal (en mime).
choisis un mot de sécurité pour la partie et explique-le au groupe d'un ton très sérieux.
dis à {q} ce qu'il/elle devra faire pour mériter ta confiance.
fais la voix d'un méchant qui chuchote les règles d'un jeu interdit à {q}.
prends-toi en photo avec un regard de défi et envoie-la à {q} avec un ordre coquin en légende (par ta messagerie).
filme-toi en train de dire « tu vas regretter de m'avoir provoqué(e)… ou pas » et envoie la vidéo à {q} (par ta messagerie).
laisse {q} choisir ta prochaine tenue (accessoire ou haut) pour la partie, s'il/si elle le veut.
joue une soumission théâtrale : jure fidélité à {q} un genou à terre face caméra.
joue une domination théâtrale : fais jurer fidélité à {q} face caméra.
demande à {q} de te donner un « ordre secret » par message que tu dois exécuter avant la fin.
pendant une minute, {q} t'interdit de sourire ; s'il/si elle te fait craquer, il/elle gagne un gage.
dis à {q} trois choses que tu lui ordonnerais de porter pour un rendez-vous.
joue une enchère imaginaire où tu « achètes » une danse avec {q}.
fais la scène du chevalier noir qui se met au service de {q}.
regarde {q} et donne-lui une note de « loyauté » en justifiant.
improvise une scène de jalousie entre deux joueurs (avec leur accord) façon série dramatique.
laisse le groupe décider si tu dois jouer le dominant ou le soumis au prochain tour.
choisis un joueur qui a le droit de te poser une question à laquelle tu dois obéir de répondre.
filme tes mains qui serrent un ruban de soie, puis envoie la vidéo à {q} avec le message « bientôt » (par ta messagerie).
enregistre ta voix en train de murmurer « dis-le : tu es à qui ? » et envoie le vocal à {q} (par ta messagerie).
""")
HV=S("""
!quel est ton fantasme de domination le plus hard, sans censure ?
!quel est ton fantasme de soumission le plus extrême que tu n'as jamais avoué ?
!dans un jeu consenti, jusqu'où accepterais-tu d'être attaché(e) et à la merci de quelqu'un ?
!quel scénario de dark romance aimerais-tu rejouer au lit, scène par scène ?
!quelle est la chose la plus crue que tu aimerais qu'on t'ordonne pendant l'acte ?
!quel jeu de rôle « prisonnier et geôlier » te ferait le plus d'effet, en détails ?
!préfères-tu être pris(e) avec autorité ou prendre quelqu'un avec autorité ? Décris.
!quelle humiliation verbale consentie t'excite, et laquelle est ta limite absolue ?
!quel est le mot cru que tu aimerais qu'on te grogne à l'oreille ?
!as-tu déjà été dominé(e) au lit ? Raconte ce qui t'a le plus marqué.
!as-tu déjà dominé quelqu'un au lit ? Jusqu'où es-tu allé(e) ?
!quelle partie de ton corps aimerais-tu qu'on « réclame » comme sienne ?
!quel accessoire de domination as-tu déjà utilisé ou rêves-tu d'utiliser : menottes, cravache, bandeau, collier ?
!la fessée : donnée, reçue, jamais ? Jusqu'où ?
!quel est ton fantasme de jalousie qui finit au lit ?
!aimerais-tu qu'on te fasse supplier avant de te faire jouir ? Raconte comment.
!quel est le contrat le plus hard que tu signerais pour une nuit de dark romance ?
!quel serait ton mot de sécurité et dans quelle situation tu l'utiliserais ?
!quelle est la position où tu te sens le plus dominé(e) ?
!quelle est la position où tu te sens le plus dominant(e) ?
!la privation d'orgasme (edging) : fantasme ou torture ? Raconte.
!aimerais-tu être exhibé(e) à ton ou ta partenaire comme un trophée, dans un jeu ?
!quelle scène de livre érotique sombre aimerais-tu vivre exactement ?
!as-tu déjà eu une relation « maître / soumis » même le temps d'une nuit ?
!as-tu déjà aimé qu'on te tire les cheveux pendant l'acte ?
!quel est le dirty talk possessif qui te ferait perdre la tête ?
!quel est le rôle de méchant que tu aimerais que ton ou ta partenaire joue pour toi, une nuit entière ?
!quel est ton fantasme de soumission en public (discret, entre adultes consentants) ?
!as-tu déjà joué à être la « proie » dans un jeu de poursuite coquin ?
!quel ordre sexuel aimerais-tu donner à quelqu'un d'ici, dans un jeu imaginaire ?
!quelle est la chose la plus sale que tu aies murmurée à quelqu'un en le dominant ?
!aimerais-tu porter un collier symbolique pendant une nuit ? Pour qui ?
!quel est le fantasme dark romance que tu trouves le plus tabou et le plus excitant ?
!quelle scène de jalousie possessive suivie d'une réconciliation torride imagines-tu ?
!jusqu'où irait ton personnage mafieux pour « posséder » sa partenaire consentante, au lit ?
!aimerais-tu qu'on te bande les yeux et qu'on t'attache pour une nuit entière de jeu ?
!quel est ton rapport aux marques (suçons, griffures légères) laissées comme « signature » ?
!as-tu déjà été excité(e) en lisant une scène très hard d'un roman ? Laquelle ?
!préfères-tu qu'on te commande en douceur ou durement, dans un jeu consenti ?
!quelle est la chose la plus soumise que tu aies faite par désir ?
!quelle est la chose la plus dominante que tu aies faite par désir ?
!as-tu déjà eu envie de jouer un enlèvement scénarisé et consenti avec ton ou ta partenaire ?
!quel est le jouet le plus hard que tu oserais utiliser dans un jeu de domination ?
!aimerais-tu être attaché(e) devant un miroir pour tout regarder ?
!quelle est la phrase crue qui te ferait obéir instantanément ?
!as-tu déjà joui sur ordre ?
!quel est ton fantasme de « punition » sexuelle consentie ?
!aimerais-tu jouer un rôle d'esclave ou de maître le temps d'un week-end, avec des règles claires ?
!quelle partie d'une scène BDSM te tente et laquelle te fait peur ?
!quel est le pire endroit (et le plus excitant) où quelqu'un pourrait te dominer ?
!aimerais-tu qu'on te fasse attendre une heure, nu(e), avant de te toucher (dans un jeu consenti) ?
!quelle est ta réaction au mot « supplie » prononcé à l'oreille ?
!quelle est la chose la plus possessive qu'un partenaire t'ait dite pendant l'acte ?
!aimerais-tu partager un fantasme de plan à trois où tu serais le centre de toutes les attentions ?
!quelle est ta limite dure dans un jeu de domination, celle que personne ne franchit ?
!as-tu déjà demandé à quelqu'un de te traiter comme dans un roman très hard ?
!si tu étais le méchant d'une dark romance, que ferais-tu à ta partenaire consentante la première nuit ?
!quel est le dernier fantasme sombre qui t'est passé par la tête ?
!aimerais-tu être filmé(e) pendant un jeu de domination, en privé et avec accord ?
!as-tu déjà eu un orgasme rien qu'en obéissant à des mots ?
!quel est le rôle que tu joues au lit et que personne ici ne soupçonne ?
!jusqu'où laisserais-tu {q} décider de ton plaisir dans un jeu imaginaire ?
!quel ordre cru aimerais-tu que {q} te donne, dans un jeu de rôle ?
!quelle partie du corps de {q} aimerais-tu « réclamer » dans un fantasme ?
!dirais-tu oui à une nuit où {q} a tous les pouvoirs, dans des limites fixées ensemble ?
!quel serait ton premier ordre à {q} si tu avais tous les pouvoirs pour une nuit consentie ?
!quelle tenue de dominatrice ou de dominateur aimerais-tu voir sur {q} ?
!avoue ce que tu ferais à {q} attaché(e) avec un ruban de soie, en détails.
!quelle scène hard de roman aimerais-tu lire à voix haute à {q} ?
!quel est le fantasme sombre que tu as déjà eu en pensant à {q} ?
!aimerais-tu que {q} te fasse supplier ? Pour quoi exactement ?
!quel mot cru voudrais-tu entendre de la bouche de {q} ?
!décris la nuit de domination parfaite, de la première minute à la dernière.
!quelle est la chose que tu ne pardonnerais jamais au lit, même dans un jeu ?
!as-tu déjà eu des sentiments plus forts après une nuit de domination ?
!quel est le compliment le plus cru qu'on t'ait fait pendant que tu étais dominé(e) ?
!l'aftercare (les câlins après un jeu intense) : indispensable ou inutile ?
!quel est ton scénario de « vengeance » sexuelle consentie dans un couple ?
!aimerais-tu être le jouet d'un couple pour une nuit, dans un cadre consenti ?
!quelle est la chose la plus soumise qu'on t'ait demandée et que tu as refusée ?
!quel est le jeu de cire, de glaçons ou de plumes que tu aimerais tester en étant attaché(e) ?
!as-tu déjà eu un fantasme de mafieux, de vampire ou de démon pendant l'acte ?
!quel est le bruit que tu fais quand on te domine vraiment bien ?
!avec quel personnage de dark romance coucherais-tu sans hésiter, et comment ?
!quel est le plus gros tabou que tu aimerais briser au lit ?
!quel ordre donnerais-tu à toute la partie si c'était une soirée privée entre adultes consentants ?
!quelle trace aimerais-tu laisser sur quelqu'un pour signer ta nuit (rien de dangereux) ?
!as-tu déjà dit « encore » alors que tu avais promis d'arrêter ?
!quelle est la chose la plus « dark » de ta vie sexuelle ?
""")
HA=S("""
décris à {q} au micro, sans censure, ta nuit de domination idéale avec lui/elle, en 1 minute.
laisse {q} te dicter trois ordres coquins à exécuter face caméra, habillé(e) ou en sous-vêtements selon ton choix.
attache tes poignets avec un foulard (sans serrer, que tu peux défaire seul(e)) et garde-le pendant un tour, caméra on.
retire un vêtement sur ordre de {q}, lentement, face caméra (avec l'accord du groupe).
gémis le mot « maître » ou « maîtresse » comme dans un roman, 10 secondes, micro ouvert.
dis à {q} trois choses crues que tu lui ferais s'il/si elle était ton ou ta soumis(e) ce soir.
fais un dirty talk dominant de 30 secondes à la caméra comme si {q} était à tes pieds.
fais un dirty talk soumis de 30 secondes à la caméra comme si {q} te donnait les ordres.
mets-toi à genoux face caméra et dis à {q} « que voulez-vous que je fasse ? » d'une voix soumise.
laisse {q} choisir un vêtement que tu enlèves et dont tu te passes jusqu'à ton prochain tour (avec son accord et celui du groupe).
filme-toi en train de nouer une cravate ou un ruban autour de tes poignets et envoie la vidéo à {q} (par ta messagerie, avec son accord).
prends-toi en photo en sous-vêtements avec un bandeau sur les yeux et envoie-la à {q} (par ta messagerie, avec son accord).
enregistre un vocal où tu supplies {q} de te toucher, 20 secondes, et envoie-le (par ta messagerie, avec son accord).
enregistre un vocal où tu ordonnes à {q} ce qu'il/elle va te faire, sans censure, et envoie-le (par ta messagerie, avec son accord).
caresse ton propre corps par-dessus tes vêtements en suivant les ordres de {q} pendant 30 secondes, caméra on.
lis à voix haute une scène très hard que tu improvises, où {q} te domine (fiction, à voix haute).
lis à voix haute une scène très hard que tu improvises, où tu domines {q} (fiction, à voix haute).
mets ton doigt sur tes lèvres et ordonne à {q} de se taire pendant que tu le/la décris nu(e) dans un fantasme.
pose ta main sur ta cuisse et fais-la remonter lentement en fixant {q} à la caméra, 15 secondes.
fais semblant d'être menotté(e) au lit et supplie la caméra, 15 secondes.
donne une fessée sonore sur ta propre fesse à la caméra, trois fois, sur ordre de {q}.
décris à {q} précisément comment tu l'attacherais et ce que tu ferais ensuite, 45 secondes.
laisse {q} te donner un ordre très hard (dans tes limites) que tu exécutes par message privé après la partie.
fais une danse de soumission lascive de 20 secondes pour {q}, caméra on.
fais une danse de domination lascive de 20 secondes pour {q}, caméra on.
filme ton regard soumis en te mordant la lèvre, puis ton regard dominant, et envoie la vidéo à {q} (par ta messagerie, avec son accord).
prends-toi en photo dans ta pose la plus soumise (habillée ou en sous-vêtements, selon ton choix) et envoie-la à {q} (par ta messagerie, avec son accord).
prends-toi en photo dans ta pose la plus dominante (habillée ou en sous-vêtements, selon ton choix) et envoie-la à {q} (par ta messagerie, avec son accord).
reste en sous-vêtements sous une couverture jusqu'à ton prochain tour, cadré(e) au-dessus de la taille (avec l'accord du groupe).
murmure « je suis à toi, fais de moi ce que tu veux » à {q} en le/la fixant, micro collé.
murmure « tu es à moi, et tu vas le sentir » à {q} en le/la fixant, micro collé.
pendant 1 minute, réponds à chaque phrase de {q} par un gémissement ou un « oui, maître/maîtresse ».
dis à {q} ce que tu ferais avec un bandeau, des menottes et une plume, en détails.
décris à {q} l'endroit précis de son corps où tu laisserais ta marque (sans danger).
écris à {q} par message privé le scénario de dark romance le plus hard que tu oses, puis lis-en la première phrase au groupe.
laisse {q} choisir comment tu dois t'asseoir et te tenir jusqu'à ton prochain tour (sans danger).
fais semblant de te faire plaquer contre un mur, habillé(e), 10 secondes, face caméra.
joue au micro une scène de geôlier et de prisonnier très explicite avec {q} en vocal, 1 minute (avec son accord).
dis à {q} le mot le plus cru que tu oses, en le/la regardant dans les yeux.
envoie à {q} un vocal de toi en train de respirer fort en imaginant qu'il/elle te domine, 20 secondes (par ta messagerie, avec son accord).
décris ton orgasme idéal sous la domination de {q}, en 30 secondes.
caresse lentement ta nuque et tes clavicules du bout des doigts en fixant {q}, 10 secondes.
retire ton haut sur ordre de {q} et reste ainsi jusqu'à ton prochain tour, caméra on (avec l'accord du groupe).
laisse {q} te dicter une pose sexy de soumission et tiens-la 20 secondes face caméra.
dis à {q} ce que tu lui interdirais de faire pendant une nuit entière… et comment tu le/la récompenserais.
mime la scène où tu attaches {q} au lit avec des rubans de soie, en commentant chaque geste.
mime la scène où {q} t'attache au lit avec des rubans de soie, en commentant chaque sensation.
filme-toi en train de passer lentement un foulard sur ton corps habillé et envoie la vidéo à {q} (par ta messagerie, avec son accord).
enregistre-toi en train de dire « à genoux » de cinq façons, de la plus douce à la plus autoritaire, et envoie le vocal à {q} (par ta messagerie).
décris à {q} au micro la première nuit de ton personnage dark romance avec lui/elle, sans aucune censure.
""")
CV+=S('''
le pire rendez-vous avec quelqu'un qui jouait les ténébreux
la phrase d'un livre qui t'a fait frissonner pendant des jours
ce que tu ferais si tu recevais des lettres anonymes d'un admirateur ici (dans le jeu)
la fois où tu as été fasciné(e) par quelqu'un que tout le monde détestait
le château, le penthouse ou la villa où se passerait ton histoire sombre
si tu préfères les héros brisés ou les héroïnes impitoyables
''')
KV+=S('''
le geste autoritaire qui te ferait taire instantanément
ce que tu ferais si {q} t'ordonnait de ne regarder que lui/elle toute la soirée
la frontière entre jeu de pouvoir et vraie jalousie pour toi
le défi de séduction que tu n'as jamais osé relever
si tu aimes qu'on te prenne par la main pour quitter une soirée sans rien demander
le jeu de pouvoir que tu aimerais tester par messages
''')
KA+=S('''
choisis un joueur qui devra te demander la permission avant de parler pendant un tour (il/elle peut refuser).
joue une scène où tu « confisques » le téléphone imaginaire de {q} par jalousie, 15 secondes.
donne à {q} un gage coquin qu'il/elle peut accepter ou échanger contre un aveu.
improvise une scène de rivaux dans un ascenseur avec {q}, 30 secondes, en vocal.
pendant un tour, chaque phrase de {q} doit commencer par « Mon seigneur » ou « Ma reine ».
dis à {q} quelle punition coquine il/elle mérite pour l'avoir fait attendre.
''')
HV+=S('''
!quel est le fantasme hard que tu as déjà tapé dans une barre de recherche ?
!aimerais-tu être dominé(e) par deux personnes à la fois, dans un jeu consenti ?
!quel est ton scénario de « obligés de partager le même lit » version dark romance, qui finit en nuit torride ?
!quelle est la chose qui te rend le plus soumis(e) : la voix, les mains ou les mots crus ?
!aimerais-tu qu'on décide de tes orgasmes pendant une semaine entière ?
!as-tu déjà fait l'amour pendant une dispute de jalousie ? Raconte.
''')
HA+=S('''
dis à {q}, d'une voix autoritaire, ce qu'il/elle a le droit de faire avec ta bouche dans un fantasme.
laisse {q} choisir le mot que tu dois gémir face caméra, 5 secondes.
retire ton bas sous ta couverture sur ordre de {q} et reste cadré(e) au-dessus de la taille jusqu'au prochain tour (avec l'accord du groupe).
envoie à {q} une photo de toi les poignets croisés, comme attaché(e), en sous-vêtements (par ta messagerie, avec son accord).
fais à {q} la liste de tes trois limites dures et de trois choses que tu le/la laisserais faire.
décris à {q} une nuit où tu es « sa propriété » de minuit à l'aube, dans un jeu consenti, sans censure.
''')
lv={'Classique':ver(CV)+act(CA),'Coquin':ver(KV)+act(KA),'Hot':['Vérité : {p}, '+x[1:] for x in HV]+act(HA)}
for k,v in lv.items(): assert len(v)==len(set(v))
json.dump({'name':'Dark Romance','desc':"Possession, jalousie, attirance interdite et jeux de pouvoir façon romans sombres. Entre adultes consentants.",'adult':True,'img':'/img/darkromance.webp','levels':lv},open('darkromance.json','w'),ensure_ascii=False,indent=1)
with open('../darkromance_draft.txt','w') as f:
  for k,v in lv.items(): f.write(f'=== {k} ({len(v)}) ===\n'+'\n'.join(v)+'\n\n')
print({k:len(v) for k,v in lv.items()})
