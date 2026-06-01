/* ════════════════════════════════════════════
   Bootstrap
   ════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initTheme();
  initHomeScreen();
  initSetupScreen();
  initPlayersScreen();
  initLetterScreen();
  initGameScreen();
  initScoringScreen();
  initRoundResultScreen();
  initFinalScreen();
  checkURLConfig();
});

/* ════════════════════════════════════════════
   Theme
   ════════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('stop_theme') || 'dark';
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('stop_theme', theme);
  const icon  = document.querySelector('#btn-theme i');
  const label = document.getElementById('theme-label');
  if (theme === 'dark') {
    icon.className  = 'fa-solid fa-moon';
    label.textContent = 'Escuro';
    document.querySelector('meta[name="theme-color"]').content = '#0F0F1A';
  } else {
    icon.className  = 'fa-solid fa-sun';
    label.textContent = 'Claro';
    document.querySelector('meta[name="theme-color"]').content = '#F0F4F8';
  }
}

document.getElementById('btn-theme').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ════════════════════════════════════════════
   URL config detection
   ════════════════════════════════════════════ */
function checkURLConfig() {
  const config = extractConfigFromURL();
  if (config) {
    applyConfig(config);
    history.replaceState(null, '', window.location.pathname);
    renderPlayersScreen();
    showScreen('screen-players');
    showToast('Configuração carregada! Insira seu nome.', 'success');
  }
}

/* ════════════════════════════════════════════
   Toast helper
   ════════════════════════════════════════════ */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: 'fa-check-circle', error: 'fa-triangle-exclamation', info: 'fa-circle-info' };
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ════════════════════════════════════════════
   Modal helpers
   ════════════════════════════════════════════ */
function showModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function hideModal(id) {
  document.getElementById(id).classList.add('hidden');
}

/* ════════════════════════════════════════════
   SCREEN: HOME
   ════════════════════════════════════════════ */
function initHomeScreen() {
  document.getElementById('btn-new-game').addEventListener('click', () => {
    fullReset();
    renderSetupScreen();
    showScreen('screen-setup');
  });

  document.getElementById('btn-enter-code').addEventListener('click', () => showModal('modal-enter-code'));

  document.getElementById('btn-cancel-code').addEventListener('click', () => hideModal('modal-enter-code'));

  document.getElementById('btn-confirm-code').addEventListener('click', () => {
    let raw = document.getElementById('code-input').value.trim();
    if (!raw) { showToast('Cole o código primeiro!', 'error'); return; }
    // Accept full URL with #config= or just the raw code
    const match = raw.match(/[#&?]?config=([A-Za-z0-9\-_]+)/);
    if (match) raw = match[1];
    const config = decodeConfig(raw);
    if (!config || !config.categories.length) {
      showToast('Código inválido. Verifique e tente novamente.', 'error');
      return;
    }
    applyConfig(config);
    hideModal('modal-enter-code');
    renderPlayersScreen();
    showScreen('screen-players');
  });
}

/* ════════════════════════════════════════════
   SCREEN: SETUP
   ════════════════════════════════════════════ */
let _setupSelectedIds = ['cep', 1, 2, 6, 7, 8, 9, 10];
let _setupRounds = 5;
let _customCats = [];

function renderSetupScreen() {
  _setupSelectedIds = ['cep', 1, 2, 6, 7, 8, 9, 10];
  _setupRounds = 5;
  _customCats = JSON.parse(localStorage.getItem('stop_custom_cats') || '[]');
  renderPresetGrid();
  renderAllCats('');
  renderCustomCats();
  renderSelectedChips();
  renderRoundsSelector();
}

function initSetupScreen() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Back
  document.getElementById('btn-setup-back').addEventListener('click', () => showScreen('screen-home'));

  // Share
  document.getElementById('btn-share-setup').addEventListener('click', openShareModal);

  // Next
  document.getElementById('btn-setup-next').addEventListener('click', () => {
    if (_setupSelectedIds.length === 0) {
      showToast('Selecione pelo menos uma categoria!', 'error');
      return;
    }
    applyConfig({
      categories: _setupSelectedIds,
      customCategories: _customCats,
      roundCount: _setupRounds,
    });
    renderPlayersScreen();
    showScreen('screen-players');
  });

  // Category search
  document.getElementById('cat-search-input').addEventListener('input', e => {
    renderAllCats(e.target.value);
  });

  // Rounds selector
  document.getElementById('rounds-selector').addEventListener('click', e => {
    const btn = e.target.closest('.rounds-btn');
    if (!btn) return;
    _setupRounds = parseInt(btn.dataset.rounds, 10);
    renderRoundsSelector();
  });

  // Add custom cat
  document.getElementById('btn-add-custom').addEventListener('click', addCustomCat);
  document.getElementById('custom-cat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addCustomCat();
  });
}

