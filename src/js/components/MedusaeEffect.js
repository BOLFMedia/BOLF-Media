import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js';

export class MedusaeEffect {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.config = {
      cursor: { radius: 0.1, strength: 4, dragFactor: 0.02 },
      halo: {
        outerOscFrequency: 2.6, outerOscAmplitude: 0.6,
        radiusBase: 2.2, radiusAmplitude: 0.4, shapeAmplitude: 0.6,
        rimWidth: 1.5, outerStartOffset: 0.3, outerEndOffset: 2.0,
        scaleX: 1.2, scaleY: 0.9
      },
      particles: {
        baseSize: 0.012, activeSize: 0.035,
        blobScaleX: 1, blobScaleY: 0.6,
        rotationSpeed: 0.08, rotationJitter: 0.15,
        cursorFollowStrength: 1, oscillationFactor: 0.8
      }
    };

    this.init();
  }

  getThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
      return {
        background: '#000000', // Deep black for Dark Mode
        base: '#033255',
        c1: '#54789E',
        c2: '#23496D',
        c3: '#7094BB'
      };
    } else {
      return {
        background: '#FFFFFF',
        base: '#A5CAF4',
        c1: '#54789E',
        c2: '#7094BB',
        c3: '#E9F1FF'
      };
    }
  }

  init() {
    this.scene = new THREE.Scene();
    this.colors = this.getThemeColors();
    this.scene.background = new THREE.Color(this.colors.background);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.setupShaders();
    this.setupMesh();
    this.setupEvents();
    this.animate();
  }

  setupShaders() {
    this.vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uHaloRadiusBase;
      uniform float uHaloRadiusAmplitude;
      uniform float uHaloShapeAmplitude;
      uniform float uHaloRimWidth;
      uniform float uHaloScaleX;
      uniform float uHaloScaleY;
      uniform float uParticleBaseSize;
      uniform float uParticleActiveSize;
      uniform float uBlobScaleX;
      uniform float uBlobScaleY;
      varying vec2 vUv;
      varying float vSize;
      varying vec2 vPos;
      attribute vec3 aOffset;
      attribute float aRandom;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      void main() {
        vUv = uv;
        vec3 pos = aOffset;
        float drift = uTime * 0.1;
        pos.x += (sin(drift + pos.y * 0.5) + sin(drift * 0.5 + pos.y * 2.0)) * 0.2;
        pos.y += (cos(drift + pos.x * 0.5) + cos(drift * 0.5 + pos.x * 2.0)) * 0.2;

        vec2 rel = pos.xy - uMouse;
        float dist = length(rel / vec2(uHaloScaleX, uHaloScaleY));
        float breath = sin(uTime * 0.8);
        float radius = (uHaloRadiusBase + breath * uHaloRadiusAmplitude) + (noise(normalize(rel + 0.0001) * 2.0 + vec2(0.0, uTime * 0.1)) * uHaloShapeAmplitude);
        float rim = smoothstep(uHaloRimWidth, 0.0, abs(dist - radius));
        
        pos.xy += normalize(rel + 0.0001) * (breath * 0.5 + 0.5) * 0.4 * rim;
        pos.z += rim * 0.3 * sin(uTime);

        float currentScale = uParticleBaseSize + (rim * uParticleActiveSize);
        vec3 transformed = position;
        transformed.x *= currentScale * uBlobScaleX;
        transformed.y *= currentScale * uBlobScaleY;
        
        vSize = rim;
        vPos = pos.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + transformed, 1.0);
      }
    `;

    this.fragmentShader = `
      uniform float uTime;
      uniform vec3 uColorBase;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      varying vec2 vUv;
      varying float vSize;
      varying vec2 vPos;

      void main() {
        float d = pow(pow(abs(vUv.x - 0.5) * 2.0, 2.6) + pow(abs(vUv.y - 0.5) * 2.0, 2.6), 1.0 / 2.6);
        float alpha = 1.0 - smoothstep(0.8, 1.0, d);
        if (alpha < 0.01) discard;

        float t = uTime * 1.2;
        float p = sin(vPos.x * 0.8 + t);
        vec3 activeColor = mix(uColor1, uColor2, p * 0.5 + 0.5);
        activeColor = mix(activeColor, uColor3, sin(vPos.y * 0.8 + t * 0.8 + p) * 0.5 + 0.5);
        
        gl_FragColor = vec4(mix(uColorBase, activeColor, smoothstep(0.1, 0.8, vSize)), alpha * mix(0.3, 0.9, vSize));
      }
    `;
  }

  setupMesh() {
    const countX = 100, countY = 55;
    const count = countX * countY;
    const geo = new THREE.PlaneGeometry(1, 1);
    
    this.uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uHaloRadiusBase: { value: this.config.halo.radiusBase },
      uHaloRadiusAmplitude: { value: this.config.halo.radiusAmplitude },
      uHaloShapeAmplitude: { value: this.config.halo.shapeAmplitude },
      uHaloRimWidth: { value: this.config.halo.rimWidth },
      uHaloScaleX: { value: this.config.halo.scaleX },
      uHaloScaleY: { value: this.config.halo.scaleY },
      uParticleBaseSize: { value: this.config.particles.baseSize },
      uParticleActiveSize: { value: this.config.particles.activeSize },
      uBlobScaleX: { value: this.config.particles.blobScaleX },
      uBlobScaleY: { value: this.config.particles.blobScaleY },
      uColorBase: { value: new THREE.Color(this.colors.base) },
      uColor1: { value: new THREE.Color(this.colors.c1) },
      uColor2: { value: new THREE.Color(this.colors.c2) },
      uColor3: { value: new THREE.Color(this.colors.c3) },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      transparent: true,
      depthWrite: false
    });

    const offsets = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    let idx = 0;
    for (let y = 0; y < countY; y++) {
      for (let x = 0; x < countX; x++) {
        offsets[idx * 3] = (x / (countX - 1) - 0.5) * 40 + (Math.random() - 0.5) * 0.25;
        offsets[idx * 3 + 1] = (y / (countY - 1) - 0.5) * 22 + (Math.random() - 0.5) * 0.25;
        randoms[idx] = Math.random();
        idx++;
      }
    }
    geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
    geo.setAttribute('aRandom', new THREE.InstancedBufferAttribute(randoms, 1));

    this.mesh = new THREE.InstancedMesh(geo, mat, count);
    this.scene.add(this.mesh);
  }

  updateTheme() {
    this.colors = this.getThemeColors();
    this.scene.background = new THREE.Color(this.colors.background);
    this.uniforms.uColorBase.value.set(this.colors.base);
    this.uniforms.uColor1.value.set(this.colors.c1);
    this.uniforms.uColor2.value.set(this.colors.c2);
    this.uniforms.uColor3.value.set(this.colors.c3);
  }

  setupEvents() {
    this.mouseTarget = { x: 0, y: 0 };
    this.mouseCurrent = new THREE.Vector2(0, 0);

    window.addEventListener('pointermove', (e) => {
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      const vFov = (this.camera.fov * Math.PI) / 180;
      const h = 2 * Math.tan(vFov / 2) * this.camera.position.z;
      const w = h * this.camera.aspect;
      this.mouseTarget.x = (ndcX * w) / 2;
      this.mouseTarget.y = (ndcY * h) / 2;
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Observe theme changes
    const observer = new MutationObserver(() => this.updateTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.uniforms.uTime.value += 0.016;
    this.mouseCurrent.x += (this.mouseTarget.x - this.mouseCurrent.x) * this.config.cursor.dragFactor;
    this.mouseCurrent.y += (this.mouseTarget.y - this.mouseCurrent.y) * this.config.cursor.dragFactor;
    this.uniforms.uMouse.value.copy(this.mouseCurrent);
    this.renderer.render(this.scene, this.camera);
  }
}
