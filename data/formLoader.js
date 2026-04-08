// ===========================
// data/formLoader.js
// Carrega la configuració del formulari des de Baserow
// Fallback a FALLBACK_STEPS si Baserow falla
// ===========================

const FORM_TABLES = {
  questions: '912254',
  options:   '912264',
};

// --- Punt d'entrada ---
async function loadFormConfig() {
  if (!USE_BASEROW) return FALLBACK_STEPS;

  try {
    const headers = { Authorization: `Token ${BASEROW_CONFIG.token}` };
    const params  = '?user_field_names=true&size=200';
    const base    = BASEROW_CONFIG.baseUrl;

    console.log('[formLoader] Carregant formulari des de Baserow...');

    const [qRes, oRes] = await Promise.all([
      fetch(`${base}/${FORM_TABLES.questions}/${params}`, { headers })
        .then(r => { if (!r.ok) throw new Error(`Questions: ${r.status}`); return r.json(); }),
      fetch(`${base}/${FORM_TABLES.options}/${params}`, { headers })
        .then(r => { if (!r.ok) throw new Error(`Options: ${r.status}`); return r.json(); }),
    ]);

    const steps = mapFormConfig(qRes.results || [], oRes.results || []);
    console.log('[formLoader] Steps carregats:', steps.length);
    if (steps.length === 0) {
      console.warn('[formLoader] Baserow buit, usant fallback');
      return FALLBACK_STEPS;
    }
    return steps;
  } catch (err) {
    console.warn('[formLoader] Baserow fallit, usant fallback:', err);
    return FALLBACK_STEPS;
  }
}

// --- Mapper: Baserow rows → format STEPS ---
function mapFormConfig(rawQuestions, rawOptions) {
  const questions = rawQuestions
    .filter(r => r.active === true || r.active === 'true')
    .sort((a, b) => (a.step || 0) - (b.step || 0) || (a.sort_order || 0) - (b.sort_order || 0));

  const options = rawOptions
    .filter(r => r.active === true || r.active === 'true')
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  // Agrupar per step
  const stepGroups = {};
  questions.forEach(q => {
    const s = q.step || 1;
    if (!stepGroups[s]) stepGroups[s] = [];
    stepGroups[s].push(q);
  });

  return Object.keys(stepGroups)
    .sort((a, b) => Number(a) - Number(b))
    .map(stepNum => {
      const group = stepGroups[stepNum];

      // Múltiples camps text al mateix step → text-group
      if (group.length > 1) {
        return {
          type: 'text-group',
          question: (group[0].title || '').trim(),
          fields: group.map(q => ({
            id:          (q.slug || '').trim(),
            label:       (q.subtitle || q.title || '').trim(),
            placeholder: (q.placeholder || '').trim(),
          })),
        };
      }

      // Pregunta única
      const q    = group[0];
      const slug = (q.slug || '').trim();
      const type = (q.type?.value || q.type || 'text').trim();

      const step = {
        type,
        id:          slug,
        question:    (q.title || '').trim(),
        placeholder: (q.placeholder || '').trim(),
        required:    q.required === true || q.required === 'true',
      };

      // Scoring slug (vincle amb scoring_rules)
      const ss = (q.scoring_slug || '').trim();
      if (ss) step.scoringSlug = ss;

      // Condició de visibilitat (skip logic)
      const showSlug  = (q.show_if_slug  || '').trim();
      const showValue = (q.show_if_value || '').trim();
      if (showSlug && showValue) {
        step.showIf = { slug: showSlug, value: showValue };
      }

      // Opcions per radio/checkbox
      if (type === 'radio' || type === 'checkbox') {
        step.options = options
          .filter(o => (o.question_slug || '').trim() === slug)
          .map(o => ({
            value: (o.key || '').trim(),
            label: (o.label || '').trim(),
          }));

        const maxSel = Number(q.max_selections) || 0;
        if (type === 'checkbox' && maxSel > 0) {
          step.hint = `hasta ${maxSel} opciones`;
          step.max  = maxSel;
        }
      }

      return step;
    });
}