function addCustomCat() {
  const input = document.getElementById('custom-cat-input');
  const name = input.value.trim();
  if (!name) return;
  if (_customCats.find(c => c.name.toLowerCase() === name.toLowerCase())) {
    showToast('Categoria já existe!', 'error');
    return;
  }
  const id = `custom_${Date.now()}`;
  _customCats.push({ id, name });
  localStorage.setItem('stop_custom_cats', JSON.stringify(_customCats));
  _setupSelectedIds.push(id);
  input.value = '';
  renderCustomCats();
  renderSelectedChips();
  showToast(`"${name}" adicionada!`, 'success');
}

function renderPresetGrid() {
  const grid = document.getElementById('preset-grid');
  grid.innerHTML = '';
  PRESETS.forEach(preset => {
    const card = document.createElement('div');
    card.className = 'preset-card';
    card.style.setProperty('--preset-color', preset.color);
    card.innerHTML = `
      <div class="preset-icon" style="background:${preset.color}">
        <i class="fa-solid ${preset.icon}"></i>
      </div>
      <div class="preset-name">${preset.name}</div>
      <div class="preset-desc">${preset.description}</div>
      <div class="preset-count"><i class="fa-solid fa-list-check"></i> ${preset.categories.length} categorias</div>
    `;
    card.addEventListener('click', () => {
      _setupSelectedIds = [...preset.categories];
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      renderAllCats(document.getElementById('cat-search-input').value);
      renderSelectedChips();
    });
    grid.appendChild(card);
  });
}

function renderAllCats(query) {
  const list = document.getElementById('all-cat-list');
  list.innerHTML = '';
  const q = query.toLowerCase();

  const items = [COMPOSITE_CEP, ...CATEGORIES].filter(cat =>
    !q || cat.name.toLowerCase().includes(q)
  );

  items.forEach(cat => {
    const selected = _setupSelectedIds.includes(cat.id);
    const item = document.createElement('div');
    item.className = `cat-item${selected ? ' selected' : ''}`;
    item.innerHTML = `
      <div class="cat-item-icon"><i class="fa-solid ${cat.icon}"></i></div>
      <div class="cat-item-name">${cat.name}</div>
      <div class="cat-item-check"><i class="fa-solid fa-check"></i></div>
    `;
    item.addEventListener('click', () => {
      if (_setupSelectedIds.includes(cat.id)) {
        _setupSelectedIds = _setupSelectedIds.filter(i => i !== cat.id);
        item.classList.remove('selected');
      } else {
        _setupSelectedIds.push(cat.id);
        item.classList.add('selected');
      }
      renderSelectedChips();
    });
    list.appendChild(item);
  });
}

