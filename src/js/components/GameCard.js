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
      image_URL,
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
          <div class="card-front backface-hidden overflow-hidden">
            <div class="h-full w-full bg-cover bg-center bg-no-repeat" style="background-image: url('${image_URL}');">
              <div class="title-overlay">
                <h3 class="text-white text-2xl font-black leading-tight tracking-tight drop-shadow-md">${title}</h3>
              </div>
              ${crownIcon}
            </div>
          </div>

          <!-- Back Side -->
          <div class="card-back rotate-y-180 backface-hidden">
            ${tooOldRibbon}
            ${playTimeBadge}
            <div class="flex-grow flex flex-col justify-start gap-4">
              <h3 class="text-main text-xl font-bold border-b border-border pb-2 text-left mb-2 pr-12">${title}</h3>
              <div class="stats-container space-y-4">
                ${this.renderStat(this.i18n.get('gameplay'), rating_gameplay)}
                ${this.renderStat(this.i18n.get('narrative'), rating_narrative)}
                ${this.renderStat(this.i18n.get('presentation'), rating_presentation)}
                ${this.renderStat(this.i18n.get('technical'), rating_technical)}
                ${this.renderStat(this.i18n.get('impact'), rating_impact)}
              </div>
            </div>
            <div class="card-footer mt-4 bg-soft rounded-xl p-4 flex items-center justify-between border border-border">
              <span class="text-muted text-xs font-bold uppercase tracking-widest">${this.i18n.get('total-score')}</span>
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-black text-primary">${total_score}</span>
                <span class="text-muted font-bold text-sm">/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderStat(label, value) {
    const fillPercentage = (value / 5) * 100;
    return `
      <div class="stat-row flex items-center justify-between group">
        <span class="stat-label text-main text-sm font-medium transition-colors group-hover:text-primary">${label}</span>
        <div class="rating-stars relative inline-block h-[24px]">
          <span class="material-symbols-outlined text-muted !text-[24px] opacity-20">star</span>
          <span class="material-symbols-outlined absolute top-0 left-0 text-primary !text-[24px] overflow-hidden filled" 
                style="width: ${fillPercentage}%;">
            star
          </span>
        </div>
      </div>
    `;
  }
}
