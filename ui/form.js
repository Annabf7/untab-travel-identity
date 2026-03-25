// ===========================
// ui/form.js — Step-by-step form
// ===========================

const STEPS = [
  {
    type: 'text',
    id: 'q1',
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
    type: 'radio',
    id: 'q4',
    question: 'Cuando recuerdas tus mejores viajes, ¿qué sensación predomina?',
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
    type: 'checkbox',
    id: 'q5',
    question: '¿Qué tipo de experiencia o entorno te atrae más en un viaje?',
    hint: 'hasta 2 opciones',
    max: 2,
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
    type: 'radio',
    id: 'q6',
    question: '¿Cómo te gusta vivir un destino cuando viajas?',
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
    type: 'checkbox',
    id: 'q7',
    question: '¿Qué prefieres evitar en un viaje?',
    hint: 'hasta 2 opciones',
    max: 2,
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
    type: 'radio',
    id: 'q8',
    question: '¿Cuánto tiempo te gustaría que durara el viaje?',
    options: [
      { value: 'A', label: '2–4 días' },
      { value: 'B', label: '5–7 días' },
      { value: 'C', label: '7–10 días' },
      { value: 'D', label: 'Más de 10 días' },
    ],
  },
  {
    type: 'radio',
    id: 'q9',
    question: '¿Qué presupuesto aproximado tienes para este viaje por persona?',
    options: [
      { value: 'A', label: '800–1.500 €' },
      { value: 'B', label: '1.500–3.000 €' },
      { value: 'C', label: '3.000–5.000 €' },
      { value: 'D', label: 'Más de 5.000 €' },
    ],
  },
  {
    type: 'text',
    id: 'q10',
    question: '¿Cuándo te gustaría viajar?',
    placeholder: 'Ej: verano 2025, enero…',
  },
  {
    type: 'textarea',
    id: 'q11',
    question: '¿Hay algo más que deberíamos saber para diseñar este viaje?',
    placeholder: 'Opcional',
  },
  {
    type: 'email',
    id: 'q12',
    question: '¿Cuál es tu correo electrónico?',
    placeholder: 'tu@email.com',
    required: true,
  },
];

const formState = {
  currentStep: 0,
  answers: {},
  onSubmit: null,
};

// ---- Public ----

function initForm(onSubmit) {
  formState.onSubmit = onSubmit;
  formState.currentStep = 0;
  formState.answers = {};
  renderStep();
}

// ---- Rendering ----

function renderStep() {
  const container = document.getElementById('view-form');
  const step = STEPS[formState.currentStep];
  const total = STEPS.length;
  const current = formState.currentStep + 1;
  const isLast = current === total;
  const showNext = step.type !== 'radio';

  container.innerHTML = `
    <div class="step-progress">
      <div class="step-progress-bar" style="width: ${(current / total) * 100}%"></div>
    </div>
    <div class="step-wrapper animate-in">
      <div class="step-count">${current} <span>/ ${total}</span></div>
      <div class="step-body">
        ${renderStepContent(step)}
      </div>
      <div class="step-actions">
        ${formState.currentStep > 0
          ? '<button type="button" class="btn-back" id="btn-back">← Anterior</button>'
          : '<span></span>'
        }
        ${showNext
          ? `<button type="button" class="btn-next" id="btn-next">${isLast ? 'Ver mi identidad →' : 'Continuar →'}</button>`
          : ''
        }
      </div>
    </div>
  `;

  attachStepListeners(step);
}

function renderStepContent(step) {
  switch (step.type) {
    case 'text':
    case 'email':
      return `
        <div class="step-question">${step.question}</div>
        <div class="step-field">
          <input type="${step.type}" id="${step.id}" name="${step.id}"
                 placeholder="${step.placeholder || ''}"
                 autocomplete="off"
                 ${step.required ? 'required' : ''}>
        </div>
      `;

    case 'textarea':
      return `
        <div class="step-question">${step.question}</div>
        <div class="step-field">
          <textarea id="${step.id}" name="${step.id}" rows="3"
                    placeholder="${step.placeholder || ''}"></textarea>
        </div>
      `;

    case 'text-group':
      return `
        <div class="step-question">${step.question}</div>
        <div class="step-field">
          ${step.fields.map(f => `
            <div class="field-sub">
              <label for="${f.id}">${f.label}</label>
              <input type="text" id="${f.id}" name="${f.id}"
                     placeholder="${f.placeholder || ''}" autocomplete="off">
            </div>
          `).join('')}
        </div>
      `;

    case 'radio':
      return `
        <div class="step-question">${step.question}</div>
        <div class="options-group">
          ${step.options.map(o => `
            <label class="option" for="${step.id}_${o.value}">
              <input type="radio" id="${step.id}_${o.value}" name="${step.id}" value="${o.value}">
              <span>${o.label}</span>
            </label>
          `).join('')}
        </div>
      `;

    case 'checkbox':
      return `
        <div class="step-question">
          ${step.question}
          ${step.hint ? `<span class="hint">${step.hint}</span>` : ''}
        </div>
        <div class="options-group">
          ${step.options.map(o => `
            <label class="option" for="${step.id}_${o.value}">
              <input type="checkbox" id="${step.id}_${o.value}" name="${step.id}" value="${o.value}">
              <span>${o.label}</span>
            </label>
          `).join('')}
        </div>
      `;
  }
}