function renderCustomCats() {
  const list = document.getElementById('custom-cat-list');
  list.innerHTML = '';
  if (_customCats.length === 0) {
    list.innerHTML = '<p class="text-muted text-sm" style="padding:0.5rem 0">Nenhuma categoria personalizada ainda.</p>';
    return;
  }
  _customCats.forEach(cat => {
    const selected = _setupSelectedIds.includes(cat.id);
    const item = document.createElement('div');
    item.className = `cat-item${selected ? ' selected' : ''}`;
    item.innerHTML = `
      <div class="cat-item-icon"><i class="fa-solid fa-star"></i></div>
      <div class="cat-item-name">${cat.name}</div>
      <button class="btn btn-icon" data-del="${cat.id}" style="width:32px;height:32px;border-radius:8px;background:transparent;color:var(--color-danger);min-height:unset;" title="Remover">
        <i class="fa-solid fa-trash"></i>
      </button>
      <div class="cat-item-check"><i class="fa-solid fa-check"></i></div>
    `;
    item.querySelector('[data-del]').addEventListener('click', e => {
      e.stopPropagation();
      _customCats = _customCats.filter(c => c.id !== cat.id);
      _setupSelectedIds = _setupSelectedIds.filter(i => i !== cat.id);
      localStorage.setItem('stop_custom_cats', JSON.stringify(_customCats));
      renderCustomCats();
      renderSelectedChips();
    });
    item.addEventListener('click', e => {
      if (e.target.closest('[data-del]')) return;
      if (_setupSelectedIds.includes(cat.id)) {
        _setupSelectedIds = _setupSelectedIds.filter(i => i !== cat.id);
        item.classList.remove('selected');
      } else {
        _setupSelectedIds.push(cat.id);
        item.classList.add('selected');
      }
      renderSelectedChips();
    });
    list.appendChild(item);
  });
}

function renderSelectedChips() {
  const wrap = document.getElementById('selected-chips');
  wrap.innerHTML = '';
  _setupSelectedIds.forEach(id => {
    const cat = id === 'cep' ? COMPOSITE_CEP
              : CATEGORIES.find(c => c.id === id)
              || _customCats.find(c => c.id === id);
    if (!cat) return;
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `
      <i class="fa-solid ${cat.icon}" style="font-size:0.7rem;color:var(--color-primary)"></i>
      <span>${cat.name}</span>
      <i class="fa-solid fa-xmark chip-remove"></i>
    `;
    chip.addEventListener('click', () => {
      _setupSelectedIds = _setupSelectedIds.filter(i => i !== id);
      renderSelectedChips();
      renderAllCats(document.getElementById('cat-search-input').value);
    });
    wrap.appendChild(chip);
  });
}

function renderRoundsSelector() {
  document.querySelectorAll('.rounds-btn').forEach(btn => {
    btn.classList.toggle('selected', parseInt(btn.dataset.rounds, 10) === _setupRounds);
  });
}

/* ════════════════════════════════════════════
   MODAL: Share
   ════════════════════════════════════════════ */
function openShareModal() {
  const config = {
    categories: _setupSelectedIds,
    customCategories: _customCats,
    roundCount: _setupRounds,
  };
  const url = buildShareURL(config);
  const code = encodeConfig(config);
  document.getElementById('share-code-display').textContent = code;
  showModal('modal-share');

  document.getElementById('btn-share-whatsapp').onclick = async () => {
    const ok = await shareURL(url);
    showToast(ok ? 'Link compartilhado!' : 'Link copiado!', 'success');
  };

  document.getElementById('btn-copy-link').onclick = async () => {
    await copyToClipboard(url);
    showToast('Link copiado!', 'success');
  };
}

document.getElementById('btn-close-share').addEventListener('click', () => hideModal('modal-share'));

/* ════════════════════════════════════════════
   SCREEN: PLAYERS
   ════════════════════════════════════════════ */
function renderPlayersScreen() {
  const state = getState();
  document.getElementById('config-cats-count').textContent =
    state.config.categories.length + (state.config.customCategories?.length || 0);
  document.getElementById('config-rounds-count').textContent =
    state.config.roundCount === 0 ? 'Livre (sem limite)' : state.config.roundCount + ' rodadas';
}

function initPlayersScreen() {
  document.getElementById('btn-players-back').addEventListener('click', () => {
    renderSetupScreen();
    showScreen('screen-setup');
  });

  document.getElementById('btn-start-game').addEventListener('click', () => {
    const name = document.getElementById('player-name-input').value.trim();
    if (!name) { showToast('Digite seu nome!', 'error'); return; }
    setPlayerName(name);
    renderLetterScreen();
    showScreen('screen-letter');
  });
}

