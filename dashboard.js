(async function () {
  Progression.checkAchievements();
  const stats = Progression.stats();
  const s = Storage.get();

  document.getElementById('playerName').textContent = s.profile.name || 'Investigator';
  document.getElementById('statLevel').textContent = stats.level;
  document.getElementById('statXP').textContent = stats.xp;
  document.getElementById('statEvidence').textContent = stats.evidence;
  document.getElementById('statCases').textContent = stats.casesCompleted;
  document.getElementById('levelPercent').textContent = stats.levelProgress.percent + '%';
  document.getElementById('levelBar').style.width = stats.levelProgress.percent + '%';

  // Current investigation
  const currentEl = document.getElementById('currentInvestigation');
  const inProgress = Object.entries(s.cases).find(([, c]) => c.status === 'in_progress' || (c.progress > 0 && c.progress < 100));
  if (inProgress) {
    const [caseId, prog] = inProgress;
    let caseData = null;
    try {
      const res = await fetch('data/cases.json');
      const all = await res.json();
      caseData = all.find(c => c.id === caseId);
    } catch (e) {}
    if (caseData) {
      currentEl.innerHTML = `
        <p class="current-case-title">${caseData.title}</p>
        <p class="current-case-meta">FILE ${caseData.id} · ${prog.progress}% complete · ${prog.completedObjectives?.length || 0} objectives done</p>
        <div class="progress-bar" style="margin-bottom:16px"><span style="width:${prog.progress}%"></span></div>
        <a class="button button-primary" href="case-detail.html?id=${caseId}">CONTINUE INVESTIGATION ↗</a>
      `;
    }
  }

  // Activity
  const list = document.getElementById('activityList');
  const activity = Storage.getActivity();
  if (activity.length) {
    list.innerHTML = activity.slice(0, 8).map(a => {
      const d = new Date(a.at);
      return `<li>${a.message}<time>${d.toLocaleString()}</time></li>`;
    }).join('');
  }

  // Achievements
  const grid = document.getElementById('achieveGrid');
  const defs = Progression.ACHIEVEMENTS;
  grid.innerHTML = Object.entries(defs).map(([id, def]) => {
    const unlocked = !!s.achievements[id];
    return `
      <div class="achieve-item ${unlocked ? 'unlocked' : ''}" title="${def.desc}">
        <div class="icon">${def.icon}</div>
        <div class="name">${def.name}</div>
        <div class="desc">${unlocked ? 'Unlocked' : 'Locked'}</div>
      </div>
    `;
  }).join('');
})();
