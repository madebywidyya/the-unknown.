/**
 * Landing page — featured cases and location preview
 */
(async function () {
  const icons = { '001': '⏱', '002': '✉', '003': '📷', '004': '📡', '005': '📑' };

  let cases = [];
  try {
    const res = await fetch('data/cases.json');
    cases = await res.json();
  } catch (e) {
    console.warn('Could not load cases', e);
  }

  const grid = document.querySelector('#caseGrid');
  if (grid && cases.length) {
    const featured = cases.filter(c => c.status === 'open' || !c.status).slice(0, 3);
    grid.innerHTML = featured.map(item => `
      <article class="case-card">
        <div class="case-visual">
          <span class="case-icon">${icons[item.id] || '📁'}</span>
          <span class="case-number">FILE NO. ${item.id}</span>
          <span class="case-status">● OPEN FILE</span>
        </div>
        <div class="case-info">
          <span class="case-category">${item.category}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <div class="case-bottom">
            <span>${item.difficultyLabel}</span>
            <a href="case-detail.html?id=${item.id}">OPEN FILE ↗</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Location preview
  let locations = [];
  try {
    const res = await fetch('data/locations.json');
    locations = await res.json();
  } catch (e) {}

  const locPrev = document.querySelector('#locationPreview');
  if (locPrev && locations.length) {
    locPrev.innerHTML = locations.slice(0, 4).map(loc => {
      const unlocked = Storage.isLocationUnlocked(loc.id) || loc.status === 'unlocked';
      return `
        <div class="loc-card ${unlocked ? '' : 'locked'}">
          <span class="loc-status">${unlocked ? '● ACCESSIBLE' : '○ LOCKED'}</span>
          <h3>${loc.shortName}</h3>
          <p>${loc.description.slice(0, 90)}…</p>
        </div>
      `;
    }).join('');
  }
})();
