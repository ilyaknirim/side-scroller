
// Simple particle system: spawn at x,y on container canvas context
export function createParticleEmitter(ctx, x, y){
  const particles = [];
  function emit(n=6){
    for(let i=0;i<n;i++){
      particles.push({x, y, vx:(Math.random()-0.5)*4, vy:(Math.random()-1.5)*4, life:30+Math.random()*30, size:1+Math.random()*3});
    }
  }
  function updateAndDraw(){
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.life -= 1;
      p.vy += 0.15;
      p.x += p.vx; p.y += p.vy;
      ctx.globalAlpha = Math.max(0, p.life/60);
      ctx.fillStyle = 'white';
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
      if(p.life<=0) particles.splice(i,1);
    }
  }
  return {emit, updateAndDraw};
}
