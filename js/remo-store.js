/* ════════════════════════════════════════════════════════════════════
   ⚡ REMO — Unified Store, Real-Time Live Bus, Auth, Economy & Audio FX
   Works 100% Immediately Offline/Local + Plug-and-Play Firebase Cloud
   Instant Live Sync between Admin Office (admin.html) & REMO (index.html)
   ════════════════════════════════════════════════════════════════════ */

const REMO_LIVE_BUS = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('remo_live_bus') : null;

/* ── 1. Web Audio API Synthesizer (Zero External MP3 Dependencies) ── */
const RemoAudio = {
  ctx: null,
  radioPlaying: false,
  radioNodes: [],
  radioTimer: null,

  ensureCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  },

  play(type = 'click') {
    try {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'coin') {
        [987.77, 1318.51].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + i * 0.08);
          g.gain.setValueAtTime(0.18, now + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.28);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.3);
        });
      } else if (type === 'goldchime') {
        [1760, 2637.02, 3520].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + i * 0.04);
          g.gain.setValueAtTime(0.24, now + i * 0.04);
          g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 1.25);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.04); o.stop(now + i * 0.04 + 1.3);
        });
      } else if (type === 'crystalchime') {
        // High-order sapphire platinum crystalline chime
        [2093, 3135.96, 4186, 5274].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + i * 0.03);
          g.gain.setValueAtTime(0.18, now + i * 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.03 + 1.4);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.03); o.stop(now + i * 0.03 + 1.45);
        });
      } else if (type === 'cybersound') {
        // Cyber obsidian emerald laser pulse
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(880, now);
        o.frequency.exponentialRampToValueAtTime(220, now + 0.35);
        g.gain.setValueAtTime(0.22, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.36);
      } else if (type === 'brassclink') {
        // Resonant heavy antique brass & steel clink
        [587.33, 880, 1174.66].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + i * 0.02);
          g.gain.setValueAtTime(0.25, now + i * 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.02 + 0.65);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.02); o.stop(now + i * 0.02 + 0.7);
        });
      } else if (type === 'pack' || type === 'fanfare') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + i * 0.09);
          g.gain.setValueAtTime(0.2, now + i * 0.09);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.45);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.09); o.stop(now + i * 0.09 + 0.46);
        });
      } else if (type === 'roger') {
        [1567.98, 1174.66].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'square';
          o.frequency.setValueAtTime(freq, now + i * 0.065);
          g.gain.setValueAtTime(0.09, now + i * 0.065);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.065 + 0.07);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.065); o.stop(now + i * 0.065 + 0.08);
        });
      } else if (type === 'splash') {
        [440, 587.33, 880].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + i * 0.07);
          g.gain.setValueAtTime(0.14, now + i * 0.07);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
          o.connect(g); g.connect(ctx.destination);
          o.start(now + i * 0.07); o.stop(now + i * 0.07 + 0.26);
        });
      } else if (type === 'hit') {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(220, now);
        o.frequency.exponentialRampToValueAtTime(55, now + 0.22);
        g.gain.setValueAtTime(0.22, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.25);
      } else {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(660, now);
        g.gain.setValueAtTime(0.07, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.08);
      }
    } catch (e) {}
  },

  haptic(ms = 18) {
    if (navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  },

  // Generates a real playable PCM WAV data URL fallback when testing voice features on a PC without a mic
  createSynthVoiceWavDataUrl(seconds = 2.4) {
    const sampleRate = 8000;
    const numSamples = Math.floor(sampleRate * seconds);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    const notes = [523.25, 659.25, 783.99, 659.25, 880, 1046.5];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const idx = Math.min(notes.length - 1, Math.floor((t / seconds) * notes.length));
      const env = Math.sin(Math.PI * ((t * notes.length) % 1));
      const sample = Math.sin(2 * Math.PI * notes[idx] * t) * 0.28 * env;
      view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 32767, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return 'data:audio/wav;base64,' + btoa(binary);
  },

  toggleCyberLofiRadio() {
    if (this.radioPlaying) {
      this.stopRadio();
      return false;
    }
    const ctx = this.ensureCtx();
    if (!ctx) return false;
    this.radioPlaying = true;
    const chords = [
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 349.23], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G6
      [164.81, 196.0, 246.94, 329.63]  // Em7
    ];
    let step = 0;
    const playChord = () => {
      if (!this.radioPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = chords[step % chords.length];
      step++;
      notes.forEach((f) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.032, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 3.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 3.7);
      });
    };
    playChord();
    this.radioTimer = setInterval(playChord, 3600);
    return true;
  },

  stopRadio() {
    this.radioPlaying = false;
    if (this.radioTimer) {
      clearInterval(this.radioTimer);
      this.radioTimer = null;
    }
  }
};

/* ── 2. Procedural Post Visual Poster Generator (Offline Taint-Free) ── */
function generateCityPostVisualDataUrl(cityId, headline, subline) {
  try {
    const cv = document.createElement('canvas');
    cv.width = 720; cv.height = 900;
    const ctx = cv.getContext('2d');
    const city = getCityById(cityId);
    const col = city.themeColor || '#6366f1';

    const bg = ctx.createLinearGradient(0, 0, 720, 900);
    bg.addColorStop(0, '#050816');
    bg.addColorStop(0.55, col + '38');
    bg.addColorStop(1, '#060919');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 720, 900);

    // Subtle cyber grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 720; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 900); ctx.stroke(); }
    for (let y = 0; y < 900; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(720, y); ctx.stroke(); }

    drawCityLandmark(ctx, city.id, col, 360, 410, 230);

    ctx.font = '900 42px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = col;
    ctx.shadowBlur = 22;
    ctx.fillText(`${city.flag} ${headline || city.name_en.toUpperCase()}`, 360, 115);
    ctx.shadowBlur = 0;

    ctx.font = '700 22px "Outfit", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(subline || city.tagline_en, 360, 775);

    ctx.font = '700 16px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`🌐 REMO LIVE · ${city.lat.toFixed(3)}°, ${city.lng.toFixed(3)}°`, 360, 825);

    return cv.toDataURL('image/jpeg', 0.86);
  } catch (e) {
    return '';
  }
}

