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

  initForm(function (answers) {
    console.log('ANSWERS:', answers);
    const axes    = calculateAxes(answers, rules.scoringRules);
    console.log('AXES RAW:', axes);
    const profile = buildProfile(answers, axes, rules);
    console.log('PROFILE FINAL:', profile);
    showResult(profile);
    document.fonts.ready.then(function () {
      renderCard(profile, 'card-container', answers);
    });
  });
});
