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
    // more faithful palette
    const BG = [250, 247, 245];
    const TEXT_DARK = [96, 88, 91];
    const TEXT_MAIN = [112, 103, 107];
    const TEXT_SOFT = [150, 140, 145];
    const TEXT_LIGHT = [181, 172, 176];
    const RULE = [220, 214, 216];
    const GRID = [223, 217, 219];

    // wider and better occupied upper zone
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

    // bottom layout
    const COL_L = 120;
    const COL_MID = 520;
    const COL_R   = 660;
    const COL_W_L = COL_MID - COL_L - 20;
    const COL_W_R = W - MARGIN - COL_R;

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

      for (let i = 0; i < 4200; i++) {
        p.fill(255, 255, 255, p.random(4, 8));
        p.circle(p.random(W), p.random(H), p.random(0.55, 1.15));
      }

      for (let i = 0; i < 2200; i++) {
        p.fill(218, 211, 214, p.random(2, 5));
        p.circle(p.random(W), p.random(H), p.random(0.45, 0.95));
      }

      p.pop();
    }

    function drawHeader() {
      p.drawingContext.save();
      p.drawingContext.font          = 'normal 22px "Helvetica Neue", Arial, sans-serif';
      p.drawingContext.fillStyle     = `rgb(${TEXT_MAIN.join(',')})`;
      p.drawingContext.textAlign     = 'center';
      p.drawingContext.textBaseline  = 'middle';
      p.drawingContext.letterSpacing = '0.18em';
      p.drawingContext.fillText('UNTAB TRAVEL', W / 2, HEADER_Y);
      p.drawingContext.restore();
    }

    function drawGrid() {
      p.push();

      p.stroke(...GRID, 90);
      p.strokeWeight(0.55);
      p.drawingContext.setLineDash([4, 10]);
      p.line(Q_L, Q_CY, Q_R, Q_CY);
      p.line(Q_CX, Q_T, Q_CX, Q_B);

      p.stroke(...GRID, 72);
      p.line(Q_CX, Q_CY, Q_L + 132, Q_T + 132);
      p.line(Q_CX, Q_CY, Q_R - 132, Q_T + 132);
      p.line(Q_CX, Q_CY, Q_L + 132, Q_B - 132);
      p.line(Q_CX, Q_CY, Q_R - 132, Q_B - 132);

      p.drawingContext.setLineDash([]);

      p.stroke(218, 212, 214, 130);
      p.strokeWeight(0.7);
      const cs = 8;
      p.line(Q_CX - cs, Q_CY, Q_CX + cs, Q_CY);
      p.line(Q_CX, Q_CY - cs, Q_CX, Q_CY + cs);

      p.pop();
    }

    function drawAxisLabels() {
      Object.entries(CORNERS).forEach(([axis, [cx, cy]]) => {
        const isRight = cx > Q_CX;
        const isBottom = cy > Q_CY;

        const x = isRight ? cx - 2 : cx + 2;
        const nameY = isBottom ? cy - 8 : cy + 68;
        const pctY = nameY + 37; // more top/bottom breathing

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
      const domCorner = CORNERS[dominantAxis];
      const oppCorner = CORNERS[OPPOSITE[dominantAxis]];

      const dx = domCorner[0] - oppCorner[0];
      const dy = domCorner[1] - oppCorner[1];
      const angle = Math.atan2(dy, dx);
      const diag = Math.sqrt(dx * dx + dy * dy);

      const domWeight = (axes[dominantAxis] || 25) / 100;
      const secWeight = (axes[secondaryAxis] || 20) / 100;

      const nLen = diag * 0.58;
      const shift = 0.08 + domWeight * 0.08;

      const ncx = Q_CX + (domCorner[0] - Q_CX) * shift;
      const ncy = Q_CY + (domCorner[1] - Q_CY) * shift;

      const spreadBoost = 1 + secWeight * 0.65;
      const densityBoost = 1 + domWeight * 0.78;

      p.push();
      p.translate(ncx, ncy);
      p.rotate(angle);
      p.noStroke();

      // 1. deep gray atmospheric base
      for (let i = 0; i < Math.round(120 * densityBoost); i++) {
        const t = p.random(-nLen * 0.52, nLen * 0.38);
        const decay = Math.max(0, 1 - Math.abs(t) / (nLen * 0.52));
        const spread = p.random(18, 82) * decay * spreadBoost;

        const gray = p.random(198, 224);
        p.fill(gray, gray, gray, p.random(8, 22));
        p.ellipse(
          t,
          p.random(-spread, spread),
          p.random(55, 165) * decay,
          p.random(24, 92) * decay
        );
      }

      // 2. white soft glow layer
      for (let i = 0; i < Math.round(100 * densityBoost); i++) {
        const t = p.random(-nLen * 0.48, nLen * 0.32);
        const decay = Math.max(0, 1 - Math.abs(t) / (nLen * 0.48));
        const spread = p.random(10, 52) * decay * spreadBoost;

        p.fill(255, 255, 255, p.random(10, 30));
        p.ellipse(
          t,
          p.random(-spread, spread),
          p.random(36, 118) * decay,
          p.random(18, 62) * decay
        );
      }

      // 3. denser inner mass
      for (let i = 0; i < Math.round(56 * densityBoost); i++) {
        const t = p.random(-nLen * 0.30, nLen * 0.22);
        const decay = Math.max(0, 1 - Math.abs(t) / (nLen * 0.30));
        const spread = p.random(4, 24) * decay;

        const gray = p.random(188, 214);
        p.fill(gray, gray, gray, p.random(14, 30));
        p.ellipse(
          t,
          p.random(-spread, spread),
          p.random(28, 88) * decay,
          p.random(14, 40) * decay
        );
      }

      // 4. star dust and points
      for (let i = 0; i < Math.round(185 * densityBoost); i++) {
        const t = p.random(-nLen * 0.54, nLen * 0.36);
        const decay = Math.max(0, 1 - Math.abs(t) / (nLen * 0.54));
        const spread = p.random(0, 42) * decay * spreadBoost;

        const px = t;
        const py = p.random(-spread, spread);
        const r = p.random(0.7, 4.4);
        const bright = 0.42 + decay * 0.92;

        const g1 = p.random(214, 238);
        p.fill(g1, g1, g1, p.random(24, 60) * bright);
        p.circle(px, py, r * 6.2);

        p.fill(255, 255, 255, p.random(90, 175) * bright);
        p.circle(px, py, r * 2.4);

        const g2 = p.random(236, 255);
        p.fill(g2, g2, g2, p.random(180, 255));
        p.circle(px, py, r);
      }

      // 5. brighter clusters
      for (let i = 0; i < 18; i++) {
        const t = p.random(-nLen * 0.42, nLen * 0.24);
        const py = p.random(-14, 14);
        clusterStar(t, py, p.random(1.8, 4.6));
      }

      // 6. central luminous fog
      for (let i = 0; i < 12; i++) {
        p.fill(255, 255, 255, p.random(10, 24));
        p.ellipse(
          p.random(-35, 20),
          p.random(-18, 18),
          p.random(90, 180),
          p.random(36, 80)
        );
      }

      brightStar(-nLen * 0.04, 0, 15 + domWeight * 4.5);

      p.pop();
    }

    function clusterStar(x, y, s) {
      p.noStroke();

      p.fill(255, 255, 255, 16);
      p.circle(x, y, s * 18);

      p.fill(242, 242, 242, 42);
      p.circle(x, y, s * 10);

      p.fill(255, 255, 255, 105);
      p.circle(x, y, s * 4.4);

      p.fill(255, 255, 255, 250);
      p.circle(x, y, s * 1.25);
    }

    function brightStar(x, y, s) {
      [
        [s * 34, 4],
        [s * 24, 8],
        [s * 16, 18],
        [s * 10, 36],
        [s * 5, 86]
      ].forEach(([r, a]) => {
        p.noStroke();
        p.fill(255, 255, 255, a);
        p.circle(x, y, r);
      });

      p.stroke(255, 255, 255, 158);
      p.strokeWeight(1.2);
      p.line(x - s * 16, y, x + s * 16, y);
      p.line(x, y - s * 16, x, y + s * 16);

      p.stroke(246, 246, 246, 80);
      p.strokeWeight(0.8);
      p.line(x - s * 9, y - s * 9, x + s * 9, y + s * 9);
      p.line(x + s * 9, y - s * 9, x - s * 9, y + s * 9);

      p.noStroke();
      p.fill(255, 255, 255, 255);
      p.circle(x, y, s * 1.52);
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
      p.fill(...TEXT_MAIN, 244);
      p.textFont(SERIF);
      p.textStyle(p.NORMAL);
      p.textSize(54);
      p.textAlign(p.LEFT);
      p.text(profile?.name || 'Viajero', MARGIN, NAME_Y);
    }

    function drawInfoBlock() {
      p.push();
      p.drawingContext.setLineDash([2, 7]);
      p.stroke(...RULE, 165);
      p.strokeWeight(0.6);
      p.line(COL_MID, INFO_Y - 2, COL_MID, INFO_Y + 258);
      p.drawingContext.setLineDash([]);
      p.pop();

      infoLabel('MICRO ADN', COL_L, INFO_Y, COL_MID - 16);
      infoText(profile?.microADN || '—', COL_L, INFO_Y + 28, COL_W_L, 112, 22, 26);

      infoLabel('TRIBU VIAJERA', COL_R, INFO_Y, W - MARGIN);
      infoText(profile?.tribe || '—', COL_R, INFO_Y + 28, COL_W_R, 80, 22, 26);

      const DEST_Y = INFO_Y + 96;
      infoLabel('DESTINO', COL_R, DEST_Y, W - MARGIN);
      infoText(destination || '—', COL_R, DEST_Y + 28, COL_W_R, 80, 22, 26);
    }

    function infoLabel(txt, x, y, lineEndX) {
      p.noStroke();
      p.fill(...TEXT_LIGHT, 238);
      p.textFont(SERIF); // same visual family for all
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