// world.js  — FIX: material="emissive:..." en vez de emission=""

AFRAME.registerComponent('fantasy-movement', {
  schema: { speed: { default: 6 } },
  init() {
    this.keys = {};
    this.joystick = { x:0, y:0 };
    document.addEventListener('keydown', e => this.keys[e.code]=true);
    document.addEventListener('keyup',   e => this.keys[e.code]=false);
    const left = document.querySelector(
      '[oculus-touch-controls="hand:left"]');
    if(left) left.addEventListener('axismove', e=>{
      this.joystick.x = e.detail.axis[2]||0;
      this.joystick.y = e.detail.axis[3]||0;
    });
  },
  tick(t, dt) {
    if(!this.cam)
      this.cam = this.el.querySelector('a-camera');
    if(!this.cam) return;
    const speed = this.data.speed * dt / 1000;
    const k     = this.keys;
    const fwd   = new THREE.Vector3();
    this.cam.object3D.getWorldDirection(fwd);
    fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(fwd, THREE.Object3D.DefaultUp).negate();
    const move = new THREE.Vector3();
    if(k['KeyW']||k['ArrowUp'])    move.addScaledVector(fwd,   1);
    if(k['KeyS']||k['ArrowDown'])  move.addScaledVector(fwd,  -1);
    if(k['KeyA']||k['ArrowLeft'])  move.addScaledVector(right,-1);
    if(k['KeyD']||k['ArrowRight']) move.addScaledVector(right, 1);
    if(Math.abs(this.joystick.y)>0.1)
      move.addScaledVector(fwd, -this.joystick.y);
    if(Math.abs(this.joystick.x)>0.1)
      move.addScaledVector(right, this.joystick.x);
    if(move.length()>0) {
      move.normalize().multiplyScalar(speed);
      const pos = this.el.object3D.position;
      pos.add(move);
      pos.y = 1.6;
    }
  }
});

// ── helper ──────────────────────────────────
function rnd(a,b){ return a+Math.random()*(b-a); }

// FIX: setMat() usa el atributo material correcto
function setMat(el, color, emissive, opacity=1) {
  let mat = `color:${color};emissive:${emissive};emissiveIntensity:0.9`;
  if(opacity < 1) mat += `;opacity:${opacity};transparent:true`;
  el.setAttribute('material', mat);
}