/* ════════════════════════════════════════════
   SCREEN: LETTER
   ════════════════════════════════════════════ */
let _spinning = false;
let _spinInterval = null;

function renderLetterScreen() {
  const state = getState();
  const round = state.currentRound;

  document.getElementById('letter-round-label').textContent =
    state.config.roundCount === 0
      ? `Rodada ${round.number}`
      : `Rodada ${round.number} de ${state.config.roundCount}`;

  document.getElementById('letter-display').textContent = round.letter || '?';
  document.getElementById('letter-number-input').value = '';
  document.getElementById('letter-number-result').textContent = '—';

  renderRoundDots('letter-round-dots', round.number, state.config.roundCount, state.rounds.length);
  renderUsedLetters(round.usedLetters);

  const btnStart = document.getElementById('btn-start-round');
  btnStart.disabled = !round.letter;
}

function renderRoundDots(containerId, current, total, done) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (total === 0) {
    for (let i = 1; i <= done; i++) {
      const dot = document.createElement('div');
      dot.className = 'round-dot done';
      container.appendChild(dot);
    }
    const cur = document.createElement('div');
    cur.className = 'round-dot current';
    container.appendChild(cur);
    return;
  }

  for (let i = 1; i <= total; i++) {
    const dot = document.createElement('div');
    dot.className = 'round-dot';
    if (i <= done) dot.classList.add('done');
    else if (i === current) dot.classList.add('current');
    container.appendChild(dot);
  }
}

function renderUsedLetters(usedLetters) {
  const wrap = document.getElementById('used-letters-display');
  wrap.innerHTML = '';
  ALPHABET.split('').forEach(letter => {
    const badge = document.createElement('div');
    badge.className = `used-letter-badge${usedLetters.includes(letter) ? ' used' : ''}`;
    badge.textContent = letter;
    wrap.appendChild(badge);
  });
}

function initLetterScreen() {
  document.getElementById('btn-draw-letter').addEventListener('click', () => {
    if (_spinning) return;
    _spinning = true;
    const display = document.getElementById('letter-display');
    display.classList.add('spinning');

    let count = 0;
    _spinInterval = setInterval(() => {
      display.textContent = ALPHABET[Math.floor(Math.random() * 26)];
      count++;
      if (count >= 18) {
        clearInterval(_spinInterval);
        _spinning = false;
        display.classList.remove('spinning');
        const letter = drawRandomLetter();
        setLetter(letter);
        display.textContent = letter;
        document.getElementById('btn-start-round').disabled = false;
      }
    }, 80);
  });

  document.getElementById('letter-number-input').addEventListener('input', e => {
    const n = parseInt(e.target.value, 10);
    if (!isNaN(n) && n > 0) {
      const letter = getLetterByNumber(n);
      document.getElementById('letter-number-result').textContent = letter;
      setLetter(letter);
      document.getElementById('letter-display').textContent = letter;
      document.getElementById('btn-start-round').disabled = false;
    } else {
      document.getElementById('letter-number-result').textContent = '—';
    }
  });

  document.getElementById('btn-start-round').addEventListener('click', () => {
    renderGameScreen();
    showScreen('screen-game');
  });
}

/* ════════════════════════════════════════════
   SCREEN: GAME
   ════════════════════════════════════════════ */
