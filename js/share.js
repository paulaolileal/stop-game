function encodeConfig(config) {
  const payload = {
    c: config.categories,
    x: config.customCategories.map(cc => cc.name),
    r: config.roundCount,
  };
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function decodeConfig(code) {
  try {
    const padded = code.replace(/-/g, '+').replace(/_/g, '/');
    const remainder = padded.length % 4;
    const padded2 = remainder ? padded + '===='.slice(remainder) : padded;
    const json = decodeURIComponent(escape(atob(padded2)));
    const payload = JSON.parse(json);
    return {
      categories: payload.c || [],
      customCategories: (payload.x || []).map((name, i) => ({ id: `custom_${i}`, name })),
      roundCount: payload.r != null ? payload.r : 5,
    };
  } catch {
    return null;
  }
}

function buildShareURL(config) {
  const code = encodeConfig(config);
  const base = window.location.origin + window.location.pathname;
  return `${base}#config=${code}`;
}

function extractConfigFromURL() {
  const hash = window.location.hash;
  const match = hash.match(/[#&]config=([^&]+)/);
  if (!match) return null;
  return decodeConfig(match[1]);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}

async function shareURL(url, title = 'Stop! — Jogo de Adedanha') {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return true;
    } catch {
      // user cancelled or not supported
    }
  }
  return copyToClipboard(url);
}
