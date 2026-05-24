// ============================================================
// Tarayıcı-bağımsız OAuth katmanı
//  - Chrome: chrome.identity.getAuthToken (mevcut davranış, mantık AYNEN korundu)
//  - Firefox: browser.identity.launchWebAuthFlow (implicit flow + token cache)
// background.js (service worker / event page) ve options.js bu fonksiyonları kullanır.
// ============================================================

// Firefox için Google Cloud "Web application" client ID'si.
// (Chrome'unkinden FARKLI bir client; bkz. docs/firefox-setup.md)
const FIREFOX_OAUTH = {
  clientId: '875793692307-00l7h555v4jots8ndrqre07l8en45p4c.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
};

// Chrome'da getAuthToken var; Firefox'ta yok (alias olsa da implement edilmemiş)
const HAS_GET_AUTH_TOKEN =
  typeof chrome !== 'undefined' &&
  chrome.identity &&
  typeof chrome.identity.getAuthToken === 'function';

// WebExtension identity API'si (Firefox: browser.*, fallback: chrome.*)
function identityApi() {
  return (typeof browser !== 'undefined' ? browser : chrome).identity;
}

// ---- Ortak giriş noktası ----
function getToken(interactive = false) {
  return HAS_GET_AUTH_TOKEN ? getTokenChrome(interactive) : getTokenFirefox(interactive);
}

// ---- Chrome (değiştirilmedi) ----
function getTokenChrome(interactive) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(new Error(chrome.runtime.lastError?.message || 'Token alınamadı'));
      } else {
        resolve(token);
      }
    });
  });
}

// ---- Firefox: launchWebAuthFlow (implicit flow) ----
async function getTokenFirefox(interactive) {
  const cached = await getCachedFirefoxToken();
  if (cached) return cached;
  if (!interactive) throw new Error('Token yok — önce bağlan');

  const redirectUri = identityApi().getRedirectURL();
  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth' +
    '?client_id=' + encodeURIComponent(FIREFOX_OAUTH.clientId) +
    '&response_type=token' +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&scope=' + encodeURIComponent(FIREFOX_OAUTH.scopes.join(' '));

  const redirect = await identityApi().launchWebAuthFlow({ interactive: true, url: authUrl });
  const parsed = parseFragment(redirect);
  if (!parsed.access_token) throw new Error('Token alınamadı (Firefox)');

  await cacheFirefoxToken(parsed.access_token, parseInt(parsed.expires_in || '3600', 10));
  return parsed.access_token;
}

// Redirect URL'inin #fragment'ından access_token/expires_in ayıkla
function parseFragment(url) {
  const out = {};
  const hash = (url || '').split('#')[1] || '';
  for (const part of hash.split('&')) {
    const [k, v] = part.split('=');
    if (k) out[k] = decodeURIComponent(v || '');
  }
  return out;
}

async function getCachedFirefoxToken() {
  const { ff_token } = await chrome.storage.local.get('ff_token');
  // 60 sn tampon ile geçerliyse döndür
  if (ff_token && ff_token.expiry > Date.now() + 60000) return ff_token.value;
  return null;
}

async function cacheFirefoxToken(value, expiresInSec) {
  await chrome.storage.local.set({
    ff_token: { value, expiry: Date.now() + expiresInSec * 1000 }
  });
}

// ---- Token iptal (her iki tarayıcı) ----
async function revokeToken(token) {
  if (HAS_GET_AUTH_TOKEN) {
    await new Promise((resolve) => {
      chrome.identity.removeCachedAuthToken({ token }, () => {
        fetch('https://oauth2.googleapis.com/revoke?token=' + token, { method: 'POST' })
          .finally(resolve);
      });
    });
  } else {
    await chrome.storage.local.remove('ff_token');
    try {
      await fetch('https://oauth2.googleapis.com/revoke?token=' + token, { method: 'POST' });
    } catch { /* yoksay */ }
  }
}
