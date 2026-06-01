// world.js

// ══════════════════════════════════════════
//  COMPONENTE: movimiento libre WASD + VR
// ══════════════════════════════════════════
AFRAME.registerComponent('fantasy-movement', {
  schema: { speed: { default: 6 } },

  init() {
    this.keys = {};
    this.joystick = { x: 0, y: 0 };
    this.cam = null;
    this.vel = new THREE.Vector3();

    document.addEventListener('keydown', e =>
      this.keys[e.code] = true);
    document.addEventListener('keyup',   e =>
      this.keys[e.code] = false);

    // Joystick izquierdo Quest
    const left = document.querySelector(
      '[oculus-touch-controls="hand:left"]');
    if (left) {
      left.addEventListener('axismove', e => {
        this.joystick.x = e.detail.axis[2] || 0;
        this.joystick.y = e.detail.axis[3] || 0;
      });
    }
  },

  tick(t, dt) {
    if (!this.cam)
      this.cam = this.el.querySelector('a-camera');
    if (!this.cam) return;

    const speed  = this.data.speed * dt / 1000;
    const k      = this.keys;
    const jx     = this.joystick.x;
    const jy     = this.joystick.y;

    // Dirección según donde mira la cámara
    const camObj = this.cam.object3D;
    const fwd = new THREE.Vector3();
    camObj.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(fwd, THREE.Object3D.DefaultUp).negate();

    const move = new THREE.Vector3();

    // WASD
    if (k['KeyW'] || k['ArrowUp'])    move.addScaledVector(fwd,   1);
    if (k['KeyS'] || k['ArrowDown'])  move.addScaledVector(fwd,  -1);
    if (k['KeyA'] || k['ArrowLeft'])  move.addScaledVector(right,-1);
    if (k['KeyD'] || k['ArrowRight']) move.addScaledVector(right, 1);

    // Joystick Quest
    if (Math.abs(jy) > 0.1) move.addScaledVector(fwd,  -jy);
    if (Math.abs(jx) > 0.1) move.addScaledVector(right, jx);

    if (move.length() > 0) {
      move.normalize().multiplyScalar(speed);
      const pos = this.el.object3D.position;
      pos.add(move);
      // Mantener altura de ojos, no volar
      pos.y = 1.6;
    }
  }
});

// ══════════════════════════════════════════
//  GENERACIÓN PROCEDURAL DEL MUNDO
// ══════════════════════════════════════════
function rnd(min, max) {
  return min + Math.random() * (max - min);
}

