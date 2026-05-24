// ============================================================
// i18n katmanı — tarayıcıya/seçime göre TR/EN dizeler
//  - Varsayılan: tarayıcı dili (TR → tr, diğerleri → en)
//  - Kullanıcı ayarlardan değiştirebilir (storage.sync.lang)
// content.js, options.js, background.js bu fonksiyonları kullanır.
// ============================================================

const I18N = {
  tr: {
    optionsTitle: 'YouTube to Sheets — Ayarlar',
    subtitle: "Videolarını Google Sheets'e kaydet",
    notConnected: 'Henüz Google hesabı bağlı değil.',
    connect: 'Google ile bağlan',
    accountConnected: 'Hesap bağlı',
    disconnect: 'Bağlantıyı kes',
    targetSheet: 'Hedef Sheet',
    currentlySelected: 'Şu an seçili',
    change: 'Değiştir',
    pickCreated: "Oluşturduğun sheet'lerden seç",
    useThis: "Bu sheet'i kullan",
    orCreateNew: 'Veya yeni bir tane oluştur',
    createNew: 'Yeni sheet oluştur',
    selectSheet: '— Bir sheet seç —',
    noSheetsYet: 'Henüz oluşturulmuş sheet yok — aşağıdan oluştur',
    loading: '— Yükleniyor —',
    connected: 'Bağlandı ✓',
    connectError: 'Bağlanma hatası: ',
    disconnected: 'Bağlantı kesildi',
    selectFirst: 'Önce bir sheet seç',
    selected: 'Seçildi: ',
    creatingSheet: 'Sheet oluşturuluyor...',
    sheetCreated: 'Sheet oluşturuldu ✓',
    createError: 'Oluşturma hatası: ',
    emailFail: '(email alınamadı)',
    langLabel: 'Dil / Language',
    cardTitle: "📋 Sheet'e kaydet",
    watched: 'İzlenen',
    notePlaceholder: 'Not...',
    tagPlaceholder: 'Etiket ekle (virgül / Tab)',
    save: 'Kaydet',
    saving: 'Kaydediliyor...',
    close: 'Kapat',
    saved: '✓ Kaydedildi',
    errorPrefix: 'Hata: ',
    reloadNeeded: 'Uzantı güncellendi, sayfayı yenile (F5)',
    timeout: "Yanıt gecikti — sheet'i kontrol et",
    unknownError: 'Bilinmeyen hata',
    saveToSheet: "Sheet'e kaydet",
    noSheet: 'Önce ayarlardan bir sheet seç',
    defaultSheetName: 'YouTube İzleme Notları',
    tabName: 'Notlar',
    dateLocale: 'tr-TR',
    headers: ['Tarih', 'Başlık', 'Kanal', 'Kanal Linki', 'URL', 'İzleme Süresi', 'Toplam Süre', 'Not', 'Etiketler']
  },
  en: {
    optionsTitle: 'YouTube to Sheets — Settings',
    subtitle: 'Save your videos to Google Sheets',
    notConnected: 'No Google account connected yet.',
    connect: 'Connect with Google',
    accountConnected: 'Account connected',
    disconnect: 'Disconnect',
    targetSheet: 'Target Sheet',
    currentlySelected: 'Currently selected',
    change: 'Change',
    pickCreated: 'Pick from sheets you created',
    useThis: 'Use this sheet',
    orCreateNew: 'Or create a new one',
    createNew: 'Create new sheet',
    selectSheet: '— Select a sheet —',
    noSheetsYet: 'No sheets created yet — create one below',
    loading: '— Loading —',
    connected: 'Connected ✓',
    connectError: 'Connection error: ',
    disconnected: 'Disconnected',
    selectFirst: 'Select a sheet first',
    selected: 'Selected: ',
    creatingSheet: 'Creating sheet...',
    sheetCreated: 'Sheet created ✓',
    createError: 'Creation error: ',
    emailFail: '(email unavailable)',
    langLabel: 'Dil / Language',
    cardTitle: '📋 Save to Sheet',
    watched: 'Watched',
    notePlaceholder: 'Note...',
    tagPlaceholder: 'Add tag (comma / Tab)',
    save: 'Save',
    saving: 'Saving...',
    close: 'Close',
    saved: '✓ Saved',
    errorPrefix: 'Error: ',
    reloadNeeded: 'Extension updated, reload the page (F5)',
    timeout: 'Response delayed — check your sheet',
    unknownError: 'Unknown error',
    saveToSheet: 'Save to Sheet',
    noSheet: 'Select a sheet in settings first',
    defaultSheetName: 'YouTube Watch Notes',
    tabName: 'Notes',
    dateLocale: 'en-US',
    headers: ['Date', 'Title', 'Channel', 'Channel Link', 'URL', 'Watched Time', 'Total Time', 'Note', 'Tags']
  }
};

let _lang = null;

// Tarayıcı dilinden varsayılanı belirle (TR → tr, diğerleri → en)
function detectDefaultLang() {
  let ui = 'en';
  try {
    ui = (chrome.i18n && chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) ||
         navigator.language || 'en';
  } catch {
    ui = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  }
  return ui.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

// Seçili dili storage'dan yükle (yoksa/erişilemezse tarayıcı dili)
async function loadLang() {
  let lang = null;
  try {
    ({ lang } = await chrome.storage.sync.get('lang'));
  } catch { /* storage yok → tarayıcı diline düş */ }
  _lang = (lang === 'tr' || lang === 'en') ? lang : detectDefaultLang();
  return _lang;
}

function currentLang() {
  return _lang || detectDefaultLang();
}

// Çeviri getir (yoksa EN'e, o da yoksa anahtara düş)
function t(key) {
  const dict = I18N[_lang] || I18N.en;
  if (dict[key] !== undefined) return dict[key];
  if (I18N.en[key] !== undefined) return I18N.en[key];
  return key;
}

async function setLang(lang) {
  _lang = lang;
  await chrome.storage.sync.set({ lang });
}
