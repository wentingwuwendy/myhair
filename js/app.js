// MyHair - Main Application
'use strict';

// ===== STATE =====
const state = {
  currentPage: 'landing',
  userImage: null,   // dataURL
  analysisResult: null,
  currentPreset: null,
  hairParams: { length: 60, curl: 20, volume: 50, bangs: 30, color: '#1a0a00' },
  renderer: null,
  camera: new CameraModule(),
  cameraActive: false,
};

// ===== NAVIGATION =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
    state.currentPage = pageId;
    onPageEnter(pageId);
  }
}

function onPageEnter(pageId) {
  if (pageId !== 'editor') {
    state.camera.stopCamera();
    state.cameraActive = false;
  }
  if (pageId === 'editor') {
    initEditor();
  }
}

// ===== LANDING PAGE =====
function initLanding() {
  document.getElementById('btn-start-scan').addEventListener('click', () => showPage('scan'));
  document.getElementById('btn-demo').addEventListener('click', loadDemoImage);
}

function loadDemoImage() {
  // Load real user sample photo
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    // Draw into a canvas for uniform handling
    const c = document.createElement('canvas');
    c.width = img.naturalWidth || 444;
    c.height = img.naturalHeight || 444;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    state.userImage = c.toDataURL('image/jpeg', 0.92);

    // Analysis result matched to real photo characteristics:
    // - Medium-thick wavy hair, warm chestnut brown, shoulder length
    state.analysisResult = {
      volume: '中等偏多',
      color: '深栗棕',
      length: '中长发',
      texture: '自然波浪',
      confidence: 0.94
    };
    // Set params to match her current hair style
    state.hairParams = { length: 58, curl: 42, volume: 62, bangs: 5, color: '#5c3300' };
    showPage('editor');
  };
  img.onerror = () => {
    // Fallback: draw a nice illustrated silhouette
    _drawFallbackDemo();
  };
  img.src = 'assets/sample-user.jpg';
}

