(async function () {
  let cases = [];
  try {
    const res = await fetch('data/cases.json');
    cases = await res.json();
  } catch (e) {
    document.getElementById('caseList').innerHTML = '<p class="empty-state">Failed to load case data.</p>';
    return;
  }

  function getStatus(c) {
    const prog = Storage.getCaseProgress(c.id);
    if (c.status === 'locked' && prog.progress === 0 && !Storage.isLocationUnlocked(c.locationId)) {
      // simple lock check — unlock if previous cases progress
      const completedCount = Object.values(Storage.get().cases).filter(x => x.progress >= 100).length;
      if (c.id === '004' && completedCount < 1) return 'locked';
      if (c.id === '005' && completedCount < 2) return 'locked';
    }
    if (prog.progress >= 100 || prog.status === 'completed') return 'completed';
    if (prog.progress > 0 || prog.status === 'in_progress') return 'in_progress';
    return 'open';
  }

  function render(filter = 'all') {
    const list = document.getElementById('caseList');
    let filtered = cases;
    if (filter !== 'all') {
      filtered = cases.filter(c => getStatus(c) === filter);
    }
    if (!filtered.length) {
      list.innerHTML = '<p class="empty-state">No cases match this filter.</p>';
      return;
    }
    list.innerHTML = filtered.map(c => {
      const status = getStatus(c);
      const prog = Storage.getCaseProgress(c.id);
      const locked = status === 'locked';
      return `
        <article class="case-row ${locked ? 'locked' : ''}">
          <div class="case-id">${c.id}</div>
          <div>
            <h3>${c.title}</h3>
            <div class="meta">${c.category} · ${c.difficultyLabel} · ${c.clues} clues</div>
          </div>
          <div class="actions">
            <span class="badge badge-${status === 'completed' ? 'done' : status === 'in_progress' ? 'progress' : status === 'locked' ? 'locked' : 'open'}">${status.replace('_', ' ')}</span>
            ${!locked ? `<a class="button button-ghost" href="case-detail.html?id=${c.id}" style="padding:8px 12px">OPEN</a>` : '<span class="prog">Complete prior cases</span>'}
            ${prog.progress > 0 && prog.progress < 100 ? `<span class="prog">${prog.progress}%</span>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  document.getElementById('filterBar').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render(btn.dataset.filter);
  });

  render('all');
})();