document.addEventListener('DOMContentLoaded', () => {

  // ── ESTRELLAS ──────────────────────────────
  const starContainer = document.getElementById('stars');
  for (let i = 0; i < 300; i++) {
    const s = document.createElement('a-sphere');
    const theta = rnd(0, Math.PI * 2);
    const phi   = rnd(0.1, Math.PI / 2);
    const r     = rnd(120, 150);
    s.setAttribute('position',
      `${r*Math.sin(phi)*Math.cos(theta)}
       ${r*Math.cos(phi)}
       ${r*Math.sin(phi)*Math.sin(theta)}`);
    s.setAttribute('radius', String(rnd(0.15, 0.45)));
    s.setAttribute('color',
      ['#ffffff','#e8d8ff','#d0b0ff','#aaddff'][
        Math.floor(Math.random()*4)]);
    starContainer.appendChild(s);
  }

  // ── ÁRBOLES FANTÁSTICOS ────────────────────
  const treeContainer = document.getElementById('trees');
  const treePositions = [
    [-20,0,-10],[-15,0,-25],[-30,0,-5],
    [18,0,-12], [25,0,-30], [35,0,-8],
    [-8,0,-40],  [10,0,-45],  [-40,0,-35],
    [5,0,15],   [-12,0,12], [22,0,8],
  ];
  const trunkColors = ['#4a1a8a','#2a0a5e','#6a2aaa'];
  const leafColors  = ['#8833ff','#44aaff','#ff44cc','#33ffbb'];

  treePositions.forEach(([x, y, z]) => {
    const h   = rnd(4, 10);
    const tc  = trunkColors[Math.floor(Math.random()*trunkColors.length)];
    const lc  = leafColors[Math.floor(Math.random()*leafColors.length)];

    // Tronco
    const trunk = document.createElement('a-cylinder');
    trunk.setAttribute('position', `${x} ${h/2} ${z}`);
    trunk.setAttribute('height',   String(h));
    trunk.setAttribute('radius',   String(rnd(0.2, 0.5)));
    trunk.setAttribute('color',    tc);
    treeContainer.appendChild(trunk);

    // Copa (esfera brillante)
    const crown = document.createElement('a-sphere');
    const cr = rnd(2, 4);
    crown.setAttribute('position', `${x} ${h + cr*0.7} ${z}`);
    crown.setAttribute('radius',   String(cr));
    crown.setAttribute('color',    lc);
    crown.setAttribute('opacity',  '0.85');
    crown.setAttribute('emission', lc);
    crown.setAttribute('animation',
      `property:scale;from:1 1 1;to:1.05 1.1 1.05;
       dur:${Math.floor(rnd(2000,4000))};
       dir:alternate;loop:true;easing:easeInOutSine`);
    treeContainer.appendChild(crown);
  });

  // ── MONTAÑAS (conos) ───────────────────────
  const mtns = document.getElementById('mountains');
  [
    [-60,0,-80,30,50],
    [-20,0,-90,25,45],
    [30, 0,-85,35,55],
    [70, 0,-75,20,38],
    [-90,0,-60,22,42],
  ].forEach(([x,y,z,r,h]) => {
    const m = document.createElement('a-cone');
    m.setAttribute('position', `${x} ${h/2} ${z}`);
    m.setAttribute('radius-bottom', String(r));
    m.setAttribute('radius-top',    '1');
    m.setAttribute('height',        String(h));
    m.setAttribute('color',
      ['#2a0a5e','#1a083a','#3a1266'][Math.floor(Math.random()*3)]);
    mtns.appendChild(m);
  });

  // ── CRISTALES MÁGICOS ──────────────────────
  const cryContainer = document.getElementById('crystals');
  for (let i = 0; i < 18; i++) {
    const x = rnd(-50, 50);
    const z = rnd(-60, 5);
    const h = rnd(1, 4);
    const c = document.createElement('a-cone');
    const color = ['#cc44ff','#44ffcc','#ffaaff','#aaeeff'][
      Math.floor(Math.random()*4)];
    c.setAttribute('position',     `${x} ${h/2} ${z}`);
    c.setAttribute('radius-bottom', String(rnd(0.15,0.4)));
    c.setAttribute('radius-top',    '0.02');
    c.setAttribute('height',        String(h));
    c.setAttribute('color',         color);
    c.setAttribute('emission',      color);
    c.setAttribute('opacity',       '0.75');
    c.setAttribute('animation',
      `property:rotation;from:0 0 0;to:0 360 0;
       dur:${Math.floor(rnd(6000,15000))};loop:true;easing:linear`);
    cryContainer.appendChild(c);
  }

  // ── LUCIÉRNAGAS ────────────────────────────
  const ffContainer = document.getElementById('fireflies');
  for (let i = 0; i < 40; i++) {
    const ff = document.createElement('a-sphere');
    const sx = rnd(-40, 40);
    const sy = rnd(0.5, 5);
    const sz = rnd(-50, 10);
    const color = ['#ffffaa','#aaffdd','#ffddff','#aaddff'][
      Math.floor(Math.random()*4)];
    ff.setAttribute('position', `${sx} ${sy} ${sz}`);
    ff.setAttribute('radius',   '0.07');
    ff.setAttribute('color',    color);
    ff.setAttribute('emission', color);
    // Vuelo flotante
    ff.setAttribute('animation',
      `property:position;
       from:${sx} ${sy} ${sz};
       to:${sx+rnd(-4,4)} ${sy+rnd(-1,2)} ${sz+rnd(-4,4)};
       dur:${Math.floor(rnd(2000,5000))};
       dir:alternate;loop:true;easing:easeInOutSine`);
    // Parpadeo de opacidad
    ff.setAttribute('animation__blink',
      `property:material.opacity;from:0.9;to:0.1;
       dur:${Math.floor(rnd(800,2500))};
       dir:alternate;loop:true`);
    ffContainer.appendChild(ff);
  }

  // ── RUINAS ANTIGUAS ────────────────────────
  const ruinsContainer = document.getElementById('ruins');
  // Arco central
  [[-1.5,1.5,-30],[1.5,1.5,-30]].forEach(([x,y,z]) => {
    const pillar = document.createElement('a-box');
    pillar.setAttribute('position', `${x} ${y} ${z}`);
    pillar.setAttribute('width',  '0.6');
    pillar.setAttribute('height', '3');
    pillar.setAttribute('depth',  '0.6');
    pillar.setAttribute('color',  '#3a2a5e');
    ruinsContainer.appendChild(pillar);
  });
  // Dintel del arco
  const lintel = document.createElement('a-box');
  lintel.setAttribute('position', '0 3.3 -30');
  lintel.setAttribute('width',  '3.6');
  lintel.setAttribute('height', '0.5');
  lintel.setAttribute('depth',  '0.6');
  lintel.setAttribute('color',  '#3a2a5e');
  ruinsContainer.appendChild(lintel);

  // Orbe mágico en el arco
  const orb = document.createElement('a-sphere');
  orb.setAttribute('position', '0 2.2 -30');
  orb.setAttribute('radius',   '0.4');
  orb.setAttribute('color',    '#cc44ff');
  orb.setAttribute('emission', '#aa22ff');
  orb.setAttribute('animation',
    'property:material.color;from:#cc44ff;to:#44ccff;dur:2000;dir:alternate;loop:true');
  ruinsContainer.appendChild(orb);
});