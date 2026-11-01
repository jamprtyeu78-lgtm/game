const V3=THREE.Vector3,$=i=>document.getElementById(i),rnd=(a,b)=>a+Math.random()*(b-a),PI=Math.PI;
const S={diff:2,q:1,vol:.7,sfx:1,time:0,ctl:0,cs:1,sens:1,col:'#35c4ff',tint:0,mus:1},JS={x:0,y:0},IS_T=matchMedia('(pointer:coarse)').matches;
const touchOn=()=>S.ctl==2||(S.ctl==0&&IS_T);
function err(e){let d=$('err');if(!d){d=document.createElement('pre');d.id='err';d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:9;background:#400;color:#fff;font-size:12px;white-space:pre-wrap;direction:ltr;margin:0;padding:6px';document.body.appendChild(d)}d.textContent=String(e&&e.stack||e).slice(0,700)}
addEventListener('error',e=>err(e.error||e.message));
const R=new THREE.WebGLRenderer({antialias:true});document.body.appendChild(R.domElement);
const sc=new THREE.Scene();sc.background=new THREE.Color(0x7fb2e5);sc.fog=new THREE.Fog(0x9cc4ea,80,700);
const cam=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1500);
const hemi=new THREE.HemisphereLight(0xffffff,0x445566,1.15);sc.add(hemi);const sun=new THREE.DirectionalLight(0xfff2d0,.9);sun.position.set(100,200,60);sc.add(sun);
function applyQ(){R.setPixelRatio(S.q?Math.min(devicePixelRatio,2):1);R.setSize(innerWidth,innerHeight);sc.fog.far=S.q?700:350;cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',applyQ);applyQ();
// ---------- audio
let AC,NB,WG,WF,SO,SG;
function au(){if(AC)return;AC=new(window.AudioContext||window.webkitAudioContext)();NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
const n=AC.createBufferSource();n.buffer=NB;n.loop=true;WF=AC.createBiquadFilter();WF.type='lowpass';WG=AC.createGain();WG.gain.value=0;n.connect(WF);WF.connect(WG);WG.connect(AC.destination);n.start();
SO=AC.createOscillator();SO.type='square';SG=AC.createGain();SG.gain.value=0;SO.connect(SG);SG.connect(AC.destination);SO.start()}
function tone(a,b,d,ty='sine',v=.2){if(!AC||!S.sfx)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(a,t);o.frequency.exponentialRampToValueAtTime(b,t+d);g.gain.setValueAtTime(v*S.vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(t+d)}
function boom(v=.6){if(!AC||!S.sfx)return;const t=AC.currentTime,s=AC.createBufferSource(),g=AC.createGain(),f=AC.createBiquadFilter();s.buffer=NB;f.type='lowpass';f.frequency.value=450;g.gain.setValueAtTime(v*S.vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.7);s.connect(f);f.connect(g);g.connect(AC.destination);s.start();s.stop(t+.7)}
// ---------- music
const MU=new Audio('game.wav');MU.loop=true;MU.preload='auto';MU.volume=0;let muGo=false,muVol=0;
function musTick(dt){const tg=(S.mus==2||(S.mus==1&&!playing))?Math.min(1,S.vol*(playing?.45:.8)):0;muVol+=(tg-muVol)*Math.min(1,2.5*dt);MU.volume=Math.max(0,Math.min(1,muVol));
if(muGo&&tg>0&&MU.paused)MU.play().catch(()=>{});else if(tg==0&&MU.volume<.005&&!MU.paused)MU.pause()}
function musGo(){if(muGo)return;MU.play().then(()=>{muGo=true;['pointerdown','keydown','touchstart'].forEach(ev=>removeEventListener(ev,musGo,true))}).catch(()=>{})}
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,musGo,true));
// ---------- particles
const NP=600,pp=new Float32Array(NP*3).fill(-999),pc=new Float32Array(NP*3),pv=new Float32Array(NP*3),pl=new Float32Array(NP);let pi=0;
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));pg.setAttribute('color',new THREE.BufferAttribute(pc,3));
const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:1.7,vertexColors:true,transparent:true,opacity:.9,depthWrite:false}));pts.frustumCulled=false;sc.add(pts);
const sg=new Float32Array(900);for(let i=0;i<300;i++){const a=rnd(0,2*PI),b=rnd(.05,1.2);sg[i*3]=Math.cos(a)*Math.cos(b)*900;sg[i*3+1]=Math.sin(b)*900;sg[i*3+2]=Math.sin(a)*Math.cos(b)*900}
const sgm=new THREE.BufferGeometry();sgm.setAttribute('position',new THREE.BufferAttribute(sg,3));const stars=new THREE.Points(sgm,new THREE.PointsMaterial({size:2.5,sizeAttenuation:false,color:0xffffff,transparent:true,opacity:0,fog:false,depthWrite:false}));stars.frustumCulled=false;sc.add(stars);
function emit(p,v,c,l){const i=pi++%NP;pp.set([p.x,p.y,p.z],i*3);pv.set([v.x,v.y,v.z],i*3);pc.set([c.r,c.g,c.b],i*3);pl[i]=l}
function burst(p,col,n){for(let k=0;k<n;k++)emit(p,new V3(rnd(-1,1),rnd(-.3,1),rnd(-1,1)).multiplyScalar(rnd(6,22)),k%3?col:new THREE.Color(0xffaa33),rnd(.5,1.2))}
// ---------- city
const B=[],BM=[];
function mkTex(c){const k=document.createElement('canvas');k.width=k.height=64;const x=k.getContext('2d');x.fillStyle=c;x.fillRect(0,0,64,64);for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=Math.random()<.35?'#ffe9a0':'#1b2a40';x.fillRect(i*16+3,j*16+4,10,9)}const t=new THREE.CanvasTexture(k);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function mkE(){const k=document.createElement('canvas');k.width=k.height=64;const x=k.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,64,64);for(let i=0;i<4;i++)for(let j=0;j<4;j++)if(Math.random()<.45){x.fillStyle='#ffd77a';x.fillRect(i*16+3,j*16+4,10,9)}const t=new THREE.CanvasTexture(k);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
const etexs=[0,1,2,3,4].map(mkE);
const texs=['#6b7a90','#8a6f5a','#4f6f8f','#7a7f88','#5c5470'].map(mkTex);
function addB(x,z,w,d,h,ti){const t=texs[ti].clone();t.needsUpdate=true;t.repeat.set(w/10,h/10);const e=etexs[ti].clone();e.needsUpdate=true;e.repeat.set(w/10,h/10);const mt=new THREE.MeshLambertMaterial({map:t,emissive:0xffffff,emissiveMap:e,emissiveIntensity:0});BM.push(mt);const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mt);m.position.set(x,h/2,z);sc.add(m);B.push({x,z,w,d,h});return m}
const gr=new THREE.Mesh(new THREE.PlaneGeometry(940,940),new THREE.MeshLambertMaterial({color:0x6d7a6a}));gr.rotation.x=-PI/2;sc.add(gr);
const sand=new THREE.Mesh(new THREE.PlaneGeometry(1010,1010),new THREE.MeshLambertMaterial({color:0xcdbf8f}));sand.rotation.x=-PI/2;sand.position.y=-.05;sc.add(sand);
const wk=document.createElement('canvas');wk.width=wk.height=128;{const x=wk.getContext('2d');x.fillStyle='#1d6fb8';x.fillRect(0,0,128,128);x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=2;for(let i=0;i<12;i++){const px=rnd(0,128),py=rnd(0,128);for(const ox of[-128,0,128])for(const oy of[-128,0,128]){x.beginPath();x.moveTo(px+ox,py+oy);x.quadraticCurveTo(px+ox+11,py+oy-5,px+ox+24,py+oy);x.stroke()}}}
const wt=new THREE.CanvasTexture(wk);wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(60,60);
const water=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000),new THREE.MeshLambertMaterial({map:wt}));water.rotation.x=-PI/2;water.position.y=-.4;sc.add(water);
const offLand=p=>Math.abs(p.x)>470||Math.abs(p.z)>470;
const rm=new THREE.MeshLambertMaterial({color:0x2a2d33});
for(let i=-5;i<=5;i++)for(const a of[0,1]){const r=new THREE.Mesh(new THREE.PlaneGeometry(20,880),rm);r.rotation.x=-PI/2;r.rotation.z=a?PI/2:0;r.position.set(a?0:i*80,.05,a?i*80:0);sc.add(r)}
for(let i=-5;i<5;i++)for(let j=-5;j<5;j++){const cx=i*80+40,cz=j*80+40;if(!i&&!j)continue;for(const a of[-14.5,14.5])for(const b of[-14.5,14.5])addB(cx+a,cz+b,21,21,rnd(14,95),Math.floor(Math.random()*5))}
const pm=addB(40,40,50,50,26,0);pm.material=new THREE.MeshLambertMaterial({color:0x2f4f9a});
{const k=document.createElement('canvas');k.width=256;k.height=64;const x=k.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,256,64);x.fillStyle='#123';x.font='bold 44px sans-serif';x.textAlign='center';x.fillText('POLICE',128,48);const s=new THREE.Mesh(new THREE.PlaneGeometry(26,6.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(k)}));s.position.set(40,18,14.9);sc.add(s);
const bl=new THREE.Mesh(new THREE.BoxGeometry(4,2,4),new THREE.MeshBasicMaterial({color:0xff2222}));bl.position.set(40,27,40);sc.add(bl);window.beacon=bl}
const PB=B.find(b=>b.x==40&&b.z==40&&b.h==26);
const CN={st:0,op:0,rs:0,cd:0,shots:0},shells=[],CX=40,CZ=53;
const cg=new THREE.Group(),cM=new THREE.MeshLambertMaterial({color:0x39414d}),cR=new THREE.MeshLambertMaterial({color:0x8a2020}),chead=new THREE.Group();
{const base=new THREE.Mesh(new THREE.CylinderGeometry(3.2,3.8,2.2,14),cM);base.position.y=1.1;chead.position.y=3.4;
chead.add(new THREE.Mesh(new THREE.SphereGeometry(2.4,14,10),cR),new THREE.Mesh(new THREE.CylinderGeometry(.7,.9,11,12).rotateX(PI/2).translate(0,0,6.5),cM),new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,1.4,12).rotateX(PI/2).translate(0,0,12),cR));
cg.add(base,chead);cg.position.set(CX,19,CZ);cg.visible=false;sc.add(cg)}
const hM=new THREE.MeshLambertMaterial({color:0x15191f}),hd=[-1,1].map(k=>{const d=new THREE.Mesh(new THREE.BoxGeometry(5,.5,9),hM);d.position.set(CX+k*2.5,26.25,CZ);sc.add(d);return d});
function cannonReset(){CN.st=0;CN.op=CN.rs=0;CN.shots=0;cg.visible=false;cg.position.y=19;hd[0].position.x=CX-2.5;hd[1].position.x=CX+2.5;shells.forEach(q=>sc.remove(q.m));shells.length=0}
function polHit(){P.heat=Math.min(100,P.heat+6);if(CN.st==0){CN.st=1;CN.op=CN.rs=0;tone(80,200,.8,'sawtooth',.2);toast('🚨 المدفع طلع!')}else if(CN.st==3)CN.st=2;CN.shots=3;if(CN.st==2)CN.cd=Math.min(CN.cd,.5)}
const cAim=new V3();
function cannonUpd(dt){
if(CN.st==1){if(CN.op<1)CN.op=Math.min(1,CN.op+dt*2);else{CN.rs=Math.min(1,CN.rs+dt/.9);if(CN.rs>=1){CN.st=2;CN.cd=.6}}}
else if(CN.st==2){CN.cd-=dt;if(CN.cd<=0){if(CN.shots>0){cFire();CN.shots--;CN.cd=1.5}else CN.st=3}}
else if(CN.st==3){if(CN.rs>0)CN.rs=Math.max(0,CN.rs-dt/.9);else{CN.op=Math.max(0,CN.op-dt*2);if(CN.op<=0)CN.st=0}}
cg.position.y=19+CN.rs*7.4;cg.visible=CN.rs>.001;hd[0].position.x=CX-2.5-CN.op*5.5;hd[1].position.x=CX+2.5+CN.op*5.5;
if(cg.visible){const w=new V3(CX,cg.position.y+3.4,CZ),d=w.distanceTo(P.p);cAim.copy(P.p).setY(P.p.y+1).addScaledVector(P.v,d/110);chead.lookAt(cAim)}}
function cFire(){const w=new V3(CX,cg.position.y+3.4,CZ),d=cAim.clone().sub(w).normalize(),mp=w.clone().addScaledVector(d,12.5);
const m=new THREE.Mesh(new THREE.SphereGeometry(.9,10,8),new THREE.MeshBasicMaterial({color:0xffaa33}));m.position.copy(mp);sc.add(m);shells.push({m,p:mp,v:d.multiplyScalar(110),life:6});
burst(mp,new THREE.Color(0xffcc55),30);boom(.7);tone(110,30,.5,'sawtooth',.3)}
function shellsUpd(dt){for(const q of shells.slice()){q.p.addScaledVector(q.v,dt);q.m.position.copy(q.p);emit(q.p,new V3(),new THREE.Color(1,.6,.2),.4);q.life-=dt;
let x=q.life<=0||q.p.y<0;for(const b of B)if(b!==PB&&q.p.y<b.h&&Math.abs(q.p.x-b.x)<b.w/2&&Math.abs(q.p.z-b.z)<b.d/2){x=1;break}
if(q.p.distanceTo(P.p.clone().setY(P.p.y+1))<4.5){hurt();x=1}
if(x){burst(q.p,new THREE.Color(0xff6633),50);boom(.8);for(const o of items.slice())if(o.st!='held'&&o.m.position.distanceTo(q.p)<10)brk(o,0);sc.remove(q.m);shells.splice(shells.indexOf(q),1)}}}
function samLaunch(){const a=rnd(0,2*PI),g=new THREE.Group();
g.add(new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,5,8).rotateX(PI/2),new THREE.MeshLambertMaterial({color:0xdddddd})),new THREE.Mesh(new THREE.ConeGeometry(.45,1.4,8).rotateX(PI/2).translate(0,0,3.2),new THREE.MeshBasicMaterial({color:0xff2222})),new THREE.Mesh(new THREE.ConeGeometry(.4,2.2,8).rotateX(-PI/2).translate(0,0,-3.4),new THREE.MeshBasicMaterial({color:0xffaa22})));g.scale.setScalar(1.6);
const p=new V3(P.p.x+Math.sin(a)*110,Math.max(8,P.p.y-140),P.p.z+Math.cos(a)*110);g.position.copy(p);sc.add(g);
mis.push({m:g,p,d:P.p.clone().sub(p).normalize(),life:9,sp:105,tr:1.6});toast('⚠ صاروخ دفاع جوي! راوغ يمين أو شمال');tone(1500,500,.7,'sawtooth',.12)}
function samCheck(dt){if(P.p.y>160&&!P.warnHi){P.warnHi=1;toast('⚠ ارتفاع خطير — الدفاع الجوي شايفك')}else if(P.p.y<130)P.warnHi=0;
if(P.p.y>200){P.hiT=(P.hiT||0)+dt;if(P.hiT>(P.hiN?3.5:1.5)){P.hiT=0;P.hiN=1;samLaunch()}}else{P.hiT=0;P.hiN=0}}
// ---------- items (cars / pedestrians)
const items=[];
function mkCar(){const g=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(2,.8,4.4),new THREE.MeshLambertMaterial({color:new THREE.Color().setHSL(Math.random(),.7,.5)}));b.position.y=.7;const t=new THREE.Mesh(new THREE.BoxGeometry(1.8,.7,2.2),new THREE.MeshLambertMaterial({color:0x223344}));t.position.set(0,1.4,-.2);g.add(b,t);const wm=new THREE.MeshLambertMaterial({color:0x111111});for(const[x,z]of[[1,1.4],[-1,1.4],[1,-1.4],[-1,-1.4]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.3,10),wm);w.rotation.z=PI/2;w.position.set(x,.4,z);g.add(w)}return g}
function mkPed(){const g=new THREE.Group(),b=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,1.2,8),new THREE.MeshLambertMaterial({color:new THREE.Color().setHSL(Math.random(),.6,.5)}));b.position.y=.9;const h=new THREE.Mesh(new THREE.SphereGeometry(.3,8,8),new THREE.MeshLambertMaterial({color:0xf0c8a0}));h.position.y=1.8;g.add(b,h);return g}
function place(it){const m=it.m;if(it.ax==0){m.position.set(it.lat,0,it.al);m.rotation.set(0,it.s>0?0:PI,0)}else{m.position.set(it.al,0,it.lat);m.rotation.set(0,it.s>0?PI/2:-PI/2,0)}}
function spawn(type){const car=type=='car',s=Math.random()<.5?1:-1,it={m:car?mkCar():mkPed(),type,ax:Math.random()<.5?0:1,s,sp:car?rnd(10,18):rnd(2,3.5),lat:Math.floor(rnd(-5,5))*80+s*(car?4:12.5),al:rnd(-380,380),st:'ok',v:new V3(),r:car?2.4:1,t:0};sc.add(it.m);items.push(it);place(it)}
function kill(it){sc.remove(it.m);items.splice(items.indexOf(it),1);spawn(it.type)}
function brk(it,crime){burst(it.m.position.clone().setY(Math.max(1,it.m.position.y)),it.type=='car'?new THREE.Color(0xff8833):new THREE.Color(0xdd2222),it.type=='car'?45:25);boom(.5);P.heat=Math.min(100,P.heat+crime);kill(it)}
// ---------- jets & missiles
const jets=[],mis=[];
function mkJet(){if(JG)return JG.clone(true);const g=new THREE.Group(),m=new THREE.MeshLambertMaterial({color:0x6c7480}),f=new THREE.CylinderGeometry(.5,1.1,9,10);f.rotateX(PI/2);g.add(new THREE.Mesh(f,m));
const w=new THREE.Mesh(new THREE.BoxGeometry(9,.2,3),m);w.position.z=-1;const t=new THREE.Mesh(new THREE.BoxGeometry(3.4,.2,1.4),m);t.position.z=-4;const fn=new THREE.Mesh(new THREE.BoxGeometry(.2,1.8,1.5),m);fn.position.set(0,1,-4);
const l=new THREE.Mesh(new THREE.SphereGeometry(.3,6,6),new THREE.MeshBasicMaterial({color:0xff2020}));l.position.set(0,.6,-5);g.add(w,t,fn,l);g.scale.setScalar(1.7);return g}
function addJet(){const a=rnd(0,2*PI),m=mkJet();const j={m,p:P.p.clone().add(new V3(Math.sin(a)*380,0,Math.cos(a)*380)),d:new V3(-Math.sin(a),0,-Math.cos(a)),sp:[0,50,58,68][S.diff],cd:rnd(2,4)};j.p.y=90;sc.add(m);jets.push(j)}
// ---------- player + animation
const P={p:new V3(0,6,0),v:new V3(),yaw:0,mode:'ground',idle:0,hp:3,hold:null,lock:0,inv:0,stun:0,dead:0,hop:0,desc:false,heat:0};
let curN='BossIdle',cy=0,cp=.25,playing=false,mixer,acts={},cur,PV=new THREE.Group();sc.add(PV);
function play(n,o={}){const a=acts[n];if(!a||(cur===a&&!o.force))return;a.reset();a.timeScale=o.ts||1;a.setLoop(o.once?THREE.LoopOnce:THREE.LoopRepeat,Infinity);a.clampWhenFinished=!!o.once;a.fadeIn(.15).play();if(cur&&cur!==a)cur.fadeOut(.15);cur=a;curN=n}
let ANC=0;function once(n,len){ANC++;const a=acts[n],d=a?a.getClip().duration:len;play(n,{once:1,force:1,ts:Math.max(1,Math.min(3,d/len))});P.lock=len}
function anim(){if(P.lock>0||P.dead>0)return;let n;const sp=Math.hypot(P.v.x,P.v.z),bank=!!(K.KeyA||K.KeyD)||Math.abs(JS.x)>.4;
if(P.stun>0)n='DeathFall';else if(P.mode=='ground')n='BossIdle';else if(P.desc)n=bank&&P.v.y<-4?'SpringFallBank':'SpringFall';else if(sp<4&&Math.abs(P.v.y)<4)n='BossIdle';else if(P.v.y<-14)n=bank?'SpringFallBank':'SpringFall';else if(K.ShiftLeft&&sp>55)n='SpringBossGlide';else if(P.v.y>7&&sp<30)n='SpringLaunchLoop';else if(bank&&sp>8)n='SpringGlideBank';else n='SpringGlide';play(n)}
let ready=false,GL,JG;
new THREE.GLTFLoader().parse(Uint8Array.from(atob(GLB2),c=>c.charCodeAt(0)).buffer,'',g=>{const m=g.scene;m.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(m),c=bx.getCenter(new V3()),L=bx.max.z-bx.min.z;m.position.sub(c);const w=new THREE.Group();w.add(m);w.scale.setScalar(16/L);JG=w},e=>err(e));
new THREE.GLTFLoader().parse(Uint8Array.from(atob(GLB),c=>c.charCodeAt(0)).buffer,'',g=>{const m=g.scene;GL=g;m.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(m),h=bx.max.y-bx.min.y||1,k=2.4/h;m.scale.setScalar(k);m.position.y=-bx.min.y*k;PV.add(m);
mixer=new THREE.AnimationMixer(m);g.animations.forEach(c=>{acts[c.name.split('|').pop().replace('Snc_','')]=mixer.clipAction(c)});play('BossIdle');ready=true;$('load').style.display='none';for(const i of['bPlay','bFr','bSet'])$(i).style.display='block'},e=>{$('load').textContent='تعذر تحميل الموديل'});
// ---------- input
const K={};let LZ;
addEventListener('keydown',e=>{if(e.target.id=='ci'){if(e.code=='Enter'||e.key=='Enter')sendChat();return}
if(e.code=='Enter'&&playing&&NET.peer){for(const k in K)K[k]=0;openChat();document.exitPointerLock&&document.exitPointerLock();return}K[e.code]=1;if(!playing||P.dead>0)return;if(e.code=='KeyE')grab();if(e.code=='KeyQ')dodge(-1);if(e.code=='KeyR')dodge(1);if(e.code=='ShiftLeft')tone(300,900,.25,'sawtooth',.1)});
addEventListener('keyup',e=>K[e.code]=0);
addEventListener('mousemove',e=>{if(document.pointerLockElement){cy-=e.movementX*.0025;cp=Math.max(-.6,Math.min(1.3,cp+e.movementY*.0025))}});
addEventListener('contextmenu',e=>e.preventDefault());
function doThrow(){if(P.dead>0||!P.hold)return;const it=P.hold;P.hold=null;const o=cam.getWorldDirection(new V3()),t=cam.position.clone().addScaledVector(o,90);it.v.copy(t.sub(it.m.position).normalize().multiplyScalar(85));it.st='fly';if(NET.peer)nsend({t:'th',k:it.type,p:it.m.position.toArray(),v:it.v.toArray()});P.heat=Math.min(100,P.heat+(it.type=='ped'?4:3));once(Math.random()<.5?'Dance1_SwipeLeft':'Dance3_SwipeRight',.5);tone(900,200,.3,'sawtooth',.15)}
function doLower(){if(P.dead>0||!P.hold)return;const it=P.hold;P.hold=null;it.st='lower';it.v.set(0,0,0);once('Dance4_SwipeDown',.5);tone(500,300,.25,'sine',.12)}
addEventListener('mousedown',e=>{if(!playing||touchOn())return;au();if(!document.pointerLockElement){R.domElement.requestPointerLock&&R.domElement.requestPointerLock();return}if(e.button==0)doThrow();else doLower()});
function openChat(){const c=$('ci');c.style.display='block';$('csend').style.display='block';c.focus()}
function sendChat(){const c=$('ci'),v=c.value.trim();if(v&&NET.peer){chat(NET.name+': '+v,S.col);nsend({t:'c',n:NET.name,m:v,c:S.col})}c.value='';if(playing){c.style.display='none';$('csend').style.display='none';c.blur()}}
function lobbyChat(){if(!playing){$('ci').style.display='block';$('csend').style.display='block'}}
function grab(){if(P.hold)return;const o=cam.getWorldDirection(new V3());let best=null,bd=touchOn()?.88:.95;for(const it of items){if(it.st=='held')continue;const t=it.m.position.clone().setY(it.m.position.y+1).sub(cam.position),L=t.length();if(L<100&&t.normalize().dot(o)>bd){bd=t.dot(o);best=it}}
if(best){best.st='held';P.hold=best;once('Dance2_SwipeUp',.9);tone(300,1200,.35,'sine',.18)}}
function dodge(s){if(P.mode!='fly'||P.stun>0)return;const r=new V3(-Math.cos(cy),0,Math.sin(cy)).multiplyScalar(s);P.v.addScaledVector(r,s*0+70);P.inv=.6;once(s<0?'HopLeft':'HopRight',.37);tone(600,200,.2,'triangle',.12)}
function toast(t){const e=$('toast');e.textContent=t;e.style.opacity=1;setTimeout(()=>e.style.opacity=0,2200)}
// ---------- game flow
function reset(){cannonReset();items.forEach(i=>sc.remove(i.m));items.length=0;jets.forEach(j=>sc.remove(j.m));jets.length=0;mis.forEach(m=>sc.remove(m.m));mis.length=0;for(let i=0;i<45;i++)spawn('car');for(let i=0;i<60;i++)spawn('ped');
P.p.set(0,0,0);P.v.set(0,0,0);P.mode='ground';P.hp=3;P.hold=null;P.dead=0;P.stun=0;P.heat=0;P.inv=2;P.desc=false;P.hop=0;P.idle=0;$('fade').style.opacity=0;if(ready)once('SpinIn',.4)}
function hurt(){if(P.inv>0||P.dead>0)return;P.hp--;P.inv=2;burst(P.p.clone().setY(P.p.y+1),new THREE.Color(0xffcc44),50);boom(.9);if(P.hold){P.hold.st='fly';P.hold=null}
if(P.hp<=0){P.dead=2.6;once(Math.random()<.5?'Death1':'Death3',2.5);P.v.set(0,0,0)}else{P.stun=1.2;P.v.set(0,-4,0);once('BossRecoil',.7)}}
function startGame(){au();playing=true;reset();$('ci').style.display='none';$('csend').style.display='none';for(const i of['menu','ttl','fr'])$(i).style.display='none';for(const i of['hud','cross','hint'])$(i).style.display=i=='hud'?'flex':'block';if(NET.peer){$('mic').style.display='block';micUI()}
document.body.classList.toggle('touch',touchOn());if(touchOn()){$('hint').style.display='none';tcShow(true);tryLandscape()}else R.domElement.requestPointerLock&&R.domElement.requestPointerLock()}
$('bPlay').onclick=startGame;
$('bFr').onclick=()=>{$('menu').style.display='none';$('fr').style.display='flex'};
$('bFb').onclick=()=>{$('fr').style.display='none';$('menu').style.display='flex'};
$('bHost').onclick=()=>netInit(true);$('bJoin').onclick=()=>netInit(false);$('bGo').onclick=()=>{nsend({t:'start'});startGame()};
function micUI(){const m=$('mic');m.textContent=NET.mic?'🎤 المايك شغال':'🔇 المايك مقفول';m.classList.toggle('on',!!NET.mic)}
function micCall(id){try{NET.peer.call(id,NET.ms)}catch(e){}}
$('mic').onclick=async()=>{if(!NET.peer)return;
if(!NET.ms){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){toast('المايك يحتاج رابط آمن https');return}
try{NET.ms=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})}catch(e){toast('تعذر تشغيل المايك (اسمح بالإذن)');return}
(NET.host?NET.conns.map(c=>c.peer):(NET.hc?[NET.hc.peer]:[])).forEach(micCall);NET.mic=true}
else{NET.mic=!NET.mic;NET.ms.getAudioTracks().forEach(t=>t.enabled=NET.mic)}
micUI();toast(NET.mic?'المايك اتفتح':'المايك اتقفل')};
$('bSet').onclick=()=>{$('menu').style.display='none';$('set').style.display='flex'};
$('bBack').onclick=()=>{$('set').style.display='none';$('menu').style.display='flex'};
$('sDiff').onchange=e=>S.diff=+e.target.value;$('sTime').onchange=e=>S.time=+e.target.value;$('sQ').onchange=e=>{S.q=+e.target.value;applyQ()};$('sVol').oninput=e=>S.vol=+e.target.value;$('sSfx').onchange=e=>S.sfx=e.target.checked?1:0;
// ---------- network
const NET={host:false,conns:[],peer:null,hc:null,name:'لاعب'+Math.floor(rnd(10,99)),rp:{},ts:0},rem=[];
function chat(t,c){const d=document.createElement('div');d.textContent=t;if(c)d.style.color=c;$('chat').appendChild(d);while($('chat').children.length>6)$('chat').firstChild.remove();setTimeout(()=>d.remove(),15000)}
function nsend(m,ex){m.id=m.id||NET.peer.id;if(NET.host)NET.conns.forEach(c=>c!==ex&&c.open&&c.send(m));else if(NET.hc&&NET.hc.open)NET.hc.send(m)}
function handle(m){if(m.t=='s')rpUpd(m);else if(m.t=='c')chat(m.n+': '+m.m,m.c);else if(m.t=='j')chat(m.n+' دخل اللعبة');else if(m.t=='start'){if(!playing)startGame()}else if(m.t=='th')rThrow(m)}
function link(c){c.on('data',m=>{if(NET.host)nsend(m,c);handle(m)});c.on('close',()=>{NET.conns=NET.conns.filter(o=>o!==c);const r=NET.rp[c.peer];if(r){sc.remove(r.H);delete NET.rp[c.peer]}chat('لاعب خرج')})}
function netInit(host){if(typeof Peer=='undefined'){$('frs').textContent='الاتصال غير متاح في هذه النسخة (شغّل الملف من جهازك)';return}
if(NET.peer)return;NET.host=host;let code=$('code').value.trim().toUpperCase();
if(host){code='';for(let i=0;i<5;i++)code+='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)];$('code').value=code}
if(!code){$('frs').textContent='اكتب الكود أولاً';return}
const p=NET.peer=host?new Peer('msc'+code):new Peer();$('frs').textContent='...جاري الاتصال';
p.on('error',e=>{$('frs').textContent='خطأ: '+e.type;NET.peer=null});
p.on('call',cl=>{cl.answer();cl.on('stream',s=>{const a=new Audio();a.srcObject=s;a.play().catch(()=>{})})});
p.on('open',()=>{if(host)$('frs').textContent='أنت السيرفر. الكود: '+code+' (أرسله لصاحبك)';else{const c=NET.hc=p.connect('msc'+code);link(c);c.on('open',()=>{$('frs').textContent='تم الدخول، انتظر المضيف يبدأ اللعبة';nsend({t:'j',n:NET.name});lobbyChat()})}});
p.on('connection',c=>{NET.conns.push(c);link(c);c.on('open',()=>{$('frs').textContent+='\nدخل لاعب';$('bGo').style.display='block';lobbyChat();if(NET.ms)micCall(c.peer)})})}
const RONCE={Dance1_SwipeLeft:3,Dance3_SwipeRight:3,Dance2_SwipeUp:1.8,Dance4_SwipeDown:3,SpinIn:1,SpringLand:1,HopLeft:1,HopRight:1,Death1:1,Death3:1,BossRecoil:1,SpringLaunchToGlide:1};
function tintC(col,on){const c=new THREE.Color(1,1,1);if(on)c.lerp(new THREE.Color(col||'#ffffff'),.65);return c}
function mkTag(txt,col){const k=document.createElement('canvas');k.width=256;k.height=64;const x=k.getContext('2d');x.font='bold 30px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';const w=Math.min(248,x.measureText(txt).width+30),l=128-w/2,t=8,h=48,r=14;
x.beginPath();x.moveTo(l+r,t);x.arcTo(l+w,t,l+w,t+h,r);x.arcTo(l+w,t+h,l,t+h,r);x.arcTo(l,t+h,l,t,r);x.arcTo(l,t,l+w,t,r);x.closePath();x.fillStyle='rgba(8,14,30,.75)';x.fill();x.lineWidth=3;x.strokeStyle=col;x.stroke();x.fillStyle=col;x.fillText(txt,128,34,w-20);
const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(k),depthTest:false,transparent:true}));sp.renderOrder=10;return sp}
function rpUpd(m){let r=NET.rp[m.id];if(!r){if(!GL)return;const g=THREE.SkeletonUtils.clone(GL.scene),H=new THREE.Group(),mats=[];g.traverse(o=>{if(o.isMesh){o.material=Array.isArray(o.material)?o.material.map(x=>x.clone()):o.material.clone();mats.push(...[].concat(o.material))}});H.add(g);sc.add(H);const mx=new THREE.AnimationMixer(g);r={H,mx,mats,acts:{},cur:null,tp:new V3(m.x,m.y,m.z),ty:m.yaw};GL.animations.forEach(c=>r.acts[c.name.split('|').pop().replace('Snc_','')]=mx.clipAction(c));H.position.copy(r.tp);NET.rp[m.id]=r}
r.tp.set(m.x,m.y,m.z);r.ty=m.yaw;
const col=/^#[0-9a-f]{6}$/i.test(m.c)?m.c:'#35c4ff',nm=String(m.n||'لاعب').slice(0,14);
if(r.nm!==nm||r.cl!==col){if(r.tag){r.H.remove(r.tag);r.tag.material.map.dispose();r.tag.material.dispose()}r.tag=mkTag(nm,col);r.tag.position.y=3.7;r.H.add(r.tag)}
if(r.cl!==col||r.tn!==m.tn){const c=tintC(col,m.tn);r.mats.forEach(x=>x.color&&x.color.copy(c))}
r.nm=nm;r.cl=col;r.tn=m.tn;
if(r.an!==m.a||r.ak!==m.k){const a=r.acts[m.a];if(a){const o1=m.a in RONCE;a.reset();a.timeScale=o1?RONCE[m.a]:1;a.setLoop(o1?THREE.LoopOnce:THREE.LoopRepeat,Infinity);a.clampWhenFinished=o1;a.fadeIn(.15).play();if(r.cur&&r.cur!==a)r.cur.fadeOut(.15);r.cur=a;r.an=m.a;r.ak=m.k}}}
function rThrow(m){const q={m:m.k=='car'?mkCar():mkPed(),v:new V3().fromArray(m.v)};q.m.position.fromArray(m.p);sc.add(q.m);rem.push(q)}
function netTick(dt){for(const id in NET.rp){const r=NET.rp[id];r.H.position.lerp(r.tp,Math.min(1,12*dt));let d=r.ty-r.H.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));r.H.rotation.y+=d*Math.min(1,10*dt);r.mx.update(dt);if(r.tag){const d=cam.position.distanceTo(r.H.position),k=Math.max(1.4,Math.min(16,d*.07));r.tag.scale.set(k*4,k,1)}}}
function netSend(dt){NET.ts+=dt;if(NET.peer&&NET.peer.id&&NET.ts>.07&&(NET.host?NET.conns.length:NET.hc)){NET.ts=0;nsend({t:'s',n:NET.name,x:P.p.x,y:P.p.y,z:P.p.z,yaw:P.yaw,a:curN,k:ANC,c:S.col,tn:S.tint})}
for(const q of rem.slice()){const p=q.m.position;q.v.y-=32*dt;p.addScaledVector(q.v,dt);q.m.rotation.x+=dt*5;let x=p.y<.3;for(const b of B)if(p.y<b.h&&Math.abs(p.x-b.x)<b.w/2+1&&Math.abs(p.z-b.z)<b.d/2+1)x=1;
if(P.dead<=0&&P.inv<=0&&p.distanceTo(P.p.clone().setY(P.p.y+1))<4.5){hurt();x=1}if(x){burst(p.clone().setY(Math.max(1,p.y)),new THREE.Color(0xff8833),35);boom(.5);sc.remove(q.m);rem.splice(rem.indexOf(q),1)}}}
// ---------- update
const cD=new THREE.Color(0x7fb2e5),cN=new THREE.Color(0x050a1a),fD=new THREE.Color(0x9cc4ea),fN=new THREE.Color(0x0a1226),cO=new THREE.Color(0xf08a4b),tmp=new THREE.Color(),tmp2=new THREE.Color();let dayT=.3;
function sky(dt){if(S.time==0)dayT=(dayT+dt/240)%1;const a=S.time==1?PI/2:S.time==2?-PI/2:dayT*2*PI,h=Math.sin(a),d=Math.max(0,Math.min(1,(h+.15)/.4)),n=1-d,du=Math.max(0,1-Math.abs(h)/.25)*.55;
tmp.copy(cN).lerp(cD,d).lerp(cO,du);sc.background.copy(tmp);tmp2.copy(fN).lerp(fD,d).lerp(cO,du*.7);sc.fog.color.copy(tmp2);
sun.position.set(Math.cos(a)*200,Math.max(20,h*200),60);sun.intensity=.12+.8*d;sun.color.set(du>.2?0xffb070:(n>.5?0x8fa6e8:0xfff2d0));hemi.intensity=.3+.85*d;
for(const m of BM)m.emissiveIntensity=n*1.3;stars.material.opacity=n;stars.position.copy(cam.position)}
const clk=new THREE.Clock();let T=0;
function upd(dt){
const f=new V3(Math.sin(cy),0,Math.cos(cy)),r=new V3(-f.z,0,f.x);
if(K.ArrowLeft)cy+=1.8*dt;if(K.ArrowRight)cy-=1.8*dt;if(K.ArrowUp)cp=Math.max(-.6,cp-dt);if(K.ArrowDown)cp=Math.min(1.3,cp+dt);
P.lock-=dt;P.inv-=dt;
if(P.dead>0){P.dead-=dt;P.v.y-=35*dt;P.v.x*=.97;P.v.z*=.97;$('fade').style.opacity=P.dead<1?1-P.dead:0;if(P.dead<=0)reset()}
else if(P.stun>0){P.stun-=dt;P.v.y-=40*dt;if(P.p.y<=0&&P.v.y<0){P.stun=0;P.v.set(0,0,0);once('SpringLand',.8)}}
else{const ix=(K.KeyD?1:0)-(K.KeyA?1:0)+JS.x,iz=(K.KeyW?1:0)-(K.KeyS?1:0)+JS.y,iy=(K.Space?1:0)-((K.KeyC||K.ControlLeft)?1:0);
const m=f.clone().multiplyScalar(iz).addScaledVector(r,ix);const mg=Math.min(1,m.length());if(mg>0)m.normalize().multiplyScalar(mg);const has=m.lengthSq()>0||iy!=0;
if(P.mode=='ground'){P.v.set(0,0,0);P.desc=false;if(has&&P.lock<=0){P.mode='fly';P.hop=.6;P.v.y=16;P.idle=0;once('SpringLaunchToGlide',.7);tone(200,700,.3,'triangle',.15)}}
if(P.mode=='fly'){P.hop-=dt;const sp=K.ShiftLeft?85:34,k=Math.min(1,4*dt);P.v.x+=(m.x*sp-P.v.x)*k;P.v.z+=(m.z*sp-P.v.z)*k;
if(P.hop<=0){if(has){P.idle=0;P.desc=false}else{P.idle+=dt;if(P.idle>1.5)P.desc=true}P.v.y+=((P.desc?-8:iy*24-Math.sin(cp-.25)*iz*sp*.9)-P.v.y)*k}
if(P.p.y<=0&&P.v.y<=0&&P.hop<=0){P.p.y=0;P.mode='ground';once('SpringLand',.8)}}}
P.p.addScaledVector(P.v,dt);if(P.p.y<0)P.p.y=0;P.p.x=Math.max(-5500,Math.min(5500,P.p.x));P.p.z=Math.max(-5500,Math.min(5500,P.p.z));
for(const b of B)if(P.p.y<b.h+1){const dx=P.p.x-b.x,dz=P.p.z-b.z,ox=b.w/2+1.2-Math.abs(dx),oz=b.d/2+1.2-Math.abs(dz);if(ox>0&&oz>0){if(ox<oz)P.p.x+=Math.sign(dx)*ox;else P.p.z+=Math.sign(dz)*oz}}
const hs=Math.hypot(P.v.x,P.v.z);let d=((P.hold||hs<3)?cy:Math.atan2(P.v.x,P.v.z))-P.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));P.yaw+=d*Math.min(1,10*dt);
PV.position.copy(P.p);PV.rotation.y=P.yaw;anim();netSend(dt);
if(P.mode=='fly'&&P.p.y<3&&hs>15&&offLand(P.p))emit(new V3(P.p.x,.3,P.p.z),new V3(rnd(-4,4),rnd(4,10),rnd(-4,4)),new THREE.Color(0xcfeeff),.7);
if(hs>45&&P.mode=='fly')emit(P.p.clone().setY(P.p.y+1.2),new V3(rnd(-2,2),rnd(-2,2),rnd(-2,2)),new THREE.Color(0x66ddff),.5);
if(AC&&WG){WG.gain.value=S.sfx?S.vol*Math.min(1,Math.hypot(hs,P.v.y)/80)*.6:0;WF.frequency.value=300+hs*25;SG.gain.value=S.sfx&&P.heat>0&&S.diff?.03*S.vol:0;SO.frequency.value=700+300*Math.sin(T*6)}
// items
for(const it of items){const p=it.m.position;
if(it.st=='ok'){it.al+=it.s*it.sp*dt;if(Math.abs(it.al)>400)it.al*=-.99;place(it)}
else if(it.st=='held'){const o=cam.getWorldDirection(new V3()),t=P.p.clone().addScaledVector(o,13).add(new V3(0,3,0));p.lerp(t,Math.min(1,8*dt));it.m.rotation.y+=dt*2}
else if(it.st=='lower'){p.y-=7*dt;if(p.y<=0){p.y=0;it.st='rest';it.t=0}}
else if(it.st=='rest'){it.t+=dt;if(it.t>8)kill(it)}
else if(it.st=='fly'){it.v.y-=32*dt;p.addScaledVector(it.v,dt);it.m.rotation.x+=dt*5;it.m.rotation.z+=dt*3;const sp=it.v.length();
if(p.y<=.3){if(offLand(p)){burst(p.clone().setY(.3),new THREE.Color(0xaee3ff),30);tone(300,80,.4,'sine',.1);kill(it);continue}if(sp>22)brk(it,it.type=='car'?4:6);else{p.y=0;it.m.rotation.set(0,0,0);it.st='rest';it.t=0}continue}
let hit=0,hb=null;for(const b of B)if(p.y<b.h&&Math.abs(p.x-b.x)<b.w/2+1&&Math.abs(p.z-b.z)<b.d/2+1){hit=1;hb=b;break}
if(hit){if(hb===PB)polHit();if(sp>15)brk(it,3);else{it.v.set(0,0,0);it.st='lower'}continue}
let gone=0;for(const o of items)if(o!==it&&o.st!='held'&&o.m.position.distanceTo(p)<it.r+o.r+1){brk(o,5);gone=1;break}
for(const j of jets)if(j.p.distanceTo(p)<9){burst(j.p.clone(),new THREE.Color(0xff8833),80);boom(.8);sc.remove(j.m);jets.splice(jets.indexOf(j),1);P.heat=Math.min(100,P.heat+8);break}
if(gone)brk(it,2)}}
// laser
const lz=LZ||(LZ=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]),new THREE.LineBasicMaterial({color:0x44e0ff})));if(!lz.parent){lz.frustumCulled=false;sc.add(lz)}
lz.visible=!!P.hold;if(P.hold){const a=lz.geometry.attributes.position,h=P.p.clone().add(r.clone().multiplyScalar(.6)).setY(P.p.y+1.5),o=P.hold.m.position;a.setXYZ(0,h.x,h.y,h.z);a.setXYZ(1,o.x,o.y+1,o.z);a.needsUpdate=true}
// police
const want=S.diff?Math.min([0,1,3,5][S.diff],P.heat>5?Math.ceil(P.heat/20):0):0;
if(jets.length<want&&Math.random()<dt*.8)addJet();
if(jets.length>want){const j=jets[0];if(j.p.distanceTo(P.p)>250){sc.remove(j.m);jets.shift()}}
P.heat=Math.max(0,P.heat-(jets.length?.5:2.5)*dt);
for(const j of jets){const to=P.p.clone().add(new V3(0,1,0)).sub(j.p),L=to.length();to.normalize();j.d.lerp(to,Math.min(1,1.1*dt)).normalize();if(j.p.y<35)j.d.y+=dt*2;
{const ah=j.p.clone().addScaledVector(j.d,j.sp*1.4);for(const b of B)if(ah.y<b.h+14&&Math.abs(ah.x-b.x)<b.w/2+10&&Math.abs(ah.z-b.z)<b.d/2+10){j.d.y+=dt*5;j.d.normalize();if(j.d.y>.75){j.d.y=.75;j.d.normalize()}break}}
j.p.addScaledVector(j.d,j.sp*dt);
{let hit=j.p.y<2;if(!hit)for(const b of B)if(j.p.y<b.h+2&&Math.abs(j.p.x-b.x)<b.w/2+3&&Math.abs(j.p.z-b.z)<b.d/2+3){hit=1;break}
if(hit){burst(j.p.clone().setY(Math.max(2,j.p.y)),new THREE.Color(0xff8833),80);boom(.8);sc.remove(j.m);jets.splice(jets.indexOf(j),1);continue}}
j.m.position.copy(j.p);j.m.lookAt(j.p.clone().add(j.d));if(L>750)j.p.copy(P.p).add(new V3(rnd(-300,300),90,rnd(-300,300)));
j.cd-=dt;if(j.cd<=0&&L>60&&L<320&&j.d.dot(to)>.85){j.cd=rnd(3.5,5.5)/(S.diff*.6+.4);const g=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,3,6),new THREE.MeshBasicMaterial({color:0xffaa22}));g.geometry.rotateX(PI/2);g.position.copy(j.p);sc.add(g);mis.push({m:g,p:j.p.clone(),d:j.d.clone(),life:7});tone(1200,300,.5,'sawtooth',.08)}}
for(const m of mis.slice()){const to=P.p.clone().add(new V3(0,1,0)).sub(m.p);m.d.lerp(to.normalize(),(m.tr||.8)*dt).normalize();m.p.addScaledVector(m.d,(m.sp||78)*dt);m.m.position.copy(m.p);m.m.lookAt(m.p.clone().add(m.d));emit(m.p,new V3(),new THREE.Color(.8,.8,.8),.6);m.life-=dt;
let x=m.life<=0||m.p.y<0;for(const b of B)if(m.p.y<b.h&&Math.abs(m.p.x-b.x)<b.w/2&&Math.abs(m.p.z-b.z)<b.d/2)x=1;
if(m.p.distanceTo(P.p)<4){hurt();x=1}if(x){burst(m.p,new THREE.Color(0xff6633),30);sc.remove(m.m);mis.splice(mis.indexOf(m),1)}}
cannonUpd(dt);shellsUpd(dt);samCheck(dt);
if(window.beacon)beacon.material.color.set(Math.sin(T*8)>0?0xff2222:0x2244ff);
$('hp').textContent='♥'.repeat(Math.max(0,P.hp));$('heat').textContent='★'.repeat(Math.ceil(P.heat/20));
// camera
const o=new V3(Math.sin(cy)*Math.cos(cp),-Math.sin(cp),Math.cos(cy)*Math.cos(cp)),tg=P.p.clone().setY(P.p.y+1.8),dist=9+Math.min(5,hs*.06);
const want2=tg.clone().addScaledVector(o,-dist);want2.y=Math.max(1.5,want2.y);cam.position.lerp(want2,1-Math.pow(.0005,dt));cam.lookAt(tg.clone().addScaledVector(o,8));
const fv=65+Math.min(25,hs*.3);if(Math.abs(cam.fov-fv)>.1){cam.fov+=(fv-cam.fov)*.1;cam.updateProjectionMatrix()}}
function menuCam(dt){P.yaw+=dt*.4;P.p.set(0,6+Math.sin(T*2)*.4,0);PV.position.copy(P.p);PV.rotation.y=PI*.15+Math.sin(T*.5)*.4;cam.position.set(0,7.6,8);cam.lookAt(0,7,0)}
function loop(){requestAnimationFrame(loop);try{loop2()}catch(e){err(e)}}
function loop2(){const dt=Math.min(.05,clk.getDelta());T+=dt;musTick(dt);water.position.x=Math.round(cam.position.x/100)*100;water.position.z=Math.round(cam.position.z/100)*100;wt.offset.x=(T*.004)%1;wt.offset.y=(T*.0025)%1;
if(ready)mixer.update(dt);netTick(dt);sky(dt);if(playing)upd(dt);else menuCam(dt);
for(let i=0;i<NP;i++)if(pl[i]>0){pl[i]-=dt;pp[i*3]+=pv[i*3]*dt;pp[i*3+1]+=pv[i*3+1]*dt;pp[i*3+2]+=pv[i*3+2]*dt;pv[i*3+1]-=12*dt;if(pl[i]<=0)pp[i*3+1]=-999}
pg.attributes.position.needsUpdate=true;pg.attributes.color.needsUpdate=true;R.render(sc,cam)}
loop();
