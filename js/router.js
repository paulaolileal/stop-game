const SCREENS = [
  'screen-home',
  'screen-setup',
  'screen-players',
  'screen-letter',
  'screen-game',
  'screen-scoring',
  'screen-round-result',
  'screen-final',
];

let currentScreen = 'screen-home';

function showScreen(id) {
  if (!SCREENS.includes(id)) return;
  SCREENS.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.remove('active');
  });
  const next = document.getElementById(id);
  if (next) {
    next.classList.add('active');
    next.scrollTop = 0;
  }
  currentScreen = id;
}

function getCurrentScreen() {
  return currentScreen;
}
