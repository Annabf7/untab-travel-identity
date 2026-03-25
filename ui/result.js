// ===========================
// ui/result.js
// ===========================

function showResult(profile) {
  document.getElementById('view-form').hidden = true;
  const result = document.getElementById('view-result');
  result.hidden = false;

  result.innerHTML = `
    <div class="result-wrapper animate-in">
      <div id="card-container"></div>
      <button class="btn-download" onclick="downloadCard('card-container')">
        Descargar tarjeta
      </button>
    </div>
  `;
}
