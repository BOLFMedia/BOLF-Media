/**
 * TranslationManager
 * Handles multi-language support (TR/EN) for BOLF Medya.
 */
export class TranslationManager {
  constructor(defaultLang = 'tr') {
    this.currentLang = localStorage.getItem('bolf-lang') || defaultLang;
    this.translations = {
      tr: {
        'nav-home': 'Ana Sayfa',
        'nav-rating': 'Değerlendirmeler',
        'site-title': 'BOLF Medya',
        'title-media-suffix': 'Medya',
        'hero-title': 'Oynadım & Değerlendirdim',

        'hero-subtitle': 'Dijital dünyalarda yaptığım keşiflerin kişisel koleksiyonu.',
        'game-count': 'Oyun',
        'sort-library': 'Arşivi Sırala',
        'sort-rating': 'Puan',
        'sort-name': 'İsim',
        'sort-newest': 'En Yeni',
        'search-placeholder': 'Oyun ara...',
        'rating-system': 'Puanlama Sistemi',
        'modal-subtitle': 'Oyunları nasıl değerlendiriyorum?',
        'gameplay': 'Oynanış',
        'narrative': 'Hikaye & Dünya',
        'presentation': 'Sunum & Görsellik',
        'technical': 'Teknik Durum',
        'impact': 'Etki & Kalıcılık',
        'total-score': 'Toplam Puan',
        'loading': 'Oyunlar yükleniyor...',
        'no-games': 'Oyun bulunamadı.',
        'tried-too-old': 'Eski ama denendi',
        'hours': 'Saat'
      },
      en: {
        'nav-home': 'Home',
        'nav-rating': 'Ratings',
        'site-title': 'BOLF Media',
        'title-media-suffix': 'Media',

        'hero-title': 'Played & Rated',

        'hero-subtitle': 'A personal collection of my digital explorations.',
        'game-count': 'Games',
        'sort-library': 'Sort Library',
        'sort-rating': 'Rating',
        'sort-name': 'Name',
        'sort-newest': 'Newest',
        'search-placeholder': 'Find a game...',
        'rating-system': 'Rating System',
        'modal-subtitle': 'How I evaluate games',
        'gameplay': 'Gameplay',
        'narrative': 'Narrative & World',
        'presentation': 'Presentation',
        'technical': 'Technical State',
        'impact': 'Impact',
        'total-score': 'Total Score',
        'loading': 'Loading games...',
        'no-games': 'No games found.',
        'tried-too-old': 'Tried but too old',
        'hours': 'Hours'
      }
    };
  }

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('bolf-lang', lang);
      this.updateUI();
    }
  }

  get(key) {
    return this.translations[this.currentLang][key] || key;
  }

  updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.placeholder = this.get(key);
      } else {
        el.innerText = this.get(key);
      }
    });

    document.documentElement.lang = this.currentLang;
  }
}