function _drawFallbackDemo() {
  const c = document.createElement('canvas');
  c.width = 444; c.height = 444;
  const ctx = c.getContext('2d');

  // Warm sunset background
  const bg = ctx.createLinearGradient(0, 0, 444, 444);
  bg.addColorStop(0, '#ff7a4a');
  bg.addColorStop(0.5, '#ff5f3a');
  bg.addColorStop(1, '#1a0a20');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 444, 444);

  // Body/shoulders
  ctx.fillStyle = '#8B3030';
  ctx.beginPath();
  ctx.ellipse(222, 460, 200, 100, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = '#e8a878';
  ctx.fillRect(196, 310, 52, 72);

  // Face
  ctx.fillStyle = '#e8a878';
  ctx.beginPath();
  ctx.ellipse(222, 238, 102, 118, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wavy long hair — chestnut brown
  const hairGrad = ctx.createLinearGradient(222, 80, 222, 420);
  hairGrad.addColorStop(0, '#7a4a20');
  hairGrad.addColorStop(0.4, '#5c3300');
  hairGrad.addColorStop(1, '#3d2000');

  // Hair silhouette
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.moveTo(120, 200);
  ctx.bezierCurveTo(90, 140, 130, 80, 222, 78);
  ctx.bezierCurveTo(314, 80, 354, 140, 324, 200);
  ctx.bezierCurveTo(340, 240, 348, 290, 338, 370);
  ctx.bezierCurveTo(320, 420, 280, 430, 270, 400);
  ctx.bezierCurveTo(260, 370, 240, 340, 222, 340);
  ctx.bezierCurveTo(204, 340, 184, 370, 174, 400);
  ctx.bezierCurveTo(164, 430, 124, 420, 106, 370);
  ctx.bezierCurveTo(96, 290, 104, 240, 120, 200);
  ctx.fill();

  // Eyes with glasses
  ctx.strokeStyle = '#2d1800';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#fff8f0';
  // Left eye frame
  ctx.beginPath(); ctx.roundRect(172, 222, 44, 28, 5); ctx.fill(); ctx.stroke();
  // Right eye frame  
  ctx.beginPath(); ctx.roundRect(228, 222, 44, 28, 5); ctx.fill(); ctx.stroke();
  // Bridge
  ctx.beginPath(); ctx.moveTo(216, 234); ctx.lineTo(228, 234); ctx.stroke();
  // Pupils
  ctx.fillStyle = '#1a0a00';
  ctx.beginPath(); ctx.arc(194, 236, 7, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(250, 236, 7, 0, Math.PI*2); ctx.fill();

  // Smile
  ctx.strokeStyle = '#c07050';
  ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(198, 290); ctx.quadraticCurveTo(222, 308, 246, 290); ctx.stroke();

  state.userImage = c.toDataURL('image/jpeg', 0.92);
  state.analysisResult = {
    volume: '中等偏多', color: '深栗棕', length: '中长发', texture: '自然波浪', confidence: 0.94
  };
  state.hairParams = { length: 58, curl: 42, volume: 62, bangs: 5, color: '#5c3300' };
  showPage('editor');
}

// ===== SCAN PAGE =====
let scanning = false;

function initScan() {
  const video = document.getElementById('camera-video');
  const placeholder = document.getElementById('camera-placeholder');
  const scanLine = document.querySelector('.scan-line');
  const uploadInput = document.getElementById('upload-input');
  const uploadZone = document.getElementById('upload-zone');

  document.getElementById('btn-start-camera').addEventListener('click', async () => {
    if (state.cameraActive) {
      captureFromCamera();
      return;
    }
    const ok = await state.camera.startCamera(video);
    if (ok) {
      placeholder.style.display = 'none';
      video.style.display = 'block';
      document.getElementById('btn-start-camera').textContent = '📸 拍照';
      state.cameraActive = true;
    } else {
      showToast('无法访问摄像头，请使用图片上传', 'error');
    }
  });

  document.getElementById('btn-use-photo').addEventListener('click', () => {
    uploadInput.click();
  });

  uploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataURL = await state.camera.loadImageFile(file);
      processImage(dataURL);
    } catch (err) {
      showToast('图片加载失败', 'error');
    }
  });

  // Drag & drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault(); uploadZone.classList.add('dragover');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', async (e) => {
    e.preventDefault(); uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      const dataURL = await state.camera.loadImageFile(file);
      processImage(dataURL);
    }
  });

  uploadZone.addEventListener('click', () => uploadInput.click());
}

function captureFromCamera() {
  const video = document.getElementById('camera-video');
  const dataURL = state.camera.captureFrame(video);
  processImage(dataURL);
}

async function processImage(dataURL) {
  state.userImage = dataURL;

  // Show analysis overlay
  const overlay = document.getElementById('analysis-overlay');
  overlay.classList.add('show');

  const steps = overlay.querySelectorAll('.analysis-step');
  const delays = [0, 700, 1400, 2000];

  steps.forEach((s, i) => {
    setTimeout(() => {
      steps.forEach(x => x.classList.remove('active'));
      s.classList.add('active');
      if (i > 0) steps[i-1].classList.add('done');
    }, delays[i]);
  });

  try {
    state.analysisResult = await state.camera.analyzeHair(dataURL);
  } catch {
    state.analysisResult = { volume: '中等', color: '自然黑', length: '中长发', texture: '直发', confidence: 0.88 };
  }

  setTimeout(() => {
    steps[steps.length - 1].classList.add('done');
    setTimeout(() => {
      overlay.classList.remove('show');
      showPage('editor');
    }, 500);
  }, 2300);
}

