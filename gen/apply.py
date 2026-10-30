import json,sys
sys.path.insert(0,'.');from pools import *;from pools2 import *
def P(frames,topics):return {f.replace('{t}',t) for t in topics for f in frames}
def rd(n):return ['{p}, '+l.strip() for l in open('hand/'+n,encoding='utf-8') if l.strip()]
def setlvl(g,l,new,drop=set(),keep_old=True):
  d=json.load(open(f'../content/{g}.json'));old=d['levels'].get(l,[]) if keep_old else []
  kept=[x for x in old if x not in drop];d['levels'][l]=list(dict.fromkeys(new+kept));json.dump(d,open(f'../content/{g}.json','w'),ensure_ascii=False)
  print(g,l,'new',len(new),'kept',len(kept),'total',len(d['levels'][l]))
if __name__=='__main__':
  C=COQ_T+COQ_T2;H=HOT_T+HOT_T2;E=EXPL_T+EXPL_T2
  setlvl('coquin','Coquin',rd('coquin_q.txt'),P(COQ_FRAMES,C))
  setlvl('coquin','Hot',rd('coquin_h.txt'),P(HOT_FRAMES[:3],H))
  setlvl('hot','Hot',rd('hot_q.txt'),P(HOT_FRAMES[3:],H))
  setlvl('hot','Explicite',rd('expl_q.txt'),P(EXPL_FRAMES,E))
