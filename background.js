// ============================================================
// Kurulum: options'ı aç + sağ tık menüsünü oluştur
// ============================================================
chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.openOptionsPage();
  chrome.contextMenus.create({
    id: 'save-to-sheet',
    title: "Sheet'e kaydet",
    contexts: ['page'],
    documentUrlPatterns: ['https://www.youtube.com/watch*']
  });
});

// Extension ikonuna tıklanınca options'ı aç
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// ============================================================
// Sağ tık menüsü tıklanınca → content script'e kartı aç de
// ============================================================
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-to-sheet' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'openSaveCard' });
  }
});

// ============================================================
// Content script'ten gelen kaydetme isteği
// ============================================================
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.id !== chrome.runtime.id) return; // sadece kendi uzantımızdan gelen mesajları işle
  if (msg.action === 'saveRow') {
    const tabId = sender.tab?.id;
    // İş bitince sonucu tab'a ayrı mesajla push et (yanıt kanalı MV3'te güvenilmez)
    handleSaveRow(msg.data).then(
      () => { if (tabId) chrome.tabs.sendMessage(tabId, { action: 'saveResult', ok: true }); },
      (err) => { if (tabId) chrome.tabs.sendMessage(tabId, { action: 'saveResult', ok: false, error: err.message }); }
    );
  }
});

// ============================================================
// Helper: OAuth token (options'ta zaten onaylandığı için interactive=false yeter)
// ============================================================
function getToken(interactive = false) {
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

async function getSelectedSheet() {
  const { selectedSheet } = await chrome.storage.sync.get('selectedSheet');
  return selectedSheet;
}

// Append için hedef sekme adı gerek; seçilen sheet'in ilk sekmesini kullan
// (yeni oluşturulanlarda "Notlar", mevcut sheet'lerde farklı olabilir)
async function getFirstSheetTitle(token, spreadsheetId) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Sheet bilgisi alınamadı: ${res.status}`);
  const data = await res.json();
  return data.sheets?.[0]?.properties?.title || 'Sayfa1';
}

// Sheet'in sonuna yeni satır ekle
async function appendRow(token, spreadsheetId, sheetTitle, row) {
  const range = encodeURIComponent(`${sheetTitle}!A:I`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}` +
              `/values/${range}:append` +
              `?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [row] })
  });
  if (!res.ok) throw new Error(`Satır eklenemedi: ${res.status}`);
}

// Kaydetme akışı: token → seçili sheet → satırı ekle
async function handleSaveRow(data) {
  const selected = await getSelectedSheet();
  if (!selected) throw new Error('Önce ayarlardan bir sheet seç');

  const token = await getToken(false);
  const sheetTitle = await getFirstSheetTitle(token, selected.id);

  // Sütun sırası: Tarih, Başlık, Kanal, Kanal Linki, URL, İzleme Süresi, Toplam Süre, Not, Etiketler
  const row = [
    new Date().toLocaleString('tr-TR'),
    data.title || '',
    data.channel || '',
    data.channelUrl || '',
    data.url || '',
    data.watchedTime || '',
    data.totalTime || '',
    data.note || '',
    data.tags || ''
  ];

  await appendRow(token, selected.id, sheetTitle, row);
}
