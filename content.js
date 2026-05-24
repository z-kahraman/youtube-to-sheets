// ============================================================
// Background'tan gelen mesajları dinle
// ============================================================
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.id !== chrome.runtime.id) return; // sadece kendi uzantımızdan gelen mesajları işle
  if (msg.action === 'openSaveCard') openSaveCard();
  else if (msg.action === 'saveResult') handleSaveResult(msg);
});

// Sağ tık konumunu takip et → kart tam orada açılsın
let lastRightClick = { x: null, y: null };
document.addEventListener('contextmenu', (e) => {
  lastRightClick = { x: e.clientX, y: e.clientY };
}, true);

// ============================================================
// Helper: saniyeyi M:SS / H:MM:SS formatına çevir
// ============================================================
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// ============================================================
// YouTube sayfasından video bilgisini çek
// ============================================================
function scrapeVideoInfo() {
  const titleEl = document.querySelector(
    'h1.ytd-watch-metadata yt-formatted-string, h1.ytd-watch-metadata'
  );
  const channelEl = document.querySelector(
    'ytd-video-owner-renderer #channel-name a, #channel-name a'
  );
  const video = document.querySelector('video');

  // URL'i temizle → sadece v= parametresini tut (zaman, liste vb. atılır)
  const vid = new URLSearchParams(location.search).get('v');
  const url = vid ? `https://www.youtube.com/watch?v=${vid}` : location.href;

  return {
    title: titleEl?.textContent?.trim() || document.title.replace(/ - YouTube$/, ''),
    channel: channelEl?.textContent?.trim() || '',
    channelUrl: channelEl?.href || '',
    url,
    watchedTime: video ? formatTime(video.currentTime) : '',
    totalTime: video ? formatTime(video.duration) : ''
  };
}

// ============================================================
// Not kartı durumu
// ============================================================
let cardEl = null;
let activeSaveBtn = null;
let saveTimeoutId = null;

// Kartı kapat — referansı + olası artık düğümleri birlikte temizle
function closeCard() {
  document.querySelectorAll('#yt2sheets-card').forEach((el) => el.remove());
  cardEl = null;
  activeSaveBtn = null;
  clearTimeout(saveTimeoutId);
}

// Background iş bitince sonucu buradan bildirir
function handleSaveResult(msg) {
  clearTimeout(saveTimeoutId);
  if (!cardEl) return; // kullanıcı kartı kapatmış
  if (msg.ok) showSuccessInCard();
  else showErrorInCard(msg.error || 'Bilinmeyen hata');
}

// Kartın yerinde "✓ Kaydedildi" göster, sonra kendiliğinden kapan
function showSuccessInCard() {
  if (!cardEl) return;
  cardEl.textContent = '';
  const ok = document.createElement('div');
  ok.textContent = '✓ Kaydedildi';
  Object.assign(ok.style, {
    color: '#2ecc71', fontWeight: '700', fontSize: '16px',
    textAlign: 'center', padding: '10px 0'
  });
  cardEl.appendChild(ok);
  saveTimeoutId = setTimeout(closeCard, 1300);
}

// Hatayı kartın içinde göster, kaydet butonunu yeniden aç
function showErrorInCard(message) {
  if (activeSaveBtn) {
    activeSaveBtn.disabled = false;
    activeSaveBtn.textContent = 'Kaydet';
  }
  if (!cardEl) return;
  let err = cardEl.querySelector('.yt2sheets-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'yt2sheets-error';
    Object.assign(err.style, { color: '#e74c3c', fontSize: '12px', marginTop: '8px' });
    cardEl.appendChild(err);
  }
  err.textContent = 'Hata: ' + message;
}

