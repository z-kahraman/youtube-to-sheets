---
name: Extension Audit
description: Chrome extension Manifest V3 için derinlemesine güvenlik denetimi
---

Bu Chrome extension projesini şu kategorilerde gözden geçir. Sadece 
değişiklikleri değil, tüm kodu oku:

1. **Manifest least privilege**: permissions ve host_permissions
   gereksiz geniş mi? Her permission için "neden gerekli" sor.
2. **XSS yüzeyleri**: innerHTML, document.write, eval, 
   new Function kullanımı var mı? textContent yerine innerHTML
   kullanılan yerler?
3. **OAuth handling**: token console.log'a düşüyor mu? localStorage
   veya başka kalıcı yerlere yazılıyor mu? Cache temizleniyor mu?
4. **Message passing güvenliği**: chrome.runtime.onMessage 
   handler'larında sender.id veya sender.origin doğrulanıyor mu?
5. **DOM scraping safety**: YouTube DOM'undan çekilen veriler 
   (başlık, kanal) sanitize ediliyor mu, doğrudan kullanılıyor mu?
6. **External resource yükleme**: <script src="..."> ile dış 
   kaynak çekme var mı? CDN bağımlılığı?
7. **Hardcoded secrets**: client_secret, API key, başka credentials
   kodun içinde mi?

Her bulgu için:
- Risk seviyesi: Kritik / Yüksek / Orta / Düşük / Bilgi
- Etkilenen dosya:satır
- Sorun: 2-3 cümle açıklama
- Çözüm: somut kod önerisi

Sonunda özet bir tablo ver. Hiç bulgu yoksa "Temiz" raporu ver, 
yapay bulgu üretme.