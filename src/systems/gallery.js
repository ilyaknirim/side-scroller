
export function saveSessionToGallery(session){
  try{
    const key = 'noosphere_gallery_v1';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.unshift({ts:Date.now(), session});
    while(arr.length>5) arr.pop();
    localStorage.setItem(key, JSON.stringify(arr));
    return true;
  }catch(e){return false;}
}
export function loadGallery(){
  try{ return JSON.parse(localStorage.getItem('noosphere_gallery_v1')||'[]'); }catch(e){return[];}
}