// ============================================================
// Not kartını aç (sağ tık konumunda)
// ============================================================
function openSaveCard() {
  closeCard();
  const info = scrapeVideoInfo();

  const card = document.createElement('div');
  card.id = 'yt2sheets-card';
  // Inline stiller: YouTube CSS'inden bağımsız, kendi katmanında float eder
  Object.assign(card.style, {
    position: 'fixed', top: '0', left: '0', zIndex: '2147483647',
    width: '320px', boxSizing: 'border-box',
    background: '#fff', color: '#1a1a1a',
    borderRadius: '12px', boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
    padding: '16px', fontFamily: 'Roboto, Arial, sans-serif', fontSize: '14px',
    lineHeight: '1.4'
  });

  // Başlık satırı
  const header = document.createElement('div');
  header.textContent = "📋 Sheet'e kaydet";
  Object.assign(header.style, { fontWeight: '700', fontSize: '15px', marginBottom: '10px' });

  // Çekilen bilgi (salt okunur özet)
  const meta = document.createElement('div');
  meta.textContent = `${info.title} — ${info.channel}`;
  Object.assign(meta.style, {
    color: '#555', fontSize: '12px', marginBottom: '4px',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
  });

  const timeMeta = document.createElement('div');
  timeMeta.textContent = `İzlenen: ${info.watchedTime || '—'} / ${info.totalTime || '—'}`;
  Object.assign(timeMeta.style, { color: '#888', fontSize: '12px', marginBottom: '12px' });

  // Not + etiket inputları
  const noteInput = document.createElement('textarea');
  noteInput.placeholder = 'Not...';
  noteInput.rows = 2;
  styleField(noteInput);

  const tagField = createTagInput();

  // Buton satırı
  const btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '8px', marginTop: '4px' });

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Kaydet';
  styleButton(saveBtn, '#3ea6ff', '#fff');

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Kapat';
  styleButton(cancelBtn, '#e0e0e0', '#333');

  cancelBtn.addEventListener('click', closeCard);
  saveBtn.addEventListener('click', () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Kaydediliyor...';
    activeSaveBtn = saveBtn;
    const data = { ...info, note: noteInput.value.trim(), tags: tagField.getTags().join(', ') };

    try {
      chrome.runtime.sendMessage({ action: 'saveRow', data });
    } catch (e) {
      // Uzantı güncellenmiş ama sayfa yenilenmemişse buraya düşer
      showErrorInCard('Uzantı güncellendi, sayfayı yenile (F5)');
      return;
    }

    // Güvenlik ağı: sonuç gelmezse buton sonsuza kadar kilitli kalmasın
    clearTimeout(saveTimeoutId);
    saveTimeoutId = setTimeout(() => {
      if (cardEl && activeSaveBtn === saveBtn) {
        showErrorInCard("Yanıt gecikti — sheet'i kontrol et");
      }
    }, 15000);
  });

  btnRow.append(saveBtn, cancelBtn);
  card.append(header, meta, timeMeta, noteInput, tagField.wrap, btnRow);
  document.body.appendChild(card);
  cardEl = card;

  positionCard(card);
  noteInput.focus();
}

// Kartı sağ tık konumuna yerleştir, viewport dışına taşırsa içeri çek
function positionCard(card) {
  const margin = 12;
  const rect = card.getBoundingClientRect();
  let x = lastRightClick.x ?? (window.innerWidth - rect.width - 24);
  let y = lastRightClick.y ?? 80;
  x = Math.max(margin, Math.min(x, window.innerWidth - rect.width - margin));
  y = Math.max(margin, Math.min(y, window.innerHeight - rect.height - margin));
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
}

// ============================================================
// Etiket girişi: virgül / Enter / Tab ile chip ekle, × ile sil
// ============================================================
function createTagInput() {
  const tags = [];

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center',
    width: '100%', boxSizing: 'border-box', padding: '6px 8px',
    margin: '0 0 8px', borderRadius: '6px', border: '1px solid #ccc',
    minHeight: '38px', cursor: 'text'
  });

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Etiket ekle (virgül / Tab)';
  Object.assign(input.style, {
    flex: '1', minWidth: '90px', border: '0', outline: 'none',
    fontSize: '13px', fontFamily: 'inherit', padding: '2px 0', background: 'transparent'
  });

  function addTag(raw) {
    const value = raw.replace(/,/g, '').trim();
    if (!value || tags.includes(value)) return;
    tags.push(value);

    const chip = document.createElement('span');
    Object.assign(chip.style, {
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: '#e8f0fe', color: '#1a73e8', borderRadius: '12px',
      padding: '2px 8px', fontSize: '12px', fontWeight: '600'
    });
    const label = document.createElement('span');
    label.textContent = value;
    const x = document.createElement('span');
    x.textContent = '×';
    Object.assign(x.style, { cursor: 'pointer', fontWeight: '700', lineHeight: '1' });
    x.addEventListener('click', () => {
      const i = tags.indexOf(value);
      if (i > -1) tags.splice(i, 1);
      chip.remove();
      input.focus();
    });
    chip.append(label, x);
    wrap.insertBefore(chip, input);
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (input.value.trim()) {
        e.preventDefault(); // virgül/Tab karakterini ekleme, etikete çevir
        addTag(input.value);
        input.value = '';
      }
      // input boşsa Tab normal davransın (odak değişimi)
    } else if (e.key === 'Backspace' && !input.value && tags.length) {
      tags.pop();
      input.previousElementSibling?.remove(); // son chip
    }
  });

  // Alanın boşluğuna tıklayınca yazmaya devam et
  wrap.addEventListener('click', () => input.focus());

  wrap.appendChild(input);

  return {
    wrap,
    getTags() {
      // Kaydederken input'ta bekleyen yazı varsa onu da etikete çevir
      if (input.value.trim()) {
        addTag(input.value);
        input.value = '';
      }
      return tags.slice();
    }
  };
}

// ============================================================
// Stil helper'ları (inline, izole)
// ============================================================
function styleField(el) {
  Object.assign(el.style, {
    width: '100%', boxSizing: 'border-box', padding: '8px',
    margin: '0 0 8px', borderRadius: '6px', border: '1px solid #ccc',
    fontSize: '13px', fontFamily: 'inherit', resize: 'vertical'
  });
}

function styleButton(el, bg, fg) {
  Object.assign(el.style, {
    flex: '1', background: bg, color: fg, border: '0',
    padding: '9px 0', borderRadius: '6px', fontWeight: '600',
    cursor: 'pointer', fontSize: '13px'
  });
}
