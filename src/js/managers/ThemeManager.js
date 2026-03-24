/**
 * ThemeManager
 * Manages Light/Dark theme toggling for BOLF Medya.
 */
export class ThemeManager {
  constructor(toggleBtnId) {
    this.theme = localStorage.getItem('bolf-theme') || 'light';
    this.btn = document.getElementById(toggleBtnId);
    this.init();
  }

  init() {
    this.applyTheme();

    if (this.btn) {
      this.btn.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('bolf-theme', this.theme);
    this.applyTheme();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateIcon();
  }

  updateIcon() {
    if (!this.btn) return;
    const icon = this.btn.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.innerText = this.theme === 'light' ? 'dark_mode' : 'light_mode';
    }
  }
}
