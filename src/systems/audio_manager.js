class AudioManager{constructor(){this.ctx=null;this.master=null;this.ambient=null;this.enabled=true;this.initialized=false;this.initAfterUserInteraction = () => { if (!this.initialized) { this.init(); this.initialized = true; document.removeEventListener('click', this.initAfterUserInteraction); document.removeEventListener('touchstart', this.initAfterUserInteraction); } }; document.addEventListener('click', this.initAfterUserInteraction); document.addEventListener('touchstart', this.initAfterUserInteraction);}init(){if(this.ctx)return;try{const C=window.AudioContext || window.webkitAudioContext;this.ctx=new C();if(this.ctx.state === 'suspended') {this.ctx.resume();}this.master=this.ctx.createGain();this.master.gain.value=0.08;this.master.connect(this.ctx.destination);this.ambient=this.ctx.createOscillator();this.ambient.type='sine';this.ambient.frequency.value=110;this.ambientGain=this.ctx.createGain();this.ambientGain.gain.value=0.02;this.ambient.connect(this.ambientGain);this.ambientGain.connect(this.master);this.ambient.start();}catch(e){console.warn('Audio init failed',e);this.ctx=null;}}setEnabled(v){this.enabled=!!v;if(this.master)this.master.gain.value=this.enabled?0.08:0;}pulse(freq,time=0.15){if(!this.ctx||!this.enabled)return;const o=this.ctx.createOscillator();o.type='square';o.frequency.value=freq;const g=this.ctx.createGain();g.gain.value=0.08;o.connect(g);g.connect(this.master);o.start();o.stop(this.ctx.currentTime+time);}}window.__AUDIO_MANAGER=window.__AUDIO_MANAGER || new AudioManager();export default window.__AUDIO_MANAGER;

// Ambient layering: call audioManager.setMood(level) with 0..1 to adjust ambient intensity
AudioManager.prototype.setMood = function(value){
  if(!this.ctx) return;
  const v = Math.max(0, Math.min(1, value));
  if(this.ambientGain) this.ambientGain.gain.setTargetAtTime(0.01 + 0.08 * v, this.ctx.currentTime, 0.2);
};
AudioManager.prototype.pulseEvent = function(){ this.pulse(220, 0.08); };

AudioManager.prototype.createAnalyzer = function(){
  if(!this.ctx) return null;
  this.analyzer = this.ctx.createAnalyser();
  this.analyzer.fftSize = 256;
  this.master.connect(this.analyzer); // tap from master
  this.freqs = new Uint8Array(this.analyzer.frequencyBinCount);
  return this.analyzer;
};
AudioManager.prototype.getFreqs = function(){
  if(!this.analyzer) return null;
  this.analyzer.getByteFrequencyData(this.freqs);
  return this.freqs;
};
