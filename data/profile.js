// ===========================
// data/profile.js
// Construeix l'objecte final de perfil
// Independent de la font de dades
// ===========================

function buildProfile(answers, axes, rules) {
  // Normalització (percentatge del total positiu)
  const total = Object.values(axes).reduce((s, v) => s + Math.max(v, 0), 0);
  const normalizedAxes = total > 0
    ? Object.fromEntries(
        Object.entries(axes).map(([k, v]) => [k, Math.round(Math.max(v, 0) / total * 100)])
      )
    : { exploracion: 25, cultura: 25, placer: 25, calma: 25 };

  // Dominant i secundari
  const sorted       = Object.entries(axes).sort((a, b) => b[1] - a[1]);
  const dominantAxis  = sorted[0][0];
  const secondaryAxis = sorted[1][0];
  const key           = `${dominantAxis}_${secondaryAxis}`;

  return {
    // Metadata del formulari
    name:               answers.q1  || '',
    desiredDestination: answers.q2  || '',
    avoidDestinations:  answers.q3  || '',
    duration:           answers.q8  || '',
    budget:             answers.q9  || '',
    when:               answers.q10 || '',
    extra:              answers.q11 || '',
    email:              answers.q12 || '',

    // Scoring
    axes,
    normalizedAxes,
    dominantAxis,
    secondaryAxis,

    // Identitat
    tribe:    rules.tribes[key]   || '—',
    microADN: rules.microADN[key] || '—',
  };
}
