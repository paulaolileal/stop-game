const STORAGE_KEY = 'stop_game_state';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const defaultState = () => ({
  config: {
    categories: [],
    customCategories: [],
    roundCount: 5,
  },
  player: {
    name: '',
    totalScore: 0,
  },
  rounds: [],
  currentRound: {
    number: 1,
    letter: null,
    usedLetters: [],
    answers: {},
    scores: {},
  },
});

let _state = defaultState();

function getState() {
  return _state;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) _state = JSON.parse(raw);
  } catch {
    _state = defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  } catch {
    // storage full or unavailable — continue without persisting
  }
}

function resetGame() {
  const config = _state.config;
  const playerName = _state.player.name;
  _state = defaultState();
  _state.config = config;
  _state.player.name = playerName;
  saveState();
}

function fullReset() {
  _state = defaultState();
  saveState();
}

function applyConfig(config) {
  _state.config = {
    categories: config.categories || [],
    customCategories: config.customCategories || [],
    roundCount: config.roundCount != null ? config.roundCount : 5,
  };
  saveState();
}

function setPlayerName(name) {
  _state.player.name = name.trim();
  saveState();
}

function setLetter(letter) {
  _state.currentRound.letter = letter;
  saveState();
}

function getLetterByNumber(n) {
  const idx = (((n - 1) % 26) + 26) % 26;
  return ALPHABET[idx];
}

function drawRandomLetter() {
  const used = _state.currentRound.usedLetters;
  const available = ALPHABET.split('').filter(l => !used.includes(l));
  if (available.length === 0) return ALPHABET[Math.floor(Math.random() * 26)];
  return available[Math.floor(Math.random() * available.length)];
}

function saveAnswer(categoryId, value) {
  _state.currentRound.answers[categoryId] = value;
  saveState();
}

function lockRound() {
  _state.currentRound.usedLetters = [
    ..._state.currentRound.usedLetters,
    _state.currentRound.letter,
  ];
  saveState();
}

function setScore(categoryId, points) {
  _state.currentRound.scores[categoryId] = points;
  saveState();
}

function getRoundTotal() {
  return Object.values(_state.currentRound.scores).reduce((sum, p) => sum + p, 0);
}

function confirmRound() {
  const total = getRoundTotal();
  _state.player.totalScore += total;

  _state.rounds.push({
    number: _state.currentRound.number,
    letter: _state.currentRound.letter,
    answers: { ..._state.currentRound.answers },
    scores:  { ..._state.currentRound.scores },
    roundTotal: total,
  });

  const nextNum = _state.currentRound.number + 1;
  const usedLetters = [..._state.currentRound.usedLetters];

  _state.currentRound = {
    number: nextNum,
    letter: null,
    usedLetters,
    answers: {},
    scores: {},
  };

  saveState();
}

function isGameOver() {
  return _state.config.roundCount > 0 && _state.rounds.length >= _state.config.roundCount;
}

function getAllCategoriesForRound() {
  const { categories, customCategories } = _state.config;
  const resolved = categories.map(id => {
    if (id === 'cep') return COMPOSITE_CEP;
    return getCategoryById(id);
  }).filter(Boolean);

  const customs = (customCategories || []).map(cc => ({
    id: cc.id,
    name: cc.name,
    icon: 'fa-star',
    custom: true,
  }));

  return [...resolved, ...customs];
}