function renderGameScreen() {
  const state = getState();
  const cats = getAllCategoriesForRound();

  document.getElementById('game-letter-badge').textContent = state.currentRound.letter;
  document.getElementById('game-round-num').textContent =
    state.config.roundCount === 0
      ? `${state.currentRound.number}`
      : `${state.currentRound.number}/${state.config.roundCount}`;

  const rows = document.getElementById('category-rows');
  rows.innerHTML = '';

  cats.forEach(cat => {
    if (cat.composite) {
      const row = document.createElement('div');
      row.className = 'category-row';
      row.innerHTML = `
        <div class="category-row-icon"><i class="fa-solid ${cat.icon}"></i></div>
        <div class="cep-inputs">
          ${cat.parts.map((part, i) => `
            <div class="cep-input-row">
              <span class="cep-input-label">${part.split(' ')[0]}</span>
              <input type="text" class="game-input"
                     id="input_${cat.id}_${i}"
                     data-cat="${cat.id}_${i}"
                     placeholder="${part}…"
                     autocomplete="off" autocorrect="off" autocapitalize="words"
                     value="${escapeAttr(state.currentRound.answers[`${cat.id}_${i}`] || '')}" />
            </div>
          `).join('')}
        </div>
      `;
      rows.appendChild(row);
    } else {
      const row = document.createElement('div');
      row.className = 'category-row';
      row.innerHTML = `
        <div class="category-row-icon"><i class="fa-solid ${cat.icon}"></i></div>
        <span class="category-row-label">${cat.name}</span>
        <input type="text" class="game-input"
               id="input_${cat.id}"
               data-cat="${cat.id}"
               placeholder="${state.currentRound.letter}…"
               autocomplete="off" autocorrect="off" autocapitalize="words"
               value="${escapeAttr(state.currentRound.answers[cat.id] || '')}" />
      `;
      rows.appendChild(row);
    }
  });

  rows.querySelectorAll('.game-input').forEach(input => {
    input.addEventListener('input', () => saveAnswer(input.dataset.cat, input.value));
  });
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

function initGameScreen() {
  document.getElementById('btn-stop').addEventListener('click', () => showModal('modal-stop-confirm'));
  document.getElementById('btn-cancel-stop').addEventListener('click', () => hideModal('modal-stop-confirm'));
  document.getElementById('btn-confirm-stop').addEventListener('click', () => {
    hideModal('modal-stop-confirm');
    lockRound();
    // Disable all inputs
    document.querySelectorAll('.game-input').forEach(i => i.disabled = true);
    renderScoringScreen();
    showScreen('screen-scoring');
  });
}

/* ════════════════════════════════════════════
   SCREEN: SCORING
   ════════════════════════════════════════════ */
function renderScoringScreen() {
  const state = getState();
  const cats = getAllCategoriesForRound();

  buildScoreRows(cats, state.currentRound.answers, state.currentRound.scores, (id) => {
    const current = state.currentRound.scores[id] ?? 0;
    const next = cycleScore(current);
    setScore(id, next);
    updateTotalDisplay();
    return next;
  });

  updateTotalDisplay();
}

function updateTotalDisplay() {
  const total = getRoundTotal();
  document.getElementById('scoring-total').textContent = `${total} pts`;
}

function initScoringScreen() {
  document.getElementById('btn-confirm-scoring').addEventListener('click', () => {
    confirmRound();
    renderRoundResultScreen();
    showScreen('screen-round-result');
  });
}

/* ════════════════════════════════════════════
   SCREEN: ROUND RESULT
   ════════════════════════════════════════════ */
function renderRoundResultScreen() {
  const state = getState();
  const lastRound = state.rounds[state.rounds.length - 1];

  document.getElementById('rr-round-label').textContent =
    state.config.roundCount === 0
      ? `Rodada ${lastRound.number}`
      : `Rodada ${lastRound.number} de ${state.config.roundCount}`;
  document.getElementById('rr-score').textContent = lastRound.roundTotal;
  document.getElementById('rr-total').textContent = `${state.player.totalScore} pts`;

  const breakdown = document.getElementById('rr-breakdown');
  breakdown.innerHTML = '';

  const cats = getAllCategoriesForRound();
  cats.forEach(cat => {
    const renderBreakdownRow = (id, label) => {
      const answer = (lastRound.answers[id] || '').trim();
      const pts    = lastRound.scores[id] ?? 0;
      const row = document.createElement('div');
      row.className = 'round-breakdown-row';
      row.innerHTML = `
        <span class="round-breakdown-cat">${label}</span>
        <span class="round-breakdown-answer">${answer || '<em style="opacity:.5">sem resposta</em>'}</span>
        <span class="round-breakdown-pts pts-${pts}">${pts}</span>
      `;
      breakdown.appendChild(row);
    };

    if (cat.composite) {
      cat.parts.forEach((part, i) => renderBreakdownRow(`${cat.id}_${i}`, `${cat.name} — ${part}`));
    } else {
      renderBreakdownRow(cat.id, cat.name);
    }
  });

  if (lastRound.roundTotal > 0) launchConfetti();

  const actions = document.getElementById('rr-actions');
  actions.innerHTML = '';

  if (isGameOver()) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary btn-full';
    btn.innerHTML = '<i class="fa-solid fa-trophy"></i> Ver Resultado Final';
    btn.addEventListener('click', () => { renderFinalScreen(); showScreen('screen-final'); });
    actions.appendChild(btn);
  } else {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary btn-full';
    btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Próxima Rodada';
    btn.addEventListener('click', () => { renderLetterScreen(); showScreen('screen-letter'); });
    actions.appendChild(btn);

    if (state.config.roundCount === 0) {
      const btnEnd = document.createElement('button');
      btnEnd.className = 'btn btn-ghost btn-full';
      btnEnd.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Encerrar Jogo';
      btnEnd.addEventListener('click', () => { renderFinalScreen(); showScreen('screen-final'); });
      actions.appendChild(btnEnd);
    }
  }
}