document.addEventListener('DOMContentLoaded', () => {

  // ── ESTRELLAS ──────────────────────────────
  const sc = document.getElementById('stars');
  for(let i=0;i<250;i++){
    const s = document.createElement('a-sphere');
    const th=rnd(0,Math.PI*2), ph=rnd(0.05,Math.PI/2), r=rnd(100,140);
    s.setAttribute('position',
      `${r*Math.sin(ph)*Math.cos(th)} ${r*Math.cos(ph)} ${r*Math.sin(ph)*Math.sin(th)}`);
    s.setAttribute('radius', String(rnd(0.2,0.5)));
    const col=['#ffffff','#e8d8ff','#aaddff'][Math.floor(Math.random()*3)];
    setMat(s, col, col);
    sc.appendChild(s);
  }

  // ── MONTAÑAS ──────────────────────────────
  const mc=document.getElementById('mountains');
  [[-50,0,-70,28,50],[-15,0,-75,22,42],
   [25,0,-70,30,52],[60,0,-65,20,36],[-80,0,-60,18,35]]
  .forEach(([x,y,z,r,h])=>{
    const m=document.createElement('a-cone');
    m.setAttribute('position',`${x} ${h/2} ${z}`);
    m.setAttribute('radius-bottom',String(r));
    m.setAttribute('radius-top','2');
    m.setAttribute('height',String(h));
    const col=['#2a0a5e','#1a083a','#3a1266'][Math.floor(Math.random()*3)];
    setMat(m, col, '#220055');
    mc.appendChild(m);
  });

  // ── ÁRBOLES ────────────────────────────────
  const tc=document.getElementById('trees');
  [[-18,0,-8],[-12,0,-20],[-28,0,-5],
   [16,0,-10],[24,0,-22],[32,0,-6],
   [-6,0,-32],[8,0,-38],[4,0,12],[-10,0,10]]
  .forEach(([x,y,z])=>{
    const h=rnd(4,9), cr=rnd(2,3.5);
    const leafCol=['#8833ff','#44aaff','#ff44cc','#33ffbb'][Math.floor(Math.random()*4)];
    const trunk=document.createElement('a-cylinder');
    trunk.setAttribute('position',`${x} ${h/2} ${z}`);
    trunk.setAttribute('height',String(h));
    trunk.setAttribute('radius',String(rnd(0.2,0.45)));
    setMat(trunk,'#3a1266','#1a0044');
    tc.appendChild(trunk);
    const crown=document.createElement('a-sphere');
    crown.setAttribute('position',`${x} ${h+cr*0.7} ${z}`);
    crown.setAttribute('radius',String(cr));
    setMat(crown, leafCol, leafCol, 0.85);
    crown.setAttribute('animation',
      `property:scale;from:1 1 1;to:1.05 1.1 1.05;
       dur:${Math.floor(rnd(2000,4000))};
       dir:alternate;loop:true;easing:easeInOutSine`);
    tc.appendChild(crown);
  });

  // ── CRISTALES ──────────────────────────────
  const cc=document.getElementById('crystals');
  for(let i=0;i<20;i++){
    const x=rnd(-40,40), z=rnd(-50,5), h=rnd(1,4);
    const cry=document.createElement('a-cone');
    const col=['#cc44ff','#44ffcc','#ffaaff','#aaeeff'][Math.floor(Math.random()*4)];
    cry.setAttribute('position',`${x} ${h/2} ${z}`);
    cry.setAttribute('radius-bottom',String(rnd(0.15,0.4)));
    cry.setAttribute('radius-top','0.02');
    cry.setAttribute('height',String(h));
    setMat(cry, col, col, 0.8);
    cry.setAttribute('animation',
      `property:rotation;from:0 0 0;to:0 360 0;
       dur:${Math.floor(rnd(6000,14000))};loop:true;easing:linear`);
    cc.appendChild(cry);
  }

  // ── LUCIÉRNAGAS ────────────────────────────
  const fc=document.getElementById('fireflies');
  for(let i=0;i<40;i++){
    const ff=document.createElement('a-sphere');
    const sx=rnd(-30,30),sy=rnd(0.5,4),sz=rnd(-40,8);
    const col=['#ffffaa','#aaffdd','#ffddff','#aaddff'][Math.floor(Math.random()*4)];
    ff.setAttribute('position',`${sx} ${sy} ${sz}`);
    ff.setAttribute('radius','0.07');
    setMat(ff, col, col);
    ff.setAttribute('animation',
      `property:position;from:${sx} ${sy} ${sz};
       to:${sx+rnd(-3,3)} ${sy+rnd(-1,1.5)} ${sz+rnd(-3,3)};
       dur:${Math.floor(rnd(2000,5000))};dir:alternate;loop:true;easing:easeInOutSine`);
    ff.setAttribute('animation__blink',
      `property:material.opacity;from:0.9;to:0.1;
       dur:${Math.floor(rnd(800,2500))};dir:alternate;loop:true`);
    fc.appendChild(ff);
  }

  // ── RUINAS ─────────────────────────────────
  const rc=document.getElementById('ruins');
  [[-1.5,1.5,-22],[1.5,1.5,-22]].forEach(([x,y,z])=>{
    const p=document.createElement('a-box');
    p.setAttribute('position',`${x} ${y} ${z}`);
    p.setAttribute('width','0.6');
    p.setAttribute('height','3');
    p.setAttribute('depth','0.6');
    setMat(p,'#4a3a7e','#220055');
    rc.appendChild(p);
  });
  const lintel=document.createElement('a-box');
  lintel.setAttribute('position','0 3.3 -22');
  lintel.setAttribute('width','3.6');
  lintel.setAttribute('height','0.5');
  lintel.setAttribute('depth','0.6');
  setMat(lintel,'#4a3a7e','#220055');
  rc.appendChild(lintel);
  const orb=document.createElement('a-sphere');
  orb.setAttribute('position','0 2.2 -22');
  orb.setAttribute('radius','0.4');
  setMat(orb,'#cc44ff','#aa22ff');
  orb.setAttribute('animation',
    'property:material.emissive;from:#aa22ff;to:#22aaff;dur:2000;dir:alternate;loop:true');
  rc.appendChild(orb);
});