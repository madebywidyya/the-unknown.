(async function () {
  let challenges = [];
  try {
    const res = await fetch('data/challenges.json');
    challenges = await res.json();
  } catch (e) {
    document.getElementById('challengeList').innerHTML = '<p class="empty-state">Failed to load challenges.</p>';
    return;
  }

  const params = new URLSearchParams(location.search);
  const focusId = params.get('id');

  function renderList() {
    const list = document.getElementById('challengeList');
    list.innerHTML = challenges.map(ch => {
      const done = Storage.get().challenges[ch.id]?.completed;
      return `
        <article class="case-row" style="cursor:pointer" data-id="${ch.id}">
          <div class="case-id" style="font-size:11px">${ch.type.toUpperCase()}</div>
          <div>
            <h3 style="font-size:17px">${ch.title}</h3>
            <div class="meta">Difficulty ${ch.difficulty} · +${ch.xp} XP ${ch.caseId ? '· Case ' + ch.caseId : ''}</div>
          </div>
          <div class="actions">
            <span class="badge ${done ? 'badge-done' : 'badge-open'}">${done ? 'SOLVED' : 'OPEN'}</span>
          </div>
        </article>
      `;
    }).join('');

    list.querySelectorAll('.case-row').forEach(row => {
      row.addEventListener('click', () => openChallenge(row.dataset.id));
    });
  }

  function openChallenge(id) {
    const ch = challenges.find(c => c.id === id);
    if (!ch) return;
    const done = Storage.get().challenges[id]?.completed;
    const modal = document.getElementById('challengeModal');
    const inner = document.getElementById('modalInner');

    let body = `
      <button class="modal-close" id="closeModal">×</button>
      <p class="eyebrow">${ch.type.toUpperCase()} · DIFFICULTY ${ch.difficulty}</p>
      <h2 style="font:600 22px var(--serif);margin:8px 0 12px">${ch.title}</h2>
      <p style="color:var(--muted);font-size:13px;line-height:1.6;margin-bottom:18px">${ch.description}</p>
      <p style="font-size:14px;margin-bottom:16px"><strong>${ch.question}</strong></p>
    `;

    if (done) {
      body += `<p style="color:var(--gold);margin-bottom:12px">Already solved.</p>
        <p style="font-size:13px;line-height:1.6">${ch.explanation}</p>`;
    } else if (ch.options) {
      body += `<div id="options" style="display:flex;flex-direction:column;gap:8px">
        ${ch.options.map(o => `
          <button class="button button-ghost opt-btn" data-id="${o.id}" style="justify-content:flex-start;text-align:left">${o.text}</button>
        `).join('')}
      </div>
      <button class="text-link" id="hintBtn" style="margin-top:16px">Show hint</button>
      <p id="hintText" style="display:none;font-size:12px;color:var(--gold-dim);margin-top:8px">${ch.hint}</p>
      <div id="feedback" style="margin-top:14px;font-size:13px"></div>`;
    } else {
      body += `
        <input type="text" id="textAnswer" placeholder="Your answer" style="width:100%;padding:12px;background:var(--panel);border:1px solid var(--line);color:var(--text);font:400 14px var(--sans);margin-bottom:12px">
        <button class="button button-primary" id="submitText">SUBMIT</button>
        <button class="text-link" id="hintBtn" style="margin-top:12px;display:block">Show hint</button>
        <p id="hintText" style="display:none;font-size:12px;color:var(--gold-dim);margin-top:8px">${ch.hint}</p>
        <div id="feedback" style="margin-top:14px;font-size:13px"></div>`;
    }

    inner.innerHTML = body;
    modal.classList.add('open');

    document.getElementById('closeModal').onclick = () => modal.classList.remove('open');
    modal.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };

    document.getElementById('hintBtn')?.addEventListener('click', () => {
      document.getElementById('hintText').style.display = 'block';
    });

    if (ch.options && !done) {
      inner.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const correct = btn.dataset.id === ch.correct;
          const fb = document.getElementById('feedback');
          if (correct) {
            Storage.completeChallenge(ch.id, 100);
            Storage.addXP(ch.xp, `Challenge: ${ch.title}`);
            Progression.checkAchievements();
            fb.innerHTML = `<span style="color:var(--success)">Correct.</span> ${ch.explanation}`;
            showToast(`+${ch.xp} XP — Challenge solved`);
            setTimeout(() => { modal.classList.remove('open'); renderList(); }, 1800);
          } else {
            fb.innerHTML = `<span style="color:var(--red)">Incorrect.</span> Try again or use the hint.`;
          }
        });
      });
    }

    if (!ch.options && !done) {
      document.getElementById('submitText')?.addEventListener('click', () => {
        const val = (document.getElementById('textAnswer').value || '').trim().toUpperCase().replace(/\s+/g, '');
        const correct = val === (ch.correct || '').toUpperCase().replace(/\s+/g, '');
        const fb = document.getElementById('feedback');
        if (correct) {
          Storage.completeChallenge(ch.id, 100);
          Storage.addXP(ch.xp, `Challenge: ${ch.title}`);
          Progression.checkAchievements();
          fb.innerHTML = `<span style="color:var(--success)">Correct.</span> ${ch.explanation}`;
          showToast(`+${ch.xp} XP — Challenge solved`);
          setTimeout(() => { modal.classList.remove('open'); renderList(); }, 1800);
        } else {
          fb.innerHTML = `<span style="color:var(--red)">Incorrect.</span> Check spelling and try again.`;
        }
      });
    }
  }

  renderList();
  if (focusId) openChallenge(focusId);
})();