// --- Fallback: configuració actual hardcoded ---
const FALLBACK_STEPS = [
  {
    type: 'text', id: 'q1',
    question: '¿Cómo te llamas?',
    placeholder: 'Tu nombre',
    required: true,
  },
  {
    type: 'text-group',
    question: 'Cuéntanos sobre el viaje que tienes en mente',
    fields: [
      { id: 'q2', label: '¿Algún destino en mente?', placeholder: 'Opcional' },
      { id: 'q3', label: '¿Destinos que prefieras no repetir?', placeholder: 'Opcional' },
    ],
  },
  {
    type: 'radio', id: 'q4',
    question: 'Cuando recuerdas tus mejores viajes, ¿qué sensación predomina?',
    scoringSlug: 'sensacion_mejores_viajes',
    options: [
      { value: 'A', label: 'Descubrir lugares que me hacen sentir pequeño frente a la naturaleza' },
      { value: 'B', label: 'Sumergirme en culturas y formas de vida diferentes' },
      { value: 'C', label: 'Disfrutar de momentos de belleza, calma y desconexión' },
      { value: 'D', label: 'Vivir experiencias intensas que me saquen de mi zona de confort' },
      { value: 'E', label: 'Disfrutar del placer de la buena mesa, el vino, la conversación y los detalles' },
      { value: 'F', label: 'Sentir que estoy en un lugar especial, diferente a todo lo demás' },
      { value: 'G', label: 'Otro' },
    ],
  },
  {
    type: 'checkbox', id: 'q5',
    question: '¿Qué tipo de experiencia o entorno te atrae más en un viaje?',
    hint: 'hasta 2 opciones', max: 2,
    scoringSlug: 'entorno_preferido',
    options: [
      { value: 'A', label: 'Naturaleza espectacular' },
      { value: 'B', label: 'Lagos, bosques y naturaleza tranquila' },
      { value: 'C', label: 'Islas salvajes y paisajes marinos' },
      { value: 'D', label: 'Desiertos o paisajes extremos' },
      { value: 'E', label: 'Ciudades con historia y cultura' },
      { value: 'F', label: 'Playas y desconexión frente al mar' },
      { value: 'G', label: 'Aventuras activas en naturaleza' },
      { value: 'H', label: 'Destinos con una gastronomía excepcional' },
      { value: 'I', label: 'Otro' },
    ],
  },
  {
    type: 'radio', id: 'q6',
    question: '¿Cómo te gusta vivir un destino cuando viajas?',
    scoringSlug: 'ritmo_viaje',
    options: [
      { value: 'A', label: 'Explorarlo activamente cada día' },
      { value: 'B', label: 'Combinar exploración con momentos tranquilos' },
      { value: 'C', label: 'Tomármelo con calma y disfrutar del lugar' },
      { value: 'D', label: 'Perderme sin demasiada planificación' },
      { value: 'E', label: 'Seguir experiencias bien seleccionadas' },
      { value: 'F', label: 'Otro' },
    ],
  },
  {
    type: 'checkbox', id: 'q7',
    question: '¿Qué prefieres evitar en un viaje?',
    hint: 'hasta 2 opciones', max: 2,
    scoringSlug: 'evitar_en_viaje',
    options: [
      { value: 'A', label: 'Lugares masificados, artificiales o demasiado orientados al turismo' },
      { value: 'B', label: 'Viajes excesivamente estructurados o con poco margen para disfrutar' },
      { value: 'C', label: 'Numerosos traslados o cambios de hotel' },
      { value: 'D', label: 'Alojamientos sin personalidad o encanto' },
      { value: 'E', label: 'Falta de contacto con naturaleza o paisajes' },
      { value: 'F', label: 'Destinos excesivamente urbanos' },
      { value: 'G', label: 'Oferta gastronómica poco interesante' },
      { value: 'H', label: 'Pasar demasiado tiempo en actividades culturales intensivas' },
      { value: 'I', label: 'Otro' },
    ],
  },
  {
    type: 'radio', id: 'q8',
    question: '¿Cuánto tiempo te gustaría que durara el viaje?',
    options: [
      { value: 'A', label: '2–4 días' },
      { value: 'B', label: '5–7 días' },
      { value: 'C', label: '7–10 días' },
      { value: 'D', label: 'Más de 10 días' },
    ],
  },
  {
    type: 'radio', id: 'q9',
    question: '¿Qué presupuesto aproximado tienes para este viaje por persona?',
    options: [
      { value: 'A', label: '800–1.500 €' },
      { value: 'B', label: '1.500–3.000 €' },
      { value: 'C', label: '3.000–5.000 €' },
      { value: 'D', label: 'Más de 5.000 €' },
    ],
  },
  {
    type: 'text', id: 'q10',
    question: '¿Cuándo te gustaría viajar?',
    placeholder: 'Ej: verano 2025, enero…',
  },
  {
    type: 'textarea', id: 'q11',
    question: '¿Hay algo más que deberíamos saber para diseñar este viaje?',
    placeholder: 'Opcional',
  },
  {
    type: 'email', id: 'q12',
    question: '¿Cuál es tu correo electrónico?',
    placeholder: 'tu@email.com',
    required: true,
  },
];
