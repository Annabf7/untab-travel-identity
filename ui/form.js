// ===========================
// ui/form.js — Step-by-step form
// Config ve de formLoader.js (Baserow o fallback)
// ===========================

const formState = {
  currentStep: 0,
  answers: {},
  config: [],   // carregat des de formLoader
  onSubmit: null,
};

// ---- Helpers ----

function getOtherOption(step) {
  return step.options?.find(o => o.label === 'Otro') || null;
}

function showValidationError(message) {
  const el = document.getElementById('validation-error-msg');
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

function clearValidationError() {
  const el = document.getElementById('validation-error-msg');
  if (el) { el.textContent = ''; el.classList.remove('visible'); }
  document.querySelectorAll('.field-error').forEach(e => e.classList.remove('field-error'));
  document.querySelectorAll('.options-group.has-error').forEach(e => e.classList.remove('has-error'));
}

// ---- Public ----

function initForm(steps, onSubmit) {
  formState.config = steps;
  formState.onSubmit = onSubmit;
  formState.currentStep = 0;
  formState.answers = {};
  renderStep();
}

// ---- Rendering ----

function renderStep() {
  const container = document.getElementById('view-form');
  const step = formState.config[formState.currentStep];
  const total = formState.config.length;
  const current = formState.currentStep + 1;
  const isLast = current === total;
  // Show Continuar for non-radio steps, and also for radio steps with an "Otro" option
  const showNext = step.type !== 'radio' || !!getOtherOption(step);

  container.innerHTML = `
    <div class="step-progress">
      <div class="step-progress-bar" style="width: ${(current / total) * 100}%"></div>
    </div>
    <div class="step-wrapper animate-in">
      <div class="step-count">${current} <span>/ ${total}</span></div>
      <div class="step-body">
        ${renderStepContent(step)}
      </div>
      <div class="validation-error" id="validation-error-msg"></div>
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
            ${o.label === 'Otro' ? `
              <div class="other-input-wrap" id="${step.id}_other_wrap">
                <input type="text" id="${step.id}_other" placeholder="Cuéntanos más…" autocomplete="off">
              </div>
            ` : ''}
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
            ${o.label === 'Otro' ? `
              <div class="other-input-wrap" id="${step.id}_other_wrap">
                <input type="text" id="${step.id}_other" placeholder="Cuéntanos más…" autocomplete="off">
              </div>
            ` : ''}
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
    const saved      = formState.answers[step.id];
    const savedOther = formState.answers[`${step.id}_other`] || '';
    const otherOpt   = getOtherOption(step);
    const otherWrap  = otherOpt ? document.getElementById(`${step.id}_other_wrap`) : null;
    const otherInput = otherOpt ? document.getElementById(`${step.id}_other`)      : null;

    document.querySelectorAll(`input[name="${step.id}"]`).forEach(radio => {
      if (saved === radio.value) {
        radio.checked = true;
        if (otherOpt && radio.value === otherOpt.value) {
          if (otherWrap)  otherWrap.classList.add('visible');
          if (otherInput) otherInput.value = savedOther;
        }
      }
      radio.addEventListener('change', () => {
        clearValidationError();
        const isOther = otherOpt && radio.value === otherOpt.value;
        if (otherWrap) otherWrap.classList.toggle('visible', isOther);
        if (isOther) {
          otherInput?.focus();
        } else {
          setTimeout(nextStep, 280);
        }
      });
    });
  }

  if (step.type === 'checkbox') {
    const saved      = formState.answers[step.id] || [];
    const savedOther = formState.answers[`${step.id}_other`] || '';
    const otherOpt   = getOtherOption(step);
    const otherWrap  = otherOpt ? document.getElementById(`${step.id}_other_wrap`) : null;
    const otherInput = otherOpt ? document.getElementById(`${step.id}_other`)      : null;

    document.querySelectorAll(`input[name="${step.id}"]`).forEach(cb => {
      if (saved.includes(cb.value)) cb.checked = true;
      cb.addEventListener('change', () => {
        clearValidationError();
        const checked = document.querySelectorAll(`input[name="${step.id}"]:checked`);
        if (checked.length > step.max) { cb.checked = false; return; }
        if (otherOpt && cb.value === otherOpt.value && otherWrap) {
          otherWrap.classList.toggle('visible', cb.checked);
          if (cb.checked) otherInput?.focus();
        }
      });
    });

    if (otherOpt && saved.includes(otherOpt.value)) {
      if (otherWrap)  otherWrap.classList.add('visible');
      if (otherInput) otherInput.value = savedOther;
    }
  }
}

// ---- Navigation ----

function saveCurrentStep() {
  const step = formState.config[formState.currentStep];
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
    const otherInput = document.getElementById(`${step.id}_other`);
    if (otherInput) a[`${step.id}_other`] = otherInput.value.trim();
  } else if (step.type === 'checkbox') {
    a[step.id] = Array.from(
      document.querySelectorAll(`input[name="${step.id}"]:checked`)
    ).map(el => el.value);
    const otherInput = document.getElementById(`${step.id}_other`);
    if (otherInput) a[`${step.id}_other`] = otherInput.value.trim();
  }
}

function validateCurrentStep() {
  clearValidationError();
  const step = formState.config[formState.currentStep];

  if (step.type === 'text' || step.type === 'email') {
    if (!step.required) return true;
    const val = (document.getElementById(step.id)?.value || '').trim();
    if (!val) {
      document.getElementById(step.id)?.classList.add('field-error');
      showValidationError('Este campo es obligatorio.');
      return false;
    }
  }

  if (step.type === 'radio') {
    const checked = document.querySelector(`input[name="${step.id}"]:checked`);
    if (!checked) {
      document.querySelector('.options-group')?.classList.add('has-error');
      showValidationError('Selecciona una opción para continuar.');
      return false;
    }
    const otherOpt = getOtherOption(step);
    if (otherOpt && checked.value === otherOpt.value) {
      const otherInput = document.getElementById(`${step.id}_other`);
      if (otherInput && !otherInput.value.trim()) {
        otherInput.classList.add('field-error');
        showValidationError('Escribe tu respuesta para continuar.');
        return false;
      }
    }
  }

  if (step.type === 'checkbox') {
    const checked = document.querySelectorAll(`input[name="${step.id}"]:checked`);
    if (checked.length === 0) {
      document.querySelector('.options-group')?.classList.add('has-error');
      showValidationError('Selecciona al menos una opción para continuar.');
      return false;
    }
    const otherOpt = getOtherOption(step);
    if (otherOpt) {
      const otherChecked = document.querySelector(`input[name="${step.id}"][value="${otherOpt.value}"]:checked`);
      if (otherChecked) {
        const otherInput = document.getElementById(`${step.id}_other`);
        if (otherInput && !otherInput.value.trim()) {
          otherInput.classList.add('field-error');
          showValidationError('Escribe tu respuesta para continuar.');
          return false;
        }
      }
    }
  }

  return true;
}

function nextStep() {
  if (!validateCurrentStep()) return;
  saveCurrentStep();

  if (formState.currentStep === formState.config.length - 1) {
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

// Construeix les respostes finals amb mapping dinàmic de scoring slugs
function buildFinalAnswers() {
  const a = formState.answers;
  const final = {};

  formState.config.forEach(step => {
    if (step.type === 'text-group') {
      // Cada sub-camp amb el seu slug
      step.fields.forEach(f => {
        final[f.id] = a[f.id] || '';
      });
    } else {
      // Valor per slug directe
      const defaultVal = step.type === 'checkbox' ? [] : '';
      final[step.id] = a[step.id] || defaultVal;

      // Si té scoring_slug → duplicar amb la clau de scoring
      if (step.scoringSlug) {
        final[step.scoringSlug] = a[step.id] || defaultVal;
      }

      // Camp "Otro" associat
      if (a[step.id + '_other']) {
        final[step.id + '_other'] = a[step.id + '_other'];
      }
    }
  });

  return final;
}
