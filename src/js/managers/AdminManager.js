/**
 * AdminManager
 * Handles login, UI state, and dashboard operations (CRUD).
 */
export class AdminManager {
  constructor(authManager, gameRepository) {
    this.auth = authManager;
    this.repository = gameRepository;
    
    // Selectors
    this.loginSection = document.getElementById('login-section');
    this.dashboardSection = document.getElementById('dashboard-section');
    this.loginForm = document.getElementById('login-form');
    this.gameForm = document.getElementById('game-form');
    this.gamesList = document.getElementById('admin-games-list');
    this.logoutBtn = document.getElementById('logout-btn');
    this.newGameBtn = document.getElementById('new-game-btn');
    this.cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    this.isEditing = false;
  }

  async init() {
    this.setupListeners();
    this.checkSession();
  }

  setupListeners() {
    this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.gameForm.addEventListener('submit', (e) => this.handleGameSubmit(e));
    this.logoutBtn.addEventListener('click', () => this.handleLogout());
    this.newGameBtn.addEventListener('click', () => this.resetForm());
    this.cancelEditBtn.addEventListener('click', () => this.resetForm());

    // Auto-calculate total score
    const ratingInputs = this.gameForm.querySelectorAll('.rating-input');
    ratingInputs.forEach(input => {
      input.addEventListener('input', () => this.calculateTotalScore());
    });
  }

