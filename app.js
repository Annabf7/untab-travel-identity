// ===========================
// app.js — orquestració
// ===========================

document.addEventListener('DOMContentLoaded', async function () {
  let rules;

  try {
    rules = await loadRules();
  } catch (err) {
    console.warn('[app] Error carregant rules, fallback al mock:', err);
    rules = getMockRules();
  }

  document.getElementById('btn-start').addEventListener('click', function () {
    document.getElementById('view-intro').hidden = true;
    document.getElementById('view-form').hidden = false;
    startForm(rules);
  });
});

function startForm(rules) {
  initForm(function (answers) {
    console.log('ANSWERS:', answers);
    const axes    = calculateAxes(answers, rules.scoringRules);
    console.log('AXES RAW:', axes);
    const profile = buildProfile(answers, axes, rules);
    console.log('PROFILE FINAL:', profile);

    // Outro screen
    document.getElementById('view-form').hidden = true;
    const outro = document.getElementById('view-outro');
    outro.hidden = false;

    setTimeout(function () {
      outro.hidden = true;
      showResult(profile);
      document.fonts.ready.then(function () {
        renderCard(profile, 'card-container', answers);
      });
    }, 1800);
  });
}
