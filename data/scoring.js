// ===========================
// data/scoring.js
// MOCK_SCORING + calculateAxes()
// Convenció d'eixos: exploracion, cultura, placer, calma
// ===========================

// Claus indexades per question_slug (alineat amb Baserow i el formulari)
const MOCK_SCORING = {
  sensacion_mejores_viajes: {  // q4 — single select
    A: { exploracion: 18, calma: 6,  placer: 3,  cultura: 3  },
    B: { cultura: 20,     exploracion: 6, placer: 2, calma: 2 },
    C: { calma: 16,       placer: 10, exploracion: 2, cultura: 2 },
    D: { exploracion: 22, placer: 4,  cultura: 2, calma: 2   },
    E: { placer: 22,      calma: 4,   cultura: 4              },
    F: { placer: 12,      exploracion: 8, cultura: 6, calma: 4 },
    G: {},
  },
  entorno_preferido: {         // q5 — multi select (max 2)
    A: { exploracion: 14, calma: 4,  placer: 2             },
    B: { calma: 12,       exploracion: 5, placer: 3         },
    C: { placer: 8,       exploracion: 7, calma: 5          },
    D: { exploracion: 16, placer: 2,  calma: 2              },
    E: { cultura: 14,     placer: 4,  exploracion: 2        },
    F: { calma: 10,       placer: 8,  exploracion: 2        },
    G: { exploracion: 17, calma: 2,   placer: 1             },
    H: { placer: 16,      cultura: 3, calma: 1              },
    I: {},
  },
  ritmo_viaje: {               // q6 — single select
    A: { exploracion: 16, cultura: 2, placer: 1, calma: 1   },
    B: { exploracion: 8,  calma: 8,   placer: 2, cultura: 2 },
    C: { calma: 14,       placer: 4,  cultura: 1, exploracion: 1 },
    D: { exploracion: 10, placer: 4,  calma: 4,  cultura: 2 },
    E: { placer: 8,       cultura: 6, calma: 4,  exploracion: 2 },
    F: {},
  },
  evitar_en_viaje: {           // q7 — multi select (max 2)
    A: { placer: 4,  calma: 3,       exploracion: 2, cultura: 1  },
    B: { calma: 5,   placer: 2,      exploracion: 2, cultura: 1  },
    C: { calma: 6,   placer: 2,      cultura: 1,     exploracion: 1 },
    D: { placer: 7,  calma: 2,       cultura: 1                  },
    E: { exploracion: 6, calma: 3,   placer: 1                   },
    F: { exploracion: 5, calma: 3,   placer: 1,      cultura: -2 },
    G: { placer: 8,  cultura: 1,     calma: 1                    },
    H: { calma: 4,   placer: 3,      exploracion: 3, cultura: -4 },
    I: {},
  },
};

// Aplica les puntuacions d'una pregunta (opció única o múltiple)
function applyPoints(axes, rules, keys) {
  const list = Array.isArray(keys) ? keys : [keys];
  list.forEach(key => {
    const entry = rules[key];
    if (!entry) return;
    Object.entries(entry).forEach(([axis, val]) => {
      axes[axis] = (axes[axis] || 0) + val;
    });
  });
}

// Motor de scoring pur — no depèn de la font de dades
function calculateAxes(answers, scoringRules) {
  const axes = { exploracion: 0, cultura: 0, placer: 0, calma: 0 };

  applyPoints(axes, scoringRules.sensacion_mejores_viajes || {}, answers.sensacion_mejores_viajes);
  applyPoints(axes, scoringRules.entorno_preferido        || {}, answers.entorno_preferido || []);
  applyPoints(axes, scoringRules.ritmo_viaje              || {}, answers.ritmo_viaje);
  applyPoints(axes, scoringRules.evitar_en_viaje          || {}, answers.evitar_en_viaje || []);

  console.log('[scoring] answers scoring:', {
    sensacion_mejores_viajes: answers.sensacion_mejores_viajes,
    entorno_preferido:        answers.entorno_preferido,
    ritmo_viaje:              answers.ritmo_viaje,
    evitar_en_viaje:          answers.evitar_en_viaje,
  });
  console.log('[scoring] axes result:', axes);

  return axes;
}
