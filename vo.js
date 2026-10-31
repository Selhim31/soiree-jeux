'use strict';
// Canal photo « vue unique » : stockage mémoire isolé, jamais exposé hors de take().
// Aucune journalisation, aucune écriture disque, aucun accès par l'admin.
const crypto=require('crypto');
const TTL=15*60e3,MAX_IMG=900000,MAX_VID=8.5e6,MAX_ROOM=20,ROOM_BYTES=30e6,ALL_BYTES=80e6;
const isJpg=b=>b[0]===0xFF&&b[1]===0xD8;const isVid=b=>b.length>12&&(b.toString('latin1',4,8)==='ftyp'||(b[0]===0x1A&&b[1]===0x45&&b[2]===0xDF&&b[3]===0xA3));
const store=new Map(); // id -> {code,from,to,t,buf}
function put(code,from,to,buf,mime){
  if(!Buffer.isBuffer(buf))return null;mime=mime||'image/jpeg';
  if(mime==='image/jpeg'){if(buf.length>MAX_IMG||!isJpg(buf))return null}else if(/^video\/(mp4|webm|quicktime)$/.test(mime)){if(buf.length>MAX_VID||!isVid(buf))return null}else return null;
  let n=0,rb=0,ab=0;for(const v of store.values()){ab+=v.buf.length;if(v.code===code){n++;rb+=v.buf.length}}if(n>=MAX_ROOM||rb+buf.length>ROOM_BYTES||ab+buf.length>ALL_BYTES)return null;
  const id=crypto.randomBytes(12).toString('hex');store.set(id,{code,from,to,t:Date.now(),buf,mime});return id}
// Renvoie {status, buf?}. Une seule lecture réussie possible : supprimée immédiatement.
function take(id,pid){const v=store.get(String(id));if(!v)return{status:410};if(!pid||pid!==v.to)return{status:403};store.delete(String(id));const buf=v.buf;v.buf=null;return{status:200,buf,mime:v.mime,code:v.code}}
function has(id){return store.has(String(id))}
function purgeRoom(code){for(const [k,v] of store)if(v.code===code){v.buf=null;store.delete(k)}}
function purgeOld(){const t=Date.now();const gone=[];for(const [k,v] of store)if(t-v.t>TTL){v.buf=null;store.delete(k);gone.push(k)}return gone}
function count(){return store.size}
module.exports=Object.freeze({put,take,has,purgeRoom,purgeOld,count,TTL});
