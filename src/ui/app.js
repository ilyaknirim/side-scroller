import { pickMeditation } from '../systems/meditations.js';
import { saveSessionToGallery, loadGallery } from '../systems/gallery.js';
import audioManager from '../systems/audio_manager.js';
import { generateCharacter, formatCharacterDescription } from '../systems/character_generator.js';
import { generateWorldSet, formatWorldSetDescription } from '../systems/integration.js';
if(tg){try{tg.expand();tg.ready();}catch(e){/* Telegram WebApp init error */}}

function showWorldSet(worldSet){el.worldsetText.textContent=formatWorldSetDescription(worldSet);el.menu.classList.add('hidden');el.worldset.classList.remove('hidden');currentWorldSet=worldSet;}function showSession(obj){
  try{
    const story = (obj.params && obj.params.seed) ? generateMicroStory(obj.params.theme, obj.params.modifiers, obj.params.seed) : '';
    const med = pickMeditation(obj.params && obj.params.seed);
    el.sessionText.textContent = story + '\n\n' + obj.text + '\n\n' + 'Meditation: ' + med;
  }catch(e){
    el.sessionText.textContent=obj.text; // Fallback on error
  }
  saveSessionToGallery(obj);
  // set ambient mood based on modifiers
  try{
    const mood = applyMoodFromModifiers(obj.params.modifiers||[]);
    if(window.__AUDIO_MANAGER) window.__AUDIO_MANAGER.setMood(mood);
  }catch(e){
    // Mood setting error handling
  }
  el.menu.classList.add('hidden');el.session.classList.remove('hidden');el.launcher.classList.add('hidden');el.stopBtn.classList.add('hidden');current=obj;}

