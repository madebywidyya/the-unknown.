(async function () {
  const params = new URLSearchParams(location.search);
  const caseId = params.get('id') || '001';
  const root = document.getElementById('caseRoot');

  let cases = [], evidence = [], challenges = [];
  try {
    const [cRes, eRes, chRes] = await Promise.all([
      fetch('data/cases.json'),
      fetch('data/evidence.json'),
      fetch('data/challenges.json')
    ]);
    cases = await cRes.json();
    evidence = await eRes.json();
    challenges = await chRes.json();
  } catch (e) {
    root.innerHTML = '<p class="empty-state">Failed to load case data.</p>';
    return;
  }

  const caseData = cases.find(c => c.id === caseId);
  if (!caseData) {
    root.innerHTML = '<p class="empty-state">Case not found. <a href="cases.html">Return to archive</a></p>';
    return;
  }

  document.title = `${caseData.title} — THE UNKNOWN`;

  // Ensure case is marked in progress
  const prog = Storage.getCaseProgress(caseId);
  if (prog.status === 'open' || !prog.status) {
    Storage.updateCase(caseId, { status: 'in_progress', progress: prog.progress || 5 });
  }

  const caseEvidence = evidence.filter(e => e.caseId === caseId);
  const caseChallenges = challenges.filter(ch => ch.caseId === caseId);

  function render() {
    const prog = Storage.getCaseProgress(caseId);
    const completedObjs = new Set(prog.completedObjectives || []);
    const discoveredChapters = new Set(prog.discoveredChapters || []);

    // Auto-discover first chapter
    if (!discoveredChapters.has(caseData.chapters[0]?.id)) {
      Storage.updateCase(caseId, {
        discoveredChapters: [...(prog.discoveredChapters || []), caseData.chapters[0].id]
      });
      discoveredChapters.add(caseData.chapters[0].id);
    }

    root.innerHTML = `
      <div class="case-detail-layout">
        <div class="case-main">
          <p class="eyebrow">FILE NO. ${caseData.id} · ${caseData.category}</p>
          <h1>${caseData.title}</h1>
          <div class="case-meta-line">
            <span>${caseData.difficultyLabel}</span>
            <span>${caseData.clues} clues</span>
            <span class="badge badge-${prog.progress >= 100 ? 'done' : 'progress'}">${prog.progress || 0}% complete</span>
          </div>
          <p style="color:var(--muted);font-size:14px;line-height:1.7;max-width:640px;margin-bottom:28px">${caseData.synopsis}</p>

          <h2 style="font-size:14px;letter-spacing:1.5px;color:var(--gold);margin-bottom:16px">INVESTIGATION CHAPTERS</h2>
          <div id="chapters">
            ${caseData.chapters.map((ch, i) => {
              const unlocked = discoveredChapters.has(ch.id) || i === 0;
              if (!unlocked) {
                return `<div class="chapter" style="opacity:0.45"><h3>CHAPTER ${String(i+1).padStart(2,'0')} — LOCKED</h3><p>Complete previous objectives to reveal.</p></div>`;
              }
              return `
                <div class="chapter">
                  <h3>CHAPTER ${String(i+1).padStart(2,'0')} — ${ch.title}</h3>
                  <div class="chapter-content">${ch.content}</div>
                  ${i < caseData.chapters.length - 1 && completedObjs.size >= (i + 1) ? '' : ''}
                </div>
              `;
            }).join('')}
          </div>

          <h2 style="font-size:14px;letter-spacing:1.5px;color:var(--gold);margin:32px 0 16px">OBJECTIVES</h2>
          <ul class="objectives-list" id="objectives">
            ${caseData.objectives.map(obj => {
              const done = completedObjs.has(obj.id);
              return `
                <li class="${done ? 'done' : ''}" data-obj="${obj.id}">
                  <span class="obj-check ${done ? 'done' : ''}">${done ? '✓' : ''}</span>
                  <div>
                    <div>${obj.text}</div>
                    <div style="font-size:10px;color:var(--muted-2);margin-top:4px">+${obj.xp} XP</div>
                  </div>
                  ${!done ? `<button class="button button-ghost obj-btn" data-obj="${obj.id}" style="margin-left:auto;padding:6px 10px;font-size:9px">MARK DONE</button>` : ''}
                </li>
              `;
            }).join('')}
          </ul>

          ${caseChallenges.length ? `
            <h2 style="font-size:14px;letter-spacing:1.5px;color:var(--gold);margin:32px 0 16px">LINKED CHALLENGE</h2>
            <div class="chapter">
              <h3>${caseChallenges[0].title}</h3>
              <p style="margin-bottom:12px">${caseChallenges[0].description}</p>
              <a class="button button-primary" href="challenges.html?id=${caseChallenges[0].id}">OPEN CHALLENGE ↗</a>
            </div>
          ` : ''}

          ${prog.progress >= 100 ? `
            <div class="chapter" style="border-color:var(--gold);margin-top:28px">
              <h3>CASE CLOSED — FINAL EXPLANATION</h3>
              <div class="chapter-content">${caseData.finalExplanation}</div>
            </div>
          ` : ''}
        </div>

        <aside class="side-panel">
          <div class="side-card">
            <h3>Evidence for this case</h3>
            <div class="evidence-mini">
              ${caseEvidence.map(ev => {
                const has = Storage.hasEvidence(ev.id);
                return `
                  <div class="evidence-mini-item ${has ? '' : 'locked'}">
                    <span>${ev.name}</span>
                    ${has
                      ? '<span style="color:var(--gold);font-size:10px">FOUND</span>'
                      : `<button class="discover-btn" data-ev="${ev.id}" style="background:none;border:0;color:var(--gold);font:600 9px var(--display);cursor:pointer">DISCOVER</button>`}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="side-card theory-box">
            <h3>Your Theory</h3>
            <textarea id="theoryInput" placeholder="Write your current theory about this case…">${Storage.get().notes[caseId] || ''}</textarea>
            <button class="button button-ghost" id="saveTheory">SAVE NOTE</button>
          </div>

          <div class="side-card">
            <h3>Actions</h3>
            <button class="button button-primary" id="completeCaseBtn" style="width:100%;margin-bottom:10px" ${prog.progress >= 100 ? 'disabled' : ''}>
              ${prog.progress >= 100 ? 'CASE COMPLETED' : 'MARK CASE COMPLETE'}
            </button>
            <a class="text-link" href="investigation-board.html?case=${caseId}">OPEN BOARD ↗</a>
          </div>
        </aside>
      </div>
    `;

    // Bind events
    root.querySelectorAll('.obj-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const objId = btn.dataset.obj;
        const obj = caseData.objectives.find(o => o.id === objId);
        const result = Storage.completeObjective(caseId, objId);
        if (result.already) {
          showToast('Objective already completed.');
          return;
        }
        Storage.addXP(obj.xp, `Objective: ${obj.text.slice(0, 40)}…`);
        // Unlock next chapter if any
        const idx = caseData.objectives.findIndex(o => o.id === objId);
        if (caseData.chapters[idx + 1]) {
          const p = Storage.getCaseProgress(caseId);
          const discovered = new Set(p.discoveredChapters || []);
          discovered.add(caseData.chapters[idx + 1].id);
          Storage.updateCase(caseId, { discoveredChapters: [...discovered] });
        }
        Progression.checkAchievements();
        showToast(`+${obj.xp} XP — Objective complete`);
        render();
      });
    });

    root.querySelectorAll('.discover-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const evId = btn.dataset.ev;
        const ev = caseEvidence.find(e => e.id === evId);
        const result = Storage.discoverEvidence(evId);
        if (result.already) {
          showToast('Already discovered.');
          return;
        }
        Storage.addXP(ev.xp || 10, `Evidence: ${ev.name}`);
        Progression.checkAchievements();
        showToast(`Evidence discovered: ${ev.name} (+${ev.xp || 10} XP)`);
        render();
      });
    });

    document.getElementById('saveTheory')?.addEventListener('click', () => {
      const text = document.getElementById('theoryInput').value;
      Storage.saveNote(caseId, text);
      showToast('Theory note saved.');
    });

    document.getElementById('completeCaseBtn')?.addEventListener('click', () => {
      if (prog.progress >= 100) return;
      // Require most objectives
      if (completedObjs.size < Math.max(1, caseData.objectives.length - 1)) {
        showToast('Complete more objectives before closing the case.');
        return;
      }
      Storage.updateCase(caseId, { progress: 100, status: 'completed' });
      Storage.addXP(50, `Case completed: ${caseData.title}`);
      // Unlock related location if any
      if (caseData.locationId) {
        Storage.unlockLocation(caseData.locationId);
      }
      Progression.checkAchievements();
      showToast('Case marked complete. +50 XP');
      render();
    });
  }

  render();
})();
