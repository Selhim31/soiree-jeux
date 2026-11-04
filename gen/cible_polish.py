# Retouches manuelles (règles ciblées) des réécritures {q} pour Défis + Actions d'Action ou Vérité.
import re
FIX=[
 (r"choisis un joueur et dis-lui ce qui te ferait craquer chez lui/elle","dis à {q} ce qui te ferait craquer chez lui/elle"),
 (r"choisis un joueur et décris-lui sa tenue","décris à {q} sa tenue"),
 (r"choisis un joueur avec qui tu ferais un slow et explique pourquoi","dis à {q} si tu ferais un slow avec lui/elle, et pourquoi"),
 (r"choisis la personne ici avec qui tu partagerais un bain \(moussant\) et pourquoi","dis à {q} si tu partagerais un bain (moussant) avec lui/elle, et pourquoi"),
 (r"choisis quelqu'un ici pour une nuit fictive et explique ton programme","propose à {q} une nuit fictive et explique ton programme"),
 (r"choisis un joueur : il/elle t'écrit","{q} t'écrit"),
 (r"choisis un joueur qui te donne un ordre sexuel à réaliser seul\(e\) hors caméra, puis raconte","laisse {q} te proposer un défi sensuel à réaliser seul(e) hors caméra (tu peux refuser), puis raconte-le-lui"),
 (r"envoie un emoji qui résume ta dernière nuit dans le chat","envoie à {q} un emoji qui résume ta dernière nuit"),
 (r"fais un bruit de claque sur tes fesses à la caméra, 3 fois","fais un bruit de claque sur tes fesses pour {q}, 3 fois"),
 (r"montre face caméra comment","montre à {q} comment"),
 (r"montre face caméra, par-dessus","montre à {q}, par-dessus"),
 (r"laisse le groupe","laisse {q}"),(r"choisie? par le groupe","choisi par {q}"),(r"le groupe le choisit","{q} le choisit"),
 (r"dès que quelqu'un dit","dès que {q} dit"),(r"jusqu'à ce que quelqu'un rigole","jusqu'à ce que {q} rigole"),
 (r"lis à voix haute","lis à {q}, à voix haute,"),(r"\bdis à voix haute","dis à {q}"),(r"explique à voix haute","explique à {q}"),
 (r"^parle comme","parle à {q} comme"),(r"^parle avec un accent","parle à {q} avec un accent"),(r"^parle (uniquement|en|sans|à la)","parle à {q} \\1"),
 (r"fais deviner","fais deviner à {q}"),
 (r"devant la caméra","devant {q}"),(r"en fixant la caméra","en fixant {q}"),(r"à ta caméra","à {q}"),(r"sur la caméra","vers {q}"),
 (r"à la caméra","à {q}"),(r"fais face caméra","fais face à {q} :"),(r"face caméra","face à {q}"),
 (r"^montre (?!à)","montre à {q} "),
]
def polish(t):
  m=re.match(r"^((?:Action : )?\{p\}, )pour \{q\}, (.*)$",t,re.S)
  if not m:return t
  pre,rest=m.groups()
  for a,b in FIX:
    n=re.sub(a,b,rest,count=1)
    if n!=rest:
      n=n.replace('à {q}, à voix haute, à voix haute','à {q}, à voix haute').replace(', à voix haute, ',', à voix haute ').replace('fais face à {q} : ta','fais face à {q} et offre-lui ta')
      return pre+n
  return t
