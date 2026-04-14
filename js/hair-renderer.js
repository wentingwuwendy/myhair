// MyHair - Canvas Hair Rendering Engine v2
class HairRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.params = { length: 60, curl: 20, volume: 50, bangs: 30, color: '#1a0a00' };
    this.animFrame = null;
    this.headBounds = null;
    this.startParams = null;
    this.targetParams = null;
    this.transitionStart = 0;
    this.transitionDuration = 300;
  }

  setHeadBounds(x, y, w, h) {
    this.headBounds = { x, y, w, h };
  }

  setParams(newParams, animate = true) {
    if (animate) {
      this.startParams = { ...this.params };
      this.targetParams = { ...this.params, ...newParams };
      this.transitionStart = performance.now();
      this._animateTransition();
    } else {
      Object.assign(this.params, newParams);
      this.render();
    }
  }

  _animateTransition() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    const step = (now) => {
      const t = Math.min((now - this.transitionStart) / this.transitionDuration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      for (const k of Object.keys(this.targetParams)) {
        if (typeof this.targetParams[k] === 'number') {
          this.params[k] = this.startParams[k] + (this.targetParams[k] - this.startParams[k]) * ease;
        } else {
          this.params[k] = this.targetParams[k];
        }
      }
      this.render();
      if (t < 1) this.animFrame = requestAnimationFrame(step);
    };
    this.animFrame = requestAnimationFrame(step);
  }

  render() {
    const { canvas, ctx } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Head geometry
    let cx, cy, headR;
    if (this.headBounds) {
      const b = this.headBounds;
      cx = b.x + b.w / 2;
      cy = b.y + b.h * 0.22; // top of head
      headR = b.w * 0.44;
    } else {
      cx = canvas.width / 2;
      cy = canvas.height * 0.25;
      headR = canvas.width * 0.22;
    }

    this._drawHair(cx, cy, headR, this.params);
  }

  _drawHair(cx, cy, headR, p) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    const lengthFactor = p.length / 100;
    const volumeFactor = 0.55 + (p.volume / 100) * 0.9;
    const curlFactor   = p.curl / 100;
    const bangsFactor  = p.bangs / 100;

    // Hair ends at most near bottom of canvas
    const maxHair = Math.min(headR * 3.8, H - cy - 4);
    const hairLen = headR * 0.2 + maxHair * lengthFactor;

    // Crown of hair (above headR)
    const crownY = cy - headR * (1.02 + volumeFactor * 0.28);

    // Face oval — clip region to protect face
    const faceRx = headR * 0.68;
    const faceRy = headR * 0.78;
    const faceCy = cy + headR * 0.12; // face center is slightly below head top-center

    const colors = this._parseColorForGradient(p.color);

    // 1. SIDE & BACK HAIR — clipped to exclude face oval
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.ellipse(cx, faceCy, faceRx, faceRy, 0, 0, Math.PI * 2);
    ctx.clip('evenodd');
    this._drawHairMass(ctx, cx, cy, headR, hairLen, volumeFactor, curlFactor, crownY, colors, 0.82);
    ctx.restore();

    // 2. TOP CROWN HAIR — only above forehead (above faceCy - faceRy)
    const foreheadY = faceCy - faceRy;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, foreheadY + headR * 0.15); // clip to forehead-and-above region
    ctx.clip();
    this._drawCrownHair(ctx, cx, cy, headR, volumeFactor, curlFactor, crownY, colors, bangsFactor);
    ctx.restore();

    // 3. BANGS — thin strip at forehead level
    if (bangsFactor > 0.08) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - headR * 1.1, foreheadY - headR * 0.1, headR * 2.2, headR * (0.3 + bangsFactor * 0.55));
      ctx.clip();
      this._drawBangs(ctx, cx, cy, headR, bangsFactor, colors);
      ctx.restore();
    }

    // 4. GLOSS
    ctx.save();
    this._drawGloss(ctx, cx, cy, headR, crownY, volumeFactor);
    ctx.restore();
  }

  // Main hair mass (sides + length)
  _drawHairMass(ctx, cx, cy, headR, hairLen, volumeFactor, curlFactor, crownY, colors, opacity) {
    const W = this.canvas.width, H = this.canvas.height;
    const bottomY = Math.min(cy + hairLen, H - 2);
    const sideR = headR * volumeFactor;

    const grad = ctx.createLinearGradient(cx, crownY, cx, bottomY);
    grad.addColorStop(0, this._lighten(colors[0], 0.18));
    grad.addColorStop(0.3, colors[0]);
    grad.addColorStop(1, colors[1] || colors[0]);

    // Silhouette
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.88, cy - headR * 0.2);
    ctx.bezierCurveTo(
      cx - sideR * 1.05, crownY,
      cx + sideR * 1.05, crownY,
      cx + headR * 0.88, cy - headR * 0.2
    );
    // Right side down
    const rEnd = cx + sideR * (0.72 + curlFactor * 0.3) + this._curl(curlFactor, 1, hairLen, 10);
    ctx.bezierCurveTo(cx + sideR * 1.1, cy + headR * 0.6, rEnd, bottomY - hairLen * 0.08, rEnd, bottomY);
    // Bottom
    ctx.bezierCurveTo(cx + curlFactor * headR * 0.4, bottomY + headR * 0.08,
                      cx - curlFactor * headR * 0.4, bottomY + headR * 0.08,
                      cx - sideR * (0.72 + curlFactor * 0.3) + this._curl(curlFactor, 0, hairLen, 11), bottomY);
    // Left side up
    ctx.bezierCurveTo(cx - sideR * 1.1, cy + headR * 0.6, cx - headR * 0.88, cy - headR * 0.2, cx - headR * 0.88, cy - headR * 0.2);
    ctx.closePath();

    ctx.globalAlpha = opacity * 0.48;
    ctx.fillStyle = grad;
    ctx.fill();

    // Strands
    const strands = 100 + Math.floor(volumeFactor * 40);
    for (let i = 0; i < strands; i++) {
      const t = i / strands;
      // Spread around sides — skip top quarter (top is handled by crownHair)
      const angle = (t - 0.5) * Math.PI * 0.95;
      const sx = cx + Math.cos(angle) * headR * 0.88;
      const sy = cy + Math.sin(angle) * headR * 0.78;
      const ex = cx + Math.cos(angle) * (sideR + (Math.random() - 0.5) * headR * 0.06)
                 + this._curl(curlFactor, t, hairLen, i);
      const ey = Math.min(sy + hairLen * (0.78 + Math.random() * 0.22), H - 2);
      const curlX = curlFactor * headR * 1.2 * Math.sin(t * Math.PI * 2.5 + i * 0.6);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(sx + curlX, sy + (ey - sy) * 0.3, ex - curlX * 0.4, ey - (ey - sy) * 0.15, ex, ey);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.5 + Math.random() * 1.1;
      ctx.globalAlpha = opacity * (0.28 + Math.random() * 0.42);
      ctx.stroke();
    }
  }

  // Hair on the very top of the head / crown
  _drawCrownHair(ctx, cx, cy, headR, volumeFactor, curlFactor, crownY, colors, bangsFactor) {
    const sideR = headR * volumeFactor;
    const bottomOfCrown = cy - headR * 0.15;
    const grad = ctx.createLinearGradient(cx, crownY - headR * 0.1, cx, bottomOfCrown);
    grad.addColorStop(0, this._lighten(colors[0], 0.25));
    grad.addColorStop(1, colors[0]);

    // Crown cap shape
    ctx.beginPath();
    ctx.moveTo(cx - headR * 0.88, cy - headR * 0.22);
    ctx.bezierCurveTo(cx - sideR * 1.05, crownY, cx + sideR * 1.05, crownY, cx + headR * 0.88, cy - headR * 0.22);
    ctx.bezierCurveTo(cx + headR * 0.5, cy - headR * 0.05, cx - headR * 0.5, cy - headR * 0.05, cx - headR * 0.88, cy - headR * 0.22);
    ctx.closePath();
    ctx.globalAlpha = 0.58;
    ctx.fillStyle = grad;
    ctx.fill();

    // Crown strands
    for (let i = 0; i < 50; i++) {
      const t = (i / 50) - 0.5;
      const angle = -Math.PI * 0.5 + t * Math.PI * 0.8;
      const sx = cx + Math.cos(angle) * headR * 0.9;
      const sy = cy + Math.sin(angle) * headR * 0.85;
      const ex = cx + Math.cos(angle) * (sideR * 0.95 + (Math.random() - 0.5) * headR * 0.05);
      const ey = crownY + Math.random() * headR * 0.2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo((sx + ex) / 2 + (Math.random() - 0.5) * headR * 0.08, (sy + ey) / 2, ex, ey);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.6 + Math.random() * 1.0;
      ctx.globalAlpha = 0.35 + Math.random() * 0.45;
      ctx.stroke();
    }
  }

  _drawBangs(ctx, cx, cy, headR, bangsFactor, colors) {
    const bangW = headR * (0.75 + bangsFactor * 0.45);
    const bangTop = cy - headR * 0.97;
    const bangBot = cy - headR * (0.82 - bangsFactor * 0.62);
    const grad = ctx.createLinearGradient(cx, bangTop, cx, bangBot);
    grad.addColorStop(0, this._lighten(colors[0], 0.15));
    grad.addColorStop(1, colors[1] || colors[0]);

    ctx.beginPath();
    ctx.moveTo(cx - bangW, bangTop);
    ctx.bezierCurveTo(cx - bangW * 0.8, bangTop - headR * 0.12, cx + bangW * 0.8, bangTop - headR * 0.12, cx + bangW, bangTop);
    ctx.bezierCurveTo(cx + bangW * 0.6, bangBot, cx + bangW * 0.15, bangBot + headR * 0.05, cx, bangBot + headR * 0.02 * bangsFactor);
    ctx.bezierCurveTo(cx - bangW * 0.15, bangBot + headR * 0.05, cx - bangW * 0.6, bangBot, cx - bangW, bangTop);
    ctx.globalAlpha = 0.78;
    ctx.fillStyle = grad;
    ctx.fill();

    for (let i = 0; i < 28; i++) {
      const t = (i / 28) - 0.5;
      const sx = cx + t * bangW * 2;
      ctx.beginPath();
      ctx.moveTo(sx, bangTop);
      ctx.quadraticCurveTo(sx + (Math.random() - 0.5) * headR * 0.08, (bangTop + bangBot) / 2, sx + t * headR * 0.04, bangBot);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.6 + Math.random() * 1.0;
      ctx.globalAlpha = 0.4 + Math.random() * 0.45;
      ctx.stroke();
    }
  }

  _drawGloss(ctx, cx, cy, headR, crownY, volumeFactor) {
    const gx = cx - headR * 0.12, gy = crownY + headR * 0.1;
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, headR * volumeFactor * 0.65);
    grad.addColorStop(0, 'rgba(255,255,255,0.18)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0.05)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 1;
    ctx.fillRect(cx - headR * volumeFactor, crownY - headR * 0.15, headR * volumeFactor * 2, headR * 1.4);
  }

  _curl(curlFactor, t, hairLen, seed) {
    return curlFactor < 0.05 ? 0 : Math.sin(t * Math.PI * 2.8 + seed * 1.2) * curlFactor * hairLen * 0.14;
  }

  _parseColorForGradient(hexColor) {
    const preset = HAIR_COLORS.find(c => c.value === hexColor);
    if (preset) return preset.gradient;
    return [this._lighten(hexColor, 0.15), this._darken(hexColor, 0.2)];
  }

  _lighten(hex, amount) {
    const n = parseInt((hex || '#1a0a00').replace('#', ''), 16);
    const r = Math.min(255, (n >> 16) + Math.round(255 * amount));
    const g = Math.min(255, ((n >> 8) & 0xff) + Math.round(255 * amount));
    const b = Math.min(255, (n & 0xff) + Math.round(255 * amount));
    return `rgb(${r},${g},${b})`;
  }

  _darken(hex, amount) {
    const n = parseInt((hex || '#1a0a00').replace('#', ''), 16);
    const r = Math.max(0, (n >> 16) - Math.round(255 * amount));
    const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(255 * amount));
    const b = Math.max(0, (n & 0xff) - Math.round(255 * amount));
    return `rgb(${r},${g},${b})`;
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }
}