  async checkSession() {
    const user = await this.auth.getCurrentUser();
    if (user) {
      this.showDashboard();
    } else {
      this.showLogin();
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    try {
      await this.auth.login(email, password);
      this.showDashboard();
    } catch (error) {
      errorMsg.textContent = 'Hata: Giriş bilgileri geçersiz.';
      errorMsg.classList.remove('hidden');
    }
  }

  async handleLogout() {
    await this.auth.logout();
    this.showLogin();
  }

  showLogin() {
    this.loginSection.classList.remove('hidden');
    this.dashboardSection.classList.add('hidden');
    this.logoutBtn.classList.add('hidden');
  }

  async showDashboard() {
    this.loginSection.classList.add('hidden');
    this.dashboardSection.classList.remove('hidden');
    this.logoutBtn.classList.remove('hidden');
    this.loadGames();
  }

  async loadGames() {
    this.gamesList.innerHTML = '<p class="loading-text">Yükleniyor...</p>';
    try {
      const games = await this.repository.getAllGames();
      if (games.length === 0) {
        this.gamesList.innerHTML = '<p class="text-muted text-center p-4">Henüz oyun yok.</p>';
      } else {
        this.gamesList.innerHTML = games.map(game => this.renderSidebarItem(game)).join('');
        this.setupItemListeners(games);
      }
    } catch (error) {
      this.gamesList.innerHTML = '<p class="error-msg">Liste yüklenemedi.</p>';
    }
  }

  renderSidebarItem(game) {
    return `
      <div class="sidebar-item" data-id="${game.id}">
        <div class="item-info">
          <span class="game-title">${game.title}</span>
          <span class="text-xs text-muted">${game.total_score}/5</span>
        </div>
        <div class="item-actions">
          <button class="btn-icon-tiny edit-btn" title="Düzenle">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="btn-icon-tiny delete-btn text-error" title="Sil">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    `;
  }

  setupItemListeners(games) {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.closest('.sidebar-item').dataset.id;
        const game = games.find(g => g.id === id);
        this.editGame(game);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.closest('.sidebar-item').dataset.id;
        if (confirm('Bu oyunu silmek istediğine emin misin?')) {
          await this.repository.deleteGame(id);
          this.loadGames();
          this.resetForm();
        }
      });
    });
  }

  calculateTotalScore() {
    const gameplay = parseFloat(document.getElementById('rating_gameplay').value) || 0;
    const narrative = parseFloat(document.getElementById('rating_narrative').value) || 0;
    const presentation = parseFloat(document.getElementById('rating_presentation').value) || 0;
    const technical = parseFloat(document.getElementById('rating_technical').value) || 0;
    const impact = parseFloat(document.getElementById('rating_impact').value) || 0;

    // Update badges
    document.getElementById('val-gameplay').textContent = gameplay;
    document.getElementById('val-narrative').textContent = narrative;
    document.getElementById('val-presentation').textContent = presentation;
    document.getElementById('val-technical').textContent = technical;
    document.getElementById('val-impact').textContent = impact;

    const total = gameplay + narrative + presentation + technical + impact;
    const formattedTotal = total.toFixed(1);
    
    document.getElementById('total_score').value = formattedTotal;
    document.getElementById('display-total-score').textContent = formattedTotal;
  }

  async handleGameSubmit(e) {
    e.preventDefault();
    const gameId = document.getElementById('edit-game-id').value;
    
    const gameData = {
      title: document.getElementById('game-title').value,
      image_url: document.getElementById('image_url').value,
      play_time: parseInt(document.getElementById('play_time').value) || 0,
      is_featured: document.getElementById('is_featured').checked,
      is_too_old: document.getElementById('is_too_old').checked,
      rating_gameplay: parseFloat(document.getElementById('rating_gameplay').value) || 0,
      rating_narrative: parseFloat(document.getElementById('rating_narrative').value) || 0,
      rating_presentation: parseFloat(document.getElementById('rating_presentation').value) || 0,
      rating_technical: parseFloat(document.getElementById('rating_technical').value) || 0,
      rating_impact: parseFloat(document.getElementById('rating_impact').value) || 0,
      total_score: parseFloat(document.getElementById('total_score').value) || 0
    };

    try {
      if (this.isEditing) {
        await this.repository.updateGame(gameId, gameData);
      } else {
        await this.repository.addGame(gameData);
      }
      this.resetForm();
      this.loadGames();
      alert('Başarıyla kaydedildi!');
    } catch (error) {
      alert('Kaydedilirken hata oluştu: ' + error.message);
    }
  }

  editGame(game) {
    this.isEditing = true;
    document.getElementById('form-title').textContent = 'Oyunu Düzenle';
    document.getElementById('edit-game-id').value = game.id;
    document.getElementById('game-title').value = game.title;
    document.getElementById('image_url').value = game.image_url;
    document.getElementById('play_time').value = game.play_time;
    document.getElementById('is_featured').checked = game.is_featured;
    document.getElementById('is_too_old').checked = game.is_too_old;
    
    document.getElementById('rating_gameplay').value = game.rating_gameplay;
    document.getElementById('rating_narrative').value = game.rating_narrative;
    document.getElementById('rating_presentation').value = game.rating_presentation;
    document.getElementById('rating_technical').value = game.rating_technical;
    document.getElementById('rating_impact').value = game.rating_impact;
    
    const formattedTotal = (game.total_score || 0).toFixed(1);
    document.getElementById('total_score').value = formattedTotal;
    document.getElementById('display-total-score').textContent = formattedTotal;

    // Update badges manually on load
    document.getElementById('val-gameplay').textContent = game.rating_gameplay;
    document.getElementById('val-narrative').textContent = game.rating_narrative;
    document.getElementById('val-presentation').textContent = game.rating_presentation;
    document.getElementById('val-technical').textContent = game.rating_technical;
    document.getElementById('val-impact').textContent = game.rating_impact;

    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.toggle('active', item.dataset.id === game.id);
    });
  }

  resetForm() {
    this.isEditing = false;
    this.gameForm.reset();
    document.getElementById('edit-game-id').value = '';
    document.getElementById('form-title').textContent = 'Yeni Oyun Ekle';
    document.getElementById('display-total-score').textContent = '0.0';
    
    // Reset badges
    ['gameplay', 'narrative', 'presentation', 'technical', 'impact'].forEach(id => {
      document.getElementById(`val-${id}`).textContent = '0';
    });

    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
  }
}
