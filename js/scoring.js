const SCORE_CYCLE = { 0: 10, 10: 5, 5: 0 };

function cycleScore(current) {
  return SCORE_CYCLE[current] ?? 0;
}

function getScoreState(pts) {
  if (pts === 10) return 'state-10';
  if (pts === 5)  return 'state-5';
  return 'state-0';
}

function getScoreLabel(pts) {
  if (pts === 10) return { pts: '10', label: 'PTS', icon: 'fa-check-double' };
  if (pts === 5)  return { pts: '5',  label: 'PTS', icon: 'fa-check' };
  return                 { pts: '0',  label: 'PTS', icon: 'fa-xmark' };
}

function buildScoreRows(categories, answers, scores, onCycle) {
  const container = document.getElementById('score-rows');
  container.innerHTML = '';

  categories.forEach(cat => {
    if (cat.composite) {
      cat.parts.forEach((part, i) => {
        const subId = `${cat.id}_${i}`;
        const answer = (answers[subId] || '').trim();
        const pts = scores[subId] ?? 0;
        container.appendChild(createScoreRow(subId, `${cat.name} — ${part}`, cat.icon, answer, pts, onCycle));
      });
    } else {
      const answer = (answers[cat.id] || '').trim();
      const pts = scores[cat.id] ?? 0;
      container.appendChild(createScoreRow(cat.id, cat.name, cat.icon, answer, pts, onCycle));
    }
  });
}

function createScoreRow(id, name, icon, answer, pts, onCycle) {
  const row = document.createElement('div');
  row.className = `score-row${pts === 10 ? ' scored-10' : pts === 5 ? ' scored-5' : ''}`;
  row.dataset.id = id;

  const { label } = getScoreLabel(pts);

  row.innerHTML = `
    <div class="score-cat-icon"><i class="fa-solid ${icon}"></i></div>
    <div style="flex:1; min-width:0;">
      <div class="score-cat-name">${escapeHtml(name)}</div>
      <div class="score-answer${answer ? '' : ' empty'}">${answer ? escapeHtml(answer) : 'sem resposta'}</div>
    </div>
    <button class="score-btn ${getScoreState(pts)}" data-id="${id}" aria-label="Alterar pontuação: ${pts} pts">
      <span class="pts">${pts}</span>
      <span class="pts-label">${label}</span>
    </button>
  `;

  const btn = row.querySelector('.score-btn');
  btn.addEventListener('click', () => {
    const newPts = onCycle(id);
    updateScoreRowUI(row, btn, newPts);
  });

  return row;
}

function updateScoreRowUI(row, btn, pts) {
  const { label } = getScoreLabel(pts);
  btn.className = `score-btn ${getScoreState(pts)}`;
  btn.querySelector('.pts').textContent = pts;
  btn.querySelector('.pts-label').textContent = label;
  row.className = `score-row${pts === 10 ? ' scored-10' : pts === 5 ? ' scored-5' : ''}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