// ===== EDITOR PAGE =====
function initEditor() {
  const previewBase = document.getElementById('preview-base');
  const hairCanvas = document.getElementById('hair-canvas');

  if (!state.userImage) {
    loadDemoImage();
    return;
  }

  // Force image to fill preview area via inline styles (CSS might be cached)
  previewBase.style.cssText = [
    'position:absolute',
    'inset:0',
    'width:100%',
    'height:100%',
    'object-fit:cover',
    'object-position:center 20%',
    'display:block',
    'z-index:1'
  ].join(';');
  document.getElementById('hair-canvas').style.cssText = [
    'position:absolute',
    'top:0',
    'left:0',
    'width:100%',
    'height:100%',
    'pointer-events:none',
    'z-index:2'
  ].join(';');

  // Load image
  previewBase.onload = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resizeCanvas();
        initRenderer();
      });
    });
  };
  if (previewBase.complete && previewBase.src === state.userImage) {
    requestAnimationFrame(() => { resizeCanvas(); initRenderer(); });
  }
  previewBase.src = state.userImage;

  // Show analysis results
  if (state.analysisResult) {
    const r = state.analysisResult;
    document.getElementById('result-volume').textContent = r.volume;
    document.getElementById('result-color').textContent = r.color;
    document.getElementById('result-length').textContent = r.length;
    document.getElementById('result-texture').textContent = r.texture;
  }

  // Init presets
  initPresets();

  // Init sliders
  initSliders();

  // Init color picker
  initColorPicker();

  // Download button
  document.getElementById('btn-download').addEventListener('click', downloadResult);
  document.getElementById('btn-share').addEventListener('click', goToResult);

  // Resize handler
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const previewBase = document.getElementById('preview-base');
  const hairCanvas = document.getElementById('hair-canvas');
  const previewArea = document.querySelector('.preview-area');

  const areaRect = previewArea.getBoundingClientRect();
  const W = areaRect.width;
  const H = areaRect.height;

  if (W === 0 || H === 0) return;

  // Canvas = full preview area; CSS already makes it 100%×100% absolute
  hairCanvas.width = W;
  hairCanvas.height = H;

  if (state.renderer) {
    // Photo fills viewport via object-fit:cover, face is zoomed in.
    // In the cover-cropped view, face center-x ≈ 40% from left,
    // head top ≈ -10% (slightly above viewport top), head height ≈ 90% of viewport
    state.renderer.setHeadBounds(W * 0.22, -H * 0.08, W * 0.55, H * 0.88);
    state.renderer.render();
  }
}

function initRenderer() {
  const hairCanvas = document.getElementById('hair-canvas');
  state.renderer = new HairRenderer(hairCanvas);

  const hw = hairCanvas.width, hh = hairCanvas.height;
  // For square portrait photo: face is in upper 60%, centered
  // Head center ~35% from top, width ~48% of image
  state.renderer.setHeadBounds(hw * 0.26, hh * 0.02, hw * 0.48, hh * 0.60);
  state.renderer.setParams(state.hairParams, false);
}

function initPresets() {
  const grid = document.getElementById('presets-grid');
  grid.innerHTML = '';

  HAIR_PRESETS.forEach(preset => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn' + (state.currentPreset === preset.id ? ' active' : '');
    btn.innerHTML = `<span class="preset-emoji">${preset.emoji}</span><span>${preset.name}</span>`;
    btn.addEventListener('click', () => applyPreset(preset));
    grid.appendChild(btn);
  });
}

function applyPreset(preset) {
  state.currentPreset = preset.id;
  state.hairParams = { ...preset.params };

  // Update slider UI
  updateSliderUI();

  // Update color picker
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === preset.params.color);
  });

  // Apply to renderer
  if (state.renderer) {
    state.renderer.setParams(state.hairParams);
  }

  // Update preset buttons
  document.querySelectorAll('.preset-btn').forEach((btn, i) => {
    btn.classList.toggle('active', HAIR_PRESETS[i].id === preset.id);
  });
}

function initSliders() {
  const sliders = [
    { id: 'slider-length', key: 'length', label: '长度', suffix: '%' },
    { id: 'slider-curl', key: 'curl', label: '卷度', suffix: '%' },
    { id: 'slider-volume', key: 'volume', label: '发量', suffix: '%' },
    { id: 'slider-bangs', key: 'bangs', label: '刘海', suffix: '%' },
  ];

  sliders.forEach(({ id, key, suffix }) => {
    const slider = document.getElementById(id);
    const valueEl = document.getElementById(id + '-val');
    slider.value = state.hairParams[key];
    valueEl.textContent = Math.round(state.hairParams[key]) + suffix;

    slider.addEventListener('input', () => {
      const val = parseFloat(slider.value);
      state.hairParams[key] = val;
      valueEl.textContent = Math.round(val) + suffix;
      updateSliderTrack(slider);
      if (state.renderer) {
        state.renderer.setParams({ [key]: val }, false);
      }
    });
    updateSliderTrack(slider);
  });
}