/* ── 2B. IndexedDB Binary Vault for 60s HD Videos, High-Res Photos & Audio ── */
const RemoMediaDB = {
  DB_NAME: 'remo_media_vault_v1',
  STORE_NAME: 'blobs',
  dbPromise: null,
  urlCache: {},

  open() {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const req = indexedDB.open(this.DB_NAME, 1);
      req.onupgradeneeded = (ev) => {
        const db = ev.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
      req.onsuccess = (ev) => resolve(ev.target.result);
      req.onerror = (ev) => reject(ev.target.error);
    });
    return this.dbPromise;
  },

  async saveBlob(blob, prefix = 'media') {
    const key = `idb://${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    try {
      this.urlCache[key] = URL.createObjectURL(blob);
      const db = await this.open();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        tx.objectStore(this.STORE_NAME).put(blob, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e);
      });
      return key;
    } catch (err) {
      // Fallback to dataURL only for tiny files if IDB is blocked
      return new Promise((resolve) => {
        const rd = new FileReader();
        rd.onload = (e) => resolve(e.target.result || '');
        rd.onerror = () => resolve('');
        rd.readAsDataURL(blob);
      });
    }
  },

  async getObjectUrl(keyOrUrl) {
    if (!keyOrUrl || !String(keyOrUrl).startsWith('idb://')) return keyOrUrl || '';
    if (this.urlCache[keyOrUrl]) return this.urlCache[keyOrUrl];
    try {
      const db = await this.open();
      const blob = await new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const req = tx.objectStore(this.STORE_NAME).get(keyOrUrl);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e);
      });
      if (blob) {
        const objUrl = URL.createObjectURL(blob);
        this.urlCache[keyOrUrl] = objUrl;
        return objUrl;
      }
    } catch (e) {}
    return '';
  },

  resolveSyncOrPlaceholder(keyOrUrl) {
    if (!keyOrUrl) return '';
    if (!String(keyOrUrl).startsWith('idb://')) return keyOrUrl;
    return this.urlCache[keyOrUrl] || '';
  },

  hydrateDom(root = document) {
    root.querySelectorAll('[data-idb-src]').forEach(async (el) => {
      const key = el.getAttribute('data-idb-src');
      if (!key || !key.startsWith('idb://')) return;
      const url = await this.getObjectUrl(key);
      if (url && el.getAttribute('src') !== url) {
        el.src = url;
      }
    });
  }
};

/* ── 2B-2. High-Performance Mobile Client Image Compressor & Cloud Uploader ── */
async function compressImageFileToDataUrl(fileOrBlob, maxDim = 1080, quality = 0.76) {
  return new Promise((resolve) => {
    if (!fileOrBlob) return resolve('');
    if (typeof fileOrBlob === 'string' && fileOrBlob.startsWith('data:image')) {
      return resolve(fileOrBlob);
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(ev.target.result || '');
      img.src = ev.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(fileOrBlob);
  });
}

async function uploadMediaToCloudOrDataUrl(blobOrFile, folder = 'posts') {
  if (!blobOrFile) return '';
  const isImage = (blobOrFile.type && blobOrFile.type.startsWith('image/')) || (typeof blobOrFile === 'string' && blobOrFile.startsWith('data:image'));
  
  if (isImage) {
    // 1. Downscale & compress to high-res mobile-optimized JPEG dataUrl (~60-90KB)
    const dataUrl = await compressImageFileToDataUrl(blobOrFile, 1080, 0.76);
    
    // 2. Upload to Firebase Storage if available
    if (typeof firebase !== 'undefined' && firebase.storage) {
      try {
        const storage = firebase.storage();
        const ref = storage.ref().child(`remo_${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`);
        const res = await fetch(dataUrl);
        const b = await res.blob();
        const snap = await ref.put(b, { contentType: 'image/jpeg' });
        const downloadUrl = await snap.ref.getDownloadURL();
        if (downloadUrl) return downloadUrl;
      } catch (err) {
        console.log('Firebase storage upload notice (using optimized dataUrl):', err.message);
      }
    }
    return dataUrl;
  }

  // Videos or audio
  if (typeof firebase !== 'undefined' && firebase.storage) {
    try {
      const storage = firebase.storage();
      const isMp4 = blobOrFile.type && blobOrFile.type.includes('mp4');
      const ext = isMp4 ? 'mp4' : 'webm';
      const mime = blobOrFile.type || (isMp4 ? 'video/mp4' : 'video/webm');
      const ref = storage.ref().child(`remo_${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`);
      const snap = await ref.put(blobOrFile, { contentType: mime });
      const downloadUrl = await snap.ref.getDownloadURL();
      if (downloadUrl) return downloadUrl;
    } catch (e) {
      console.warn('Firebase storage video upload notice:', e);
    }
  }

  // If storage is unavailable and video is compact (< 1.2MB), convert to base64 Data URL so all users can see it
  if (blobOrFile.size && blobOrFile.size < 1200000) {
    try {
      const dataUrl = await new Promise((res) => {
        const r = new FileReader();
        r.onloadend = () => res(r.result || '');
        r.onerror = () => res('');
        r.readAsDataURL(blobOrFile);
      });
      if (dataUrl) return dataUrl;
    } catch (e) {}
  }

  // Fallback to local IndexedDB for large offline videos
  return RemoMediaDB.saveBlob(blobOrFile, folder);
}

window.compressImageFileToDataUrl = compressImageFileToDataUrl;
window.uploadMediaToCloudOrDataUrl = uploadMediaToCloudOrDataUrl;

/* ── 2C. Starter Templates for Live Interactive HTML / 3D Mini-App Posts ── */
const REMO_HTML_TEMPLATES = {
  fireworks: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:#040714;font-family:system-ui,sans-serif;user-select:none;touch-action:none;}
  canvas{display:block;width:100%;height:100%;cursor:crosshair;}
  .hud{position:fixed;top:40px;left:12px;right:12px;display:flex;justify-content:space-between;pointer-events:none;color:#fff;font-weight:800;font-size:12px;text-shadow:0 2px 8px #000;}
  .pill{background:rgba(15,23,42,0.78);border:1px solid rgba(56,189,248,0.5);padding:5px 12px;border-radius:99px;}
</style>
</head>
<body>
<div class="hud">
  <span class="pill">🎆 TAP SKY: CYBER FIREWORKS SYNTH</span>
  <span class="pill" id="sc">COMBO: 0 ✨</span>
</div>
<canvas id="c"></canvas>
<script>
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let w,h,pts=[],combo=0,ac=null;
function resize(){w=cv.width=innerWidth;h=cv.height=innerHeight;}
addEventListener('resize',resize);resize();
const cols=['#38bdf8','#ec4899','#fbbf24','#a855f7','#10b981','#f43f5e'];
function chime(yRatio){
  try{
    if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();
    if(ac.state==='suspended')ac.resume();
    const o=ac.createOscillator(),g=ac.createGain(),now=ac.currentTime;
    const scale=[261.6,329.6,392,523.2,659.2,784,1046.5];
    o.type='triangle';
    o.frequency.setValueAtTime(scale[Math.floor((1-yRatio)*scale.length)]||523.2,now);
    g.gain.setValueAtTime(0.14,now);
    g.gain.exponentialRampToValueAtTime(0.001,now+0.45);
    o.connect(g);g.connect(ac.destination);o.start(now);o.stop(now+0.46);
  }catch(e){}
}
function boom(x,y,auto){
  if(!auto){combo++;document.getElementById('sc').textContent='COMBO: '+combo+' ✨';chime(Math.max(0,Math.min(0.99,y/h)));}
  const col=cols[Math.floor(Math.random()*cols.length)];
  for(let i=0;i<44;i++){
    const a=(Math.PI*2*i)/44+Math.random()*0.15,sp=1.5+Math.random()*5.2;
    pts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,col,r:2+Math.random()*2.5});
  }
}
cv.addEventListener('pointerdown',e=>boom(e.clientX,e.clientY,false));
setInterval(()=>boom(w*(0.2+Math.random()*0.6),h*(0.18+Math.random()*0.42),true),1400);
function loop(){
  ctx.fillStyle='rgba(4,7,20,0.22)';ctx.fillRect(0,0,w,h);
  // Neon Skyline
  ctx.fillStyle='#0b132b';
  for(let i=0;i<16;i++){
    const bw=w/15,bh=36+((i*37)%68);
    ctx.fillRect(i*bw,h-bh,bw-3,bh);
  }
  for(let i=pts.length-1;i>=0;i--){
    const p=pts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.06;p.life-=0.018;
    if(p.life<=0){pts.splice(i,1);continue;}
    ctx.globalAlpha=p.life;ctx.fillStyle=p.col;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;requestAnimationFrame(loop);
}
boom(w/2,h*0.35,true);loop();
<\/script>
</body>
</html>`,

  racer: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:#050816;font-family:system-ui,sans-serif;user-select:none;touch-action:none;}
  canvas{display:block;width:100%;height:100%;}
  .hud{position:fixed;top:40px;left:12px;right:12px;display:flex;justify-content:space-between;color:#fbbf24;font-weight:900;font-size:12px;pointer-events:none;}
  .tag{background:rgba(10,15,32,0.85);border:1px solid #fbbf24;padding:5px 11px;border-radius:99px;}
</style>
</head>
<body>
<div class="hud">
  <span class="tag">🏎️ MOVE MOUSE / FINGER TO STEER</span>
  <span class="tag" id="pts">🪙 0</span>
</div>
<canvas id="g"></canvas>
<script>
const c=document.getElementById('g'),x=c.getContext('2d');
let w,h,px=0.5,score=0,spd=4.2,items=[],gridOff=0;
function rs(){w=c.width=innerWidth;h=c.height=innerHeight;}
addEventListener('resize',rs);rs();
c.addEventListener('pointermove',e=>{px=Math.max(0.15,Math.min(0.85,e.clientX/w));});
c.addEventListener('pointerdown',e=>{px=Math.max(0.15,Math.min(0.85,e.clientX/w));});
setInterval(()=>{
  const coin=Math.random()>0.38;
  items.push({u:0.18+Math.random()*0.64,y:-20,coin});
},520);
function draw(){
  x.fillStyle='#050816';x.fillRect(0,0,w,h);
  gridOff=(gridOff+spd)%40;
  // Cyber synthwave road
  x.strokeStyle='rgba(236,72,153,0.35)';x.lineWidth=2;
  x.beginPath();x.moveTo(w*0.1,0);x.lineTo(w*0.02,h);x.moveTo(w*0.9,0);x.lineTo(w*0.98,h);x.stroke();
  x.strokeStyle='rgba(56,189,248,0.18)';
  for(let y=gridOff;y<h;y+=40){x.beginPath();x.moveTo(w*0.06,y);x.lineTo(w*0.94,y);x.stroke();}
  const carX=px*w,carY=h-62;
  // Player Neon Hovercar
  x.shadowColor='#38bdf8';x.shadowBlur=16;x.fillStyle='#38bdf8';
  x.beginPath();x.moveTo(carX,carY-22);x.lineTo(carX-18,carY+16);x.lineTo(carX+18,carY+16);x.closePath();x.fill();
  x.shadowBlur=0;
  for(let i=items.length-1;i>=0;i--){
    const it=items[i];it.y+=spd;
    const ix=it.u*w;
    if(it.coin){
      x.fillStyle='#fbbf24';x.beginPath();x.arc(ix,it.y,11,0,Math.PI*2);x.fill();
    }else{
      x.fillStyle='#f43f5e';x.fillRect(ix-20,it.y-8,40,16);
    }
    if(Math.hypot(ix-carX,it.y-carY)<28){
      score=it.coin?score+10:Math.max(0,score-15);
      spd=Math.min(8.5,4.2+score*0.02);
      document.getElementById('pts').textContent='🪙 '+score;
      items.splice(i,1);continue;
    }
    if(it.y>h+30)items.splice(i,1);
  }
  requestAnimationFrame(draw);
}
draw();
<\/script>
</body>
</html>`,

  globe: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:radial-gradient(circle,#0f172a,#030612);font-family:system-ui,sans-serif;user-select:none;touch-action:none;}
  canvas{display:block;width:100%;height:100%;cursor:grab;}
  .lbl{position:fixed;top:40px;left:12px;background:rgba(15,23,42,0.8);border:1px solid #6366f1;color:#38bdf8;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:800;pointer-events:none;}
</style>
</head>
<body>
<div class="lbl">🌀 DRAG TO SPIN 4D REMO WORLD GLOBE</div>
<canvas id="gl"></canvas>
<script>
const c=document.getElementById('gl'),ctx=c.getContext('2d');
let w,h,ry=0,rx=0.25,drag=false,lx=0,ly=0;
function rs(){w=c.width=innerWidth;h=c.height=innerHeight;}
addEventListener('resize',rs);rs();
const nodes=[];
for(let i=0;i<160;i++){
  const phi=Math.acos(1-2*(i+0.5)/160),th=Math.PI*(1+Math.sqrt(5))*i;
  nodes.push({x:Math.cos(th)*Math.sin(phi),y:Math.cos(phi),z:Math.sin(th)*Math.sin(phi),hub:i%14===0});
}
c.onpointerdown=e=>{drag=true;lx=e.clientX;ly=e.clientY;};
addEventListener('pointerup',()=>drag=false);
c.onpointermove=e=>{if(!drag)return;ry+=(e.clientX-lx)*0.01;rx=Math.max(-1.2,Math.min(1.2,rx+(e.clientY-ly)*0.01));lx=e.clientX;ly=e.clientY;};
function frame(){
  if(!drag)ry+=0.008;
  ctx.clearRect(0,0,w,h);
  const R=Math.min(w,h)*0.34,cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
  nodes.forEach(n=>{
    const x1=n.x*cy-n.z*sy,z1=n.x*sy+n.z*cy;
    const y2=n.y*cx-z1*sx,z2=n.y*sx+z1*cx;
    const sc=(z2+2.4)/3.4;
    const px=w/2+x1*R,py=h/2+y2*R;
    ctx.globalAlpha=Math.max(0.12,sc);
    ctx.fillStyle=n.hub?'#fbbf24':'#38bdf8';
    ctx.beginPath();ctx.arc(px,py,n.hub?4.8*sc:2.2*sc,0,Math.PI*2);ctx.fill();
  });
  ctx.globalAlpha=1;requestAnimationFrame(frame);
}
frame();
<\/script>
</body>
</html>`,

  beatpad: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  html,body{margin:0;height:100%;background:#060918;color:#fff;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;user-select:none;}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:min(90vw,360px);}
  .pad{aspect-ratio:1;border-radius:16px;border:2px solid rgba(255,255,255,0.18);display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;font-size:12px;cursor:pointer;transition:transform 0.08s,box-shadow 0.12s;}
  .pad:active,.pad.hit{transform:scale(0.92);box-shadow:0 0 24px currentColor;}
</style>
</head>
<body>
<div style="font-weight:900;font-size:13px;color:#fbbf24;letter-spacing:1px;">🎹 REMO CYBER SYNTH PAD — TAP TO PLAY</div>
<div class="grid" id="pads"></div>
<script>
const pads=[
  {n:'KICK',f:65,t:'sine',c:'#f43f5e'},{n:'BASS',f:110,t:'sawtooth',c:'#ec4899'},
  {n:'LEAD',f:440,t:'triangle',c:'#6366f1'},{n:'NEON',f:587.3,t:'sine',c:'#38bdf8'},
  {n:'CHORD',f:329.6,t:'triangle',c:'#10b981'},{n:'LASER',f:880,t:'sawtooth',c:'#fbbf24'},
  {n:'ARP',f:659.3,t:'sine',c:'#a855f7'},{n:'GOLD',f:1046.5,t:'triangle',c:'#f59e0b'}
];
let ac=null;
const box=document.getElementById('pads');
pads.forEach(p=>{
  const b=document.createElement('div');
  b.className='pad';
  b.style.background=p.c+'26';b.style.color=p.c;b.style.borderColor=p.c;
  b.innerHTML='<span style="font-size:20px;">⚡</span><span>'+p.n+'</span>';
  b.onpointerdown=()=>{
    b.classList.add('hit');setTimeout(()=>b.classList.remove('hit'),140);
    if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();
    if(ac.state==='suspended')ac.resume();
    const o=ac.createOscillator(),g=ac.createGain(),now=ac.currentTime;
    o.type=p.t;o.frequency.setValueAtTime(p.f,now);
    if(p.n==='KICK'||p.n==='LASER')o.frequency.exponentialRampToValueAtTime(32,now+0.25);
    g.gain.setValueAtTime(0.24,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.34);
    o.connect(g);g.connect(ac.destination);o.start(now);o.stop(now+0.35);
  };
  box.appendChild(b);
});
<\/script>
</body>
</html>`
};

function getShowcaseInteractivePosts(now = Date.now()) {
  return [
    {
      id: 'post_html_fireworks',
      uid: 'u_admin_founder',
      authorName: 'REMO Founder',
      authorVerified: true,
      authorPassport: '0001',
      cityId: 'montreal',
      vibe: 'energy',
      caption_en: '🎆 LIVE INTERACTIVE HTML APP! Tap the sky directly inside this post to launch 3D Cyber Fireworks & Synth music — or click Remix Code to build your own! #LiveHTML #Montreal #WebArt',
      caption_fr: '🎆 APP HTML INTERACTIVE EN DIRECT ! Touchez le ciel dans ce post pour lancer des feux d’artifice 3D musicaux — ou cliquez sur Remixer le Code ! #LiveHTML #Montreal #WebArt',
      mediaType: 'html_app',
      htmlCode: REMO_HTML_TEMPLATES.fireworks,
      verifiedGps: true,
      boosted: false,
      mintedCard: false,
      reactions: { '🔥': 14, '⚡': 9, '💎': 6, '🤯': 11 },
      secretCapsule: {
        cost: 15,
        text_en: '💎 VIP Creator Tip: Inside Remix Code, change cols[] or scale[] frequencies to create your own custom city symphony!',
        text_fr: '💎 Astuce Créateur VIP : Dans Remixer Code, modifiez cols[] ou scale[] pour composer votre propre symphonie urbaine !',
        unlockedBy: []
      },
      likes: ['u_elena_kiv', 'u_lucas_par', 'u_kenji_tyo'],
      tipsTotal: 320,
      comments: [
        { id: 'ch1', author: 'Kenji_Shibuya', text: 'Playing with fireworks directly inside the feed is next-level 🤯🔥', createdAt: now - 600000 }
      ],
      createdAt: now - 1200000
    },
    {
      id: 'post_html_racer_kiv',
      uid: 'u_elena_kiv',
      authorName: 'Elena_KIV',
      authorVerified: true,
      authorPassport: '0007',
      cityId: 'chisinau',
      vibe: 'culture',
      caption_en: '🏎️🇲🇩 Playable Chișinău Neon Hovercar Mini-Game coded in pure HTML5! Beat 100 points & vote in the poll below! #Chisinau #HTMLGame #Moldova',
      caption_fr: '🏎️🇲🇩 Mini-Jeu Néon Chișinău jouable directement dans le flux en HTML5 ! Dépassez 100 points et votez au sondage ci-dessous ! #Chisinau #HTMLGame #Moldavie',
      mediaType: 'html_app',
      htmlCode: REMO_HTML_TEMPLATES.racer,
      verifiedGps: true,
      boosted: false,
      mintedCard: true,
      reactions: { '🔥': 19, '👑': 8, '💎': 7 },
      poll: {
        question_en: 'What should I code next for REMO Live HTML?',
        question_fr: 'Que dois-je coder ensuite en HTML Live sur REMO ?',
        options: [
          { label_en: '🗼 3D Eiffel Tower Climber', label_fr: '🗼 Jeu 3D Tour Eiffel', votes: 28 },
          { label_en: '🎹 Cyber Synth Studio', label_fr: '🎹 Studio Synthé Cyber', votes: 19 },
          { label_en: '🃏 Mini Blackjack Arena', label_fr: '🃏 Mini Arène Cartes', votes: 15 }
        ],
        voters: []
      },
      likes: ['u_admin_founder', 'u_lucas_par'],
      tipsTotal: 210,
      comments: [],
      createdAt: now - 2100000
    }
  ];
}

/* ── 3. Default Seeded Ecosystem Data ── */
function createDefaultState() {
  const now = Date.now();
  return {
    settings: {
      adminPin: '2026',
      adminEmail: 'andart1174@gmail.com',
      customDomain: '',
      announcement_en: '🌐 Welcome to REMO! Choose your Home City, open your Free Daily 4D City Card Pack & join the World City Cup!',
      announcement_fr: '🌐 Bienvenue sur REMO ! Choisissez votre Ville, ouvrez votre Pack Carte 4D gratuit et rejoignez la Coupe des Villes !',
      announcementActive: true,
      rewards: {
        signupBonus: 150,
        postReward: 15,
        pulseReward: 25,
        duelVoteReward: 20,
        pvpWinReward: 35,
        packCost: 150,
        boostCost: 50,
        mintPostCardCost: 100
      },
      dailyPulse: {
        active: true,
        hashtag: '#RemoGoldenHour',
        title_en: 'Capture your city sky or street vibe tonight!',
        title_fr: 'Capturez le ciel ou l’ambiance de votre ville ce soir !',
        reward: 25
      },
      flashDrop: {
        active: true,
        cityId: 'montreal',
        spotName_en: 'Mont-Royal Belvédère Golden Beacon',
        spotName_fr: 'Balise Dorée du Belvédère Mont-Royal',
        lat: 45.5048,
        lng: -73.5876,
        coins: 300,
        bonusCardCityId: 'montreal',
        expiresAt: now + 15 * 60 * 1000
      }
    },

    cityScores: {
      montreal: 4820,
      paris: 4610,
      chisinau: 4390,
      newyork: 4150,
      tokyo: 3980,
      bucharest: 3740,
      dubai: 3520,
      london: 3390,
      miami: 3120,
      barcelona: 2950,
      monaco: 2880,
      seoul: 2790
    },

    users: [
      {
        uid: 'u_admin_founder',
        name: 'REMO Founder',
        email: 'andart1174@gmail.com',
        role: 'admin',
        verified: true,
        homeCity: 'montreal',
        passportNum: '0001',
        coins: 25000,
        lifetimeCoins: 50000,
        streak: 14,
        visas: ['montreal', 'paris', 'chisinau', 'bucharest', 'newyork', 'tokyo', 'monaco'],
        avatarColor: '#f59e0b'
      },
      {
        uid: 'u_elena_kiv',
        name: 'Elena_KIV',
        email: 'elena@remo.world',
        role: 'vip',
        verified: true,
        homeCity: 'chisinau',
        passportNum: '0007',
        coins: 1840,
        lifetimeCoins: 3200,
        streak: 9,
        visas: ['chisinau', 'bucharest', 'paris', 'rome'],
        avatarColor: '#ec4899'
      },
      {
        uid: 'u_lucas_par',
        name: 'Lucas_Paris',
        email: 'lucas@remo.world',
        role: 'vip',
        verified: true,
        homeCity: 'paris',
        passportNum: '0012',
        coins: 1520,
        lifetimeCoins: 2900,
        streak: 11,
        visas: ['paris', 'monaco', 'london', 'montreal'],
        avatarColor: '#38bdf8'
      },
      {
        uid: 'u_kenji_tyo',
        name: 'Kenji_Shibuya',
        email: 'kenji@remo.world',
        role: 'citizen',
        verified: true,
        homeCity: 'tokyo',
        passportNum: '0019',
        coins: 2100,
        lifetimeCoins: 4100,
        streak: 16,
        visas: ['tokyo', 'seoul', 'singapore', 'newyork'],
        avatarColor: '#10b981'
      }
    ],

    posts: [],

    stories: [
      { id: 'st_1', author: 'REMO Founder', cityId: 'montreal', caption_en: 'Mont-Royal Flash Drop Live! ⚡', caption_fr: 'Flash Drop Mont-Royal en direct ! ⚡', createdAt: now - 1200000 },
      { id: 'st_2', author: 'Elena_KIV', cityId: 'chisinau', caption_en: 'Chișinău Night Walk 🇲🇩✨', caption_fr: 'Promenade nocturne à Chișinău 🇲🇩✨', createdAt: now - 2400000 },
      { id: 'st_3', author: 'Lucas_Paris', cityId: 'paris', caption_en: 'Seine Cruise & Espresso 🗼', caption_fr: 'Croisière sur la Seine 🗼', createdAt: now - 3800000 },
      { id: 'st_4', author: 'Kenji_Shibuya', cityId: 'tokyo', caption_en: 'Akihabara Card Battle! 🎴', caption_fr: 'Duel de Cartes à Akihabara ! 🎴', createdAt: now - 5100000 }
    ],

    duels: [
      {
        id: 'war_1',
        title_en: 'World Nightlife & Gastronomy Clash',
        title_fr: 'Choc Mondial Gastronomie & Vie Nocturne',
        cityA: 'montreal',
        cityB: 'paris',
        votesA: 148,
        votesB: 142,
        voters: []
      },
      {
        id: 'war_2',
        title_en: 'Eastern European Capitals Super-Derby',
        title_fr: 'Super-Derby des Capitales d’Europe de l’Est',
        cityA: 'chisinau',
        cityB: 'bucharest',
        votesA: 136,
        votesB: 131,
        voters: []
      },
      {
        id: 'war_3',
        title_en: 'Hyper-Skylines & Future Tech Megacities',
        title_fr: 'Mégapoles du Futur & Gratte-Ciels Néon',
        cityA: 'newyork',
        cityB: 'tokyo',
        votesA: 119,
        votesB: 124,
        voters: []
      }
    ],

    droppedCardsPool: [
      {
        id: 'card_genesis_mtl',
        cityId: 'montreal',
        serial: '0001',
        maxSupply: 1000,
        rarity: 'Mythic 4D',
        themeId: 1,
        verifiedGps: true,
        coinValue: 9500,
        ownerUid: 'u_admin_founder',
        ownerName: 'REMO Founder',
        mintedAt: now - 86400000
      },
      {
        id: 'card_genesis_kiv',
        cityId: 'chisinau',
        serial: '0001',
        maxSupply: 1000,
        rarity: 'Mythic 4D',
        themeId: 0,
        verifiedGps: true,
        coinValue: 9400,
        ownerUid: null, // Available inFeatured / Auction!
        ownerName: 'REMO Treasury',
        mintedAt: now - 43200000
      }
    ],

    auctions: [
      {
        id: 'auc_1',
        cardSpec: { cityId: 'chisinau', serial: '0001', rarity: 'Founder 1-of-1', themeId: 0, verifiedGps: true, coinValue: 12500 },
        sellerName: 'REMO Official Mint',
        currentBid: 650,
        highestBidder: 'Elena_KIV',
        endsAt: now + 18 * 3600 * 1000
      },
      {
        id: 'auc_2',
        cardSpec: { cityId: 'monaco', serial: '0003', rarity: 'Mythic 4D', themeId: 4, verifiedGps: true, coinValue: 10000 },
        sellerName: 'Lucas_Paris',
        currentBid: 480,
        highestBidder: 'Kenji_Shibuya',
        endsAt: now + 9 * 3600 * 1000
      }
    ],

    radarPins: [
      { id: 'pin_mtl', cityId: 'montreal', lat: 45.5048, lng: -73.5876, title_en: 'Mont-Royal Belvédère Cyber Meetup', title_fr: 'Rencontre Cyber Belvédère Mont-Royal', reward: 50 },
      { id: 'pin_kiv', cityId: 'chisinau', lat: 47.0245, lng: 28.8322, title_en: 'Arcul de Triumf REMO Gold Drop', title_fr: 'Drop Doré Arc de Triomphe Chișinău', reward: 75 },
      { id: 'pin_par', cityId: 'paris', lat: 48.8584, lng: 2.2945, title_en: 'Tour Eiffel Midnight Flash Photo', title_fr: 'Photo Flash Minuit Tour Eiffel', reward: 60 },
      { id: 'pin_buh', cityId: 'bucharest', lat: 44.4413, lng: 26.0973, title_en: 'Romanian Athenaeum Creator Hub', title_fr: 'Hub Créateurs Athénée de Bucarest', reward: 50 },
      { id: 'pin_nyc', cityId: 'newyork', lat: 40.7580, lng: -73.9855, title_en: 'Times Square 4D Billboard Drop', title_fr: 'Drop 4D Times Square', reward: 65 },
      { id: 'pin_tyo', cityId: 'tokyo', lat: 35.6595, lng: 139.7004, title_en: 'Shibuya Scramble Neon Check-In', title_fr: 'Check-In Néon Shibuya Crossing', reward: 65 }
    ],

    chatMessages: {
      global: [
        { id: 'm1', author: 'REMO Founder', cityFlag: '⚜️', text: 'Welcome everyone to REMO! English & Français live worldwide 🌐', ts: now - 3600000 },
        { id: 'm2', author: 'Elena_KIV', cityFlag: '🇲🇩', text: 'Salut from Chișinău! Our Triumphal Arch card looks insane in 4D!', ts: now - 1800000 },
        { id: 'm3', author: 'Lucas_Paris', cityFlag: '🗼', text: 'Bonjour à tous ! Qui est prêt pour un duel de cartes PvP ?', ts: now - 900000 }
      ],
      montreal: [
        { id: 'mm1', author: 'REMO Founder', cityFlag: '⚜️', text: 'Montréal squad! Don’t miss the +300 🪙 Flash Drop on Mont-Royal!', ts: now - 1500000 }
      ],
      chisinau: [
        { id: 'mk1', author: 'Elena_KIV', cityFlag: '🇲🇩', text: 'Team Chișinău pushing for #1 in the World City Cup! 🇲🇩🔥', ts: now - 1200000 }
      ],
      paris: [
        { id: 'mp1', author: 'Lucas_Paris', cityFlag: '🗼', text: 'Bienvenue dans le salon officiel de Paris ! ✨', ts: now - 1100000 }
      ]
    },

    directMessages: [
      { id: 'dm1', fromUid: 'u_elena_kiv', fromName: 'Elena_KIV', toUid: 'active', text: 'Hey! Want to trade a Paris card or battle in PvP?', ts: now - 2000000 }
    ],

    serialCounter: 14,
    cityMayors: {
      montreal: 'u_admin_founder',
      chisinau: 'u_elena_kiv',
      paris: 'u_lucas_par',
      tokyo: 'u_kenji_tyo'
    },
    bounties: getDefaultBounties(now),
    promoCodes: getDefaultPromoCodes(),
    geoVaults: getDefaultGeoVaults(now),
    vipShopItems: getDefaultVipShopItems(),
    vipOrders: [],
    serializedCoins: [
      { id: 'sc_0001', serial: '0001', coinsValue: 1000, ownerUid: 'u_admin_founder', ownerName: 'Founder Admin', mintedAt: now - 86400000, status: 'vault', note: 'Genesis Mint #0001' }
    ],
    cityPortfolios: {},
    wishes: getDefaultWishes(now)
  };
}

function getDefaultWishes(now = Date.now()) {
  return [
    {
      id: 'wish_mtl_1',
      cityId: 'chisinau',
      authorName: 'Elena_KIV',
      authorUid: 'u_elena_kiv',
      text: 'Pace, prosperitate și un viitor luminos pentru Chișinău și toți frații noștri de pe glob! 🇲🇩❤️✨',
      blessings: 18,
      blessedUids: ['u_admin_founder'],
      timestamp: now - 3600000 * 3,
      isAnonymous: false
    },
    {
      id: 'wish_mtl_2',
      cityId: 'montreal',
      authorName: 'REMO Founder',
      authorUid: 'u_admin_founder',
      text: 'Que Montréal reste un phare d’art, de technologie et de liberté créative pour le monde entier ! ⚜️🍁',
      blessings: 24,
      blessedUids: ['u_elena_kiv'],
      timestamp: now - 3600000 * 5,
      isAnonymous: false
    },
    {
      id: 'wish_tyo_1',
      cityId: 'tokyo',
      authorName: 'Kenji_TYO',
      authorUid: 'u_kenji_tyo',
      text: 'May neon dreams inspire every creator in the 4D World! 🗼⚡ Arigato REMO!',
      blessings: 15,
      blessedUids: [],
      timestamp: now - 3600000 * 7,
      isAnonymous: false
    },
    {
      id: 'wish_par_1',
      cityId: 'paris',
      authorName: 'Citoyen Secret',
      authorUid: '',
      text: 'Amour, art et lumière sur Paris et toutes les villes reliées par le réseau 4D ! ✨🗼',
      blessings: 11,
      blessedUids: [],
      timestamp: now - 3600000 * 12,
      isAnonymous: true
    }
  ];
}

function getDefaultBounties(now = Date.now()) {
  return [
    {
      id: 'bty_kiv_1',
      cityId: 'chisinau',
      sponsorName: 'REMO Treasury',
      format: 'photo_or_video',
      reward: 500,
      title_en: '🇲🇩 Chișinău Golden Gates or Triumphal Arch Night Shot',
      title_fr: '🇲🇩 Photo/Vidéo Nocturne des Portes de la Ville ou Arc de Triomphe à Chișinău',
      status: 'open',
      submissions: [],
      winnerName: '',
      createdAt: now - 3600000
    },
    {
      id: 'bty_html_1',
      cityId: 'montreal',
      sponsorName: 'REMO Founder',
      format: 'html_app',
      reward: 750,
      title_en: '💻 Global Code Bounty: Build an Interactive HTML Mini-Game or 3D City Visualizer!',
      title_fr: '💻 Mission Code HTML : Créez un Mini-Jeu HTML5 ou Visualiseur 3D Interactif !',
      status: 'open',
      submissions: [],
      winnerName: '',
      createdAt: now - 7200000
    },
    {
      id: 'bty_par_1',
      cityId: 'paris',
      sponsorName: 'Lucas_Paris',
      format: 'video_60s',
      reward: 400,
      title_en: '🗼 60-Second Street Vibe or Café Moment in Your City',
      title_fr: '🗼 Vidéo 60s d’Ambiance Urbaine ou Café dans Votre Ville',
      status: 'open',
      submissions: [],
      winnerName: '',
      createdAt: now - 9800000
    }
  ];
}

function getDefaultPromoCodes() {
  return [
    { code: 'REMO2026', coins: 300, bonusCityCard: '', maxUses: 999, redeemedBy: [] },
    { code: 'CHISINAU4D', coins: 500, bonusCityCard: 'chisinau', maxUses: 500, redeemedBy: [] },
    { code: 'MONTREALVIP', coins: 400, bonusCityCard: 'montreal', maxUses: 500, redeemedBy: [] }
  ];
}

function getDefaultGeoVaults(now = Date.now()) {
  return [
    {
      id: 'vault_kiv_gates',
      cityId: 'chisinau',
      title_en: 'Gates of Chișinău Golden Vault',
      title_fr: 'Coffre Doré des Portes de Chișinău',
      hint_en: 'Guarded by the iconic white-stone stepped towers framing the southern entryway on Dacia Boulevard.',
      hint_fr: 'Gardé par les célèbres tours blanches en gradins marquant l’entrée sud sur le Boulevard Dacia.',
      lat: 46.9782,
      lng: 28.8785,
      radiusMeters: 400,
      coinsReward: 350,
      rarity: 'Mythic 4D',
      cardCityId: 'chisinau',
      sponsorName: 'Chișinău Pioneer',
      unlockedBy: [],
      createdAt: now - 3600000
    },
    {
      id: 'vault_par_louvre',
      cityId: 'paris',
      title_en: 'Louvre Glass Pyramid Holographic Vault',
      title_fr: 'Coffre Holographique Pyramide du Louvre',
      hint_en: 'Right at the geometric center of the Cour Napoléon where the glass pyramid mirrors the sunset.',
      hint_fr: 'Au centre géométrique de la Cour Napoléon où la pyramide de verre reflète le crépuscule.',
      lat: 48.8606,
      lng: 2.3376,
      radiusMeters: 350,
      coinsReward: 300,
      rarity: 'Mythic 4D',
      cardCityId: 'paris',
      sponsorName: 'Lucas_Paris',
      unlockedBy: [],
      createdAt: now - 7200000
    },
    {
      id: 'vault_mtl_summit',
      cityId: 'montreal',
      title_en: 'Mount Royal Belvedere Summit Vault',
      title_fr: 'Coffre du Sommet Belvédère Mont-Royal',
      hint_en: 'At the Kondiaronk lookout overlooking the illuminated cyber skyline of Downtown Montréal.',
      hint_fr: 'Au belvédère Kondiaronk surplombant l’horizon illuminé du centre-ville de Montréal.',
      lat: 45.5048,
      lng: -73.5876,
      radiusMeters: 350,
      coinsReward: 250,
      rarity: 'Legendary Gold',
      cardCityId: 'montreal',
      sponsorName: 'REMO Founder',
      unlockedBy: [],
      createdAt: now - 10800000
    },
    {
      id: 'vault_buh_athenaeum',
      cityId: 'bucharest',
      title_en: 'Romanian Athenaeum Classical Vault',
      title_fr: 'Coffre Classique de l’Athénée Roumain',
      hint_en: 'Beside the majestic ionic peristyle in George Enescu square in the heart of Bucharest.',
      hint_fr: 'Aux abords du péristyle ionique majestueux sur la place George Enescu au cœur de Bucarest.',
      lat: 44.4413,
      lng: 26.0973,
      radiusMeters: 350,
      coinsReward: 250,
      rarity: 'Legendary Gold',
      cardCityId: 'bucharest',
      sponsorName: 'Bucharest Hub',
      unlockedBy: [],
      createdAt: now - 14400000
    },
    {
      id: 'vault_nyc_centralpark',
      cityId: 'newyork',
      title_en: 'Central Park Bethesda Terrace Vault',
      title_fr: 'Coffre Bethesda Terrace Central Park',
      hint_en: 'Under the arched Minton tile ceiling by the Angel of the Waters fountain.',
      hint_fr: 'Sous les arches de céramique Minton près de la fontaine Angel of the Waters.',
      lat: 40.7738,
      lng: -73.9708,
      radiusMeters: 400,
      coinsReward: 350,
      rarity: 'Mythic 4D',
      cardCityId: 'newyork',
      sponsorName: 'NYC Explorer',
      unlockedBy: [],
      createdAt: now - 18000000
    },
    {
      id: 'vault_tyo_shibuya',
      cityId: 'tokyo',
      title_en: 'Shibuya Crossing Cyber Vault',
      title_fr: 'Coffre Cyber du Carrefour de Shibuya',
      hint_en: 'Surrounded by massive holographic screens and neon crosswalks at the world’s busiest scramble.',
      hint_fr: 'Entouré d’écrans holographiques géants et de néons au carrefour le plus effervescent du monde.',
      lat: 35.6595,
      lng: 139.7004,
      radiusMeters: 300,
      coinsReward: 400,
      rarity: 'Mythic 4D',
      cardCityId: 'tokyo',
      sponsorName: 'Kenji_Shibuya',
      unlockedBy: [],
      createdAt: now - 21600000
    }
  ];
}

function getDefaultVipShopItems() {
  return [
    // Animated 4D Neon Avatar Frames
    {
      id: 'frame_gold_fire',
      category: 'frame',
      icon: '🔥',
      cssClass: 'av-frame-gold_fire',
      name_en: 'Solar Crown 4D Frame',
      name_fr: 'Cadre Couronne Solaire 4D',
      desc_en: 'Blazing animated golden solar aura around your avatar across REMO.',
      desc_fr: 'Aura solaire dorée animée autour de votre avatar sur tout REMO.',
      price: 300
    },
    {
      id: 'frame_cyber_matrix',
      category: 'frame',
      icon: '⚡',
      cssClass: 'av-frame-cyber_matrix',
      name_en: 'Cyber Matrix Neon Ring',
      name_fr: 'Anneau Néon Cyber Matrix',
      desc_en: 'Spinning cyan & emerald holographic halo for tech creators.',
      desc_fr: 'Halo holographique cyan & émeraude rotatif pour créateurs cyber.',
      price: 250
    },
    {
      id: 'frame_diamond_vip',
      category: 'frame',
      icon: '💎',
      cssClass: 'av-frame-diamond_vip',
      name_en: 'Royal Diamond Prism',
      name_fr: 'Prisme Diamant Royal',
      desc_en: 'Ultra-luxury prismatic violet & pink diamond shimmer.',
      desc_fr: 'Éclat prismatique diamant violet & rose ultra-luxe.',
      price: 500
    },
    {
      id: 'frame_tricolor_crest',
      category: 'frame',
      icon: '👑',
      cssClass: 'av-frame-tricolor_crest',
      name_en: 'Imperial Gold & Ruby Crest',
      name_fr: 'Blason Impérial Or & Rubis',
      desc_en: 'Regal sapphire, gold & crimson aura worthy of World Champions.',
      desc_fr: 'Aura royale saphir, or & rubis digne des Champions du Monde.',
      price: 400
    },

    // Royal Citizen Titles (Displayed next to @Username)
    {
      id: 'title_legend',
      category: 'title',
      icon: '👑',
      badge_en: '👑 URBAN LEGEND',
      badge_fr: '👑 LÉGENDE URBAINE',
      name_en: 'Title: Urban Legend',
      name_fr: 'Titre : Légende Urbaine',
      desc_en: 'Displays the glowing [👑 URBAN LEGEND] badge next to your name.',
      desc_fr: 'Affiche le badge lumineux [👑 LÉGENDE URBAINE] à côté de votre nom.',
      price: 200
    },
    {
      id: 'title_architect',
      category: 'title',
      icon: '💻',
      badge_en: '💻 4D ARCHITECT',
      badge_fr: '💻 ARCHITECTE 4D',
      name_en: 'Title: 4D Cyber Architect',
      name_fr: 'Titre : Architecte Cyber 4D',
      desc_en: 'Elite title for Live HTML coders & digital city builders.',
      desc_fr: 'Titre d’élite pour les créateurs de code HTML Live & bâtisseurs.',
      price: 250
    },
    {
      id: 'title_mogul',
      category: 'title',
      icon: '💎',
      badge_en: '💎 CITY MOGUL',
      badge_fr: '💎 MAGNAT URBAIN',
      name_en: 'Title: World City Mogul',
      name_fr: 'Titre : Magnat des Villes',
      desc_en: 'Prestigious badge reserved for top City Stock investors & collectors.',
      desc_fr: 'Badge de prestige réservé aux grands investisseurs & collectionneurs.',
      price: 450
    },
    {
      id: 'title_pioneer',
      category: 'title',
      icon: '🚀',
      badge_en: '🚀 PIONEER #1',
      badge_fr: '🚀 PIONNIER #1',
      name_en: 'Title: Founding Pioneer',
      name_fr: 'Titre : Pionnier Fondateur',
      desc_en: 'Marks you forever as an early pioneer of the REMO network.',
      desc_fr: 'Certifie votre statut de pionnier historique du réseau REMO.',
      price: 180
    },

    // Real-World & Founder VIP Perks / Vouchers
    {
      id: 'perk_physical_card',
      category: 'perk',
      icon: '🎴',
      name_en: 'Physical Printed 4D City Card (Official Mail)',
      name_fr: 'Carte Ville 4D Imprimée Physique (Envoi Officiel)',
      desc_en: 'Redeem an official voucher for a real 63.5×88.9mm Collector Card approved by the Founder!',
      desc_fr: 'Obtenez un bon officiel pour une vraie Carte Collector 63.5×88.9mm validée par le Fondateur !',
      price: 2500
    },
    {
      id: 'perk_spotlight_24h',
      category: 'perk',
      icon: '📌',
      name_en: 'Front-Page #1 Spotlight Pass (24h)',
      name_fr: 'Pass Publication Épinglée #1 (24h)',
      desc_en: 'Official voucher to feature your best post at #1 on REMO + bonus Mythic status!',
      desc_fr: 'Bon officiel pour propulser votre post en #1 sur REMO avec statut VIP !',
      price: 750
    },
    {
      id: 'perk_mythic_pack',
      category: 'perk',
      icon: '🌌',
      name_en: 'Guaranteed Mythic 4D Founder Card Drop',
      name_fr: 'Carte Fondateur Mythic 4D Garantie',
      desc_en: 'Instantly mints a 1-of-1 Mythic 4D City Card directly into your Vault + VIP Ticket!',
      desc_fr: 'Forge instantanément une Carte Ville Mythic 4D dans votre Coffre + Ticket VIP !',
      price: 900
    }
  ];
}

/* ── Instant Bilingual EN ⇄ FR Auto-Translator & Viral Co-Pilot Engine ── */
const REMO_TRANSLATOR = {
  phrasesEnToFr: [
    ['what is happening in', 'que se passe-t-il à'],
    ['right now', 'en ce moment'],
    ['tonight in', 'ce soir à'],
    ['live from', 'en direct de'],
    ['sunset over', 'coucher de soleil sur'],
    ['night vibe in', 'ambiance nocturne à'],
    ['night vibes in', 'ambiance nocturne à'],
    ['golden hour in', 'heure dorée à'],
    ['check out this', 'découvrez ce'],
    ['who wants to battle', 'qui veut affronter'],
    ['drop a comment', 'laissez un commentaire'],
    ['rate this view', 'notez cette vue'],
    ['best city in the world', 'meilleure ville du monde'],
    ['tap to play', 'touchez pour jouer'],
    ['built in pure html', 'codé en pur HTML'],
    ['good morning', 'bonjour'],
    ['good night', 'bonne nuit'],
    ['street food', 'cuisine de rue'],
    ['hidden gem', 'pépite secrète'],
    ['unbelievable view', 'vue incroyable'],
    ['let us go', 'allons-y'],
    ['join me in', 'rejoignez-moi à'],
    ['who is awake in', 'qui est réveillé à']
  ],
  wordsEnToFr: {
    amazing: 'incroyable', awesome: 'génial', beautiful: 'magnifique', night: 'nuit',
    city: 'ville', world: 'monde', sky: 'ciel', sunset: 'coucher de soleil',
    sunrise: 'lever du soleil', street: 'rue', lights: 'lumières', music: 'musique',
    game: 'jeu', code: 'code', video: 'vidéo', photo: 'photo', love: 'adore',
    today: 'aujourd’hui', tonight: 'ce soir', friends: 'amis', welcome: 'bienvenue',
    coffee: 'café', winter: 'hiver', summer: 'été', magic: 'magie', energy: 'énergie',
    new: 'nouveau', first: 'premier', best: 'meilleur', winner: 'gagnant', card: 'carte',
    coins: 'pièces', secret: 'secret', downtown: 'centre-ville', architecture: 'architecture',
    festival: 'festival', party: 'soirée', dream: 'rêve', future: 'futur', fast: 'rapide',
    watch: 'regardez', play: 'jouez', vote: 'votez', share: 'partagez', here: 'ici',
    with: 'avec', from: 'depuis', my: 'mon', your: 'votre', our: 'notre', the: 'le', and: 'et', in: 'à'
  },

  detectLang(text = '') {
    const s = String(text).toLowerCase();
    const frSignals = /[éèêëàâîïôûùçœ]|(\b(le|la|les|des|dans|avec|pour|une|cette|monde|ville|soir|magnifique|incroyable|bienvenue|bonjour|voici|depuis)\b)/i;
    return frSignals.test(s) ? 'fr' : 'en';
  },

  translateSync(text = '', targetLang = 'fr') {
    if (!text || !text.trim()) return '';
    const srcLang = this.detectLang(text);
    if (srcLang === targetLang) return text.trim();

    let out = text.trim();
    if (targetLang === 'fr') {
      this.phrasesEnToFr.forEach(([enP, frP]) => {
        const rx = new RegExp(enP, 'gi');
        out = out.replace(rx, frP);
      });
      out = out.replace(/\b([A-Za-z']+)\b/g, (m) => {
        const low = m.toLowerCase();
        if (!this.wordsEnToFr[low]) return m;
        const tr = this.wordsEnToFr[low];
        return m[0] === m[0].toUpperCase() ? tr.charAt(0).toUpperCase() + tr.slice(1) : tr;
      });
      return out === text.trim() ? `🇫🇷 ${out}` : out;
    } else {
      // FR -> EN reverse phrase & word pass
      this.phrasesEnToFr.forEach(([enP, frP]) => {
        const rx = new RegExp(frP, 'gi');
        out = out.replace(rx, enP);
      });
      const revWords = {};
      Object.entries(this.wordsEnToFr).forEach(([enW, frW]) => { revWords[frW.toLowerCase()] = enW; });
      revWords['à'] = 'in'; revWords['et'] = 'and'; revWords['la'] = 'the'; revWords['les'] = 'the';
      revWords['magnifique'] = 'stunning'; revWords['incroyable'] = 'incredible'; revWords['découvrez'] = 'check out';
      revWords['bonjour'] = 'hello'; revWords['soirée'] = 'nightlife'; revWords['ville'] = 'city';
      out = out.replace(/([A-Za-zÀ-ÿ’']+)/g, (m) => {
        const low = m.toLowerCase();
        if (!revWords[low]) return m;
        const tr = revWords[low];
        return m[0] === m[0].toUpperCase() ? tr.charAt(0).toUpperCase() + tr.slice(1) : tr;
      });
      return out === text.trim() ? `🇬🇧 ${out}` : out;
    }
  },

  makeBilingualPair(rawText = '') {
    const clean = String(rawText || '').trim();
    if (!clean) return { en: '', fr: '' };
    const lang = this.detectLang(clean);
    if (lang === 'fr') {
      return { en: this.translateSync(clean, 'en'), fr: clean };
    }
    return { en: clean, fr: this.translateSync(clean, 'fr') };
  }
};

/* ── 3B. REMO_WEATHER — Live World City Clock, Weather & 2X Storm Surge Engine ── */
const REMO_CITY_TIMEZONES = {
  montreal: 'America/Toronto',
  toronto: 'America/Toronto',
  newyork: 'America/New_York',
  miami: 'America/New_York',
  losangeles: 'America/Los_Angeles',
  rio: 'America/Sao_Paulo',
  london: 'Europe/London',
  lisbon: 'Europe/Lisbon',
  paris: 'Europe/Paris',
  monaco: 'Europe/Monaco',
  barcelona: 'Europe/Madrid',
  rome: 'Europe/Rome',
  geneva: 'Europe/Zurich',
  berlin: 'Europe/Berlin',
  amsterdam: 'Europe/Amsterdam',
  bucharest: 'Europe/Bucharest',
  chisinau: 'Europe/Chisinau',
  istanbul: 'Europe/Istanbul',
  cairo: 'Africa/Cairo',
  dubai: 'Asia/Dubai',
  singapore: 'Asia/Singapore',
  seoul: 'Asia/Seoul',
  tokyo: 'Asia/Tokyo',
  sydney: 'Australia/Sydney'
};

const REMO_WEATHER = {
  _liveCache: {},
  _fetching: {},

  getLocalClock(city) {
    const now = new Date();
    const tz = city && REMO_CITY_TIMEZONES[city.id];
    if (tz) {
      try {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).formatToParts(now);
        const hh = parts.find((p) => p.type === 'hour')?.value || '12';
        const mm = parts.find((p) => p.type === 'minute')?.value || '00';
        const hNum = Number(hh) % 24;
        return { timeStr: `${String(hNum).padStart(2, '0')}:${mm}`, hour: hNum, isNight: hNum < 6 || hNum >= 20 };
      } catch (e) {}
    }
    // Longitude solar timezone fallback for any user-founded city!
    const offsetHrs = Math.round(((city && Number(city.lng)) || 0) / 15);
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const localDate = new Date(utcMs + offsetHrs * 3600000);
    const hNum = localDate.getHours();
    const mNum = localDate.getMinutes();
    return {
      timeStr: `${String(hNum).padStart(2, '0')}:${String(mNum).padStart(2, '0')}`,
      hour: hNum,
      isNight: hNum < 6 || hNum >= 20
    };
  },

  maybeHydrateOnline(city) {
    if (!city || !city.id || typeof fetch === 'undefined') return;
    const cached = this._liveCache[city.id];
    if (cached && Date.now() - cached.ts < 15 * 60000) return;
    if (this._fetching[city.id]) return;
    this._fetching[city.id] = true;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${Number(city.lat).toFixed(2)}&longitude=${Number(city.lng).toFixed(2)}&current_weather=true`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.current_weather) {
          const cw = data.current_weather;
          const code = Number(cw.weathercode || 0);
          const mapped = this.mapWmoCode(code, cw.is_day === 0);
          this._liveCache[city.id] = {
            ts: Date.now(),
            tempC: Math.round(cw.temperature),
            ...mapped
          };
        }
      })
      .catch(() => {})
      .finally(() => {
        this._fetching[city.id] = false;
      });
  },

  mapWmoCode(code, isNight) {
    if (code >= 95) return { icon: '⛈️', cond_en: 'Thunderstorm', cond_fr: 'Orage Électrique', naturalStorm: true };
    if (code >= 71 && code <= 86) return { icon: '❄️', cond_en: 'Snowfall', cond_fr: 'Chute de Neige', naturalStorm: true };
    if (code >= 51 && code <= 67) return { icon: '🌧️', cond_en: 'Neon Rain', cond_fr: 'Pluie Fine', naturalStorm: true };
    if (code >= 80 && code <= 82) return { icon: '🌧️', cond_en: 'Rain Showers', cond_fr: 'Averses', naturalStorm: true };
    if (code >= 1 && code <= 3) return { icon: isNight ? '☁️' : '⛅', cond_en: 'Partly Cloudy', cond_fr: 'Nuageux', naturalStorm: false };
    if (code >= 45 && code <= 48) return { icon: '🌫️', cond_en: 'Misty Glow', cond_fr: 'Brume', naturalStorm: false };
    return { icon: isNight ? '🌙' : '☀️', cond_en: isNight ? 'Clear Night' : 'Sunny Sky', cond_fr: isNight ? 'Nuit Claire' : 'Grand Soleil', naturalStorm: false };
  },

  getCityLiveStatus(cityOrId) {
    const city = typeof cityOrId === 'string'
      ? (typeof getCityById === 'function' ? getCityById(cityOrId) : { id: cityOrId, lat: 45.5, lng: -73.5 })
      : (cityOrId || { id: 'montreal', lat: 45.5, lng: -73.5 });

    const clock = this.getLocalClock(city);
    this.maybeHydrateOnline(city);

    let tempC, icon, cond_en, cond_fr, naturalStorm;
    const live = this._liveCache[city.id];
    if (live) {
      ({ tempC, icon, cond_en, cond_fr, naturalStorm } = live);
    } else {
      // Smart deterministic offline climate + live day/night cycle
      const absLat = Math.abs(Number(city.lat) || 45);
      const month = new Date().getMonth(); // 0-11
      const northernSummer = (Number(city.lat) >= 0) ? (month >= 4 && month <= 8) : (month <= 2 || month >= 10);
      const baseTemp = Math.round(29 - absLat * 0.42 + (northernSummer ? 6 : -3) + (clock.isNight ? -4 : 3));
      let hash = 0;
      const seedStr = `${city.id}_${new Date().getDate()}_${Math.floor(clock.hour / 4)}`;
      for (let i = 0; i < seedStr.length; i++) hash = (hash * 31 + seedStr.charCodeAt(i)) % 100;

      tempC = baseTemp + ((hash % 5) - 2);
      if (hash >= 86) {
        if (tempC <= 1) {
          icon = '❄️'; cond_en = 'Snow Surge'; cond_fr = 'Neige Vive'; naturalStorm = true;
        } else {
          icon = '⛈️'; cond_en = 'Cyber Storm'; cond_fr = 'Orage Cyber'; naturalStorm = true;
        }
      } else if (hash >= 74) {
        icon = '🌧️'; cond_en = 'Light Rain'; cond_fr = 'Pluie Légère'; naturalStorm = true;
      } else if (hash >= 45) {
        icon = clock.isNight ? '☁️' : '⛅'; cond_en = 'Breezy'; cond_fr = 'Brise Douce'; naturalStorm = false;
      } else {
        icon = clock.isNight ? '🌙' : '☀️';
        cond_en = clock.isNight ? 'Starry Night' : 'Clear Sky';
        cond_fr = clock.isNight ? 'Nuit Étoilée' : 'Ciel Azur';
        naturalStorm = false;
      }
    }

    const surgeMap = (REMO_STORE.state && REMO_STORE.state.cityWeatherSurge) || {};
    const explicit = surgeMap[city.id];
    const isSurge = explicit === true ? true : explicit === false ? false : !!naturalStorm;
    if (explicit === true && !naturalStorm) {
      icon = tempC <= 0 ? '❄️' : '⛈️';
      cond_en = tempC <= 0 ? 'Snow Surge 2X' : 'Storm Surge 2X';
      cond_fr = tempC <= 0 ? 'Tempête Neige 2X' : 'Orage Bonus 2X';
    }

    return {
      cityId: city.id,
      timeStr: clock.timeStr,
      hour: clock.hour,
      isNight: clock.isNight,
      dayNightIcon: clock.isNight ? '🌙' : '☀️',
      tempC,
      icon,
      cond_en,
      cond_fr,
      isSurge
    };
  },

  toggleAdminCitySurge(cityId) {
    if (!REMO_STORE.state) return false;
    REMO_STORE.state.cityWeatherSurge = REMO_STORE.state.cityWeatherSurge || {};
    const cur = this.getCityLiveStatus(cityId).isSurge;
    REMO_STORE.state.cityWeatherSurge[cityId] = !cur;
    REMO_STORE.save(true, 'weather_surge_toggle');
    return !cur;
  }
};

function getShowcaseTimeCapsuleHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;user-select:none}
  body{margin:0;height:100vh;overflow:hidden;background:radial-gradient(circle at 50% 35%,#1e1b4b,#040714 75%);color:#fff;font-family:'Segoe UI',sans-serif}
  canvas{display:block;width:100%;height:100%;cursor:pointer}
  .hud{position:fixed;top:40px;left:12px;right:12px;display:flex;justify-content:space-between;font-weight:900;font-size:13px;pointer-events:none;text-shadow:0 2px 8px #000}
  .pill{background:rgba(15,23,42,0.82);border:1px solid #fbbf24;padding:4px 10px;border-radius:99px;color:#fde68a}
  </style></head><body>
  <div class="hud"><span class="pill">🔓 CHIȘINĂU × MONTRÉAL VAULT</span><span class="pill" id="sc">💎 TAP GEMS: 0</span></div>
  <canvas id="c"></canvas>
  <script>
  const cv=document.getElementById('c'),ctx=cv.getContext('2d');
  let W,H,pts=0,gems=[];
  function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight}rs();addEventListener('resize',rs);
  function spawn(){gems.push({x:40+Math.random()*(W-80),y:H+20,vy:-1.8-Math.random()*2.2,r:20,ic:['💎','🪙','👑','🇲🇩','⚜️'][Math.floor(Math.random()*5)]})}
  for(let i=0;i<7;i++)spawn();
  cv.addEventListener('pointerdown',e=>{
    const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    gems.forEach(g=>{if(Math.hypot(g.x-mx,g.y-my)<34){pts+=25;g.y=H+40;g.x=40+Math.random()*(W-80);document.getElementById('sc').textContent='💎 TAP GEMS: '+pts}});
  });
  function loop(){
    ctx.fillStyle='rgba(4,7,20,0.28)';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='900 18px sans-serif';ctx.fillStyle='#38bdf8';
    ctx.fillText('🎉 TIME-CAPSULE UNSEALED! TAP RISING TREASURES',W/2,H-24);
    ctx.font='28px serif';
    gems.forEach(g=>{g.y+=g.vy;if(g.y<-30){g.y=H+30;g.x=40+Math.random()*(W-80)}ctx.fillText(g.ic,g.x,g.y)});
    requestAnimationFrame(loop);
  }loop();
  </script></body></html>`;
}

function upgradeEcosystemState(st) {
  if (!st) return;
  if (st.settings && st.settings.happyHour2x === undefined) st.settings.happyHour2x = false;
  if (st.settings && st.settings.rewards && !st.settings.rewards.referralBonus) {
    st.settings.rewards.referralBonus = 100;
  }
  if (!st.cityWeatherSurge) {
    st.cityWeatherSurge = { chisinau: true, montreal: true };
  }
  if (!st.cityMayors) {
    st.cityMayors = {
      montreal: 'u_admin_founder',
      chisinau: 'u_elena_kiv',
      paris: 'u_lucas_par',
      tokyo: 'u_kenji_tyo'
    };
  }
  if (!Array.isArray(st.bounties)) st.bounties = getDefaultBounties();
  if (!Array.isArray(st.promoCodes)) st.promoCodes = getDefaultPromoCodes();
  if (!st.cityPortfolios) st.cityPortfolios = {};
  if (!Array.isArray(st.vipShopItems) || st.vipShopItems.length === 0) {
    st.vipShopItems = getDefaultVipShopItems();
  }
  if (!Array.isArray(st.vipOrders)) st.vipOrders = [];
  if (!Array.isArray(st.geoVaults) || st.geoVaults.length === 0) {
    st.geoVaults = getDefaultGeoVaults();
  }
  if (!Array.isArray(st.serializedCoins) || st.serializedCoins.length === 0) {
    st.serializedCoins = [
      { id: 'sc_0001', serial: '0001', coinsValue: 1000, ownerUid: 'u_admin_founder', ownerName: 'Founder Admin', mintedAt: Date.now() - 86400000, status: 'vault', note: 'Genesis Mint #0001' }
    ];
  }
  if (!Array.isArray(st.wishes) || st.wishes.length === 0) {
    st.wishes = getDefaultWishes();
  }

  // Upgrade every citizen with Referral Codes & VIP Cosmetics
  (st.users || []).forEach((u, idx) => {
    const pNum = u.passportNum || String(idx + 1).padStart(4, '0');
    if (!u.referralCode) u.referralCode = `REMO-${pNum}`;
    if (u.referralsCount === undefined) {
      u.referralsCount = u.uid === 'u_admin_founder' ? 5 : u.uid === 'u_elena_kiv' ? 3 : u.uid === 'u_lucas_par' ? 2 : 0;
    }
    if (!Array.isArray(u.ownedShopItems)) {
      if (u.uid === 'u_admin_founder') u.ownedShopItems = ['frame_gold_fire', 'title_legend'];
      else if (u.uid === 'u_elena_kiv') u.ownedShopItems = ['frame_diamond_vip', 'title_architect'];
      else u.ownedShopItems = [];
    }
    if (u.equippedFrame === undefined) {
      u.equippedFrame = u.uid === 'u_admin_founder' ? 'frame_gold_fire' : u.uid === 'u_elena_kiv' ? 'frame_diamond_vip' : '';
    }
    if (u.equippedTitleId === undefined) {
      u.equippedTitleId = u.uid === 'u_admin_founder' ? 'title_legend' : u.uid === 'u_elena_kiv' ? 'title_architect' : '';
    }
  });

  // Ensure existing HTML mini-app HUDs sit cleanly below top post badges
  (st.posts || []).forEach((p) => {
    if (p.mediaType === 'html_app' && p.htmlCode) {
      p.htmlCode = p.htmlCode.replace(/\.hud\{position:fixed;top:(10|12)px;/g, '.hud{position:fixed;top:40px;');
    }
  });

  // Ensure all demo posts (capsule and duet) are permanently stripped
  if (Array.isArray(st.posts)) {
    st.posts = st.posts.filter((p) => p && p.id !== 'post_capsule_demo_1' && p.id !== 'post_duet_demo_1');
  }

  // #5: Upgrade 1-on-1 Direct Messages & Seed an Unclaimed +50 🪙 Gift Envelope!
  st.directMessages = Array.isArray(st.directMessages) ? st.directMessages : [];
  st.directMessages.forEach((d) => {
    if (!d.toUid || d.toUid === 'peer') d.toUid = 'u_admin_founder';
    if (!d.fromUid) d.fromUid = 'u_elena_kiv';
  });
  if (!st.directMessages.some((d) => d.id === 'dm_env_demo_1')) {
    st.directMessages.push({
      id: 'dm_env_demo_1',
      fromUid: 'u_elena_kiv',
      fromName: 'Elena KIV',
      fromCity: 'chisinau',
      toUid: 'u_admin_founder',
      text: 'Salut from Chișinău 🇲🇩! Open this Golden Envelope gift inside our private chat!',
      envelopeCoins: 50,
      envelopeClaimed: false,
      ts: Date.now() - 60000
    });
  }

  // #8: Seed World City Digital Bottles floating across the ocean!
  if (!Array.isArray(st.worldBottles) || st.worldBottles.length === 0) {
    st.worldBottles = [
      {
        id: 'btl_demo_tyo',
        fromUid: 'u_kenji_tyo',
        fromName: 'Kenji TYO',
        fromCityId: 'tokyo',
        toCityId: 'montreal',
        km: 10390,
        text_en: 'Greetings from Shibuya Crossing at midnight 🏯! What is the best midnight street food in your city?',
        text_fr: 'Salutations de Shibuya à minuit 🏯 ! Quel est le meilleur plat nocturne dans votre ville ?',
        bonusCoins: 25,
        isGoldenAdmin: false,
        caughtByUid: '',
        repliedByName: '',
        replyText: '',
        createdAt: Date.now() - 360000
      },
      {
        id: 'btl_demo_kiv',
        fromUid: 'u_elena_kiv',
        fromName: 'Elena KIV',
        fromCityId: 'chisinau',
        toCityId: 'paris',
        km: 1980,
        text_en: 'Sending warm vibes from Valea Morilor lake in Chișinău 🇲🇩! Tell me one secret spot in your city!',
        text_fr: 'Salutations chaleureuses du lac Valea Morilor à Chișinău 🇲🇩 ! Partagez un lieu secret de votre ville !',
        bonusCoins: 30,
        isGoldenAdmin: false,
        caughtByUid: '',
        repliedByName: '',
        replyText: '',
        createdAt: Date.now() - 180000
      },
      {
        id: 'btl_demo_founder',
        fromUid: 'u_admin_founder',
        fromName: 'Founder Admin',
        fromCityId: 'montreal',
        toCityId: 'chisinau',
        km: 7140,
        text_en: '👑 GOLDEN FOUNDER BOTTLE! Whoever catches this ocean bottle wins +100 🪙 Treasury Coins!',
        text_fr: '👑 BOUTEILLE D’OR FONDATEUR ! Celui qui pêche cette bouteille gagne +100 🪙 Pièces Royales !',
        bonusCoins: 100,
        isGoldenAdmin: true,
        caughtByUid: '',
        repliedByName: '',
        replyText: '',
        createdAt: Date.now() - 90000
      }
    ];
  }
}

/* ── 4. REMO_STORE Singleton ── */
const REMO_STORE = {
  KEY: 'remo_master_state_v1',
  USER_KEY: 'remo_current_user_uid',
  FB_KEY: 'remo_firebase_config_json',
  ADMIN_MODE_KEY: 'remo_admin_godmode',
  state: null,
  fbApp: null,
  fbDb: null,
  fbAuth: null,
  deletedPostIds: null,
  deletedUserIds: null,

  init() {
    try {
      this.deletedPostIds = new Set(JSON.parse(localStorage.getItem('remo_deleted_posts') || '[]'));
    } catch (e) {
      this.deletedPostIds = new Set();
    }
    try {
      this.deletedUserIds = new Set(JSON.parse(localStorage.getItem('remo_deleted_users') || '[]'));
    } catch (e) {
      this.deletedUserIds = new Set();
    }
    try {
      const raw = localStorage.getItem(this.KEY);
      this.state = raw ? JSON.parse(raw) : createDefaultState();
    } catch (e) {
      this.state = createDefaultState();
    }
    if (!this.state.settings) this.state = createDefaultState();
    // Strip out legacy built-in mock posts from previous builds
    const legacyMockIds = new Set(['post_capsule_demo_1', 'post_duet_demo_1', 'post_html_fireworks', 'post_html_racer_kiv', 'post_1', 'post_2', 'post_3', 'post_4', 'post_duet_tokyo_paris', 'post_duet_mtl_chisinau', 'post_capsule_locked', 'post_duo_live_kiv_mtl', 'demo_1']);
    if (Array.isArray(this.state.posts)) {
      this.state.posts = this.state.posts.filter((p) =>
        p && p.id &&
        !legacyMockIds.has(p.id) &&
        !p.id.startsWith('demo_') &&
        !p.id.includes('demo') &&
        (!this.deletedPostIds || !this.deletedPostIds.has(p.id))
      );
    }
    // Strip out legacy fake citizen00XX accounts and deleted users from local state
    if (Array.isArray(this.state.users)) {
      this.state.users = this.state.users.filter((u) =>
        u && u.uid &&
        !this.deletedUserIds.has(u.uid) &&
        !(u.email && /^citizen\d+@remo\.world$/i.test(u.email) && u.role !== 'admin') &&
        !(u.name && u.name.startsWith('REMO Pioneer #'))
      );
    }
    upgradeEcosystemState(this.state);
    this.save(false);
    this.initFirebaseIfConfigured();

    // Listen to live cross-tab broadcasts (Admin Office <-> Social Network)
    if (REMO_LIVE_BUS) {
      REMO_LIVE_BUS.onmessage = (ev) => {
        if (ev.data && ev.data.type === 'STATE_UPDATED') {
          this.reloadFromDisk();
          window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: ev.data }));
        }
      };
    }
    window.addEventListener('storage', (ev) => {
      if (ev.key === this.KEY || ev.key === 'remo_cities_override' || ev.key === this.ADMIN_MODE_KEY) {
        this.reloadFromDisk();
        window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'storage' } }));
      }
    });
  },

  isCurrentUserAdmin() {
    const u = this.getCurrentUser();
    if (!u) return false;
    const adminEmail = (this.state && this.state.settings && this.state.settings.adminEmail) || 'andart1174@gmail.com';
    const emailMatch = Boolean(u.email && u.email.toLowerCase().trim() === adminEmail.toLowerCase().trim());
    const roleMatch = Boolean(u.role === 'admin');
    const uidMatch = Boolean(u.uid === 'u_admin_founder');
    return emailMatch || roleMatch || uidMatch;
  },

  isAdminUnlocked() {
    if (!this.isCurrentUserAdmin()) return false;
    return localStorage.getItem(this.ADMIN_MODE_KEY) === '1' || sessionStorage.getItem('remo_admin_unlocked') === '1';
  },

  setAdminUnlocked(active) {
    if (active) {
      localStorage.setItem(this.ADMIN_MODE_KEY, '1');
      sessionStorage.setItem('remo_admin_unlocked', '1');
    } else {
      localStorage.removeItem(this.ADMIN_MODE_KEY);
      sessionStorage.removeItem('remo_admin_unlocked');
    }
    if (REMO_LIVE_BUS) {
      REMO_LIVE_BUS.postMessage({ type: 'STATE_UPDATED', reason: 'admin_mode', ts: Date.now() });
    }
    window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'admin_mode' } }));
  },

  adminAdjustUserCoins(targetUid, mode = 'add', amount = 100, note = '') {
    const u = this.state.users.find((x) => x.uid === targetUid);
    if (!u) return null;
    const val = Math.max(0, Math.round(Number(amount) || 0));
    if (mode === 'set') {
      u.coins = val;
      u.lifetimeCoins = Math.max(u.lifetimeCoins || 0, val);
    } else if (mode === 'sub') {
      u.coins = Math.max(0, (u.coins || 0) - val);
    } else {
      u.coins = (u.coins || 0) + val;
      u.lifetimeCoins = (u.lifetimeCoins || 0) + val;
    }
    if (note && note.trim()) {
      this.state.directMessages = this.state.directMessages || [];
      this.state.directMessages.push({
        id: 'dm_adm_' + Date.now(),
        fromUid: 'u_admin_founder',
        fromName: '👑 REMO Treasury',
        toUid: u.uid,
        text: `🪙 [${mode === 'sub' ? '-' : mode === 'set' ? '=' : '+'}${val} REMO Coins → @${u.name}]: ${note.trim()}`,
        ts: Date.now()
      });
    }
    RemoAudio.play('coin');
    this.save(true, 'admin_coin_transfer', { uid: u.uid, coins: u.coins });
    return u;
  },

  getCityMayor(cityId) {
    if (!cityId || !this.state.cityMayors) return null;
    const mayorUid = this.state.cityMayors[cityId];
    if (mayorUid) {
      const explicit = this.state.users.find((u) => u.uid === mayorUid && !u.banned);
      if (explicit) return explicit;
    }
    // Dynamic auto-mayor: richest citizen of that city!
    const candidates = (this.state.users || [])
      .filter((u) => u.homeCity === cityId && !u.banned)
      .sort((a, b) => (b.lifetimeCoins || b.coins || 0) - (a.lifetimeCoins || a.coins || 0));
    return candidates[0] || null;
  },

  setCityMayor(cityId, uid) {
    this.state.cityMayors = this.state.cityMayors || {};
    if (!uid) delete this.state.cityMayors[cityId];
    else this.state.cityMayors[cityId] = uid;
    this.save(true, 'mayor_updated');
  },

  getCitySharePrice(cityId) {
    const score = (this.state.cityScores && this.state.cityScores[cityId]) || 1500;
    return Math.max(25, Math.round(score / 25));
  },

  reloadFromDisk() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const diskState = JSON.parse(raw);
        if (diskState && typeof diskState === 'object') {
          // Never discard newer in-memory posts when reloading from disk
          const memPosts = this.state.posts || [];
          if (Array.isArray(diskState.posts)) {
            memPosts.forEach((mp) => {
              if (mp && mp.id && !diskState.posts.some((dp) => dp.id === mp.id)) {
                diskState.posts.unshift(mp);
              }
            });
            diskState.posts = diskState.posts.filter((p) =>
              p && p.id &&
              (!this.deletedPostIds || !this.deletedPostIds.has(p.id)) &&
              !p.id.startsWith('demo') &&
              !p.id.includes('demo')
            );
          } else {
            diskState.posts = memPosts.filter((p) =>
              p && p.id &&
              (!this.deletedPostIds || !this.deletedPostIds.has(p.id)) &&
              !p.id.startsWith('demo') &&
              !p.id.includes('demo')
            );
          }
          if (Array.isArray(diskState.users)) {
            diskState.users = diskState.users.filter((u) =>
              u && u.uid &&
              (!this.deletedUserIds || !this.deletedUserIds.has(u.uid)) &&
              !(u.email && /^citizen\d+@remo\.world$/i.test(u.email) && u.role !== 'admin') &&
              !(u.name && u.name.startsWith('REMO Pioneer #'))
            );
          }
          this.state = diskState;
          if (!Array.isArray(this.state.vipShopItems) || this.state.vipShopItems.length === 0) {
            this.state.vipShopItems = getDefaultVipShopItems();
          }
          if (!Array.isArray(this.state.vipOrders)) {
            this.state.vipOrders = [];
          }
        }
      }
    } catch (e) {}
  },

  save(broadcast = true, reason = 'update', payload = null) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, trimming local cache:', e);
      try {
        const pruned = Object.assign({}, this.state);
        if (Array.isArray(pruned.posts)) {
          // Keep top 20 posts in localStorage; full posts live safely in Firestore remo_posts
          pruned.posts = pruned.posts.slice(0, 20);
        }
        localStorage.setItem(this.KEY, JSON.stringify(pruned));
      } catch (e2) {}
    }
    if (this.fbDb && reason !== 'cloud_sync' && reason !== 'cloud_live_update') {
      this.syncToFirestore(reason);
    }
    if (broadcast && REMO_LIVE_BUS) {
      REMO_LIVE_BUS.postMessage({ type: 'STATE_UPDATED', reason, payload, ts: Date.now() });
    }
    if (broadcast) {
      window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason, payload } }));
    }
  },

  nextSerial() {
    this.state.serialCounter = (this.state.serialCounter || 14) + 1;
    return String(this.state.serialCounter).padStart(4, '0');
  },

  /* ── Current Citizen, Cosmetics & Viral Referral Engine ── */
  getCurrentUser() {
    const uid = localStorage.getItem(this.USER_KEY);
    if (!uid) return null;
    return this.state.users.find((u) => u.uid === uid) || null;
  },

  getUserCosmetics(uid) {
    const u = uid ? (this.state.users || []).find((x) => x.uid === uid) : null;
    if (!u) return { frameClass: '', title_en: '', title_fr: '' };
    const shop = this.state.vipShopItems || [];
    const frObj = u.equippedFrame ? shop.find((i) => i.id === u.equippedFrame) : null;
    const tiObj = u.equippedTitleId ? shop.find((i) => i.id === u.equippedTitleId) : null;
    return {
      frameClass: frObj && frObj.cssClass ? frObj.cssClass : '',
      title_en: tiObj ? (tiObj.badge_en || tiObj.name_en) : '',
      title_fr: tiObj ? (tiObj.badge_fr || tiObj.name_fr) : ''
    };
  },

  redeemReferralCode(claimerUid, rawCode) {
    if (!claimerUid || !rawCode) return { ok: false, reason: 'empty' };
    const clean = String(rawCode).trim().toUpperCase();
    const claimer = (this.state.users || []).find((u) => u.uid === claimerUid);
    if (!claimer) return { ok: false, reason: 'no_user' };
    if (claimer.referredBy) return { ok: false, reason: 'already_claimed' };

    const inviter = (this.state.users || []).find((u) =>
      (u.referralCode && u.referralCode.toUpperCase() === clean) ||
      (`PASS${u.passportNum}` === clean) ||
      (`REMO-${u.passportNum}` === clean)
    );
    if (!inviter) return { ok: false, reason: 'invalid' };
    if (inviter.uid === claimer.uid) return { ok: false, reason: 'self' };

    const bonus = (this.state.settings.rewards && this.state.settings.rewards.referralBonus) || 100;
    claimer.referredBy = inviter.referralCode || `REMO-${inviter.passportNum}`;
    claimer.coins = (claimer.coins || 0) + bonus;
    claimer.lifetimeCoins = (claimer.lifetimeCoins || 0) + bonus;

    inviter.referralsCount = (inviter.referralsCount || 0) + 1;
    inviter.coins = (inviter.coins || 0) + bonus;
    inviter.lifetimeCoins = (inviter.lifetimeCoins || 0) + bonus;

    this.state.directMessages = this.state.directMessages || [];
    this.state.directMessages.push({
      id: 'dm_ref_' + Date.now(),
      fromUid: inviter.uid,
      fromName: `🤝 @${inviter.name}`,
      toUid: claimer.uid,
      text: `🎉 Referral Bonus Activated! Both @${inviter.name} and @${claimer.name} earned +${bonus} 🪙 REMO Coins!`,
      ts: Date.now()
    });
    RemoAudio.play('fanfare');
    this.save(true, 'referral_claimed', { inviter: inviter.name, claimer: claimer.name, bonus });
    return { ok: true, inviter, claimer, bonus };
  },

  ensureGuestOrCitizen(name, email, homeCity = 'montreal', isAdmin = false, fbUid = '') {
    // 1. If user already logged in and no specific new email/fbUid is requested, keep current user
    if (!email && !fbUid) {
      const cur = this.getCurrentUser();
      if (cur) return cur;
      // If there's an existing registered user, use it
      if (this.state.users && this.state.users.length > 0) {
        const u0 = this.state.users[0];
        localStorage.setItem(this.USER_KEY, u0.uid);
        return u0;
      }
    }

    let u = email ? this.state.users.find((x) => x.email && x.email.toLowerCase() === email.toLowerCase()) : null;
    if (!u && fbUid) {
      u = this.state.users.find((x) => x.uid === ('u_fb_' + fbUid) || x.fbUid === fbUid);
    }

    if (!u) {
      // Only create if we actually have an email or fbUid (real sign-up)
      if (!email && !fbUid) {
        return this.state.users[0] || null;
      }
      const pNum = String(this.state.users.length + 1).padStart(4, '0');
      const bonus = this.state.settings?.rewards?.signupBonus || 150;
      const finalEmail = email || (fbUid ? `user_${fbUid.slice(0, 8)}@gmail.com` : '');

      u = {
        uid: fbUid ? ('u_fb_' + fbUid) : ('u_' + Date.now().toString(36)),
        fbUid: fbUid || '',
        name: name || 'Citizen #' + pNum,
        email: finalEmail,
        role: isAdmin || (email && email.toLowerCase() === this.state.settings?.adminEmail?.toLowerCase()) ? 'admin' : 'citizen',
        verified: true,
        homeCity: homeCity || 'montreal',
        passportNum: pNum,
        referralCode: `REMO-${pNum}`,
        referralsCount: 0,
        referredBy: '',
        ownedShopItems: [],
        equippedFrame: '',
        equippedTitleId: '',
        coins: bonus,
        lifetimeCoins: bonus,
        streak: 1,
        visas: [homeCity || 'montreal'],
        avatarColor: '#6366f1'
      };
      this.state.users.push(u);
      this.mintCardForUser(u.uid, homeCity || 'montreal', 'Rare', false);
    } else {
      if (name && (!u.name || u.name.startsWith('Citizen #') || u.name === 'REMO Pioneer')) {
        u.name = name;
      }
      if (fbUid && !u.fbUid) u.fbUid = fbUid;
    }

    localStorage.setItem(this.USER_KEY, u.uid);
    const adminEmail = (this.state && this.state.settings && this.state.settings.adminEmail) || 'andart1174@gmail.com';
    if (u && u.email && u.email.toLowerCase().trim() === adminEmail.toLowerCase().trim()) {
      u.role = 'admin';
      this.setAdminUnlocked(true);
    }
    // Auto-apply pending URL Referral Code (?ref=...) if present!
    const pendingRef = localStorage.getItem('remo_pending_ref');
    if (pendingRef && !u.referredBy) {
      this.redeemReferralCode(u.uid, pendingRef);
      localStorage.removeItem('remo_pending_ref');
    }
    this.save(true, 'auth');
    if (u.email && !/^citizen\d+@remo\.world$/i.test(u.email)) {
      this.syncUserToCloud(u);
    }
    return u;
  },

  syncUserToCloud(user) {
    if (!this.fbDb || !user || !user.uid) return;
    try {
      const cleanUser = {
        uid: user.uid,
        name: user.name || 'Citizen',
        email: user.email || '',
        role: user.role || 'citizen',
        verified: Boolean(user.verified),
        homeCity: user.homeCity || 'montreal',
        passportNum: user.passportNum || '0000',
        referralCode: user.referralCode || `REMO-${user.passportNum}`,
        referralsCount: Number(user.referralsCount || 0),
        referredBy: user.referredBy || '',
        coins: Number(user.coins || 0),
        lifetimeCoins: Number(user.lifetimeCoins || user.coins || 0),
        streak: Number(user.streak || 1),
        visas: Array.isArray(user.visas) ? user.visas : [user.homeCity || 'montreal'],
        equippedFrame: user.equippedFrame || '',
        equippedTitleId: user.equippedTitleId || '',
        banned: Boolean(user.banned),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      this.fbDb.collection('remo_users').doc(cleanUser.uid).set(cleanUser, { merge: true })
        .catch((err) => {
          console.warn('Firestore sync user notice:', err.message);
        });
    } catch (e) {
      console.warn('syncUserToCloud error:', e);
    }
  },

  deleteUserFromCloud(uid) {
    if (!uid) return;
    if (!this.deletedUserIds) this.deletedUserIds = new Set();
    this.deletedUserIds.add(uid);
    try {
      localStorage.setItem('remo_deleted_users', JSON.stringify([...this.deletedUserIds]));
    } catch (e) {}
    this.state.users = (this.state.users || []).filter((u) => u.uid !== uid);
    this.save(false);
    if (this.fbDb) {
      try {
        this.fbDb.collection('remo_users').doc(uid).delete().catch(() => {});
      } catch (e) {}
    }
  },

  async purgeFakeUsersFromCloud() {
    if (!this.deletedUserIds) this.deletedUserIds = new Set();
    const fakeUids = [];
    this.state.users = (this.state.users || []).filter((u) => {
      const isFake = u && /^citizen\d+@remo\.world$/i.test(u.email || '') && u.role !== 'admin';
      if (isFake) {
        fakeUids.push(u.uid);
        this.deletedUserIds.add(u.uid);
      }
      return !isFake;
    });
    try {
      localStorage.setItem('remo_deleted_users', JSON.stringify([...this.deletedUserIds]));
    } catch (e) {}
    this.save(false, 'purge_fake_users');
    if (this.fbDb) {
      try {
        const snap = await this.fbDb.collection('remo_users').get();
        const batch = this.fbDb.batch();
        snap.forEach((doc) => {
          const d = doc.data();
          if (d && ((d.email && /^citizen\d+@remo\.world$/i.test(d.email) && d.role !== 'admin') || fakeUids.includes(doc.id))) {
            batch.delete(doc.ref);
          }
        });
        await batch.commit();
        console.log('Fake pioneer citizens purged from Firestore successfully');
      } catch (e) {
        console.warn('purgeFakeUsersFromCloud error:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'purge_users' } }));
    if (typeof refreshAllAdminPanels === 'function') refreshAllAdminPanels();
  },

  syncDmToCloud(dm) {
    if (!this.fbDb || !dm || !dm.id) return;
    try {
      const cleanDm = {
        id: dm.id,
        fromUid: dm.fromUid,
        fromName: dm.fromName || 'Citizen',
        toUid: dm.toUid || 'u_admin_founder',
        text: dm.text || '',
        voiceUrl: dm.voiceUrl || '',
        envelopeCoins: Number(dm.envelopeCoins || 0),
        envelopeClaimed: Boolean(dm.envelopeClaimed),
        cardOffer: dm.cardOffer || null,
        ts: Number(dm.ts || Date.now())
      };
      this.fbDb.collection('remo_direct_messages').doc(dm.id).set(cleanDm, { merge: true })
        .catch((err) => console.warn('Firestore sync DM notice:', err.message));
    } catch (e) {
      console.warn('syncDmToCloud error:', e);
    }
  },

  signOut() {
    localStorage.removeItem(this.USER_KEY);
    this.setAdminUnlocked(false);
    if (this.fbAuth) this.fbAuth.signOut().catch(() => {});
    window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'auth' } }));
  },

  addCoins(uid, delta, addCityPoints = 0) {
    const u = this.state.users.find((x) => x.uid === uid);
    if (!u || u.banned) return false;
    const finalDelta = (delta > 0 && addCityPoints > 0 && this.state.settings.happyHour2x) ? delta * 2 : delta;
    if (finalDelta < 0 && u.coins + finalDelta < 0) return false;
    u.coins += finalDelta;
    if (finalDelta > 0) u.lifetimeCoins = (u.lifetimeCoins || 0) + finalDelta;
    if (addCityPoints > 0 && u.homeCity) {
      const pts = this.state.settings.happyHour2x ? addCityPoints * 2 : addCityPoints;
      this.state.cityScores[u.homeCity] = (this.state.cityScores[u.homeCity] || 1000) + pts;
    }
    if (finalDelta > 0) RemoAudio.play('coin');
    this.save(true, 'coins');
    this.syncUserToCloud(u);
    return true;
  },

  addCityScore(cityId, pts) {
    if (!cityId) return;
    this.state.cityScores[cityId] = (this.state.cityScores[cityId] || 1000) + pts;
    this.save(true, 'city_score');
  },

  mintCardForUser(uid, cityId, rarityOverride, verifiedGps = false, customSpec = {}) {
    const u = this.state.users.find((x) => x.uid === uid);
    const city = getCityById(cityId);
    const serial = customSpec.serial || this.nextSerial();
    const card = {
      id: 'card_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      cityId: city.id,
      title: customSpec.title || '',
      subtitle: customSpec.subtitle || '',
      serial,
      maxSupply: customSpec.maxSupply || 1000,
      rarity: rarityOverride || customSpec.rarity || city.rarity || 'Epic',
      themeId: customSpec.themeId !== undefined ? customSpec.themeId : city.themeId,
      verifiedGps: !!verifiedGps,
      coinValue: customSpec.coinValue || city.baseValue || 8500,
      customPhotoDataUrl: customSpec.customPhotoDataUrl || '',
      security: customSpec.security || {
        guilloche: true, microtext: true, nfcChip: true,
        psaSlab: false, goldStamp: true, founderSig: true, redLensSecret: ''
      },
      ownerUid: uid || null,
      ownerName: u ? u.name : (customSpec.ownerName || 'REMO Drop'),
      mintedAt: Date.now()
    };
    this.state.droppedCardsPool.unshift(card);
    if (u && !u.visas.includes(city.id)) {
      u.visas.push(city.id);
    }
    this.addCityScore(city.id, 30);
    this.save(true, 'card_minted', card);
    return card;
  },

  getUserCards(uid) {
    if (!uid) return [];
    return this.state.droppedCardsPool.filter((c) => c.ownerUid === uid);
  },

  /* ── Detect Social In-App Browser (TikTok, Instagram, FB) ── */
  isInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor || '';
    return /FBAN|FBAV|Instagram|BytedanceWebview|TikTok|Snapchat|Line\//i.test(ua);
  },

  /* ── Urban Geo-Vaults (Real-World AR Treasure Hunts) ── */
  _calcGeoDistKm(lat1, lon1, lat2, lon2) {
    if (typeof haversineKm === 'function') return haversineKm(lat1, lon1, lat2, lon2);
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  claimGeoVault(vaultId, userLat, userLng, isSimulated = false) {
    if (!this.state || !Array.isArray(this.state.geoVaults)) return { success: false, reason: 'no_state' };
    const v = this.state.geoVaults.find((x) => x.id === vaultId);
    if (!v) return { success: false, reason: 'not_found' };

    const u = this.getCurrentUser() || this.ensureGuestOrCitizen('Explorer', '', v.cityId || 'montreal');
    v.unlockedBy = v.unlockedBy || [];
    if (v.unlockedBy.includes(u.uid)) {
      return { success: false, reason: 'already_claimed', vault: v };
    }

    const distKm = this._calcGeoDistKm(userLat, userLng, v.lat, v.lng);
    const radiusKm = (v.radiusMeters || 350) / 1000;

    if (!isSimulated && distKm > radiusKm) {
      return {
        success: false,
        reason: 'too_far',
        distanceKm: distKm,
        radiusMeters: v.radiusMeters || 350,
        vault: v
      };
    }

    // Mark as unlocked
    v.unlockedBy.push(u.uid);

    // Reward Coins
    const coinsWon = v.coinsReward || 250;
    this.addCoins(u.uid, coinsWon, 50);

    // Mint Bonus 4D City Card if configured
    let cardDrop = null;
    if (v.cardCityId) {
      cardDrop = this.mintCardForUser(u.uid, v.cardCityId, v.rarity || 'Mythic 4D', true, {
        title: v.title_en || 'Geo-Vault Treasure Card',
        subtitle: `Discovered at ${v.title_en}`,
        verifiedGps: true,
        coinValue: 9500
      });
    }

    this.save(true, 'geovault_claimed', { vaultId, uid: u.uid, coins: coinsWon });
    return {
      success: true,
      vault: v,
      distanceKm: distKm,
      coinsWon,
      cardDrop
    };
  },

  buryNewGeoVault(data) {
    if (!this.state) return null;
    if (!this.isAdminUnlocked() && !this.isCurrentUserAdmin()) {
      return { success: false, reason: 'admin_only' };
    }
    this.state.geoVaults = this.state.geoVaults || [];
    const u = this.getCurrentUser() || this.ensureGuestOrCitizen('Admin Founder', '', data.cityId || 'montreal');

    const bountyCoins = Math.max(50, Number(data.coinsReward) || 150);

    const newVault = {
      id: 'vault_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      cityId: data.cityId || u.homeCity || 'montreal',
      address: data.address || '',
      title_en: data.title_en || data.title || 'Secret Landmark Vault',
      title_fr: data.title_fr || data.title_en || data.title || 'Coffre Secret Urbain',
      hint_en: data.hint_en || data.hint || 'Look closely around the landmark coordinates...',
      hint_fr: data.hint_fr || data.hint_en || data.hint || 'Observez attentivement autour des coordonnées du lieu...',
      lat: Number(data.lat) || 45.5017,
      lng: Number(data.lng) || -73.5673,
      radiusMeters: Math.max(100, Math.min(2000, Number(data.radiusMeters) || 350)),
      coinsReward: bountyCoins,
      rarity: data.rarity || 'Mythic 4D',
      cardCityId: data.cardCityId || data.cityId,
      sponsorName: u.name || 'REMO Admin',
      creatorUid: u.uid,
      unlockedBy: [],
      createdAt: Date.now()
    };

    this.state.geoVaults.unshift(newVault);
    this.save(true, 'geovault_buried', newVault);
    return { success: true, vault: newVault };
  },

  /* ── Sovereign REMO Coin Serialization Bureau (Admin Exclusive) ── */
  mintSerializedCoin(serialStr, coinsVal = 500, targetUid = '', note = '', alloy = 'genesis') {
    if (!this.state) return { success: false, reason: 'no_state' };
    this.state.serializedCoins = this.state.serializedCoins || [];

    const cleanSerial = String(serialStr || '').trim().replace(/^#+/, '') || String(this.state.serializedCoins.length + 1).padStart(4, '0');
    
    // Check if duplicate serial
    if (this.state.serializedCoins.some((c) => c.serial.toLowerCase() === cleanSerial.toLowerCase())) {
      return { success: false, reason: 'duplicate_serial', serial: cleanSerial };
    }

    const val = Math.max(0, Math.round(Number(coinsVal) || 0));
    let recipientUser = targetUid && targetUid !== 'vault' ? this.state.users.find((u) => u.uid === targetUid) : null;
    const cleanAlloy = ['genesis', 'platinum', 'obsidian', 'urban'].includes(alloy) ? alloy : 'genesis';

    const newCoin = {
      id: 'sc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      serial: cleanSerial,
      coinsValue: val,
      alloy: cleanAlloy,
      ownerUid: recipientUser ? recipientUser.uid : 'u_admin_founder',
      ownerName: recipientUser ? recipientUser.name : 'Founder Treasury Vault',
      mintedAt: Date.now(),
      status: recipientUser ? 'assigned' : 'vault',
      note: note.trim() || `Official Mint #${cleanSerial} [${cleanAlloy.toUpperCase()}]`
    };

    this.state.serializedCoins.unshift(newCoin);

    // If assigned to a citizen, credit the coins to their balance & send royal DM
    if (recipientUser && val > 0) {
      recipientUser.coins = (recipientUser.coins || 0) + val;
      recipientUser.lifetimeCoins = (recipientUser.lifetimeCoins || 0) + val;

      this.state.directMessages = this.state.directMessages || [];
      this.state.directMessages.push({
        id: 'dm_royal_coin_' + Date.now(),
        fromUid: 'u_admin_founder',
        fromName: '👑 REMO Treasury',
        toUid: recipientUser.uid,
        text: `👑 [ROYAL SOVEREIGN COIN #${cleanSerial}]: You have been granted Official Serialized REMO Coin #${cleanSerial} containing +${val} 🪙 REMO Coins! ${note ? `Message: "${note}"` : ''}`,
        ts: Date.now()
      });
    }

    RemoAudio.play('fanfare');
    this.save(true, 'coin_serialized_minted', newCoin);
    return { success: true, coin: newCoin, recipient: recipientUser };
  },

  getSerializedCoins() {
    return (this.state && this.state.serializedCoins) || [];
  },

  COIN_ALLOYS: {
    genesis: {
      id: 'genesis',
      name: 'Genesis Proof (24K Gold & Titanium)',
      nameFr: 'Épreuve Genesis (Or 24K & Titane)',
      icon: '🌟',
      badgeColor: '#fbbf24',
      badgeBg: 'rgba(251,191,36,0.18)',
      rimBorder: '#f59e0b',
      glow: 'rgba(251, 191, 36, 0.55)',
      filter: 'sepia(0.18) saturate(1.22) brightness(1.04)',
      goldGrad: ['#fffbeb', '#fef08a', '#eab308', '#ca8a04', '#854d0e'],
      sound: 'goldchime',
      spec: '99.9% 24K Fine Gold & Grade 5 Titanium'
    },
    platinum: {
      id: 'platinum',
      name: 'Royal Platinum & Sapphire (Ambassador VIP)',
      nameFr: 'Platine Royal & Saphir (Ambassadeur VIP)',
      icon: '💎',
      badgeColor: '#38bdf8',
      badgeBg: 'rgba(56,189,248,0.18)',
      rimBorder: '#93c5fd',
      glow: 'rgba(56, 189, 248, 0.55)',
      filter: 'hue-rotate(185deg) saturate(1.3) brightness(1.12)',
      goldGrad: ['#f0fdf4', '#e0f2fe', '#38bdf8', '#0284c7', '#0c4a6e'],
      sound: 'crystalchime',
      spec: '95% Pure Mirror Platinum with Sapphire Crystal Core'
    },
    obsidian: {
      id: 'obsidian',
      name: 'Cyber Obsidian & Emerald Neon (Night Rare)',
      nameFr: 'Cyber Obsidienne & Émeraude Néon (Édition Nuit)',
      icon: '⚡',
      badgeColor: '#34d399',
      badgeBg: 'rgba(52,211,153,0.18)',
      rimBorder: '#10b981',
      glow: 'rgba(16, 185, 129, 0.55)',
      filter: 'hue-rotate(95deg) brightness(0.92) contrast(1.25)',
      goldGrad: ['#ecfdf5', '#a7f3d0', '#34d399', '#059669', '#064e3b'],
      sound: 'cybersound',
      spec: 'Volcanic Obsidian Glass with Radiant Emerald Neon Matrix'
    },
    urban: {
      id: 'urban',
      name: 'Urban Sovereign (Aged Brass & Steel)',
      nameFr: 'Souverain Urbain (Laiton Antique & Acier)',
      icon: '🪙',
      badgeColor: '#fb923c',
      badgeBg: 'rgba(251,146,60,0.18)',
      rimBorder: '#d97706',
      glow: 'rgba(249, 115, 22, 0.55)',
      filter: 'sepia(0.42) saturate(0.95) contrast(1.12)',
      goldGrad: ['#fff7ed', '#fed7aa', '#f97316', '#c2410c', '#7c2d12'],
      sound: 'brassclink',
      spec: 'Urban Heavy Antiqued Brass & Gunmetal Industrial Steel'
    }
  },

  getAlloyConfig(alloyId) {
    return this.COIN_ALLOYS[alloyId] || this.COIN_ALLOYS.genesis;
  },

  /* ── Dedicated Firebase Cloud Infrastructure & Realtime Sync ── */
  DEFAULT_FIREBASE_CONFIG: {
    apiKey: "AIzaSyCEuOszFOEspkoj0vgfQxHrwhv65Pa1U1U",
    authDomain: "remo-world.firebaseapp.com",
    projectId: "remo-world",
    storageBucket: "remo-world.firebasestorage.app",
    messagingSenderId: "536603686704",
    appId: "1:536603686704:web:1fddedb557b3a0cf963af5",
    measurementId: "G-TBWJYSC60M"
  },

  getFirebaseConfig() {
    try {
      const raw = localStorage.getItem(this.FB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return this.DEFAULT_FIREBASE_CONFIG;
  },

  saveFirebaseConfig(cfgObj) {
    if (!cfgObj || !cfgObj.apiKey || !cfgObj.projectId) {
      localStorage.removeItem(this.FB_KEY);
      return false;
    }
    localStorage.setItem(this.FB_KEY, JSON.stringify(cfgObj));
    this.initFirebaseIfConfigured();
    return true;
  },

  initFirebaseIfConfigured() {
    const cfg = this.getFirebaseConfig();
    if (!cfg || !cfg.apiKey || typeof firebase === 'undefined') return false;
    try {
      if (!firebase.apps.length) {
        this.fbApp = firebase.initializeApp(cfg);
      } else {
        this.fbApp = firebase.app();
      }
      if (firebase.firestore) {
        this.fbDb = firebase.firestore();
        this.startFirestoreSync();
      }
      if (firebase.auth) {
        this.fbAuth = firebase.auth();
        this.fbAuth.onAuthStateChanged((fbU) => {
          if (fbU) {
            const adminEmail = (this.state?.settings?.adminEmail || 'andart1174@gmail.com').toLowerCase();
            const isAdminEmail = (fbU.email || '').toLowerCase() === adminEmail;
            const u = this.ensureGuestOrCitizen(fbU.displayName || (isAdminEmail ? 'REMO Founder' : 'Citizen'), fbU.email, 'montreal', isAdminEmail, fbU.uid);
            if (isAdminEmail) {
              this.setAdminUnlocked(true);
            }
            if (typeof syncHeaderAndSidebars === 'function') syncHeaderAndSidebars();
          }
        });
      }
      console.log('%c☁️ REMO Firebase Cloud Connected: ' + cfg.projectId, 'color:#10b981;font-weight:bold;');
      return true;
    } catch (e) {
      console.warn('Firebase init deferred:', e.message);
      return false;
    }
  },

  startFirestoreSync() {
    if (!this.fbDb || this._fbSyncStarted) return;
    this._fbSyncStarted = true;
    try {
      // 1. Sync & Watch ALL USERS in Real Time across all devices (Cloud is Authoritative Source of Truth)
      this.fbDb.collection('remo_users').onSnapshot((snap) => {
        if (!snap) return;
        const cloudUsers = [];
        const cloudUserIds = new Set();
        snap.forEach((doc) => {
          const uData = doc.data();
          if (!uData || !uData.uid) return;

          // Delete any fake pioneer citizens or admin-deleted accounts from Firestore on the fly
          const isFakeCitizen = (uData.name && uData.name.startsWith('REMO Pioneer #')) || (uData.email && /^citizen\d+@remo\.world$/i.test(uData.email) && uData.role !== 'admin');
          const isDeleted = (this.deletedUserIds && this.deletedUserIds.has(uData.uid));
          if (isFakeCitizen || isDeleted) {
            this.fbDb.collection('remo_users').doc(uData.uid).delete().catch(() => {});
            return;
          }
          cloudUsers.push(uData);
          cloudUserIds.add(uData.uid);
        });

        // Current active user
        const curU = this.getCurrentUser();
        const activeUsers = [...cloudUsers];
        if (curU && !cloudUserIds.has(curU.uid) && !this.deletedUserIds?.has(curU.uid)) {
          if (!/^citizen\d+@remo\.world$/i.test(curU.email || '')) {
            activeUsers.push(curU);
          }
        }
        this.state.users = activeUsers;
        this.save(false, 'cloud_users_sync');
        window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'cloud_users' } }));
        if (typeof refreshAllAdminPanels === 'function') refreshAllAdminPanels();
        if (typeof syncHeaderAndSidebars === 'function') syncHeaderAndSidebars();
        if (typeof renderDirectMessagesView === 'function' && typeof currentRemoView !== 'undefined' && currentRemoView === 'messages') {
          renderDirectMessagesView();
        }
      }, (err) => {
        console.warn('Firestore remo_users sync notice:', err.message);
      });

      // 2. Sync & Watch ALL DIRECT MESSAGES in Real Time
      this.fbDb.collection('remo_direct_messages').orderBy('ts', 'desc').limit(150).onSnapshot((snap) => {
        if (!snap) return;
        let hasNew = false;
        const curU = this.getCurrentUser();
        const myUid = curU ? curU.uid : null;
        const isAdm = this.isCurrentUserAdmin();

        snap.docChanges().forEach((change) => {
          const dm = change.doc.data();
          if (!dm || !dm.id) return;

          if (change.type === 'added') {
            const exists = this.state.directMessages.some((x) => x.id === dm.id);
            if (!exists) {
              this.state.directMessages.push(dm);
              hasNew = true;

              // Incoming message alert & sound if addressed to me or Admin
              const isForMe = (myUid && (dm.toUid === myUid || (isAdm && (dm.toUid === 'u_admin_founder' || !dm.toUid)))) && dm.fromUid !== myUid;
              if (isForMe) {
                try { RemoAudio.play('chime'); } catch (e) {}
                if (typeof remoToast === 'function') {
                  const preview = dm.text ? dm.text.slice(0, 45) : (dm.voiceUrl ? '🎤 Note Vocale' : '✉️ Message');
                  remoToast(`💬 @${dm.fromName || 'Citizen'}: ${preview}`);
                }
              }
            }
          } else if (change.type === 'modified') {
            const idx = this.state.directMessages.findIndex((x) => x.id === dm.id);
            if (idx >= 0) {
              this.state.directMessages[idx] = dm;
              hasNew = true;
            }
          } else if (change.type === 'removed') {
            this.state.directMessages = this.state.directMessages.filter((x) => x.id !== dm.id);
            hasNew = true;
          }
        });

        if (hasNew) {
          this.save(false, 'cloud_dms');
          window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'cloud_dms' } }));
          if (typeof renderDirectMessagesView === 'function' && typeof currentRemoView !== 'undefined' && currentRemoView === 'messages') {
            renderDirectMessagesView();
          }
          if (typeof refreshAllAdminPanels === 'function') refreshAllAdminPanels();
        }
      }, (err) => {
        console.warn('Firestore remo_direct_messages sync notice:', err.message);
      });

      // 3. Sync & Watch ALL SOCIAL POSTS in Real Time across all devices (Cloud is Authoritative Source of Truth)
      this.fbDb.collection('remo_posts').limit(80).onSnapshot((snap) => {
        if (!snap) return;
        const cloudPosts = [];
        const cloudPostIds = new Set();
        snap.forEach((doc) => {
          const cp = doc.data();
          if (cp && cp.id) {
            // Discard and delete any demo posts or posts deleted by admin
            const isDemo = cp.id === 'demo_1' || cp.id.startsWith('demo_') || cp.id.includes('demo') || cp.id === 'post_capsule_demo_1' || cp.id === 'post_duet_demo_1';
            const isDeleted = (this.deletedPostIds && this.deletedPostIds.has(cp.id));
            if (isDemo || isDeleted) {
              this.fbDb.collection('remo_posts').doc(cp.id).delete().catch(() => {});
              return;
            }
            cloudPosts.push(cp);
            cloudPostIds.add(cp.id);
          }
        });

        const now = Date.now();
        // Preserve only freshly created local drafts (< 4000ms old) that haven't hit the cloud yet
        const freshLocal = (this.state.posts || []).filter((lp) =>
          lp && lp.id && !cloudPostIds.has(lp.id) && !this.deletedPostIds?.has(lp.id) && (now - (lp.createdAt || 0) < 4000)
        );

        // Active posts are strictly what's in Firestore + any fresh local drafts
        const activePosts = [...freshLocal];
        cloudPosts.forEach((cp) => {
          if (!activePosts.some((m) => m.id === cp.id) && (!this.deletedPostIds || !this.deletedPostIds.has(cp.id))) {
            activePosts.push(cp);
          }
        });

        const prevSignature = (this.state.posts || []).map((p) => `${p.id}_${p.likes?.length || 0}_${p.comments?.length || 0}_${p.pinned ? 1 : 0}`).join('|');
        const nextSignature = activePosts.map((p) => `${p.id}_${p.likes?.length || 0}_${p.comments?.length || 0}_${p.pinned ? 1 : 0}`).join('|');
        const hasContentChanged = prevSignature !== nextSignature;

        this.state.posts = activePosts;
        this.state.posts.sort((a, b) =>
          (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
          (b.boosted ? 1 : 0) - (a.boosted ? 1 : 0) ||
          (b.createdAt || 0) - (a.createdAt || 0)
        );

        this.save(false, 'cloud_posts_sync');
        if (hasContentChanged) {
          window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'cloud_posts' } }));
          if (typeof renderSocialFeed === 'function' && (typeof currentRemoView === 'undefined' || currentRemoView === 'feed')) {
            renderSocialFeed();
          }
          if (typeof refreshAllAdminPanels === 'function') {
            refreshAllAdminPanels();
          }
        }
      }, (err) => {
        console.warn('Firestore remo_posts sync notice:', err.message);
      });

      // 4. Ecosystem Live State (City Scores, Settings, World Bottles, Auctions & GeoVaults)
      const docRef = this.fbDb.collection('remo_ecosystem').doc('live_state');
      
      docRef.get().then((snap) => {
        if (!snap.exists) {
          docRef.set({
            cityScores: this.state.cityScores || {},
            settings: this.state.settings || {},
            bottles: (this.state.bottles || []).slice(0, 30),
            auctions: (this.state.auctions || []).slice(0, 25),
            geoVaults: (this.state.geoVaults || []).slice(0, 35),
            deletedPostIds: [...(this.deletedPostIds || [])].slice(-100),
            deletedUserIds: [...(this.deletedUserIds || [])].slice(-100),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }).catch((err) => console.log('Firestore seed status:', err.message));
        } else {
          const data = snap.data();
          if (data) {
            if (data.cityScores) this.state.cityScores = Object.assign(this.state.cityScores || {}, data.cityScores);
            if (data.bottles) this.state.bottles = data.bottles;
            if (Array.isArray(data.auctions)) {
              this.state.auctions = data.auctions;
              if (typeof renderAuctionsView === 'function') renderAuctionsView();
            }
            if (Array.isArray(data.geoVaults)) {
              this.state.geoVaults = data.geoVaults;
              if (typeof refreshRadarMarkers === 'function') refreshRadarMarkers();
            }
            if (Array.isArray(data.deletedPostIds)) {
              if (!this.deletedPostIds) this.deletedPostIds = new Set();
              data.deletedPostIds.forEach((id) => this.deletedPostIds.add(id));
              this.state.posts = (this.state.posts || []).filter((p) => !this.deletedPostIds.has(p.id));
            }
            if (Array.isArray(data.deletedUserIds)) {
              if (!this.deletedUserIds) this.deletedUserIds = new Set();
              data.deletedUserIds.forEach((id) => this.deletedUserIds.add(id));
              this.state.users = (this.state.users || []).filter((u) => !this.deletedUserIds.has(u.uid));
            }
            this.save(false, 'cloud_sync');
            window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'cloud_sync' } }));
          }
        }
      }).catch((err) => console.log('Firestore read status:', err.message));

      // Realtime listener for scores, bottles, auctions & geovaults
      docRef.onSnapshot((snap) => {
        if (!snap || !snap.exists || snap.metadata?.hasPendingWrites) return;
        const data = snap.data();
        if (data) {
          if (data.cityScores) this.state.cityScores = Object.assign(this.state.cityScores || {}, data.cityScores);
          if (data.bottles) this.state.bottles = data.bottles;
          if (Array.isArray(data.auctions)) {
            this.state.auctions = data.auctions;
            if (typeof renderAuctionsView === 'function') renderAuctionsView();
          }
          if (Array.isArray(data.geoVaults)) {
            this.state.geoVaults = data.geoVaults;
            if (typeof refreshRadarMarkers === 'function') refreshRadarMarkers();
          }
          if (Array.isArray(data.deletedPostIds)) {
            if (!this.deletedPostIds) this.deletedPostIds = new Set();
            data.deletedPostIds.forEach((id) => this.deletedPostIds.add(id));
            this.state.posts = (this.state.posts || []).filter((p) => !this.deletedPostIds.has(p.id));
          }
          if (Array.isArray(data.deletedUserIds)) {
            if (!this.deletedUserIds) this.deletedUserIds = new Set();
            data.deletedUserIds.forEach((id) => this.deletedUserIds.add(id));
            this.state.users = (this.state.users || []).filter((u) => !this.deletedUserIds.has(u.uid));
          }
          this.save(false, 'cloud_live_update');
          window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'cloud_live_update' } }));
        }
      }, (err) => console.log('Firestore live watch status:', err.message));
    } catch (e) {
      console.warn('Firestore sync setup deferred:', e);
    }
  },

  syncPostToCloud(post) {
    if (!this.fbDb || !post || !post.id) return;
    try {
      // Sanitize undefined fields so Firestore doesn't reject write
      const cleanPost = JSON.parse(JSON.stringify(post));
      if (!cleanPost.createdAt) cleanPost.createdAt = Date.now();
      this.fbDb.collection('remo_posts').doc(post.id).set(cleanPost, { merge: true })
        .catch((err) => console.warn('Firestore post sync notice:', err.message));
    } catch (e) {
      console.warn('syncPostToCloud exception:', e);
    }
  },

  deletePostFromCloud(postId) {
    if (!postId) return;
    try {
      if (!this.deletedPostIds) this.deletedPostIds = new Set();
      this.deletedPostIds.add(postId);
      localStorage.setItem('remo_deleted_posts', JSON.stringify([...this.deletedPostIds]));
    } catch (e) {}
    this.state.posts = (this.state.posts || []).filter((p) => p.id !== postId);
    if (!this.fbDb) return;
    try {
      this.fbDb.collection('remo_posts').doc(postId).delete()
        .then(() => console.log('Successfully deleted post from Firestore:', postId))
        .catch((err) => console.warn('Firestore delete notice:', err.message));
    } catch (e) {}
  },

  async purgeAllPostsFromCloud() {
    this.state.posts = [];
    if (!this.deletedPostIds) this.deletedPostIds = new Set();
    localStorage.removeItem('remo_deleted_posts');
    this.deletedPostIds.clear();
    this.save(false, 'purge_all_posts');
    if (this.fbDb) {
      try {
        const snap = await this.fbDb.collection('remo_posts').get();
        const batch = this.fbDb.batch();
        snap.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('All posts deleted from Firestore successfully');
      } catch (err) {
        console.warn('Purge posts error:', err);
      }
    }
    window.dispatchEvent(new CustomEvent('remo:stateupdate', { detail: { reason: 'purge_posts' } }));
    if (typeof renderSocialFeed === 'function') renderSocialFeed();
  },

  tossCoinInWishingWell(cityId, text, isAnonymous = false) {
    const u = this.getCurrentUser();
    if (!u) return { success: false, reason: 'no_user' };
    if ((u.coins || 0) < 1) return { success: false, reason: 'no_coins' };
    const cleanText = (text || '').trim();
    if (!cleanText) return { success: false, reason: 'empty_text' };

    u.coins = Math.max(0, (u.coins || 0) - 1);
    const targetCityId = cityId || (u.homeCity || 'montreal');
    if (!this.state.cityScores) this.state.cityScores = {};
    this.state.cityScores[targetCityId] = (this.state.cityScores[targetCityId] || 0) + 5;

    if (!Array.isArray(this.state.wishes)) this.state.wishes = [];
    const newWish = {
      id: 'wish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      cityId: targetCityId,
      authorName: isAnonymous ? (typeof REMO_I18N !== 'undefined' && REMO_I18N.getLang() === 'fr' ? 'Citoyen Anonyme' : 'Anonymous Citizen') : u.name,
      authorUid: isAnonymous ? '' : u.uid,
      text: cleanText,
      blessings: 1,
      blessedUids: u.uid ? [u.uid] : [],
      timestamp: Date.now(),
      isAnonymous: Boolean(isAnonymous)
    };

    this.state.wishes.unshift(newWish);
    if (this.state.wishes.length > 150) this.state.wishes = this.state.wishes.slice(0, 150);
    this.save(true);
    return { success: true, wish: newWish, userCoins: u.coins };
  },

  blessWish(wishId) {
    const u = this.getCurrentUser();
    if (!Array.isArray(this.state.wishes)) return { success: false, reason: 'not_found' };
    const wish = this.state.wishes.find((w) => w && w.id === wishId);
    if (!wish) return { success: false, reason: 'not_found' };

    if (!Array.isArray(wish.blessedUids)) wish.blessedUids = [];
    if (u && u.uid && wish.blessedUids.includes(u.uid)) {
      return { success: false, reason: 'already_blessed', wish };
    }

    if (u && u.uid) wish.blessedUids.push(u.uid);
    wish.blessings = (wish.blessings || 0) + 1;

    // Positive karma reward: +1 coin to current user
    if (u) {
      u.coins = (u.coins || 0) + 1;
    }
    // Boost city score +1
    if (this.state.cityScores && wish.cityId) {
      this.state.cityScores[wish.cityId] = (this.state.cityScores[wish.cityId] || 0) + 1;
    }

    this.save(true);
    return { success: true, wish, userCoins: u ? u.coins : null };
  },

  syncToFirestore(reason = 'update') {
    if (!this.fbDb) return;
    clearTimeout(this._fbSyncDebounce);
    this._fbSyncDebounce = setTimeout(() => {
      try {
        const docRef = this.fbDb.collection('remo_ecosystem').doc('live_state');
        docRef.set({
          cityScores: this.state.cityScores || {},
          settings: this.state.settings || {},
          bottles: (this.state.bottles || []).slice(0, 30),
          auctions: (this.state.auctions || []).slice(0, 25),
          geoVaults: (this.state.geoVaults || []).slice(0, 35),
          deletedPostIds: [...(this.deletedPostIds || [])].slice(-100),
          deletedUserIds: [...(this.deletedUserIds || [])].slice(-100),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch((err) => {
          console.log('Firestore background sync info:', err.message);
        });
      } catch (e) {}
    }, 1200);
  }
};

REMO_STORE.getDefaultVipShopItems = getDefaultVipShopItems;
window.getDefaultVipShopItems = getDefaultVipShopItems;

REMO_STORE.init();

window.RemoAudio = RemoAudio;
window.RemoMediaDB = RemoMediaDB;
window.REMO_HTML_TEMPLATES = REMO_HTML_TEMPLATES;
window.REMO_TRANSLATOR = REMO_TRANSLATOR;
window.REMO_WEATHER = REMO_WEATHER;
window.REMO_STORE = REMO_STORE;
window.generateCityPostVisualDataUrl = generateCityPostVisualDataUrl;
