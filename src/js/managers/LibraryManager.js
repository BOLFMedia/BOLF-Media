/**
 * LibraryManager
 * Manages the collection of games, sorting, searching, and UI rendering.
 */
import { GameCard } from '../components/GameCard.js';

export class LibraryManager {
  constructor(containerId, supabaseService, translationManager) {
    this.container = document.getElementById(containerId);
    this.service = supabaseService;
    this.i18n = translationManager;
    this.allGames = [];
    this.filteredGames = [];
  }

  async init() {
    this.container.innerHTML = `<p class="loading-text">${this.i18n.get('loading')}</p>`;
    this.allGames = await this.service.fetchGames();
    this.filteredGames = [...this.allGames];
    this.render();
  }

  sort(criteria) {
    if (criteria === 'rating') {
      this.filteredGames.sort((a, b) => b.total_score - a.total_score);
    } else if (criteria === 'name') {
      this.filteredGames.sort((a, b) => a.title.localeCompare(b.title));
    } else if (criteria === 'newest') {
      this.filteredGames.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    this.render();
  }

  search(query) {
    const q = query.toLowerCase();
    this.filteredGames = this.allGames.filter(game => 
      game.title.toLowerCase().includes(q)
    );
    this.render();
  }

  render() {
    if (this.filteredGames.length === 0) {
      this.container.innerHTML = `<p class="no-games">${this.i18n.get('no-games')}</p>`;
      return;
    }

    this.container.innerHTML = this.filteredGames.map(game => {
      const card = new GameCard(game, this.i18n);
      return card.render();
    }).join('');

    // Add card flip interactions
    this.addInteractions();
  }

  addInteractions() {
    document.querySelectorAll('.game-card').forEach(card => {
      const inner = card.querySelector('.card-inner');
      card.addEventListener('mouseenter', () => {
        inner.classList.add('rotate-y-180');
      });
      card.addEventListener('mouseleave', () => {
        inner.classList.remove('rotate-y-180');
      });
    });
  }
}
