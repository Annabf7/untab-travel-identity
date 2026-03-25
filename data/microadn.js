// ===========================
// data/microadn.js
// ===========================

const MICRO_ADN = {
  'plaer_exploracio':   'Atravesar límites, buscar lo excepcional',
  'plaer_cultura':      'Buscar belleza, historia y lugares con alma',
  'plaer_calma':        'Bajar el ritmo, afinar la mirada',
  'exploracio_plaer':   'Moverse lejos para sentir más',
  'exploracio_cultura': 'Descubrir mundos y entender cómo se viven',
  'exploracio_calma':   'Perderse en paisajes que lo cambian todo',
  'cultura_plaer':      'Encontrar emoción en lo auténtico y lo bello',
  'cultura_exploracio': 'Seguir la huella de otros mundos',
  'calma_plaer':        'Habitar lo bello sin prisa',
  'calma_cultura':      'Viajar hondo, lento y con sentido',
};

function getMicroADN(dominant, secondary) {
  return MICRO_ADN[`${dominant}_${secondary}`] || '';
}