function showCharacter(character){el.characterText.textContent=formatCharacterDescription(character);el.menu.classList.add('hidden');el.character.classList.remove('hidden');currentCharacter=character;}el.generateBtn.addEventListener('click',()=>showSession(generateSession()));el.regen.addEventListener('click',()=>showSession(generateSession()));el.characterBtn.addEventListener('click',()=>{const seedInput=document.getElementById('seed-input');const seed=seedInput.value?parseInt(seedInput.value,10):Math.floor(Math.random()*0xffffffff);showCharacter(generateCharacter(seed));});el.worldsetBtn.addEventListener('click',()=>{const seedInput=document.getElementById('seed-input');const seed=seedInput.value?parseInt(seedInput.value,10):Math.floor(Math.random()*0xffffffff);showWorldSet(generateWorldSet(seed));});el.back.addEventListener('click',()=>{if(runningInstance && runningInstance.stop){runningInstance.stop();runningInstance=null;}el.session.classList.add('hidden');el.menu.classList.remove('hidden');el.launcher.classList.add('hidden');el.gameRoot.innerHTML='';el.stopBtn.classList.add('hidden');current=null;});el.regenCharacterBtn.addEventListener('click',()=>{const seedInput=document.getElementById('seed-input');const seed=seedInput.value?parseInt(seedInput.value,10):Math.floor(Math.random()*0xffffffff);showCharacter(generateCharacter(seed));});el.backCharacterBtn.addEventListener('click',()=>{el.character.classList.add('hidden');el.menu.classList.remove('hidden');currentCharacter=null;});el.regenWorldsetBtn.addEventListener('click',()=>{const seedInput=document.getElementById('seed-input');const seed=seedInput.value?parseInt(seedInput.value,10):Math.floor(Math.random()*0xffffffff);showWorldSet(generateWorldSet(seed));});el.backWorldsetBtn.addEventListener('click',()=>{el.worldset.classList.add('hidden');el.menu.classList.remove('hidden');currentWorldSet=null;});el.downloadWorldsetBtn.addEventListener('click',()=>{const text=currentWorldSet?formatWorldSetDescription(currentWorldSet):'Мир не сгенерирован';const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='noosphere_worldset.txt';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);});el.downloadCharacterBtn.addEventListener('click',()=>{const text=currentCharacter?formatCharacterDescription(currentCharacter):'Персонаж не сгенерирован';const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='noosphere_character.txt';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);});el.download.addEventListener('click',()=>{const text=(current && current.text)|| 'Пустая сессия';const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='noosphere_session.txt';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);});el.send.addEventListener('click',()=>{if(!current)return;const payload={session:current.text,meta:{game:current.game.id,params:current.params}};if(tg && tg.sendData){try{tg.sendData(JSON.stringify(payload));el.launchMsg.textContent='Сессия отправлена боту.';el.launchMsg.classList.remove('hidden');}catch(e){el.launchMsg.textContent='Ошибка отправки:'+e.message;}}else{navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(payload));el.launchMsg.textContent='Telegram WebApp не обнаружен — JSON скопирован в буфер обмена.';el.launcher.classList.remove('hidden');}});el.play.addEventListener('click',async()=>{if(!current)return;const demoPath=current.game.demo;el.launchMsg.textContent=`Загружается:${current.game.name}...`;el.launcher.classList.remove('hidden');el.gameRoot.innerHTML='';try{const mod=await import(demoPath);if(mod && mod.runDemo){runningInstance=mod.runDemo(el.gameRoot,current.params.level);el.stopBtn.classList.remove('hidden');el.launchMsg.textContent=`Игровая сессия:${current.game.name}— тема ${current.params.theme}`;}else{el.launchMsg.textContent='Демо-модуль не экспортирует runDemo.';}}catch(e){el.launchMsg.textContent='Ошибка загрузки демо:'+e.message;}});el.stopBtn.addEventListener('click',()=>{if(runningInstance && runningInstance.stop){runningInstance.stop();runningInstance=null;el.gameRoot.innerHTML='';el.stopBtn.classList.add('hidden');el.launchMsg.textContent='Игра остановлена.';}});const muteBtn=document.createElement('button');muteBtn.textContent='🔊';muteBtn.title='Toggle sound';muteBtn.style.marginLeft='8px';document.querySelector('header').appendChild(muteBtn);muteBtn.addEventListener('click',()=>{audioManager.setEnabled(!audioManager.enabled);muteBtn.textContent=audioManager.enabled?'🔊':'🔈';});

function loadSessionFromHash(){
  try{
    const h = location.hash.replace('#','');
    if(!h) return null;
    const m = h.match(/seed=(\d+)/);
    if(m){
      const seed = parseInt(m[1],10);
      const params = generateSessionParameters(seed);
      // pick a game deterministically
      const idx = seed % GAMES.length;
      const chosenGame = GAMES[idx];
      const rulesCount = 3 + Math.floor((seed>>3)%4);
      const rules = pickRandom(RULE_BANK, rulesCount);
      const name = generateSessionName(params.theme, params.modifiers, params.seed);
      const header = `Название: ${name}\nДата: ${new Date().toLocaleString('ru-RU')}\nSeed: ${params.seed}\nТема: ${params.theme}\nСложность: ${params.difficulty}\nИгра: ${chosenGame.name}\nМодификаторы: ${params.modifiers.join(', ')}\n\n`;
      const body = rules.map((r,i)=>`${i+1}. ${r}`).join('\n');
      return {text: header+body+'\n\nВот такое', game: chosenGame, params};
    }
  }catch(e){ console.warn('load hash', e); }
  return null;
}
window.addEventListener('load', ()=>{
  const s = loadSessionFromHash();
  if(s) showSession(s);
  // App initialization complete placeholder
});


