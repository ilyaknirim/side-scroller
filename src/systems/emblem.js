
// emblem generator: returns an SVG string based on seed, theme, modifiers
import { pseudoRandom } from "../utils/random.js";

export function generateEmblemSVG(seed, theme, modifiers){
  const rnd = pseudoRandom(seed||Date.now());
  const colors = [
    `hsl(${Math.floor(rnd()*360)} 70% 60%)`,
    `hsl(${Math.floor(rnd()*360)} 60% 45%)`,
    `hsl(${Math.floor(rnd()*360)} 50% 35%)`
  ];
  const shapes = ['circle','triangle','hex','wave'];
  const shape = shapes[Math.floor(rnd()*shapes.length)];
  const size = 120;
  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="100%" height="100%" fill="black" opacity="0.06"/>`;
  // draw background rings
  for(let i=0;i<3;i++){
    const r = 30 + i*18 + Math.floor(rnd()*8);
    svg += `<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${colors[i]}" stroke-width="${2-i*0.3}" opacity="${0.6 - i*0.15}"/>`;
  }
  // central shape
  if(shape==='circle'){
    svg += `<circle cx="${size/2}" cy="${size/2}" r="26" fill="${colors[0]}" opacity="0.9"/>`;
  } else if(shape==='triangle'){
    svg += `<polygon points="${size/2},18 ${size-18},${size-18} 18,${size-18}" fill="${colors[1]}" opacity="0.95"/>`;
  } else if(shape==='hex'){
    const s = size/2; const r=28;
    let pts = [];
    for(let k=0;k<6;k++){ pts.push( s + r*Math.cos(Math.PI*k/3), s + r*Math.sin(Math.PI*k/3) ); }
    svg += `<polygon points="${pts.join(' ')}" fill="${colors[2]}" opacity="0.95"/>`;
  } else {
    // wave
    svg += `<path d="M0 ${size/2} C ${size/4} ${size/2-20}, ${size*3/4} ${size/2+20}, ${size} ${size/2}" stroke="${colors[0]}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.9"/>`;
  }
  // small badges based on modifiers
  modifiers.slice(0,3).forEach((m,i)=>{
    const x = 18 + i*34; const y = size - 18;
    svg += `<circle cx="${x}" cy="${y}" r="8" fill="${colors[i%colors.length]}" />`;
  });
  svg += `</svg>`;
  return svg;
}

export function emblemToDataUrl(svg){
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
