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

    const COL_MID = W / 2;

    const CORNERS = {
      exploracion: [Q_CX, Q_T],   // Nord
      cultura:     [Q_R,  Q_CY],  // Est
      calma:       [Q_CX, Q_B],   // Sud
      placer:      [Q_L,  Q_CY],  // Oest
    };

    const AXIS_LABEL = {
      exploracion: 'Exploración',
      cultura: 'Cultura',
      placer: 'Placer',
      calma: 'Calma',
    };

    const seed = Array.from(profile?.name || 'x').reduce((s, c) => s + c.charCodeAt(0), 42);
    const axes = normalizeAxes(profile?.normalizedAxes || {});
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
      drawCornerAccents();
      drawHeader();
      drawGrid();
      drawNebula();
      drawAxisLabels();
      hRule(MARGIN, DIV1_Y, W - MARGIN, 0.74);
      drawName();
      hRule(MARGIN, DIV2_Y, W - MARGIN, 0.56);
      drawInfoBlock();
    };

    function drawCornerAccents() {
      const inset  = 28;   // distància des del marge exterior
      const len    = 48;   // longitud de cada braç de la L
      const weight = 1.8;  // gruix de línia
      const alpha  = 195;  // opacitat més alta — visible però elegant

      p.push();
      p.stroke(...RULE, alpha);
      p.strokeWeight(weight);
      p.noFill();

      const corners = [
        { x: inset,     y: inset,      hDir: 1,  vDir: 1  }, // top-left
        { x: W - inset, y: inset,      hDir: -1, vDir: 1  }, // top-right
        { x: inset,     y: H - inset,  hDir: 1,  vDir: -1 }, // bottom-left
        { x: W - inset, y: H - inset,  hDir: -1, vDir: -1 }, // bottom-right
      ];

      corners.forEach(({ x, y, hDir, vDir }) => {
        p.line(x, y, x + hDir * len, y);       // braç horitzontal
        p.line(x, y, x, y + vDir * len);       // braç vertical
      });

      p.pop();
    }

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

      p.stroke(120, 120, 120, 50);
      p.strokeWeight(0.5);
      const arm = 190;
      p.line(Q_CX, Q_CY - arm, Q_CX, Q_CY + arm);
      p.line(Q_CX - arm, Q_CY, Q_CX + arm, Q_CY);

      p.pop();
    }

    function drawAxisLabels() {
      p.noStroke();
      p.textFont(SERIF);
      p.textStyle(p.NORMAL);

      // Nord — Exploración (centrat, dins de l'àrea, sota Q_T)
      p.textAlign(p.CENTER);
      p.fill(...TEXT_MAIN, 248);
      p.textSize(31);
      p.text(AXIS_LABEL.exploracion, Q_CX, Q_T + 34);
      p.fill(...TEXT_SOFT, 228);
      p.textSize(15);
      p.text(`+${axes.exploracion}%`, Q_CX, Q_T + 60);

      // Sud — Calma (centrat, dins de l'àrea, sobre Q_B)
      p.textAlign(p.CENTER);
      p.fill(...TEXT_MAIN, 248);
      p.textSize(31);
      p.text(AXIS_LABEL.calma, Q_CX, Q_B - 58);
      p.fill(...TEXT_SOFT, 228);
      p.textSize(15);
      p.text(`+${axes.calma}%`, Q_CX, Q_B - 32);

      // Est — Cultura (alineat dreta, dins de l'àrea, a l'esquerra de Q_R)
      p.textAlign(p.RIGHT);
      p.fill(...TEXT_MAIN, 248);
      p.textSize(31);
      p.text(AXIS_LABEL.cultura, Q_R - 20, Q_CY - 8);
      p.fill(...TEXT_SOFT, 228);
      p.textSize(15);
      p.text(`+${axes.cultura}%`, Q_R - 20, Q_CY + 22);

      // Oest — Placer (alineat esquerra, dins de l'àrea, a la dreta de Q_L)
      p.textAlign(p.LEFT);
      p.fill(...TEXT_MAIN, 248);
      p.textSize(31);
      p.text(AXIS_LABEL.placer, Q_L + 20, Q_CY - 8);
      p.fill(...TEXT_SOFT, 228);
      p.textSize(15);
      p.text(`+${axes.placer}%`, Q_L + 20, Q_CY + 22);

      p.textAlign(p.LEFT);
    }

    function drawNebula() {
  p.push();
  p.noStroke();

  const axisNamesArr = ['exploracion', 'cultura', 'calma', 'placer'];

  function getPercentAtAngle(ang) {
    let a = ang % p.TWO_PI;
    if (a < 0) a += p.TWO_PI;

    const idx1 = Math.floor(a / p.HALF_PI);
    const idx2 = (idx1 + 1) % 4;
    const t = (a - (idx1 * p.HALF_PI)) / p.HALF_PI;

    const p1 = axes[axisNamesArr[idx1]];
    const p2 = axes[axisNamesArr[idx2]];
    return p.lerp(p1, p2, t);
  }

  const TOTAL = 9000;

  for (let i = 0; i < TOTAL; i++) {
    const angle = p.random(p.TWO_PI);
    const perVal = getPercentAtAngle(angle);

    let dist = p.pow(p.random(), 2.8) * 420;
    dist *= p.map(perVal, 0, 100, 0.4, 1.05);

    const x = Q_CX + p.cos(angle) * dist + p.randomGaussian() * 10;
    const y = Q_CY + p.sin(angle) * dist * 0.8 + p.randomGaussian() * 10;

    const size = p.random(0.4, 3.2);

    const r = p.random();
    if (r < 0.62) {
      p.fill(...STAR_WHITE, p.random(80, 220));
    } else if (r < 0.9) {
      p.fill(...STAR_MID, p.random(70, 170));
    } else {
      p.fill(40, 35, 38, p.random(140, 240));
    }

    drawOrganicParticle(x, y, size);
  }

  for (let i = 0; i < 4500; i++) {
    const angle = p.random(p.TWO_PI);
    const r = p.pow(p.random(), 3.6) * 220;

    const x = Q_CX + p.cos(angle) * r + p.randomGaussian() * 5;
    const y = Q_CY + p.sin(angle) * r + p.randomGaussian() * 5;

    p.fill(...STAR_WHITE, p.random(40, 120));
    drawOrganicParticle(x, y, p.random(0.2, 1.4));
  }

  brightStar(Q_CX, Q_CY, 18);

  p.pop();
}

function drawOrganicParticle(x, y, size) {
  p.push();
  p.translate(x, y);

  const points = 6;
  const verts = [];

  for (let i = 0; i < points; i++) {
    const angle = (p.TWO_PI / points) * i;
    const radius = size * p.random(0.55, 1.35);

    verts.push({
      x: p.cos(angle) * radius,
      y: p.sin(angle) * radius,
    });
  }

  p.beginShape();
  for (let i = 0; i < verts.length; i++) {
    const v = verts[i];
    p.curveVertex(v.x, v.y);
  }
  // repetir primers punts perquè curveVertex tanqui bé
  p.curveVertex(verts[0].x, verts[0].y);
  p.curveVertex(verts[1].x, verts[1].y);
  p.curveVertex(verts[2].x, verts[2].y);
  p.endShape(p.CLOSE);

  p.pop();
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
const colsShift = 36;

  const colWidth = (W - outerMargin * 2 - centerGap) / 2;

  const leftX = outerMargin + colsShift;
  const opticalNudge = 12;

const rightX = outerMargin + colWidth + centerGap + opticalNudge + colsShift;

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