// FPS meter
const fpsEl = document.createElement('div'); fpsEl.style.fontSize='12px'; fpsEl.style.opacity='0.8'; fpsEl.style.marginLeft='12px'; fpsEl.textContent='FPS: -'; document.querySelector('header').appendChild(fpsEl);
let last = performance.now(), frames = 0;
function fpsTick(){
  frames++; const now = performance.now();
  if(now - last >= 1000){ fpsEl.textContent = 'FPS: ' + frames; frames = 0; last = now; }
  requestAnimationFrame(fpsTick);
}
requestAnimationFrame(fpsTick);
// patch game loop counters: increment frames in demos via requestAnimationFrame implicitly measured


// PWA install prompt handling
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  const ib = document.getElementById('install-btn'); if(ib) ib.style.display='block';
  // Install prompt ready placeholder
});
const ibtn = document.getElementById('install-btn');
if(ibtn){
  ibtn.addEventListener('click', async ()=>{
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    ibtn.style.display='none';
    // Install prompt handled placeholder
  });
}


function sendAnalytics(event, data){
  try{
    console.log('[analytics]', event, data||{});
    // optional: POST to analytics endpoint if set in window.__ANALYTICS_URL
    if(window.__ANALYTICS_URL){
      fetch(window.__ANALYTICS_URL, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event, data, ts:Date.now()})}).catch(()=>{});
    }
  }catch(e){
    // Analytics error handling placeholder
  }
}
// use sendAnalytics on generate/play/stop
el.generateBtn.addEventListener('click', ()=> sendAnalytics('generate', {}));
// attach other events later when actions occur


// Gallery UI
const galleryBtn = document.createElement('button'); galleryBtn.textContent='Галерея'; galleryBtn.style.marginLeft='8px'; document.querySelector('header').appendChild(galleryBtn);
const galleryPanel = document.createElement('div'); galleryPanel.style.position='fixed'; galleryPanel.style.left='50%'; galleryPanel.style.top='50%'; galleryPanel.style.transform='translate(-50%,-50%)'; galleryPanel.style.padding='12px'; galleryPanel.style.background='rgba(2,6,12,0.95)'; galleryPanel.style.borderRadius='10px'; galleryPanel.style.display='none'; galleryPanel.style.zIndex=9999; document.body.appendChild(galleryPanel);
galleryBtn.addEventListener('click', ()=>{
  const items = loadGallery();
  galleryPanel.innerHTML = '<h3>Галерея последних сессий</h3>';
  if(!items.length){ galleryPanel.innerHTML += '<div>Пусто</div>'; galleryPanel.style.display='block'; return; }
  items.forEach(it=>{
    const b = document.createElement('button'); b.textContent = new Date(it.ts).toLocaleString(); b.style.display='block'; b.style.margin='6px 0'; b.onclick = ()=> { showSession(it.session); galleryPanel.style.display='none'; };
    galleryPanel.appendChild(b);
  });
  const close = document.createElement('button'); close.textContent='Закрыть'; close.onclick=()=> galleryPanel.style.display='none'; galleryPanel.style.display='block'; galleryPanel.appendChild(close);
});


// Developer console overlay (toggle Ctrl+~)
const devConsole = document.createElement('div'); devConsole.style.position='fixed'; devConsole.style.right='16px'; devConsole.style.top='16px'; devConsole.style.padding='8px'; devConsole.style.background='rgba(0,0,0,0.6)'; devConsole.style.color='white'; devConsole.style.fontSize='12px'; devConsole.style.borderRadius='8px'; devConsole.style.display='none'; devConsole.style.zIndex=9999; document.body.appendChild(devConsole);
window.addEventListener('keydown', (e)=>{ if(e.ctrlKey && e.key==='`'){ devConsole.style.display = devConsole.style.display==='none'?'block':'none'; } });
function devLog(){ devConsole.innerHTML = 'Seed: ' + (current && current.params?current.params.seed:'-') + '<br/>FPS: ' + (document.querySelector('div')? 'see header FPS':'-') + '<br/>Events logged: ' + (window.__ANALYTICS_EVENTS?window.__ANALYTICS_EVENTS.length:0); }
setInterval(devLog, 700);
