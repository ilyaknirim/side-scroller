
// visuals: audio-reactive background. Call initVisuals(container) to create canvas and start.
export function initVisuals(container){
  const canvas = document.createElement('canvas'); canvas.style.width='100%'; canvas.style.height='120px'; canvas.width=800; canvas.height=120;
  canvas.style.display='block'; canvas.style.borderRadius='8px'; container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let anim = true;
  function draw(){
    if(!anim) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const am = window.__AUDIO_MANAGER;
    let freqs = am && am.getFreqs ? am.getFreqs() : null;
    // background gradient
    const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    g.addColorStop(0,'rgba(6,182,212,0.06)'); g.addColorStop(1,'rgba(6,182,164,0.02)');
    ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);
    // draw waveform from freqs
    if(freqs){
      ctx.beginPath();
      for(let i=0;i<freqs.length;i++){
        const v = freqs[i]/255;
        const x = (i/freqs.length) * canvas.width;
        const y = canvas.height - v*canvas.height*0.9;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth=2; ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  return {stop: ()=>{ anim=false; if(container.contains(canvas)) container.removeChild(canvas);} };
}
