// Chrome service worker'da ortak katmanları yükle.
// (Firefox'ta background.scripts bunları zaten ayrı yükler; orada importScripts yok.)
if (typeof importScripts === 'function') {
  importScripts('auth.js', 'strings.js');
}

// Video sayfası mı? (watch veya shorts)
function isVideoUrl(url) {
  return typeof url === 'string' &&
    /^https:\/\/www\.youtube\.com\/(watch|shorts\/)/.test(url);
}

// tabs.sendMessage'ın promise sarmalayıcısı (Firefox'ta chrome.* promise döndürmez)
function sendToTab(tabId, msg) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, msg, () => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve();
    });
  });
}

// Sağ tık menüsünü güncel dille (yeniden) oluştur
async function ensureMenu() {
  await loadLang();
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'save-to-sheet',
      title: t('saveToSheet'),
      contexts: ['page'],
      documentUrlPatterns: [
        'https://www.youtube.com/watch*',
        'https://www.youtube.com/shorts/*'
      ]
    });
  });
}

// ============================================================
// Kurulum / açılış
// ============================================================
chrome.runtime.onInstalled.addListener((details) => {
  // onInstalled her GÜNCELLEMEDE de tetiklenir; ayarlar yalnız ilk kurulumda açılsın
  if (details.reason === 'install') chrome.runtime.openOptionsPage();
  ensureMenu();
});

// Tarayıcı açılışında menüyü garanti et (SW / event page yeniden başlar)
chrome.runtime.onStartup.addListener(ensureMenu);

// Dil değişince sağ tık menüsünü güncelle
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.lang) ensureMenu();
});

// Extension ikonu: video sayfasındaysa kartı aç, değilse ayarları aç
chrome.action.onClicked.addListener((tab) => {
  if (tab?.id && isVideoUrl(tab.url)) {
    sendToTab(tab.id, { action: 'openSaveCard' })
      .catch(() => chrome.runtime.openOptionsPage()); // content script yok (eski sekme)
  } else {
    chrome.runtime.openOptionsPage();
  }
});

// Klavye kısayolu (manifest "commands") → aktif sekmede kartı aç
if (chrome.commands?.onCommand) {
  chrome.commands.onCommand.addListener((command) => {
    if (command !== 'open-save-card') return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs?.[0];
      // Video sayfası değilse content script yoktur → hata sessizce yutulur
      if (tab?.id) sendToTab(tab.id, { action: 'openSaveCard' }).catch(() => {});
    });
  });
}

// ============================================================
// Sağ tık menüsü tıklanınca → content script'e kartı aç de
// ============================================================
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-to-sheet' && tab?.id) {
    sendToTab(tab.id, { action: 'openSaveCard' }).catch(() => {});
  }
});

// ============================================================
// Content script'ten gelen istekler
// ============================================================
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.id !== chrome.runtime.id) return; // sadece kendi uzantımızdan gelen mesajları işle
  const tabId = sender.tab?.id;
  if (msg.action === 'saveRow') {
    // İş bitince sonucu tab'a ayrı mesajla push et (yanıt kanalı MV3'te güvenilmez)
    handleSaveRow(msg.data).then(
      () => { if (tabId) sendToTab(tabId, { action: 'saveResult', ok: true }).catch(() => {}); },
      (err) => { if (tabId) sendToTab(tabId, { action: 'saveResult', ok: false, error: err.message }).catch(() => {}); }
    );
  } else if (msg.action === 'lookupRow') {
    // Kart açılırken "bu video zaten kayıtlı mı?" sorgusu (başarısızlık = kayıt yok say)
    handleLookup(msg.url)
      .catch(() => null)
      .then((existing) => {
        if (tabId) sendToTab(tabId, { action: 'lookupResult', url: msg.url, existing }).catch(() => {});
      });
  }
});