function updateSliderTrack(slider) {
  const pct = ((slider.value - slider.min) / (slider.max - slider.min) * 100) + '%';
  slider.style.setProperty('--pct', pct);
}

function updateSliderUI() {
  [['slider-length', 'length'], ['slider-curl', 'curl'], ['slider-volume', 'volume'], ['slider-bangs', 'bangs']].forEach(([id, key]) => {
    const slider = document.getElementById(id);
    const val = document.getElementById(id + '-val');
    slider.value = state.hairParams[key];
    val.textContent = Math.round(state.hairParams[key]) + '%';
    updateSliderTrack(slider);
  });
}

function initColorPicker() {
  const grid = document.getElementById('color-grid');
  grid.innerHTML = '';

  HAIR_COLORS.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch' + (color.value === state.hairParams.color ? ' active' : '');
    swatch.dataset.color = color.value;
    swatch.title = color.name;
    swatch.style.background = `linear-gradient(135deg, ${color.gradient[0]}, ${color.gradient[1]})`;

    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      state.hairParams.color = color.value;
      if (state.renderer) {
        state.renderer.setParams({ color: color.value });
      }
    });

    grid.appendChild(swatch);
  });
}

function downloadResult() {
  const previewBase = document.getElementById('preview-base');
  const hairCanvas = document.getElementById('hair-canvas');

  const out = document.createElement('canvas');
  out.width = previewBase.naturalWidth || hairCanvas.width;
  out.height = previewBase.naturalHeight || hairCanvas.height;
  const ctx = out.getContext('2d');

  ctx.drawImage(previewBase, 0, 0, out.width, out.height);

  // Scale and draw hair canvas on top
  ctx.drawImage(hairCanvas, 0, 0, out.width, out.height);

  const link = document.createElement('a');
  link.download = 'myhair-style.png';
  link.href = out.toDataURL('image/png');
  link.click();
  showToast('✅ 发型图片已保存！');
}

function goToResult() {
  const previewBase = document.getElementById('preview-base');
  const hairCanvas = document.getElementById('hair-canvas');

  const out = document.createElement('canvas');
  out.width = hairCanvas.width;
  out.height = hairCanvas.height;
  const ctx = out.getContext('2d');
  ctx.drawImage(previewBase, 0, 0, out.width, out.height);
  ctx.drawImage(hairCanvas, 0, 0);

  document.getElementById('result-img').src = out.toDataURL('image/jpeg', 0.92);

  const preset = HAIR_PRESETS.find(p => p.id === state.currentPreset);
  if (preset) {
    document.getElementById('result-style-name').textContent = preset.name;
    document.getElementById('result-style-desc').textContent = preset.description;
  } else {
    document.getElementById('result-style-name').textContent = '自定义发型';
    document.getElementById('result-style-desc').textContent = '你的专属发型搭配';
  }

  showPage('result');
}

// ===== RESULT PAGE =====
function initResult() {
  document.getElementById('btn-edit-again').addEventListener('click', () => showPage('editor'));
  document.getElementById('btn-new-scan').addEventListener('click', () => showPage('scan'));
  document.getElementById('btn-download-result').addEventListener('click', () => {
    const img = document.getElementById('result-img');
    const link = document.createElement('a');
    link.download = 'myhair-result.jpg';
    link.href = img.src;
    link.click();
    showToast('✅ 图片已保存！');
  });
}

// ===== TOAST =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.borderColor = type === 'error' ? '#ef4444' : 'var(--purple)';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initLanding();
  initScan();
  initResult();
  showPage('landing');
});
