// ===========================
// data/baserow.js
// Font de dades: toggle mock ↔ Baserow API
// ===========================

// --- Configuració ---
const USE_BASEROW = true; // true → fetch Baserow | false → mock local

const BASEROW_CONFIG = {
  baseUrl: 'https://api.baserow.io/api/database/rows/table',
  token:   (typeof CONFIG !== 'undefined') ? CONFIG.BASEROW_TOKEN : '',
  tables: {
    scoring: '902048',
    tribes:  '902068',
  },
};

// --- Punt d'entrada principal ---
async function loadRules() {
  if (USE_BASEROW) {
    try {
      return await fetchFromBaserow();
    } catch (err) {
      console.warn('[baserow] Fetch fallat, usant mock local:', err);
      return getMockRules();
    }
  }
  return getMockRules();
}

// --- Fetch des de Baserow ---
async function fetchFromBaserow() {
  const headers = { Authorization: `Token ${BASEROW_CONFIG.token}` };
  const params  = '?user_field_names=true&size=200';

  console.log('[baserow] Carregant scoring i tribes des de Baserow...');

  const [scoringRes, tribesRes] = await Promise.all([
    fetch(`${BASEROW_CONFIG.baseUrl}/${BASEROW_CONFIG.tables.scoring}/${params}`, { headers }).then(r => {
      if (!r.ok) throw new Error(`Scoring fetch error: ${r.status} ${r.statusText}`);
      return r.json();
    }),
    fetch(`${BASEROW_CONFIG.baseUrl}/${BASEROW_CONFIG.tables.tribes}/${params}`, { headers }).then(r => {
      if (!r.ok) throw new Error(`Tribes fetch error: ${r.status} ${r.statusText}`);
      return r.json();
    }),
  ]);

  console.log('[baserow] scoring raw rows:', scoringRes.results);
  console.log('[baserow] tribes raw rows:', tribesRes.results);

  const scoringRows = (scoringRes.results || []).filter(r => r.active === true || r.active === 'true');
  const tribesRows  = (tribesRes.results  || []).filter(r => r.active === true || r.active === 'true');

  console.log(`[baserow] Scoring rows actives: ${scoringRows.length} / ${(scoringRes.results || []).length}`);
  console.log(`[baserow] Tribes rows actives: ${tribesRows.length} / ${(tribesRes.results || []).length}`);

  const rules = {
    scoringRules: mapScoringRows(scoringRows),
    tribes:       mapTribeRows(tribesRows, 'tribe'),
    microADN:     mapTribeRows(tribesRows, 'micro_adn'),
  };

  console.log('[baserow] Rules carregades:', rules);
  return rules;
}

// --- Mappers ---

// Baserow scoring row: { question, option, exploracion, cultura, placer, calma, active }
// Output: { Q4: { A: { exploracion: 3, placer: 1 } } }
function mapScoringRows(rows) {
  const rules = {};
  rows.forEach(row => {
    const q = (row.question_slug || '').trim().toLowerCase(); // 'sensacion_mejores_viajes', ...
    const o = (row.option_key    || '').trim().toUpperCase(); // 'A', 'B', 'C', ...
    if (!q || !o) return;
    if (!rules[q]) rules[q] = {};
    rules[q][o] = {
      exploracion: Number(row.exploracion) || 0,
      cultura:     Number(row.cultura)     || 0,
      placer:      Number(row.placer)      || 0,
      calma:       Number(row.calma)       || 0,
    };
    // Elimina eixos amb valor 0 per neteja
    Object.keys(rules[q][o]).forEach(k => {
      if (rules[q][o][k] === 0) delete rules[q][o][k];
    });
  });
  console.log('[baserow] mapScoringRows result:', rules);
  return rules;
}

// Baserow tribe row: { dominant, secondary, tribe, micro_adn, active }
// Output: { "placer_exploracion": "Nómadas del Horizonte" }
function mapTribeRows(rows, field) {
  const map = {};
  rows.forEach(row => {
    const dominant   = (row.dominant   || '').trim().toLowerCase();
    const secondary  = (row.secondary  || '').trim().toLowerCase();
    if (!dominant || !secondary) return;
    const key = `${dominant}_${secondary}`;
    map[key] = row[field] || '—';
  });
  console.log(`[baserow] mapTribeRows (${field}):`, map);
  return map;
}

// --- Mock local ---
function getMockRules() {
  return {
    scoringRules: MOCK_SCORING,  // definit a scoring.js
    tribes:       MOCK_TRIBES,   // definit a tribes.js
    microADN:     MOCK_MICROADN, // definit a dna.js
  };
}