// ============================================================
// Yetkili API çağrıları — 401'de token'ı tazeleyip BİR kez daha dener
// ============================================================
async function apiFetch(url, options = {}) {
  let token = await getToken(false);
  const doFetch = (tk) => fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${tk}` }
  });
  let res = await doFetch(token);
  if (res.status === 401) {
    // Cache'teki token süresi dolmuş / iptal edilmiş olabilir
    await invalidateToken(token);
    token = await getToken(false);
    res = await doFetch(token);
  }
  return res;
}

async function apiJson(url, options, errKey) {
  const res = await apiFetch(url, options);
  if (!res.ok) {
    throw new Error(res.status === 401 ? t('authExpired') : `${t(errKey)}: ${res.status}`);
  }
  return res.json();
}

async function getSelectedSheet() {
  const { selectedSheet } = await chrome.storage.sync.get('selectedSheet');
  return selectedSheet;
}

// Append için hedef sekme adı gerek; seçilen sheet'in ilk sekmesini kullan.
// Her kayıtta API'ye sormamak için storage.local'de cache'lenir
// (sekme adı değişirse handleSaveRow 400 alınca fresh:true ile tazeler).
async function getSheetTitle(spreadsheetId, { fresh = false } = {}) {
  const { sheetTitleCache = {} } = await chrome.storage.local.get('sheetTitleCache');
  if (!fresh && sheetTitleCache[spreadsheetId]) return sheetTitleCache[spreadsheetId];
  const data = await apiJson(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    {}, 'errSheetInfo'
  );
  const title = data.sheets?.[0]?.properties?.title || 'Sayfa1';
  sheetTitleCache[spreadsheetId] = title;
  await chrome.storage.local.set({ sheetTitleCache });
  return title;
}

// Sheet'in sonuna yeni satır ekle
async function appendRow(spreadsheetId, sheetTitle, row) {
  const range = encodeURIComponent(`${sheetTitle}!A:J`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}` +
              `/values/${range}:append` +
              `?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  await apiJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [row] })
  }, 'errAppend');
}

// ============================================================
// Durum sütunu: otomatik durumda "geri düşürme" yok
//  - İzlendi > Kısmen izlendi > Açıldı; tam izlenmiş video tekrar açılınca
//    otomatik hesap "Açıldı" derse eski durum korunur.
//  - Kullanıcı kartta durumu ELLE seçtiyse (statusManual) seçimi aynen uygulanır.
//  - Hücredeki eski metin dil değişmiş olsa da tanınır (tüm dillerde aranır).
// ============================================================
const STATUS_RANK = { statusOpened: 0, statusPartial: 1, statusWatched: 2 };

function statusKeyFromText(text) {
  const s = (text || '').trim();
  for (const lang of Object.keys(I18N)) {
    for (const key of Object.keys(STATUS_RANK)) {
      if (I18N[lang][key] === s) return key;
    }
  }
  return null;
}

// Kaydetme akışı (upsert): video sheet'te varsa güncelle, yoksa yeni satır ekle
async function handleSaveRow(data) {
  await loadLang();
  const selected = await getSelectedSheet();
  if (!selected) throw new Error(t('noSheet'));
  // Token düşmüş ve sessiz yenileme başarısızsa (Firefox implicit flow ~1 saat)
  // kullanıcı kaydı kendisi başlattığı için interactive izin penceresi açılabilir.
  // Başarılı olursa token cache'lenir; aşağıdaki apiFetch'ler sessizce devam eder.
  try { await getToken(false); } catch { await getToken(true); }
  try {
    await saveRowTo(selected.id, await getSheetTitle(selected.id), data);
  } catch (e) {
    // Sekme adı değişmişse cache bayattır → 400 (geçersiz aralık); taze adla bir kez daha
    if (!/: 400$/.test(e.message || '')) throw e;
    await saveRowTo(selected.id, await getSheetTitle(selected.id, { fresh: true }), data);
  }
}

async function saveRowTo(spreadsheetId, sheetTitle, data) {
  const now = new Date().toLocaleString(t('dateLocale'));
  const newKey = STATUS_RANK[data.status] !== undefined ? data.status : 'statusOpened';

  // Bu video sheet'te zaten var mı? (URL sütunu = E)
  const rowNumber = await findRowByUrl(spreadsheetId, sheetTitle, data.url);

  if (rowNumber) {
    // VAR → mevcut satırı oku; notu altına ekle, etiketleri birleştir, güncelle
    const old = await getRow(spreadsheetId, sheetTitle, rowNumber);
    const oldKey = statusKeyFromText(old[9]);
    const finalKey = (!data.statusManual && oldKey && STATUS_RANK[oldKey] > STATUS_RANK[newKey])
      ? oldKey : newKey;
    const row = [
      old[0] || now,                     // tarih: ilk kayıt tarihi korunur
      data.title || old[1] || '',
      data.channel || old[2] || '',
      data.channelUrl || old[3] || '',
      data.url,
      data.watchedTime || old[5] || '',  // en güncel izleme süresi
      data.totalTime || old[6] || '',
      mergeNote(old[7], data.note),       // eski notun altına ekle
      // Kart mevcut etiketleri chip olarak yüklediyse (tagsReplace) kartteki set
      // geçerlidir (silinen chip sheet'ten de silinir); aksi halde birleştir.
      data.tagsReplace ? (data.tags || '') : mergeTags(old[8], data.tags),
      t(finalKey)
    ];
    await updateRow(spreadsheetId, sheetTitle, rowNumber, row);
  } else {
    // YOK → yeni satır
    // Sütunlar: Tarih, Başlık, Kanal, Kanal Linki, URL, İzleme Süresi, Toplam Süre, Not, Etiketler, Durum
    const row = [
      now,
      data.title || '',
      data.channel || '',
      data.channelUrl || '',
      data.url || '',
      data.watchedTime || '',
      data.totalTime || '',
      data.note || '',
      data.tags || '',
      t(newKey)
    ];
    await appendRow(spreadsheetId, sheetTitle, row);
  }
}

// Kart açılışı için: bu videonun mevcut kaydı (yoksa null)
async function handleLookup(url) {
  await loadLang();
  const selected = await getSelectedSheet();
  if (!selected || !url) return null;
  const sheetTitle = await getSheetTitle(selected.id);
  const rowNumber = await findRowByUrl(selected.id, sheetTitle, url);
  if (!rowNumber) return null;
  const row = await getRow(selected.id, sheetTitle, rowNumber);
  return { note: row[7] || '', tags: row[8] || '', status: row[9] || '' };
}

// URL sütununda (E) bu videoyu ara → 1 tabanlı satır no (yoksa null)
async function findRowByUrl(spreadsheetId, sheetTitle, url) {
  const range = encodeURIComponent(`${sheetTitle}!E:E`);
  const data = await apiJson(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {}, 'errRead'
  );
  const rows = data.values || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]?.[0] === url) return i + 1; // değerler 1. satırdan başlar (başlık dahil)
  }
  return null;
}

// Tek bir satırı oku (A:J) → hücre dizisi (boşsa [])
async function getRow(spreadsheetId, sheetTitle, rowNumber) {
  const range = encodeURIComponent(`${sheetTitle}!A${rowNumber}:J${rowNumber}`);
  const data = await apiJson(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {}, 'errRowRead'
  );
  return (data.values && data.values[0]) || [];
}

// Var olan satırı güncelle (A:J)
async function updateRow(spreadsheetId, sheetTitle, rowNumber, row) {
  const range = encodeURIComponent(`${sheetTitle}!A${rowNumber}:J${rowNumber}`);
  await apiJson(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}` +
    `?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row] })
    },
    'errUpdate'
  );
}

// Eski notun altına yeni notu ekle (boşları atla, aynısını tekrar ekleme)
function mergeNote(oldNote, addition) {
  const a = (oldNote || '').trim();
  const b = (addition || '').trim();
  if (!b) return a;
  if (!a) return b;
  if (a === b || a.endsWith(b)) return a;
  return `${a}\n${b}`;
}

// Etiketleri birleştir (virgülle ayrılmış, tekrarsız)
function mergeTags(oldTags, newTags) {
  const split = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);
  const merged = split(oldTags);
  for (const tag of split(newTags)) {
    if (!merged.includes(tag)) merged.push(tag);
  }
  return merged.join(', ');
}
