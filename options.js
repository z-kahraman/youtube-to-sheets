// getToken()/revokeToken() → auth.js; t()/loadLang()/setLang() → strings.js
// (options.html'de options.js'ten önce yüklenirler)

// ============================================================
// Helper: Toast bildirim
// ============================================================
function toast(message, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = type;
  el.classList.remove('hidden');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}

// ============================================================
// Tema (auto / light / dark) — dil gibi storage.sync'te saklanır
// ============================================================
const VALID_THEMES = ['auto', 'light', 'dark'];

async function loadTheme() {
  let theme = 'auto';
  try {
    ({ theme } = await chrome.storage.sync.get('theme'));
  } catch { /* storage yok → auto */ }
  return VALID_THEMES.includes(theme) ? theme : 'auto';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

async function setTheme(theme) {
  applyTheme(theme);
  try { await chrome.storage.sync.set({ theme }); } catch {}
}

// Düğmeyi işlem boyunca kilitle; eski haline döndüren fonksiyonu verir
function setBusy(btn, busyText) {
  const prev = btn.textContent;
  btn.disabled = true;
  btn.textContent = busyText;
  return () => { btn.disabled = false; btn.textContent = prev; };
}

// ============================================================
// Google API çağrıları
// ============================================================
async function getUserEmail(token) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.email;
}

async function createSheet(token, name) {
  const tabName = t('tabName');

  // 1) Sheet'i oluştur (sekme adı seçili dile göre)
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title: name },
      sheets: [{ properties: { title: tabName } }]
    })
  });
  if (!createRes.ok) throw new Error(`Sheet oluşturulamadı: ${createRes.status}`);
  const sheet = await createRes.json();

  // 2) Header satırını seçili dile göre yaz
  const range = `${encodeURIComponent(tabName)}!A1:J1`;
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheet.spreadsheetId}` +
    `/values/${range}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: [t('headers')] })
    }
  );

  return { id: sheet.spreadsheetId, name };
}

// ============================================================
// Storage helpers
// ============================================================
const setSelectedSheet = (id, name) =>
  chrome.storage.sync.set({ selectedSheet: { id, name } });

const getSelectedSheet = async () => {
  const { selectedSheet } = await chrome.storage.sync.get('selectedSheet');
  return selectedSheet;
};

const clearSelectedSheet = () => chrome.storage.sync.remove('selectedSheet');

// drive.file scope'u yalnızca uygulamanın oluşturduğu dosyalara erişir;
// bu yüzden "tüm sheet'leri listele" yerine kendi oluşturduklarımızı tutarız.
const getCreatedSheets = async () => {
  const { createdSheets } = await chrome.storage.sync.get('createdSheets');
  return createdSheets || [];
};

const addCreatedSheet = async (id, name) => {
  const list = await getCreatedSheets();
  if (!list.some((s) => s.id === id)) {
    list.unshift({ id, name });
    await chrome.storage.sync.set({ createdSheets: list });
  }
};

// ============================================================
// UI render
// ============================================================
const show = (id) => document.getElementById(id).classList.remove('hidden');
const hide = (id) => document.getElementById(id).classList.add('hidden');

// Sabit metinleri seçili dile göre uygula
function applyI18n() {
  document.title = t('optionsTitle');
  document.documentElement.lang = currentLang();
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.getElementById('new-sheet-name').placeholder = t('defaultSheetName');
  // Gizlilik bağlantısı GitHub'daki dosyaya (build paketinde olmayabilir +
  // GitHub markdown'ı düzgün render eder; ham .md yerel olarak açılmıyordu)
  const privacyBase = 'https://github.com/z-kahraman/youtube-to-sheets/blob/main/';
  document.getElementById('privacy-link').href =
    privacyBase + (currentLang() === 'tr' ? 'PRIVACY.md' : 'PRIVACY.en.md');
}

