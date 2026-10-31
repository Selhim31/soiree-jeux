'use strict';
// Canal photo « vue unique » : stockage mémoire isolé, jamais exposé hors de take().
// Aucune journalisation, aucune écriture disque, aucun accès par l'admin.
const crypto=require('crypto');
const TTL=15*60e3,MAX_BYTES=900000,MAX_ROOM=20;
const store=new Map(); // id -> {code,from,to,t,buf}
function put(code,from,to,buf){
  if(!Buffer.isBuffer(buf)||buf.length>MAX_BYTES||buf[0]!==0xFF||buf[1]!==0xD8)return null;
  let n=0;for(const v of store.values())if(v.code===code)n++;if(n>=MAX_ROOM)return null;
  const id=crypto.randomBytes(12).toString('hex');store.set(id,{code,from,to,t:Date.now(),buf});return id}
// Renvoie {status, buf?}. Une seule lecture réussie possible : supprimée immédiatement.
function take(id,pid){const v=store.get(String(id));if(!v)return{status:410};if(!pid||pid!==v.to)return{status:403};store.delete(String(id));const buf=v.buf;v.buf=null;return{status:200,buf,code:v.code}}
function has(id){return store.has(String(id))}
function purgeRoom(code){for(const [k,v] of store)if(v.code===code){v.buf=null;store.delete(k)}}
function purgeOld(){const t=Date.now();const gone=[];for(const [k,v] of store)if(t-v.t>TTL){v.buf=null;store.delete(k);gone.push(k)}return gone}
function count(){return store.size}
module.exports=Object.freeze({put,take,has,purgeRoom,purgeOld,count,TTL});
