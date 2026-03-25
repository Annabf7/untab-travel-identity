// ===========================
// render/card.js — layout + scale pass
// Canvas 1080×1350 — p5.js instance mode
// ===========================

function renderCard(profile, containerId, answers = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  new p5(function (p) {

    // ---- Canvas ----
    const W = 1080;
    const H = 1350;
    const MARGIN = 88;

    // ---- Fonts ----
    const SERIF = 'Cormorant Garamond';
    const SANS = '"Helvetica Neue", Arial, sans-serif';

    // ---- Colors (closer to reference) ----
    const BG = [252, 249, 247];
    const TEXT_DARK = [92, 84, 86];
    const TEXT_MAIN = [108, 99, 102];
    const TEXT_SOFT = [145, 136, 140];
    const TEXT_LIGHT = [176, 167, 171];
    const RULE = [220, 214, 216];
    const GRID = [222, 216, 218];

    // ---- Top chart area (wider occupation) ----
    const Q_L = 142;
    const Q_R = 938;
    const Q_T = 170;
    const Q_B = 792;
    const Q_CX = (Q_L + Q_R) / 2;
    const Q_CY = (Q_T + Q_B) / 2;

    // ---- Vertical rhythm (more filled) ----
    const HEADER_Y = 84;
    const DIV1_Y = 862;
    const NAME_Y = 1008;
    const DIV2_Y = 1042;
    const INFO_Y = 1094;

    // ---- Bottom info grid ----
    const COL_L = 92;
    const COL_MID = 518;
    const COL_R = 562;
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
      hRule(MARGIN, DIV1_Y, W - MARGIN, 0.72);
      drawName();
      hRule(MARGIN, DIV2_Y, W - MARGIN, 0.56);
      drawInfoBlock();
    };

    // =========================
    // Background
    // =========================
    function drawBackground() {
      p.background(...BG);

      p.push();
      p.noStroke();

      // warm paper grain
      for (let i = 0; i < 4600; i++) {
        p.fill(255, 255, 255, p.random(4, 8));
        p.circle(p.random(W), p.random(H), p.random(0.55, 1.2));
      }

      for (let i = 0; i < 2400; i++) {
        p.fill(214, 208, 210, p.random(2, 5));
        p.circle(p.random(W), p.random(H), p.random(0.45, 0.95));
      }

      p.pop();
    }

    // =========================
    // Header
    // =========================
    function drawHeader() {
      p.noStroke();
      p.fill(...TEXT_SOFT, 230);
      p.textFont(SANS);
      p.textStyle(p.NORMAL);
      p.textSize(15);
      trackedTextCenter('UNTAB TRAVEL', W / 2, HEADER_Y, 7.5);
    }

    // =========================
    // Grid
    // =========================
    function drawGrid() {
      p.push();

      p.stroke(...GRID, 94);
      p.strokeWeight(0.55);
      p.drawingContext.setLineDash([4, 10]);
      p.line(Q_L, Q_CY, Q_R, Q_CY);
      p.line(Q_CX, Q_T, Q_CX, Q_B);

      p.stroke(...GRID, 76);
      p.line(Q_CX, Q_CY, Q_L + 130, Q_T + 130);
      p.line(Q_CX, Q_CY, Q_R - 130, Q_T + 130);
      p.line(Q_CX, Q_CY, Q_L + 130, Q_B - 130);
      p.line(Q_CX, Q_CY, Q_R - 130, Q_B - 130);

      p.drawingContext.setLineDash([]);

      p.stroke(218, 212, 214, 130);
      p.strokeWeight(0.7);
      const cs = 8;
      p.line(Q_CX - cs, Q_CY, Q_CX + cs, Q_CY);
      p.line(Q_CX, Q_CY - cs, Q_CX, Q_CY + cs);

      p.pop();
    }

    // =========================
    // Axis labels
    // =========================
    function drawAxisLabels() {
      Object.entries(CORNERS).forEach(([axis, [cx, cy]]) => {
        const isRight = cx > Q_CX;
        const isBottom = cy > Q_CY;

        // push slightly inward
        const x = isRight ? cx - 8 : cx + 8;
        const nameY = isBottom ? cy - 10 : cy + 66;
        const pctY = nameY + 28;

        p.noStroke();
        p.textAlign(isRight ? p.RIGHT : p.LEFT);

        p.fill(...TEXT_MAIN, 240);
        p.textFont(SERIF);
        p.textStyle(p.NORMAL);
        p.textSize(29);
        p.text(AXIS_LABEL[axis], x, nameY);

        p.fill(...TEXT_SOFT, 225);
        p.textFont(SANS);
        p.textStyle(p.NORMAL);
        p.textSize(13);
        p.text(`+${axes[axis]}%`, x, pctY);
      });

      p.textAlign(p.LEFT);
    }

    // =========================
    // Nebula
    // =========================
    function drawNebula() {
      const domCorner = CORNERS[dominantAxis];
      const oppCorner = CORNERS[OPPOSITE[dominantAxis]];

      const dx = domCorner[0] - oppCorner[0];
      const dy = domCorner[1] - oppCorner[1];
      const angle = Math.atan2(dy, dx);
      const diag = Math.sqrt(dx * dx + dy * dy);

      const domWeight = (axes[dominantAxis] || 25) / 100;
      const secWeight = (axes[secondaryAxis] || 20) / 100;

      const nLen = diag * 0.54;
      const shift = 0.11 + domWeight * 0.08;

      const ncx = Q_CX + (domCorner[0] - Q_CX) * shift;
      const ncy = Q_CY + (domCorner[1] - Q_CY) * shift;

      const spreadBoost = 1 + secWeight * 0.55;
      const densityBoost = 1 + domWeight * 0.65;

      p.push();
      p.translate(ncx, ncy);
      p.rotate(angle);
      p.noStroke();

      // layer 1 — soft gray atmospheric body
      for (let i = 0; i < Math.round(80 * densityBoost); i++) {
        const t = p.random(-nLen * 0.50, nLen * 0.36);
        const decay = Math.max(0, 1 - Math.abs(t) / (nLen * 0.50));
        const spread = p.random(16, 72) * decay * spreadBoost;

        const gray = p.random(204, 228);
        p.fill(gray, gray, gray, p.random(8, 18));
        p.ellipse(
          t,
          p.random(-spread, spread),
          p.random(48, 150) * decay,
          p.random(20, 88) * decay
        );
      }

      // layer 2 — diffuse white haze
      for (let i = 0; i < Math.round(72 * densityBoost); i++) {
        const t = p.random(-nLen * 0.44, nLen * 0.28);
        const decay = Math.max(0, 1 - Math.abs(t) / (nLen * 0.44));
        const spread = p.random(10, 46) * decay * spreadBoost;

        p.fill(255, 255, 255, p.random(10, 26));
        p.ellipse(
          t,
          p.random(-spread, spread),
          p.random(34, 110) * decay,
          p.random(16, 58) * decay
        );
      }

      // layer 3 — darker internal mist
      for (let i = 0; i < Math.round(28 * densityBoost); i++) {
        const t = p.random(-nLen * 0.34, nLen * 0.22);
        const decay = Math.max(0, 1 - Math.abs(t) / (nLen * 0.34));
        const spread = p.random(5, 24) * decay;

        const gray = p.random(188, 214);
        p.fill(gray, gray, gray, p.random(10, 22));
        p.ellipse(
          t,
          p.random(-spread, spread),
          p.random(22, 72) * decay,
          p.random(12, 34) * decay
        );
      }

      // layer 4 — star dust / dots
      for (let i = 0; i < Math.round(120 * densityBoost); i++) {
        const t = p.random(-nLen * 0.50, nLen * 0.34);
        const decay = Math.max(0, 1 - Math.abs(t) / (nLen * 0.50));
        const spread = p.random(0, 38) * decay * spreadBoost;

        const px = t;
        const py = p.random(-spread, spread);
        const r = p.random(0.8, 4.1);
        const bright = 0.36 + decay * 0.9;

        const g1 = p.random(222, 245);
        p.fill(g1, g1, g1, p.random(20, 52) * bright);
        p.circle(px, py, r * 5.2);

        p.fill(255, 255, 255, p.random(70, 150) * bright);
        p.circle(px, py, r * 2.2);

        const g2 = p.random(242, 255);
        p.fill(g2, g2, g2, p.random(170, 255));
        p.circle(px, py, r);
      }

      // highlighted clusters
      for (let i = 0; i < 11; i++) {
        const t = p.random(-nLen * 0.40, nLen * 0.24);
        const py = p.random(-12, 12);
        clusterStar(t, py, p.random(1.8, 3.8));
      }

      // central star
      brightStar(-nLen * 0.06, 0, 12.5 + domWeight * 3.6);

      p.pop();
    }

    function clusterStar(x, y, s) {
      p.noStroke();

      p.fill(255, 255, 255, 18);
      p.circle(x, y, s * 14);

      p.fill(245, 245, 245, 48);
      p.circle(x, y, s * 8);

      p.fill(255, 255, 255, 115);
      p.circle(x, y, s * 4);

      p.fill(255, 255, 255, 250);
      p.circle(x, y, s * 1.2);
    }

    function brightStar(x, y, s) {
      [
        [s * 28, 3],
        [s * 18, 9],
        [s * 12, 18],
        [s * 7, 38],
        [s * 3.4, 105]
      ].forEach(([r, a]) => {
        p.noStroke();
        p.fill(255, 255, 255, a);
        p.circle(x, y, r);
      });

      p.stroke(255, 255, 255, 150);
      p.strokeWeight(1.1);
      p.line(x - s * 15, y, x + s * 15, y);
      p.line(x, y - s * 15, x, y + s * 15);

      p.stroke(245, 245, 245, 72);
      p.strokeWeight(0.7);
      p.line(x - s * 8.5, y - s * 8.5, x + s * 8.5, y + s * 8.5);
      p.line(x + s * 8.5, y - s * 8.5, x - s * 8.5, y + s * 8.5);

      p.noStroke();
      p.fill(255, 255, 255, 255);
      p.circle(x, y, s * 1.45);
    }

    // =========================
    // Rules
    // =========================
    function hRule(x1, y, x2, alpha = 0.5) {
      p.push();
      p.stroke(...RULE, 255 * alpha);
      p.strokeWeight(0.65);
      p.line(x1, y, x2, y);
      p.pop();
    }

    // =========================
    // Name
    // =========================
    function drawName() {
      p.noStroke();
      p.fill(...TEXT_MAIN, 242);
      p.textFont(SERIF);
      p.textStyle(p.NORMAL);
      p.textSize(50);
      p.textAlign(p.LEFT);
      p.text(profile?.name || 'Viajero', MARGIN, NAME_Y);
    }

    // =========================
    // Info block
    // =========================
    function drawInfoBlock() {
      p.push();
      p.drawingContext.setLineDash([2, 7]);
      p.stroke(...RULE, 165);
      p.strokeWeight(0.6);
      p.line(COL_MID, INFO_Y - 2, COL_MID, INFO_Y + 258);
      p.drawingContext.setLineDash([]);
      p.pop();

      infoLabel('MICRO ADN', COL_L, INFO_Y, COL_MID - 16);
      infoText(profile?.microADN || '—', COL_L, INFO_Y + 34, COL_W_L, 112, 23, 32);

      infoLabel('TRIBU VIAJERA', COL_R, INFO_Y, W - MARGIN);
      infoText(profile?.tribe || '—', COL_R, INFO_Y + 34, COL_W_R, 78, 23, 32);

      const DEST_Y = INFO_Y + 154;
      infoLabel('DESTINO', COL_R, DEST_Y, W - MARGIN);
      infoText(destination || '—', COL_R, DEST_Y + 34, COL_W_R, 78, 23, 32);
    }

    function infoLabel(txt, x, y, lineEndX) {
      p.noStroke();
      p.fill(...TEXT_LIGHT, 238);
      p.textFont(SANS);
      p.textStyle(p.NORMAL);
      p.textSize(13);
      p.textAlign(p.LEFT);

      const endX = trackedTextLeft(txt, x, y, 2.2);

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

    function infoText(txt, x, y, w, h, size = 22, leading = 31) {
      p.noStroke();
      p.fill(...TEXT_DARK, 242);
      p.textFont(SERIF);
      p.textStyle(p.NORMAL);
      p.textSize(size);
      p.textLeading(leading);
      p.textAlign(p.LEFT);
      p.text(txt, x, y, w, h);
    }

    // =========================
    // Helpers
    // =========================
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

    function trackedTextCenter(str, cx, y, spacing) {
      const chars = String(str).split('');
      const widths = chars.map(c => p.textWidth(c));
      const total = widths.reduce((s, w) => s + w, 0) + spacing * (chars.length - 1);
      let x = cx - total / 2;

      p.textAlign(p.LEFT);
      chars.forEach((c, i) => {
        p.text(c, x, y);
        x += widths[i] + spacing;
      });
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