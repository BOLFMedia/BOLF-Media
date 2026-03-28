/**
 * GameCard Component
 * Encapsulates the UI and logic for a single game review card.
 */
export class GameCard {
  constructor(game, translationManager) {
    this.game = game;
    this.i18n = translationManager;
    this.id = `game-${game.id}`;
  }

  render() {
    const {
      title,
      image_url,
      play_time,
      is_too_old,
      is_featured,
      rating_gameplay,
      rating_narrative,
      rating_presentation,
      rating_technical,
      rating_impact,
      total_score
    } = this.game;

    const crownIcon = is_featured ? `
      <div class="card-crown" title="Hall of Fame">
        <span class="material-symbols-outlined filled">workspace_premium</span>
      </div>
    ` : '';

    const playTimeBadge = play_time ? `
      <div class="card-badge play-time">
        <span>${play_time} ${this.i18n.get('hours')}</span>
      </div>
    ` : '';

    const tooOldRibbon = is_too_old ? `
      <div class="too-old-ribbon">
        <div class="ribbon-text">${this.i18n.get('tried-too-old')}</div>
      </div>
    ` : '';

    return `
      <div class="game-card" id="${this.id}">
        <div class="card-inner preserve-3d">
          
          <!-- Front Side -->
          <div class="card-front backface-hidden">
            <div style="height: 100%; width: 100%; background-size: cover; background-position: center; background-repeat: no-repeat; background-image: url('${image_url}');">
              <div class="title-overlay">
                <h3 style="color: #FFFFFF; font-size: 1.5rem; font-weight: 900; line-height: 1.2; letter-spacing: -0.025em; text-shadow: 0 4px 6px rgba(0,0,0,0.5); margin: 0;">${title}</h3>
              </div>
              ${crownIcon}
            </div>
          </div>

          <!-- Back Side -->
          <div class="card-back rotate-y-180 backface-hidden bg-soft">
            ${tooOldRibbon}
            ${playTimeBadge}
            <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: flex-start;">
              <h3 class="text-main font-bold border-border text-left" style="font-size: 1.25rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 1rem; padding-right: 3rem;">${title}</h3>
              <div class="stats-container" style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${this.renderStat(this.i18n.get('gameplay'), rating_gameplay)}
                ${this.renderStat(this.i18n.get('narrative'), rating_narrative)}
                ${this.renderStat(this.i18n.get('presentation'), rating_presentation)}
                ${this.renderStat(this.i18n.get('technical'), rating_technical)}
                ${this.renderStat(this.i18n.get('impact'), rating_impact)}
              </div>
            </div>
            <div class="card-footer border-border" style="background-color: var(--color-primary); color: var(--palette-white); margin-top: auto; border-radius: 1.25rem; padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border); box-shadow: 0 4px 15px var(--color-primary-glow);">
              <span class="font-bold uppercase tracking-widest" style="color: var(--palette-white); opacity: 0.9; font-size: 0.75rem;">${this.i18n.get('total-score')}</span>
              <div style="display: flex; align-items: baseline; gap: 0.25rem;">
                <span class="font-black" style="color: var(--palette-white); font-size: 1.75rem; line-height: 1;">${total_score}</span>
                <span class="font-bold" style="color: var(--palette-white); opacity: 0.7; font-size: 0.8rem;">/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderStat(label, value) {
    const fillPercentage = (value / 1) * 100;
    return `
      <div class="stat-row group" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
        <span class="stat-label text-main" style="font-size: 1.05rem; font-weight: 600; letter-spacing: -0.01em; transition: color 0.3s ease;">${label}</span>
        <div class="rating-stars" style="position: relative; display: inline-block; width: 24px; height: 24px; line-height: 1;">
          <span class="material-symbols-outlined text-muted" style="font-size: 24px; opacity: 0.3; display: block; line-height: 1;">star</span>
          <span class="material-symbols-outlined filled text-primary" 
                style="position: absolute; top: 0; left: 0; font-size: 24px; line-height: 1; overflow: hidden; white-space: nowrap; width: ${fillPercentage}%;">
            star
          </span>
        </div>
      </div>
    `;
  }
}
