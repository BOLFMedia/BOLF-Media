/**
 * FloatingParticles
 * Lightweight background effect for the Ratings page.
 */
export class FloatingParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.count = 50; // Sparse distribution

    this.init();
    window.addEventListener('resize', () => this.resize());
    
    // Theme observer
    const observer = new MutationObserver(() => this.updateColors());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  init() {
    this.resize();
    this.createParticles();
    this.updateColors();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  updateColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    // Dark mode uses soft white, Light mode uses a more visible primary blue
    this.particleColor = isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(84, 120, 158, 0.7)';
  }


  createParticles() {
    for (let i = 0; i < this.count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 1, // 1-3px
        speedY: (Math.random() - 0.5) * 0.4, // Slow up/down
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.particleColor;

    this.particles.forEach(p => {
      // Gentle floating oscillation
      p.y += p.speedY + Math.sin(Date.now() * 0.001 + p.phase) * 0.1;
      
      // Wrap around
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}
