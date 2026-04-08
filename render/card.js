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
    const Q_T = 200;
    const Q_B = 830;
    const Q_CX = (Q_L + Q_R) / 2;
    const Q_CY = (Q_T + Q_B) / 2;

    const HEADER_Y = 76;
    const NAME_Y = 1060;
    const INFO_Y = 1115;

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
      drawName();
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
      p.drawingContext.font = '300 22px "Oswald", sans-serif';
      p.drawingContext.fillStyle = `rgb(${TEXT_MAIN.join(',')})`;
      p.drawingContext.textAlign = 'center';
      p.drawingContext.textBaseline = 'middle';
      p.drawingContext.letterSpacing = '0.12em';
      p.drawingContext.fillText('UNTAB TRAVEL', W / 2, HEADER_Y);
      p.drawingContext.restore();
    }

    function drawGrid() {
      p.push();

      p.stroke(120, 120, 120, 28);
      p.strokeWeight(0.4);
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

      // Angles cardinals: N=exploración, E=cultura, S=calma, W=placer
      const AXIS_ANGLES = {
        exploracion: -p.HALF_PI,
        cultura:      0,
        calma:        p.HALF_PI,
        placer:       p.PI,
      };

      // Ordenar eixos per força
      const sorted = Object.entries(axes).sort((a, b) => b[1] - a[1]);

      // Configuració per rang: dominant → residual
      const PLUME = [
        { count: 5000, reach: 450, cross: 40, exp: 1.8 },
        { count: 3200, reach: 330, cross: 46, exp: 2.0 },
        { count: 550,  reach: 100, cross: 30, exp: 2.8 },
        { count: 220,  reach: 50,  cross: 22, exp: 3.4 },
      ];

      // ── Plomes direccionals ──
      sorted.forEach(([name, pct], rank) => {
        const cfg = PLUME[rank];
        const dir = AXIS_ANGLES[name];
        const strength = Math.max(0.2, pct / 100);

        for (let i = 0; i < cfg.count; i++) {
          // Distància al llarg de la ploma
          const along = p.pow(p.random(), cfg.exp) * cfg.reach * strength;
          // Dispersió perpendicular (s'obre lleugerament amb la distància)
          const crossW = cfg.cross * (0.35 + 0.65 * (along / (cfg.reach * strength)));
          const across = p.randomGaussian() * crossW;

          const x = Q_CX + p.cos(dir) * along - p.sin(dir) * across;
          const y = Q_CY + p.sin(dir) * along + p.cos(dir) * across;

          // Dissolució gradual a la perifèria
          const t = along / (cfg.reach * strength);
          if (t > 0.8 && p.random() < (t - 0.8) * 4) continue;

          const size = p.random(0.3, 2.6) * (1 - t * 0.35);
          const fade = 1 - t * 0.65;

          const r = p.random();
          if (r < 0.50) {
            p.fill(...STAR_WHITE, p.random(70, 210) * fade);
          } else if (r < 0.76) {
            p.fill(...STAR_MID, p.random(55, 155) * fade);
          } else {
            const dc = p.random() < 0.5 ? STAR_DARK_1 : STAR_DARK_2;
            p.fill(...dc, p.random(100, 220) * fade);
          }

          drawOrganicParticle(x, y, size);
        }
      });

      // ── Nucli dens central (amb biaix direccional subtil) ──
      const domDir = AXIS_ANGLES[sorted[0][0]];
      const secDir = AXIS_ANGLES[sorted[1][0]];

      for (let i = 0; i < 3800; i++) {
        let angle;
        const pick = p.random();
        if (pick < 0.35) {
          angle = domDir + p.randomGaussian() * 0.7;
        } else if (pick < 0.55) {
          angle = secDir + p.randomGaussian() * 0.8;
        } else {
          angle = p.random(p.TWO_PI);
        }

        const r = p.pow(p.random(), 4.5) * 95;
        const x = Q_CX + p.cos(angle) * r + p.randomGaussian() * 2.5;
        const y = Q_CY + p.sin(angle) * r + p.randomGaussian() * 2.5;

        const alpha = p.map(r, 0, 95, 240, 30);
        p.fill(...STAR_WHITE, alpha);
        drawOrganicParticle(x, y, p.random(0.2, 1.3));
      }

      // ── Glow central elegant ──
      [
        [24, 7],
        [16, 16],
        [9,  40],
        [4.5, 95],
      ].forEach(([radius, alpha]) => {
        p.fill(...STAR_WHITE, alpha);
        p.circle(Q_CX, Q_CY, radius * 2);
      });

      brightStar(Q_CX, Q_CY, 16);

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
        p.curveVertex(verts[i].x, verts[i].y);
      }
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
      const COL1 = Math.round(W * 0.22);
      const COL2 = W / 2;
      const COL3 = Math.round(W * 0.78);
      const CW = 260;
      const y = INFO_Y;

      // Labels
      infoLabelCenter('ESENCIA VIAJERA', COL1, y);
      infoLabelCenter('TRIBU', COL2, y);
      infoLabelCenter('DESTINO IDEAL', COL3, y);

      // Contingut
      const cy = y + 26;
      infoTextCenter(profile?.microADN || '—', COL1, cy, CW, 18, 24);
      infoTextCenter(profile?.tribe || '—', COL2, cy, CW, 18, 24);
      infoTextCenter(destination || '—', COL3, cy, CW, 18, 24);
    }

    function infoLabelCenter(txt, x, y) {
      p.drawingContext.save();
      p.drawingContext.font = '300 15px "Oswald", sans-serif';
      p.drawingContext.fillStyle = 'rgb(110, 102, 106)';
      p.drawingContext.textAlign = 'center';
      p.drawingContext.textBaseline = 'alphabetic';
      p.drawingContext.letterSpacing = '0.12em';
      p.drawingContext.fillText(txt, x, y);
      p.drawingContext.restore();
    }

    function infoTextCenter(txt, x, y, w, size = 22, leading = 28) {
      p.noStroke();
      p.fill(...TEXT_DARK, 248);
      p.textFont(SERIF);
      p.textStyle(p.NORMAL);
      p.textSize(size);
      p.textLeading(leading);
      p.textAlign(p.CENTER);
      p.text(txt, x - w / 2, y, w, leading * 3);
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