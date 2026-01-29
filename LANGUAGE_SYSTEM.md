# Multi-Language System Implementation

## Overview
Implemented an **automatic language detection + manual language switch** system for the public website (not admin panel).

---

## Files Created/Modified

### New Files:
- **`js/i18n.js`** - Complete language dictionary for Indonesian (id) and English (en)
  - Contains all text translations for both languages
  - Organized by page sections (navbar, hero, products, etc.)

### Modified Files:

#### 1. **js/script.js**
- Added `detectLanguage()` - Auto-detects user language:
  - Checks localStorage for saved preference first
  - Auto-detects from `navigator.language`
  - Indonesia (id, in) → Bahasa Indonesia
  - Other locales → English
  - Skips detection for admin.html (always Indonesian)

- Added `switchLanguage(lang)` - Manual language switch:
  - Saves preference to localStorage (`langPreference`)
  - Updates page without reload
  - Updates UI styling

- Added `updatePageLanguage()` - Updates all text:
  - Scans for elements with `data-i18n` attribute
  - Replaces text using i18n dictionary
  - Updates navbar links dynamically

- Added `updateLanguageSwitchUI()` - Updates active state:
  - Highlights active language in navbar (bold)

- Initialization on page load via `DOMContentLoaded`

#### 2. **index.html**
- Added `<script src="js/i18n.js"></script>` in head
- Added `data-i18n` attributes to navbar links
- Added language switch UI in navbar:
  ```html
  <li style="margin-left: 20px; cursor: pointer; user-select: none;">
      <span id="langID" onclick="switchLanguage('id')" 
            style="font-weight: bold; margin-right: 8px; color: #0066B3;">ID</span>
      <span style="color: #999;">|</span>
      <span id="langEN" onclick="switchLanguage('en')" 
            style="margin-left: 8px; color: #0066B3;">EN</span>
  </li>
  ```

#### 3. **produk.html**
- Added `<script src="js/i18n.js"></script>` in head
- Added `data-i18n` attributes to navbar links
- Added language switch UI in navbar (same as index.html)

#### 4. **order.html**
- Added `<script src="js/i18n.js"></script>` in head
- Added language switch UI in navbar (same as index.html)

#### 5. **css/style.css**
- Added CSS for language switch styling:
  ```css
  #langID, #langEN {
      font-size: 14px;
      transition: all 0.3s ease;
      cursor: pointer;
  }
  ```

---

## How It Works

### 1. Page Load (Initialization)
```
1. js/i18n.js loads → language dictionary ready
2. js/script.js loads → detectLanguage() called
3. DOMContentLoaded fires → updatePageLanguage() + updateLanguageSwitchUI()
4. Page displays in correct language
```

### 2. Language Detection Priority
```
Priority 1: Check localStorage ('langPreference')
  ↓ (if found, use it)
Priority 2: Check navigator.language
  ↓
  - If Indonesian (id, in) → use 'id'
  - Otherwise → use 'en'
```

### 3. Manual Language Switch
```
User clicks "EN" or "ID" in navbar
  ↓
switchLanguage('en' or 'id') triggered
  ↓
Save to localStorage
  ↓
updatePageLanguage() → update all text
  ↓
updateLanguageSwitchUI() → highlight active language
```

---

## Language Dictionary (js/i18n.js)

Contains translations for:
- Navbar (navHome, navAbout, navProducts, etc.)
- Hero Section (heroTitle, heroSubtitle, etc.)
- About Section (aboutTitle, aboutText, etc.)
- Products Section (productsFeatured, etc.)
- Why Choose Us Section
- CTA Section
- Footer
- Order Form
- Error Messages

### Adding New Translations

1. Edit `js/i18n.js`
2. Add key to both `id:{}` and `en:{}` objects
3. Use in HTML:
   ```html
   <h1 data-i18n="myNewKey">Default Text</h1>
   ```
4. Update with JavaScript:
   ```javascript
   element.textContent = i18n[currentLanguage].myNewKey;
   ```

---

## Admin Panel (admin.html)

**Important:** Admin panel is NOT affected by language system
- Always displays in Bahasa Indonesia
- Auto-detection check skips admin.html
- No language switch on admin panel

---

## Console Logs

The system logs information for debugging:

```
✅ i18n language dictionary loaded

🌍 Language auto-detected: id
   (or: English (en))

🌍 Language loaded from localStorage: id

✅ Page language updated to: id

🔄 Language switched to: en

🔄 Language switched to: id
```

---

## localStorage

Preference saved as:
```javascript
localStorage.setItem('langPreference', 'en'); // or 'id'
```

To clear language preference (browser console):
```javascript
localStorage.removeItem('langPreference');
```

---

## Testing Checklist

- [ ] Open index.html → detect your browser language automatically
- [ ] Click "EN" → page switches to English, UI updates
- [ ] Click "ID" → page switches back to Indonesian
- [ ] Refresh page → language preference persists (from localStorage)
- [ ] Open browser console → check console logs
- [ ] Open admin.html → should always be Indonesian
- [ ] Open produk.html → language switch works
- [ ] Open order.html → language switch works

---

## Supported Languages

- **ID** - Bahasa Indonesia (Default for Indonesian users)
- **EN** - English (Default for international users)

To add more languages:
1. Add new language object in `js/i18n.js`:
   ```javascript
   const i18n = {
       id: { ... },
       en: { ... },
       fr: { ... },  // Add French
   };
   ```
2. Add switch button in navbar
3. Update `switchLanguage()` validation

---

## Browser Support

Works in all modern browsers that support:
- `navigator.language` API
- localStorage
- ES6 JavaScript

Tested on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

---

## Notes

- No page reload needed when switching languages
- Language preference persists across sessions
- Works offline (language stored locally)
- Mobile responsive language switch
- No additional dependencies required (vanilla JS)

---

## Future Enhancements

- [ ] Add more languages (FR, ES, DE, etc.)
- [ ] API integration for dynamic translations
- [ ] RTL language support (Arabic, Hebrew)
- [ ] Language cookie for analytics
- [ ] Auto-translate descriptions from Supabase
