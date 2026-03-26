// ===========================
// render/card.js — premium final pass
// Canvas 1080×1350 — p5.js instance mode
// ===========================

function renderCard(profile, containerId, answers = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  new p5(function (p) {

    const W = 1080;
    const H = 1350;
    const MARGIN = 120;

    const SERIF = 'Cormorant Garamond';

    const BG = [247, 243, 241];
    const TEXT_DARK = [96, 88, 91];
    const TEXT_MAIN = [112, 103, 107];
    const TEXT_SOFT = [150, 140, 145];
    const TEXT_LIGHT = [170, 161, 166];
    const RULE = [214, 208, 211];
    const GRID = [223, 217, 219];

    const Q_L = 150;
    const Q_R = 930;
    const Q_T = 172;
    const Q_B = 792;
    const Q_CX = (Q_L + Q_R) / 2;
    const Q_CY = (Q_T + Q_B) / 2;

    const HEADER_Y = 88;
    const DIV1_Y = 862;
    const NAME_Y = 1008;
    const DIV2_Y = 1042;
    const INFO_Y = 1094;

    const INFO_LEFT = MARGIN;
const INFO_RIGHT = W - MARGIN;
const INFO_CENTER = W / 2;

const INFO_GAP = 44; // espai total entre les dues columnes
const COL_W = (INFO_RIGHT - INFO_LEFT - INFO_GAP) / 2;

const COL_L = INFO_LEFT;
const COL_R = INFO_CENTER + INFO_GAP / 2;
const COL_MID = INFO_CENTER;

const COL_W_L = COL_W;
const COL_W_R = COL_W;

    const CORNERS = {
      exploracion: [Q_L, Q_T],
      cultura: [Q_R, Q_T],
      placer: [Q_L, Q_B],
      calma: [Q_R, Q_B],
    };

    const AXIS_LABEL = {
      exploracion: 'Exploración',
      cultura: 'Cultura',
      placer: 'Placer',
      calma: 'Calma',
    };

    const OPPOSITE = {
      exploracion: 'calma',
      cultura: 'placer',
      placer: 'cultura',
      calma: 'exploracion',
    };

    const seed = Array.from(profile?.name || 'x').reduce((s, c) => s + c.charCodeAt(0), 42);
    const axes = normalizeAxes(profile?.normalizedAxes || {});
    const dominantAxis = getDominantAxis(axes, profile?.dominantAxis);
    const secondaryAxis = getSecondaryAxis(axes, dominantAxis);
    const destination = getDestination(profile, answers);

    p.setup = function () {
      p.pixelDensity(2);
      const cnv = p.createCanvas(W, H);
      cnv.parent(containerId);
      p.noLoop();
      p.randomSeed(seed);
      p.noiseSeed(seed);
    };

    p.draw = function () {
      drawBackground();
      drawHeader();
      drawGrid();
      drawNebula();
      drawAxisLabels();
      hRule(MARGIN, DIV1_Y, W - MARGIN, 0.74);
      drawName();
      hRule(MARGIN, DIV2_Y, W - MARGIN, 0.56);
      drawInfoBlock();
    };

    function drawBackground() {
  p.background(...BG);

  p.push();
  p.noStroke();

  // gra clar fi, molt homogeni
  for (let i = 0; i < 5200; i++) {
    const g = p.random(250, 255);
    p.fill(g, g, g, p.random(4, 9));
    p.circle(p.random(W), p.random(H), p.random(0.35, 0.9));
  }

  // gra ombra subtil, més fi que abans
  for (let i = 0; i < 2600; i++) {
    const g = p.random(210, 219);
    p.fill(g, g, g, p.random(2, 5));
    p.circle(p.random(W), p.random(H), p.random(0.3, 0.75));
  }

  // vel central gairebé imperceptible per donar profunditat
  for (let i = 0; i < 18; i++) {
    const a = p.random(3, 7);
    p.fill(255, 255, 255, a);
    p.circle(
      W / 2 + p.random(-120, 120),
      H / 2 + p.random(-180, 180),
      p.random(180, 320)
    );
  }

  p.pop();
}

    function drawHeader() {
      p.drawingContext.save();
      p.drawingContext.font = 'normal 22px "Helvetica Neue", Arial, sans-serif';
      p.drawingContext.fillStyle = `rgb(${TEXT_MAIN.join(',')})`;
      p.drawingContext.textAlign = 'center';
      p.drawingContext.textBaseline = 'middle';
      p.drawingContext.letterSpacing = '0.18em';
      p.drawingContext.fillText('UNTAB TRAVEL', W / 2, HEADER_Y);
      p.drawingContext.restore();
    }

    function drawGrid() {
      p.push();
      p.noStroke();

      // Pols molt subtils
      const poles = [
        [Q_CX, Q_T + 22],
        [Q_CX, Q_B - 22],
        [Q_L + 22, Q_CY],
        [Q_R - 22, Q_CY],
      ];

      poles.forEach(([mx, my]) => {
        p.fill(...GRID, 42);
        p.circle(mx, my, 1.7);
      });

      // Traços curts i quasi imperceptibles prop del centre
      p.stroke(...GRID, 20);
      p.strokeWeight(0.32);
      p.drawingContext.setLineDash([2, 18]);
      const cLen = 34;
      p.line(Q_CX - cLen, Q_CY, Q_CX + cLen, Q_CY);
      p.line(Q_CX, Q_CY - cLen, Q_CX, Q_CY + cLen);
      p.drawingContext.setLineDash([]);

      // Diagonals ultra subtils
      p.stroke(...GRID, 12);
      p.strokeWeight(0.28);
      const dLen = 54;
      p.line(Q_CX - dLen, Q_CY - dLen, Q_CX + dLen, Q_CY + dLen);
      p.line(Q_CX + dLen, Q_CY - dLen, Q_CX - dLen, Q_CY + dLen);

      p.noStroke();
      p.fill(...GRID, 30);
      p.circle(Q_CX, Q_CY, 1.6);

      p.pop();
    }

    function drawAxisLabels() {
      Object.entries(CORNERS).forEach(([axis, [cx, cy]]) => {
        const isRight = cx > Q_CX;
        const isBottom = cy > Q_CY;

        const x = isRight ? cx - 2 : cx + 2;
        const nameY = isBottom ? cy - 8 : cy + 68;
        const pctY = nameY + 37;

        p.noStroke();
        p.textAlign(isRight ? p.RIGHT : p.LEFT);

        p.fill(...TEXT_MAIN, 242);
        p.textFont(SERIF);
        p.textStyle(p.NORMAL);
        p.textSize(31);
        p.text(AXIS_LABEL[axis], x, nameY);

        p.fill(...TEXT_SOFT, 228);
        p.textFont(SERIF);
        p.textStyle(p.NORMAL);
        p.textSize(15);
        p.text(`+${axes[axis]}%`, x, pctY);
      });

      p.textAlign(p.LEFT);
    }

    function drawNebula() {
  const domVal = axes[dominantAxis] || 25;
  const secVal = axes[secondaryAxis] || 20;

  const domCorner = CORNERS[dominantAxis];
  const oppCorner = CORNERS[OPPOSITE[dominantAxis]];
  const secCorner = CORNERS[secondaryAxis];

  // Direcció principal = eix dominant
  const dirX = domCorner[0] - oppCorner[0];
  const dirY = domCorner[1] - oppCorner[1];
  const angle = Math.atan2(dirY, dirX);
  const diag = Math.sqrt(dirX * dirX + dirY * dirY);

  // Centre lleugerament desplaçat cap al dominant
  const domPull = 0.08 + (domVal / 100) * 0.08;
  const ncx = Q_CX + (domCorner[0] - Q_CX) * domPull;
  const ncy = Q_CY + (domCorner[1] - Q_CY) * domPull;

  // Obertura lateral guiada pel secundari
  const secVecX = secCorner[0] - Q_CX;
  const secVecY = secCorner[1] - Q_CY;
  const perp = -Math.sin(angle) * secVecX + Math.cos(angle) * secVecY;
  const secSign = perp >= 0 ? 1 : -1;
  const secInfluence = (secVal / 100) * 0.48;

  // una mica més curta perquè no arribi tan lluny a les cantonades
  const nLen = diag * 0.72;
  const halfLen = nLen * 0.5;

  p.push();
  p.translate(ncx, ncy);
  p.rotate(angle);
  p.noStroke();

  // Amplada: molt ampla al centre, fina a les puntes
  const getSpread = (t) => {
    const norm = Math.min(1, Math.abs(t) / halfLen);
    const taper = Math.pow(1 - norm, 0.42);
    return 3 + taper * 62;
  };

  const getCurveY = (t) => {
    const n = t / halfLen;
    return secSign * Math.sin(n * Math.PI * 0.82) * (8 + secInfluence * 12);
  };


  // =========================
  // 2. Microdust principal — més punts
  // =========================
  for (let i = 0; i < 280; i++) {
    const t = p.random(-halfLen * 0.96, halfLen * 0.82);
    const spread = getSpread(t) * 0.72;
    const cy = getCurveY(t);
    const y = cy + p.random(-spread, spread);

    const r = p.random(0.35, 1.25);
    const soft = p.random(156, 198);
const core = p.random(244, 255);

p.fill(soft, soft, soft, p.random(58, 98));
p.circle(t, y, r * 3.2);

p.fill(core, core, core, p.random(236, 255));
p.circle(t, y, r * 1.02);
  }

  // =========================
  // 3. Punts estructurals
  // =========================
  for (let i = 0; i < 110; i++) {
    const t = p.random(-halfLen * 0.90, halfLen * 0.76);
    const spread = getSpread(t) * 0.56;
    const cy = getCurveY(t);
    const y = cy + p.random(-spread, spread);

    const r = p.random(0.9, 2.8);

    p.fill(188, 188, 188, p.random(58, 98));
p.circle(t, y, r * 4.6);

p.fill(252, 252, 252, p.random(242, 255));
p.circle(t, y, r * 1.06);
  }

  // =========================
  // 4. Punts grafit — més presència
  // =========================
  for (let i = 0; i < 58; i++) {
    const t = p.random(-halfLen * 0.86, halfLen * 0.74);
    const spread = getSpread(t) * 0.70;
    const cy = getCurveY(t);
    const y = cy + p.random(-spread, spread);

    const g = p.random(28, 68);
const r = p.random(0.85, 2.15);

p.fill(g, g, g, p.random(220, 255));
p.circle(t, y, r);
  }

  // =========================
  // 5. Anchors brillants
  // =========================
  for (let i = 0; i < 22; i++) {
    const t = p.random(-halfLen * 0.54, halfLen * 0.42);
    const spread = getSpread(t) * 0.30;
    const cy = getCurveY(t);
    clusterStar(t, cy + p.random(-spread, spread), p.random(1.8, 3.7));
  }

  // =========================
  // 6. Densitat central extra
  // =========================
  for (let i = 0; i < 90; i++) {
    const t = p.random(-halfLen * 0.22, halfLen * 0.18);
    const spread = getSpread(t) * 0.95;
    const cy = getCurveY(t);
    const y = cy + p.random(-spread, spread);

    const r = p.random(0.45, 1.6);
    const g = p.random(148, 190);

p.fill(g, g, g, p.random(64, 112));
p.circle(t, y, r * 2.9);

p.fill(252, 252, 252, p.random(232, 255));
p.circle(t, y, r * 1.02);
  }

  // =========================
  // 7. Punts perifèrics grans al centre
  // =========================
  for (let i = 0; i < 12; i++) {
    const t = p.random(-halfLen * 0.28, halfLen * 0.24);
    const spread = getSpread(t) * 0.78;
    const cy = getCurveY(t);
    const y = cy + p.random(-spread, spread);

    const r = p.random(1.8, 4.4);

    p.fill(255, 255, 255, p.random(56, 94));
    p.circle(t, y, r * 3.5);

    p.fill(252, 252, 252, p.random(235, 255));
    p.circle(t, y, r);
  }

  // =========================
  // 8. Focus central més visible
  // =========================
  brightStar(0, getCurveY(0) * 0.18, 18.5);

  p.pop();
}
   function clusterStar(x, y, s) {
  p.noStroke();

  p.fill(255, 255, 255, 62);
  p.circle(x, y, s * 11.5);

  p.fill(188, 188, 188, 156);
  p.circle(x, y, s * 5.6);

  p.fill(255, 255, 255, 252);
  p.circle(x, y, s * 2.2);

  p.fill(255, 255, 255, 255);
  p.circle(x, y, s * 1.02);
}
   function brightStar(x, y, s) {
  [
    [s * 22, 16],
    [s * 13, 36],
    [s * 7.4, 88],
    [s * 3.6, 165]
  ].forEach(([r, a]) => {
    p.noStroke();
    p.fill(255, 255, 255, a);
    p.circle(x, y, r);
  });

  p.stroke(255, 255, 255, 205);
  p.strokeWeight(1.2);
  p.line(x - s * 8.8, y, x + s * 8.8, y);
  p.line(x, y - s * 8.8, x, y + s * 8.8);

  p.stroke(182, 182, 182, 125);
  p.strokeWeight(0.85);
  p.line(x - s * 5.2, y - s * 5.2, x + s * 5.2, y + s * 5.2);
  p.line(x + s * 5.2, y - s * 5.2, x - s * 5.2, y + s * 5.2);

  p.noStroke();
  p.fill(255, 255, 255, 255);
  p.circle(x, y, s * 1.04);
}

    function hRule(x1, y, x2, alpha = 0.5) {
      p.push();
      p.stroke(...RULE, 255 * alpha);
      p.strokeWeight(0.65);
      p.line(x1, y, x2, y);
      p.pop();
    }

    function drawName() {
  p.noStroke();
  p.fill(...TEXT_MAIN, 236);
  p.textFont(SERIF);
  p.textStyle(p.NORMAL);
  p.textSize(42);
  p.textAlign(p.CENTER);
  p.text(profile?.name || 'Viajero', W / 2, NAME_Y);
}

    function drawInfoBlock() {
  p.push();
  p.drawingContext.setLineDash([2, 7]);
  p.stroke(...RULE, 150);
  p.strokeWeight(0.6);
  p.line(COL_MID, INFO_Y + 10, COL_MID, INFO_Y + 258);
  p.drawingContext.setLineDash([]);
  p.pop();

  const innerPad = 18;
  const shiftRight = 14;

  const leftX = COL_L + innerPad;
  const rightX = COL_R + innerPad + shiftRight;

  const textWLeft = COL_W_L - innerPad * 2;
  const textWRight = COL_W_R - innerPad * 2 - shiftRight;

  const leftEndX = COL_L + COL_W_L;
  const rightEndX = COL_R + COL_W_R + shiftRight;

  infoLabelLeft('MICRO ADN', leftX, INFO_Y, leftEndX);
  infoTextLeft(profile?.microADN || '—', leftX, INFO_Y + 44, textWLeft, 120, 22, 28);

  infoLabelLeft('TRIBU VIAJERA', rightX, INFO_Y, rightEndX);
  infoTextLeft(profile?.tribe || '—', rightX, INFO_Y + 44, textWRight, 80, 22, 28);

  const DEST_Y = INFO_Y + 116;
  infoLabelLeft('DESTINO', rightX, DEST_Y, rightEndX);
  infoTextLeft(destination || '—', rightX, DEST_Y + 44, textWRight, 70, 22, 28);
}

function infoLabelLeft(txt, x, y, colEndX) {
  p.noStroke();
  p.fill(...TEXT_LIGHT, 244);
  p.textFont(SERIF);
  p.textStyle(p.NORMAL);
  p.textSize(16.5);
  p.textAlign(p.LEFT);

  const endX = trackedTextLeft(txt, x, y, 2.1);

  if (endX + 16 < colEndX) {
  p.push();
  p.drawingContext.setLineDash([1, 5]);
  p.stroke(...RULE, 175);
  p.strokeWeight(0.55);
  p.line(endX + 14, y - 4, colEndX, y - 4);
  p.drawingContext.setLineDash([]);
  p.pop();
}
}

function infoTextLeft(txt, x, y, w, h, size = 20, leading = 30) {
  p.noStroke();
  p.fill(...TEXT_DARK, 242);
  p.textFont(SERIF);
  p.textStyle(p.NORMAL);
  p.textSize(size);
  p.textLeading(leading);
  p.textAlign(p.LEFT);
  p.text(txt, x, y, w, h);
}

    function infoLabel(txt, x, y, lineEndX) {
      p.noStroke();
      p.fill(...TEXT_LIGHT, 238);
      p.textFont(SERIF);
      p.textStyle(p.NORMAL);
      p.textSize(17);
      p.textAlign(p.LEFT);

      const endX = trackedTextLeft(txt, x, y, 2.1);

      if (endX + 10 < lineEndX) {
        p.push();
        p.drawingContext.setLineDash([1, 5]);
        p.stroke(...RULE, 180);
        p.strokeWeight(0.55);
        p.line(endX + 8, y - 4, lineEndX, y - 4);
        p.drawingContext.setLineDash([]);
        p.pop();
      }
    }

    function infoText(txt, x, y, w, h, size = 20, leading = 30) {
      p.noStroke();
      p.fill(...TEXT_DARK, 244);
      p.textFont(SERIF);
      p.textStyle(p.NORMAL);
      p.textSize(size);
      p.textLeading(leading);
      p.textAlign(p.LEFT);
      p.text(txt, x, y, w, h);
    }

    function normalizeAxes(raw) {
      return {
        exploracion: clampPercent(raw?.exploracion ?? 25),
        cultura: clampPercent(raw?.cultura ?? 25),
        placer: clampPercent(raw?.placer ?? 25),
        calma: clampPercent(raw?.calma ?? 25),
      };
    }

    function clampPercent(v) {
      const n = Number(v);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(100, Math.round(n)));
    }

    function getDominantAxis(axesObj, fallback) {
      if (fallback && axesObj[fallback] != null) return fallback;
      return Object.entries(axesObj).sort((a, b) => b[1] - a[1])[0]?.[0] || 'placer';
    }

    function getSecondaryAxis(axesObj, dominant) {
      return Object.entries(axesObj)
        .filter(([key]) => key !== dominant)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'cultura';
    }

    function getDestination(profileObj, answersObj) {
      const explicit = cleanText(profileObj?.desiredDestination);
      if (explicit) return explicit;

      const fromQ2 = cleanText(answersObj?.q2);
      if (fromQ2) return fromQ2;

      return '—';
    }

    function cleanText(value) {
      if (value == null) return '';
      const txt = String(value).trim();
      if (!txt || txt === '—' || txt === '-') return '';
      return txt;
    }

    function trackedTextLeft(str, x, y, spacing) {
      let cx = x;
      const chars = String(str).split('');
      p.textAlign(p.LEFT);

      chars.forEach(c => {
        p.text(c, cx, y);
        cx += p.textWidth(c) + spacing;
      });

      return cx;
    }

  });
}

function downloadCard(containerId) {
  const canvas = document.querySelector(`#${containerId} canvas`);
  if (!canvas) return;

  const link = document.createElement('a');
  link.download = 'travel-identity.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}