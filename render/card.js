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

    // Base palette
    const BG = [246, 243, 240];      // #d5d3d1
    const TEXT_DARK = [96, 88, 91];
    const TEXT_MAIN = [112, 103, 107];
    const TEXT_SOFT = [150, 140, 145];
    const TEXT_LIGHT = [170, 161, 166];
    const RULE = [214, 208, 211];

    // Constellation palette
    const STAR_WHITE = [250, 250, 246];  // #fafaf6
    const STAR_DARK_1 = [107, 105, 102]; // #6b6966
    const STAR_DARK_2 = [110, 107, 104]; // #6e6b68
    const STAR_MID = [205, 201, 197];

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

    const INFO_GAP = 44;
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

      // fine highlight grain
      for (let i = 0; i < 5200; i++) {
        const g = p.random(236, 248);
        p.fill(g, g, g, p.random(3, 8));
        p.circle(p.random(W), p.random(H), p.random(0.35, 0.9));
      }

      // darker mineral grain
      for (let i = 0; i < 2600; i++) {
        const g = p.random(188, 199);
        p.fill(g, g, g, p.random(2, 5));
        p.circle(p.random(W), p.random(H), p.random(0.3, 0.75));
      }

      // central veil
      for (let i = 0; i < 10; i++) {
  const a = p.random(2, 4);
  p.fill(...STAR_WHITE, a);
  p.circle(
    W / 2 + p.random(-90, 90),
    H / 2 + p.random(-130, 130),
    p.random(120, 220)
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

      const poles = [
        [Q_CX, Q_T + 22],
        [Q_CX, Q_B - 22],
        [Q_L + 22, Q_CY],
        [Q_R - 22, Q_CY],
      ];

      poles.forEach(([mx, my]) => {
        p.fill(185, 181, 178, 42);
        p.circle(mx, my, 1.7);
      });

      p.stroke(185, 181, 178, 34);
      p.strokeWeight(0.32);
      p.drawingContext.setLineDash([2, 18]);
      const cLen = 34;
      p.line(Q_CX - cLen, Q_CY, Q_CX + cLen, Q_CY);
      p.line(Q_CX, Q_CY - cLen, Q_CX, Q_CY + cLen);
      p.drawingContext.setLineDash([]);

      p.stroke(240, 238, 234, 26);
      p.strokeWeight(0.28);
      const dLen = 54;
      p.line(Q_CX - dLen, Q_CY - dLen, Q_CX + dLen, Q_CY + dLen);
      p.line(Q_CX + dLen, Q_CY - dLen, Q_CX - dLen, Q_CY + dLen);

      p.noStroke();
      p.fill(190, 186, 183, 28);
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

        p.fill(...TEXT_MAIN, 248);
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

      const dirX = domCorner[0] - oppCorner[0];
      const dirY = domCorner[1] - oppCorner[1];
      const angle = Math.atan2(dirY, dirX);
      const diag = Math.sqrt(dirX * dirX + dirY * dirY);

      const domPull = 0.08 + (domVal / 100) * 0.08;
      const ncx = Q_CX + (domCorner[0] - Q_CX) * domPull;
      const ncy = Q_CY + (domCorner[1] - Q_CY) * domPull;

      const secVecX = secCorner[0] - Q_CX;
      const secVecY = secCorner[1] - Q_CY;
      const perp = -Math.sin(angle) * secVecX + Math.cos(angle) * secVecY;
      const secSign = perp >= 0 ? 1 : -1;
      const secInfluence = (secVal / 100) * 0.48;

      const nLen = diag * 0.72;
      const halfLen = nLen * 0.5;

      p.push();
      p.translate(ncx, ncy);
      p.rotate(angle);
      p.noStroke();

      const getSpread = (t) => {
        const norm = Math.min(1, Math.abs(t) / halfLen);
        const base = Math.pow(1 - norm, 0.30);
        const asymmetry = t > 0 ? 0.82 : 1.08;
        return 2 + base * 92 * asymmetry;
      };

      const getCurveY = (t) => {
        const n = t / halfLen;
        return secSign * Math.sin(n * Math.PI * 0.82) * (8 + secInfluence * 12);
      };

      // microdust principal
      for (let i = 0; i < 280; i++) {
        const t = p.random(-halfLen * 0.96, halfLen * 0.82);
        const spread = getSpread(t) * 0.72;
        const cy = getCurveY(t);
        const y = cy + p.random(-spread, spread);

        const r = p.random(0.35, 1.25);

        p.fill(...STAR_MID, p.random(62, 102));
        p.circle(t, y, r * 3.4);

        p.fill(...STAR_WHITE, p.random(236, 255));
        p.circle(t, y, r * 1.06);
      }

      // punts estructurals
      for (let i = 0; i < 110; i++) {
        const t = p.random(-halfLen * 0.90, halfLen * 0.76);
        const spread = getSpread(t) * 0.56;
        const cy = getCurveY(t);
        const y = cy + p.random(-spread, spread);

        const r = p.random(0.9, 2.8);

        p.fill(...STAR_MID, p.random(72, 112));
        p.circle(t, y, r * 4.9);

        p.fill(...STAR_WHITE, p.random(242, 255));
        p.circle(t, y, r * 1.12);
      }

      // punts foscos perifèrics
      for (let i = 0; i < 58; i++) {
        const t = p.random(-halfLen * 0.86, halfLen * 0.74);
        const spread = getSpread(t) * 0.70;
        const cy = getCurveY(t);
        const y = cy + p.random(-spread, spread);

        const darkColor = p.random() < 0.5 ? STAR_DARK_1 : STAR_DARK_2;
        const r = p.random(0.9, 2.35);

        p.fill(...darkColor, p.random(218, 255));
        p.circle(t, y, r);
      }

      // anchors brillants
      for (let i = 0; i < 22; i++) {
        const t = p.random(-halfLen * 0.54, halfLen * 0.42);
        const spread = getSpread(t) * 0.30;
        const cy = getCurveY(t);
        clusterStar(t, cy + p.random(-spread, spread), p.random(1.8, 3.7));
      }

      // densitat central extra
      for (let i = 0; i < 320; i++) {
        const t = p.random(-halfLen * 0.24, halfLen * 0.22);
        const spread = getSpread(t) * 1.08;
        const cy = getCurveY(t);
        const y = cy + p.random(-spread, spread);

        const r = p.random(0.4, 1.75);

        p.fill(...STAR_MID, p.random(72, 118));
        p.circle(t, y, r * 3.1);

        p.fill(...STAR_WHITE, p.random(232, 255));
        p.circle(t, y, r * 1.05);
      }

      // punts perifèrics grans al centre
      for (let i = 0; i < 12; i++) {
        const t = p.random(-halfLen * 0.28, halfLen * 0.24);
        const spread = getSpread(t) * 0.78;
        const cy = getCurveY(t);
        const y = cy + p.random(-spread, spread);

        const r = p.random(1.8, 4.4);

        p.fill(...STAR_WHITE, p.random(56, 94));
        p.circle(t, y, r * 3.5);

        p.fill(...STAR_WHITE, p.random(235, 255));
        p.circle(t, y, r);
      }

      // activitat extra al nucli
      for (let i = 0; i < 130; i++) {
        const t = p.random(-halfLen * 0.18, halfLen * 0.18);
        const spread = getSpread(t) * 1.15;
        const cy = getCurveY(t);
        const y = cy + p.random(-spread, spread);

        const useWhite = p.random() > 0.38;
        const r = p.random(0.8, 2.8);

        if (useWhite) {
          p.fill(...STAR_WHITE, p.random(232, 255));
          p.circle(t, y, r);
        } else {
          const darkColor = p.random() < 0.5 ? STAR_DARK_1 : STAR_DARK_2;
          p.fill(...darkColor, p.random(210, 248));
          p.circle(t, y, r * 0.85);
        }
      }

      brightStar(0, getCurveY(0) * 0.18, 18.5);

      p.pop();
    }

    function clusterStar(x, y, s) {
      p.noStroke();

      p.fill(...STAR_WHITE, 68);
      p.circle(x, y, s * 12.5);

      p.fill(...STAR_MID, 148);
      p.circle(x, y, s * 5.8);

      p.fill(...STAR_WHITE, 250);
      p.circle(x, y, s * 2.25);

      p.fill(...STAR_WHITE, 255);
      p.circle(x, y, s * 1.08);
    }

    function brightStar(x, y, s) {
      [
  [s * 18, 10],
  [s * 10, 22],
  [s * 5.8, 56],
  [s * 2.8, 120]
].forEach(([r, a]) => {
        p.noStroke();
        p.fill(...STAR_WHITE, a);
        p.circle(x, y, r);
      });

      p.stroke(...STAR_WHITE, 205);
      p.strokeWeight(1.2);
      p.line(x - s * 8.8, y, x + s * 8.8, y);
      p.line(x, y - s * 8.8, x, y + s * 8.8);

      p.stroke(182, 182, 182, 125);
      p.strokeWeight(0.85);
      p.line(x - s * 5.2, y - s * 5.2, x + s * 5.2, y + s * 5.2);
      p.line(x + s * 5.2, y - s * 5.2, x - s * 5.2, y + s * 5.2);

      p.noStroke();
      p.fill(...STAR_WHITE, 255);
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
  p.fill(...TEXT_MAIN, 248);
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

  const outerMargin = 192;
const centerGap = 60;


  const colWidth = (W - outerMargin * 2 - centerGap) / 2;

  const leftX = outerMargin;
  const opticalNudge = 12;

const rightX = outerMargin + colWidth + centerGap + opticalNudge;

  const leftEndX = leftX + colWidth;
  const rightEndX = rightX + colWidth;

  infoLabelLeft('MICRO ADN', leftX, INFO_Y, leftEndX);
  infoTextLeft(profile?.microADN || '—', leftX, INFO_Y + 30, colWidth, 120, 22, 28);

  infoLabelLeft('TRIBU VIAJERA', rightX, INFO_Y, rightEndX);
  infoTextLeft(profile?.tribe || '—', rightX, INFO_Y + 30, colWidth, 80, 22, 28);

  const DEST_Y = INFO_Y + 96;
  infoLabelLeft('DESTINO', rightX, DEST_Y, rightEndX);
  infoTextLeft(destination || '—', rightX, DEST_Y + 30, colWidth, 70, 22, 28);
}

    function infoLabelLeft(txt, x, y, colEndX) {
      p.noStroke();
      p.fill(110, 102, 106, 255);
      p.textFont(SERIF);
      p.textStyle(p.NORMAL);
      p.textSize(16.5);
      p.textAlign(p.LEFT);

      const endX = trackedTextLeft(txt, x, y, 2.1);

      if (endX + 16 < colEndX) {
        p.push();
        p.drawingContext.setLineDash([1, 5]);
        p.stroke(...RULE, 140);
        p.strokeWeight(0.55);
        p.line(endX + 14, y - 4, colEndX - 16, y - 4);
        p.drawingContext.setLineDash([]);
        p.pop();
      }
    }

    function infoTextLeft(txt, x, y, w, h, size = 20, leading = 30) {
      p.noStroke();
      p.fill(...TEXT_DARK, 248);
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