// ============================================================
// Helper: OAuth token al
// ============================================================
function getToken(interactive = true) {
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

// Token cache'i temizle ve Google tarafında revoke et
async function revokeToken(token) {
  return new Promise((resolve) => {
    chrome.identity.removeCachedAuthToken({ token }, () => {
      fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, { method: 'POST' })
        .finally(resolve);
    });
  });
}

// ============================================================
// Helper: Toast bildirim
// ============================================================
function toast(message, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = message;
  t.className = type;
  t.classList.remove('hidden');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
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

async function listSheets(token) {
  const query = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
  );
  const url = `https://www.googleapis.com/drive/v3/files` +
              `?q=${query}` +
              `&fields=files(id,name,modifiedTime)` +
              `&orderBy=modifiedTime desc` +
              `&pageSize=50`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive listesi alınamadı: ${res.status}`);
  const data = await res.json();
  return data.files || [];
}

async function createSheet(token, name) {
  // 1) Sheet'i oluştur
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title: name },
      sheets: [{ properties: { title: 'Notlar' } }]
    })
  });
  if (!createRes.ok) throw new Error(`Sheet oluşturulamadı: ${createRes.status}`);
  const sheet = await createRes.json();

  // 2) Header satırı yaz
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheet.spreadsheetId}` +
    `/values/Notlar!A1:I1?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [['Tarih', 'Başlık', 'Kanal', 'Kanal Linki', 'URL', 'İzleme Süresi', 'Toplam Süre', 'Not', 'Etiketler']]
      })
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

// ============================================================
// UI render
// ============================================================
const show = (id) => document.getElementById(id).classList.remove('hidden');
const hide = (id) => document.getElementById(id).classList.add('hidden');

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
    document.getElementById('user-email').textContent = await getUserEmail(token);
  } catch {
    document.getElementById('user-email').textContent = '(email alınamadı)';
  }

  // Seçili sheet var mı?
  const selected = await getSelectedSheet();
  if (selected) {
    show('current-sheet');
    hide('sheet-picker');
    document.getElementById('selected-sheet-name').textContent = selected.name;
  } else {
    hide('current-sheet');
    show('sheet-picker');
    await loadSheetList(token);
  }
}

async function loadSheetList(token) {
  const select = document.getElementById('sheet-list');
  select.innerHTML = '<option value="">— Yükleniyor —</option>';
  try {
    const sheets = await listSheets(token);
    if (sheets.length === 0) {
      select.innerHTML = '<option value="">Hiç sheet bulunamadı</option>';
      return;
    }
    select.innerHTML = '<option value="">— Bir sheet seç —</option>';
    sheets.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      select.appendChild(opt);
    });
  } catch (e) {
    select.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = `Hata: ${e.message}`;
    select.appendChild(opt);
  }
}

// ============================================================
// Event listeners
// ============================================================
document.getElementById('connect-btn').addEventListener('click', async () => {
  try {
    await getToken(true);
    toast('Bağlandı ✓');
    await refreshUI();
  } catch (e) {
    toast('Bağlanma hatası: ' + e.message, 'error');
  }
});

document.getElementById('disconnect-btn').addEventListener('click', async () => {
  try {
    const token = await getToken(false);
    await revokeToken(token);
  } catch {}
  await clearSelectedSheet();
  toast('Bağlantı kesildi');
  await refreshUI();
});

document.getElementById('use-selected-btn').addEventListener('click', async () => {
  const select = document.getElementById('sheet-list');
  const id = select.value;
  if (!id) {
    toast('Önce bir sheet seç', 'error');
    return;
  }
  const name = select.options[select.selectedIndex].textContent;
  await setSelectedSheet(id, name);
  toast(`Seçildi: ${name}`);
  await refreshUI();
});

document.getElementById('change-sheet-btn').addEventListener('click', async () => {
  await clearSelectedSheet();
  await refreshUI();
});

document.getElementById('create-sheet-btn').addEventListener('click', async () => {
  const name = document.getElementById('new-sheet-name').value.trim() || 'YouTube İzleme Notları';
  try {
    toast('Sheet oluşturuluyor...');
    const token = await getToken(true);
    const sheet = await createSheet(token, name);
    await setSelectedSheet(sheet.id, sheet.name);
    toast('Sheet oluşturuldu ✓');
    await refreshUI();
  } catch (e) {
    toast('Oluşturma hatası: ' + e.message, 'error');
  }
});

// İlk yükleme
refreshUI();