
// simple fake sync: store shared state in localStorage key and notify via storage event
export function syncPublish(key, data){
  try{ localStorage.setItem('noosphere_sync_'+key, JSON.stringify({ts:Date.now(), data})); return true;}catch(e){return false;}
}
export function syncSubscribe(key, handler){
  function onStorage(e){ if(e.key === 'noosphere_sync_'+key){ try{ handler(JSON.parse(e.newValue).data); }catch(_){} } }
  window.addEventListener('storage', onStorage);
  return ()=> window.removeEventListener('storage', onStorage);
}
