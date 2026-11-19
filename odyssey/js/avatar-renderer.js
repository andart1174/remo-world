/* ═══════════════════════════════════════════════════════════════════════════
   REMO WORLD: 4D Compass Odyssey — Living Animated 4A <-> 4B Hero Renderer
   Side-Profile 6-Frame Sprint + Jump + Slide + 4B Hover-Coin Skins + Vault Auras
   Layered with Live 60 FPS Phase Blink, 4D Ascended Orbit & Plasma Exhaust
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const CRYSTAL_DEFS = [
    { angle: -2.62, color: '#a855f7', glow: 'rgba(168,85,247,0.85)' },
    { angle: -2.06, color: '#10b981', glow: 'rgba(16,185,129,0.85)' },
    { angle: -1.08, color: '#fbbf24', glow: 'rgba(251,191,36,0.85)' },
    { angle: -0.52, color: '#ec4899', glow: 'rgba(236,72,153,0.85)' }
  ];

  const AURA_PALETTES = {
    gold_fire:      { c1: 'rgba(251,191,36,0.34)', c2: 'rgba(244,63,94,0.18)', ring: '#fbbf24' },
    cyber_matrix:   { c1: 'rgba(16,185,129,0.36)', c2: 'rgba(56,189,248,0.20)', ring: '#10b981' },
    diamond_vip:    { c1: 'rgba(56,189,248,0.38)', c2: 'rgba(236,72,153,0.22)', ring: '#7dd3fc' },
    tricolor_crest: { c1: 'rgba(250,204,21,0.34)', c2: 'rgba(59,130,246,0.22)', ring: '#fde047' },
    rainbow_4d:     { c1: 'rgba(236,72,153,0.40)', c2: 'rgba(56,189,248,0.28)', ring: '#c084fc' }
  };

  const HOVER_COIN_SKINS = {
    gold:    { ringA: 'rgba(251,191,36,0.85)', ringB: 'rgba(56,189,248,0.80)' },
    cyber:   { ringA: 'rgba(16,185,129,0.90)', ringB: 'rgba(6,182,212,0.85)' },
    diamond: { ringA: 'rgba(224,242,254,0.92)', ringB: 'rgba(244,114,182,0.82)' },
    galaxy:  { ringA: 'rgba(192,132,252,0.92)', ringB: 'rgba(251,191,36,0.85)' }
  };

  function drawRemoCoinDisc(ctx, cx, cy, rx, ry, rotAngle, time, showLabel) {
    ctx.save();
    ctx.translate(cx, cy);

    const aura = ctx.createRadialGradient(0, 0, rx * 0.25, 0, 0, rx * 1.38);
    aura.addColorStop(0, 'rgba(56, 189, 248, 0.42)');
    aura.addColorStop(0.55, 'rgba(251, 191, 36, 0.22)');
    aura.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 1.38, ry * 1.38, 0, 0, Math.PI * 2);
    ctx.fill();

    const thickness = Math.max(2, ry * 0.28);
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(0, thickness, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    const rimG = ctx.createLinearGradient(-rx, -ry, rx, ry);
    rimG.addColorStop(0, '#fef08a');
    rimG.addColorStop(0.4, '#fbbf24');
    rimG.addColorStop(0.8, '#d97706');
    rimG.addColorStop(1, '#92400e');
    ctx.fillStyle = rimG;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    const irx = rx * 0.80;
    const iry = ry * 0.80;
    const shift = (Math.sin(time * 2.5) + 1) * 0.5;
    const holo = ctx.createLinearGradient(-irx, -iry, irx, iry);
    holo.addColorStop(0, '#38bdf8');
    holo.addColorStop(0.25 + shift * 0.14, '#c084fc');
    holo.addColorStop(0.55, '#fde047');
    holo.addColorStop(0.8, '#2dd4bf');
    holo.addColorStop(1, '#f472b6');
    ctx.fillStyle = holo;
    ctx.beginPath();
    ctx.ellipse(0, 0, irx, iry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, irx, iry, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.lineWidth = Math.max(0.9, rx * 0.036);
    ctx.beginPath();
    ctx.moveTo(-irx * 0.7, -iry * 0.15);
    ctx.quadraticCurveTo(0, -iry * 0.8, irx * 0.7, -iry * 0.1);
    ctx.moveTo(-irx * 0.55, iry * 0.32);
    ctx.quadraticCurveTo(0, -iry * 0.35, irx * 0.6, iry * 0.28);
    ctx.stroke();

    const sweepX = Math.sin(time * 2.2 + rotAngle) * irx * 0.9;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.beginPath();
    ctx.ellipse(sweepX, -iry * 0.2, irx * 0.25, iry * 0.75, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (showLabel && rx >= 18) {
      ctx.fillStyle = '#070b1a';
      ctx.font = `900 ${Math.max(7, Math.round(rx * 0.30))}px "Orbitron", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('REMO', 0, -ry * 0.1);
    }

    ctx.restore();
  }

  function drawCrystalShard(ctx, cx, cy, size, color, glow, active, pulse) {
    ctx.save();
    ctx.translate(cx, cy);
    if (active) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = 14 + pulse * 6;
    } else {
      ctx.globalAlpha = 0.22;
    }
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffffdd';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.45);
    ctx.lineTo(size * 0.82, 0);
    ctx.lineTo(0, size * 1.45);
    ctx.lineTo(-size * 0.82, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function _spriteReady(img) {
    return Boolean(img && img.complete && img.naturalWidth > 0);
  }

  function draw4AMode(ctx, p, s, alpha) {
    const sp = global.REMO_SPRITES;
    if (!sp || !Array.isArray(sp.runFrames) || sp.runFrames.length < 6) return false;

    const time = p.time || 0;
    const rp = p.runPhase || 0;
    const sliding = Boolean(p.sliding);
    const dashing = Boolean(p.dashing);
    const isAirborne = Math.abs(p.vy || 0) > 45;

    ctx.save();
    ctx.globalAlpha *= alpha;

    if (sliding && _spriteReady(sp.slide4A)) {
      const w = 165 * (s / 1.44);
      const h = 117 * (s / 1.44);
      ctx.drawImage(sp.slide4A, -w * 0.48, -h * 0.94, w, h);
      ctx.restore();
      return true;
    }

    if (isAirborne && _spriteReady(sp.jump4A)) {
      const w = 152 * (s / 1.44);
      const h = 141 * (s / 1.44);
      const jumpTilt = Math.max(-0.18, Math.min(0.22, (p.vy || 0) * 0.00028));
      ctx.rotate(jumpTilt);
      ctx.drawImage(sp.jump4A, -w * 0.50, -h * 0.94, w, h);
      ctx.restore();
      return true;
    }

    const fIdx = Math.floor(rp * 1.55) % sp.runFrames.length;
    const frameImg = sp.runFrames[fIdx];
    if (!_spriteReady(frameImg)) {
      ctx.restore();
      return false;
    }

    const phaseBob = [0, 3, -5, 0, 3, -5][fIdx] || 0;
    const phaseLean = [0.02, 0.05, 0.08, 0.02, 0.05, 0.08][fIdx] || 0.04;
    const w = 152 * (s / 1.44);
    const h = 140 * (s / 1.44);

    ctx.translate(0, phaseBob);
    ctx.rotate(phaseLean + (dashing ? 0.14 : 0));

    if (dashing || p.blitzActive || p.blinkActive) {
      ctx.save();
      ctx.globalAlpha *= p.blinkActive ? 0.5 : 0.35;
      ctx.drawImage(frameImg, -w * 0.50 - (p.blinkActive ? 26 : 18), -h * 0.94, w, h);
      ctx.restore();
    }

    ctx.drawImage(frameImg, -w * 0.50, -h * 0.94, w, h);

    const shine = (Math.sin(time * 5) + 1) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.10 + shine * 0.18})`;
    ctx.beginPath();
    ctx.arc(w * 0.07, -h * 0.43, w * 0.032, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return true;
  }

  function draw4BMode(ctx, p, s, alpha) {
    const sp = global.REMO_SPRITES;
    if (!sp || !_spriteReady(sp.full4B)) return false;

    const time = p.time || 0;
    const bankTilt = Math.max(-0.24, Math.min(0.24, (p.vy || 0) * 0.00048));
    const hoverBob = Math.sin(time * 5.2) * 4;
    const skin = HOVER_COIN_SKINS[p.hoverSkin] || HOVER_COIN_SKINS.gold;

    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(0, hoverBob);
    ctx.rotate(bankTilt);

    for (let rIdx = 0; rIdx < 3; rIdx++) {
      const phase = ((time * 2.5 + rIdx * 0.33) % 1);
      const ringY = 4 + phase * 26 * s;
      const ringRx = (42 - phase * 18) * s;
      const ringRy = (11 - phase * 5) * s;
      ctx.strokeStyle = rIdx % 2 === 0 ? skin.ringA : skin.ringB;
      ctx.globalAlpha = alpha * (1 - phase) * 0.9;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.ellipse(0, ringY, Math.max(4, ringRx), Math.max(2, ringRy), -0.08, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = alpha;

    const size = 114 * s;
    ctx.drawImage(sp.full4B, -size * 0.50, -size * 0.845, size, size);
    ctx.restore();
    return true;
  }

  function drawFallbackVector(ctx, p) {
    const s = p.scale || 1.3;
    const morph = p.morph || 0;
    ctx.save();
    ctx.translate(p.x, p.y);
    if (morph > 0.3) drawRemoCoinDisc(ctx, 0, 2, 34 * s, 10 * s, p.time || 0, p.time || 0, true);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-12 * s, -54 * s, 24 * s, 32 * s, 6 * s);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -64 * s, 9 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawRemoHero(ctx, p) {
    const x = p.x;
    const y = p.y;
    const s = p.scale || 1.44;
    const time = p.time || 0;
    const morph = Math.max(0, Math.min(1, p.morph !== undefined ? p.morph : (p.mode === 'fly' ? 1 : 0)));
    const invuln = Boolean(p.invuln);
    const aura = AURA_PALETTES[p.auraStyle || p.vipFrame] || AURA_PALETTES.gold_fire;

    ctx.save();
    if (p.blinkActive) {
      ctx.globalAlpha = 0.42;
    } else if (invuln && Math.floor(time * 18) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    ctx.translate(x, y);

    // Sovereign Vault Aura glow behind Hero
    const aR = 62 * (s / 1.44);
    const ag = ctx.createRadialGradient(0, -56, aR * 0.18, 0, -56, aR);
    ag.addColorStop(0, aura.c1);
    ag.addColorStop(0.65, aura.c2);
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.arc(0, -56, aR, 0, Math.PI * 2);
    ctx.fill();

    if (p.auraStyle === 'rainbow_4d') {
      ctx.strokeStyle = `hsl(${(time * 140) % 360}, 95%, 65%)`;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(0, -58, 48, 66, Math.sin(time * 2) * 0.25, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (p.blinkActive) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.8;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.ellipse(0, -56, 46, 62, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (p.blitzActive) {
      const bR = 66 * (s / 1.44);
      const bg = ctx.createRadialGradient(0, -56, bR * 0.25, 0, -56, bR);
      bg.addColorStop(0, 'rgba(251,191,36,0.34)');
      bg.addColorStop(0.65, 'rgba(244,63,94,0.22)');
      bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(0, -56, bR, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.magnetActive) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, -56, 56 + Math.sin(time * 10) * 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    let rendered = false;
    if (morph <= 0.05) {
      rendered = draw4AMode(ctx, p, s, 1);
    } else if (morph >= 0.95) {
      rendered = draw4BMode(ctx, p, s, 1);
    } else {
      const okA = draw4AMode(ctx, p, s, 1 - morph);
      const okB = draw4BMode(ctx, p, s, morph);
      rendered = okA || okB;
    }

    // 4D Sovereign Ascended Mode — Orbiting Auto-Defense Crystals!
    if (p.ascendedActive) {
      CRYSTAL_DEFS.forEach((cd, idx) => {
        const ang = time * 4.2 + (idx * Math.PI) / 2;
        const cx = Math.cos(ang) * 58;
        const cy = -58 + Math.sin(ang) * 44;
        drawCrystalShard(ctx, cx, cy, 9, cd.color, cd.glow, true, 1.4);
      });
    }

    ctx.restore();

    if (!rendered) {
      drawFallbackVector(ctx, p);
    }
  }

  function drawGhostHero(ctx, p, label) {
    ctx.save();
    ctx.globalAlpha = 0.36;
    if ('filter' in ctx) ctx.filter = 'hue-rotate(155deg) saturate(1.8) brightness(1.2)';
    drawRemoHero(ctx, p);
    if ('filter' in ctx) ctx.filter = 'none';

    ctx.globalAlpha = 0.85;
    ctx.fillStyle = 'rgba(5, 8, 22, 0.78)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(p.x - 42, p.y - 165, 84, 20, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#7dd3fc';
    ctx.font = '800 10px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label || '👻 BEST', p.x, p.y - 151);
    ctx.restore();
  }

  global.REMO_AVATAR = {
    drawRemoHero,
    drawGhostHero,
    drawRemoCoinDisc,
    drawCrystalShard,
    CRYSTAL_DEFS
  };
})(window);