async function refreshUI() {
  // Bağlı mı? (interactive=false → popup açmadan dene)
  let token = null;
  try { token = await getToken(false); } catch { /* bağlı değil */ }

  if (!token) {
    show('not-connected');
    hide('connected');
    hide('sheet-section');
    return;
  }

  // Bağlı durumu
  hide('not-connected');
  show('connected');
  show('sheet-section');

  try {
    const email = await getUserEmail(token);
    document.getElementById('user-email').textContent = email;
    document.getElementById('user-avatar').textContent = (email.trim()[0] || '?').toUpperCase();
  } catch {
    document.getElementById('user-email').textContent = t('emailFail');
    document.getElementById('user-avatar').textContent = '?';
  }

  // Seçili sheet var mı?
  const selected = await getSelectedSheet();
  if (selected) {
    show('current-sheet');
    hide('sheet-picker');
    document.getElementById('selected-sheet-name').textContent = selected.name;
    document.getElementById('open-sheet-btn').href =
      `https://docs.google.com/spreadsheets/d/${selected.id}/edit`;
  } else {
    hide('current-sheet');
    show('sheet-picker');
    await loadSheetList();
  }
}

// Uygulamanın daha önce oluşturduğu sheet'leri listele (storage'dan)
async function loadSheetList() {
  const select = document.getElementById('sheet-list');
  select.innerHTML = '';

  const sheets = await getCreatedSheets();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = sheets.length ? t('selectSheet') : t('noSheetsYet');
  select.appendChild(placeholder);

  sheets.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    select.appendChild(opt);
  });
}

// ============================================================
// Event listeners
// ============================================================
document.getElementById('lang-select').addEventListener('change', async (e) => {
  await setLang(e.target.value);
  applyI18n();
  await refreshUI();
});

document.getElementById('theme-select').addEventListener('change', (e) => {
  setTheme(e.target.value);
});

document.getElementById('connect-btn').addEventListener('click', async (e) => {
  const restore = setBusy(e.currentTarget, t('connecting'));
  try {
    await getToken(true);
    toast(t('connected'));
    await refreshUI();
  } catch (err) {
    toast(t('connectError') + err.message, 'error');
  } finally {
    restore();
  }
});

document.getElementById('disconnect-btn').addEventListener('click', async () => {
  try {
    const token = await getToken(false);
    await revokeToken(token);
  } catch {}
  await clearSelectedSheet();
  toast(t('disconnected'));
  await refreshUI();
});

document.getElementById('use-selected-btn').addEventListener('click', async () => {
  const select = document.getElementById('sheet-list');
  const id = select.value;
  if (!id) {
    toast(t('selectFirst'), 'error');
    return;
  }
  const name = select.options[select.selectedIndex].textContent;
  await setSelectedSheet(id, name);
  toast(t('selected') + name);
  await refreshUI();
});

document.getElementById('change-sheet-btn').addEventListener('click', async () => {
  await clearSelectedSheet();
  await refreshUI();
});

document.getElementById('create-sheet-btn').addEventListener('click', async (e) => {
  const name = document.getElementById('new-sheet-name').value.trim() || t('defaultSheetName');
  const restore = setBusy(e.currentTarget, t('creatingSheet'));
  try {
    const token = await getToken(true);
    const sheet = await createSheet(token, name);
    await addCreatedSheet(sheet.id, sheet.name);
    await setSelectedSheet(sheet.id, sheet.name);
    toast(t('sheetCreated'));
    await refreshUI();
  } catch (err) {
    toast(t('createError') + err.message, 'error');
  } finally {
    restore();
  }
});

// ============================================================
// İlk yükleme: dili yükle → metinleri uygula → UI
// ============================================================
async function init() {
  await loadLang();
  const theme = await loadTheme();
  applyTheme(theme);
  document.getElementById('theme-select').value = theme;
  document.getElementById('lang-select').value = currentLang();
  document.getElementById('app-version').textContent = 'v' + chrome.runtime.getManifest().version;
  applyI18n();
  await refreshUI();
}

init();