function initRoundResultScreen() {}

/* ════════════════════════════════════════════
   SCREEN: FINAL
   ════════════════════════════════════════════ */
function renderFinalScreen() {
  const state = getState();

  // Single player — show their total
  document.getElementById('final-winner-name').textContent = state.player.name || 'Você';
  document.getElementById('final-winner-score').textContent = `${state.player.totalScore} pts`;

  const ranking = document.getElementById('final-ranking');
  ranking.innerHTML = '';

  // Show round history
  const histTitle = document.createElement('h3');
  histTitle.innerHTML = '<i class="fa-solid fa-chart-bar"></i> Histórico de Rodadas';
  ranking.appendChild(histTitle);

  state.rounds.forEach(r => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-body">
        <div class="flex justify-between items-center">
          <strong style="font-family:'Fredoka One',cursive">Rodada ${r.number} — <span style="color:var(--color-primary)">${r.letter}</span></strong>
          <span style="font-family:'Fredoka One',cursive;color:var(--color-success);font-size:1.2rem">+${r.roundTotal} pts</span>
        </div>
      </div>
    `;
    ranking.appendChild(card);
  });

  launchConfetti();
}

function initFinalScreen() {
  document.getElementById('btn-play-again').addEventListener('click', () => {
    resetGame();
    renderLetterScreen();
    showScreen('screen-letter');
  });

  document.getElementById('btn-new-game-final').addEventListener('click', () => {
    fullReset();
    showScreen('screen-home');
  });
}

/* ════════════════════════════════════════════
   Confetti (lightweight canvas implementation)
   ════════════════════════════════════════════ */
let _confettiAnim = null;

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#6C63FF', '#FF6584', '#43D9AD', '#FFD166', '#EF476F', '#06D6A0', '#54A0FF'];
  const pieces = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 8 + 4,
    d: Math.random() * 2 + 1,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.05,
  }));

  if (_confettiAnim) cancelAnimationFrame(_confettiAnim);

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.tiltAngle += p.tiltSpeed;
      p.y += p.d;
      p.tilt = Math.sin(p.tiltAngle) * 12;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      ctx.ellipse(p.x + p.tilt, p.y, p.r / 2, p.r, p.tiltAngle, 0, Math.PI * 2);
      ctx.fill();
    });
    frame++;
    if (frame < 200) _confettiAnim = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  _confettiAnim = requestAnimationFrame(draw);
}

/* ════════════════════════════════════════════
   Overlay clicks to close modals
   ════════════════════════════════════════════ */
['modal-enter-code', 'modal-share', 'modal-stop-confirm'].forEach(id => {
  document.getElementById(id).addEventListener('click', e => {
    if (e.target === e.currentTarget) hideModal(id);
  });
});