// ---- Listeners ----

function attachStepListeners(step) {
  document.getElementById('btn-back')?.addEventListener('click', prevStep);
  document.getElementById('btn-next')?.addEventListener('click', nextStep);

  if (step.type === 'text' || step.type === 'email') {
    const input = document.getElementById(step.id);
    if (formState.answers[step.id]) input.value = formState.answers[step.id];
    input.addEventListener('keydown', e => { if (e.key === 'Enter') nextStep(); });
    input.focus();
  }

  if (step.type === 'textarea') {
    const el = document.getElementById(step.id);
    if (formState.answers[step.id]) el.value = formState.answers[step.id];
    el.focus();
  }

  if (step.type === 'text-group') {
    step.fields.forEach(f => {
      const el = document.getElementById(f.id);
      if (formState.answers[f.id]) el.value = formState.answers[f.id];
    });
    document.getElementById(step.fields[0].id)?.focus();
  }

  if (step.type === 'radio') {
    const saved = formState.answers[step.id];
    document.querySelectorAll(`input[name="${step.id}"]`).forEach(radio => {
      if (saved === radio.value) radio.checked = true;
      radio.addEventListener('change', () => setTimeout(nextStep, 280));
    });
  }

  if (step.type === 'checkbox') {
    const saved = formState.answers[step.id] || [];
    document.querySelectorAll(`input[name="${step.id}"]`).forEach(cb => {
      if (saved.includes(cb.value)) cb.checked = true;
      cb.addEventListener('change', () => {
        const checked = document.querySelectorAll(`input[name="${step.id}"]:checked`);
        if (checked.length > step.max) cb.checked = false;
      });
    });
  }
}

// ---- Navigation ----

function saveCurrentStep() {
  const step = STEPS[formState.currentStep];
  const a = formState.answers;

  if (step.type === 'text' || step.type === 'email' || step.type === 'textarea') {
    a[step.id] = (document.getElementById(step.id)?.value || '').trim();
  } else if (step.type === 'text-group') {
    step.fields.forEach(f => {
      a[f.id] = (document.getElementById(f.id)?.value || '').trim();
    });
  } else if (step.type === 'radio') {
    const el = document.querySelector(`input[name="${step.id}"]:checked`);
    a[step.id] = el ? el.value : '';
  } else if (step.type === 'checkbox') {
    a[step.id] = Array.from(
      document.querySelectorAll(`input[name="${step.id}"]:checked`)
    ).map(el => el.value);
  }
}

function validateCurrentStep() {
  const step = STEPS[formState.currentStep];
  if (!step.required) return true;

  if (step.type === 'text' || step.type === 'email') {
    const val = (document.getElementById(step.id)?.value || '').trim();
    if (!val) {
      document.getElementById(step.id)?.classList.add('field-error');
      return false;
    }
  }
  return true;
}

function nextStep() {
  if (!validateCurrentStep()) return;
  saveCurrentStep();

  if (formState.currentStep === STEPS.length - 1) {
    formState.onSubmit(buildFinalAnswers());
  } else {
    formState.currentStep++;
    renderStep();
  }
}

function prevStep() {
  saveCurrentStep();
  if (formState.currentStep > 0) {
    formState.currentStep--;
    renderStep();
  }
}

function buildFinalAnswers() {
  const a = formState.answers;
  return {
    // Metadata — usades per profile.js
    q1:  a.q1  || '',
    q2:  a.q2  || '',
    q3:  a.q3  || '',
    q8:  a.q8  || '',
    q9:  a.q9  || '',
    q10: a.q10 || '',
    q11: a.q11 || '',
    q12: a.q12 || '',
    // Scoring — indexades per question_slug (usades per calculateAxes)
    sensacion_mejores_viajes: a.q4  || '',
    entorno_preferido:        a.q5  || [],
    ritmo_viaje:              a.q6  || '',
    evitar_en_viaje:          a.q7  || [],
  };
}
