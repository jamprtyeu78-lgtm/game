// ---------- touch controls (joystick + buttons + layout editor)
(()=>{
const LS='msc_ctl_v1';
// default centers as fraction of screen [x,y] and size in px
const DEF={joy:[.13,.72],up:[.31,.56],dn:[.31,.82],spd:[.2,.38],thr:[.9,.68],grb:[.77,.8],low:[.9,.42],dl:[.58,.86],dr:[.68,.86],chat:[.5,.22]};
const SZ={joy:132,up:58,dn:58,spd:58,thr:80,grb:70,low:58,dl:54,dr:54,chat:50};
let L=JSON.parse(JSON.stringify(DEF)),snap=null,editing=false;
function save(){try{localStorage.setItem(LS,JSON.stringify({ctl:S.ctl,cs:S.cs,sens:S.sens,name:NET.name,mus:S.mus,col:S.col,tint:S.tint,L}))}catch(e){}}
try{const d=JSON.parse(localStorage.getItem(LS)||'{}');
if([0,1,2].includes(d.ctl))S.ctl=d.ctl;if(d.cs>=.7&&d.cs<=1.5)S.cs=d.cs;if(d.sens>=.4&&d.sens<=2.5)S.sens=d.sens;
if(typeof d.name=='string'&&d.name.trim())NET.name=d.name.trim().slice(0,12);if(/^#[0-9a-f]{6}$/i.test(d.col))S.col=d.col;S.tint=d.tint?1:0;if([0,1,2].includes(d.mus))S.mus=d.mus;
if(d.L)for(const k in DEF){const v=d.L[k];if(Array.isArray(v)&&v.length==2&&v[0]>=0&&v[0]<=1&&v[1]>=0&&v[1]<=1)L[k]=v}}catch(e){}

const root=document.createElement('div');root.id='tc';
const look=document.createElement('div');look.id='look';
document.body.append(look,root);

// ---- helpers
function pos(el,id){el.style.left=L[id][0]*100+'%';el.style.top=L[id][1]*100+'%'}
function mk(id,cls){const el=document.createElement('div');el.className='tp '+cls;el.dataset.id=id;el.style.setProperty('--b',SZ[id]);pos(el,id);root.appendChild(el);return el}
function startDrag(el,e){const id=el.dataset.id,r=el.getBoundingClientRect(),ox=e.clientX-(r.left+r.width/2),oy=e.clientY-(r.top+r.height/2);el.setPointerCapture(e.pointerId);
const mv=ev=>{if(ev.pointerId!==e.pointerId)return;L[id]=[Math.max(.04,Math.min(.96,(ev.clientX-ox)/innerWidth)),Math.max(.06,Math.min(.94,(ev.clientY-oy)/innerHeight))];pos(el,id)};
const up=ev=>{if(ev.pointerId!==e.pointerId)return;el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}
const live=()=>playing&&P.dead<=0;

// ---- buttons
const btns={};
function addBtn(id,icon,label,a){const el=mk(id,'tb');el.innerHTML='<i>'+icon+'</i><small>'+label+'</small>';btns[id]=el;
el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();
if(editing)return startDrag(el,e);if(!playing)return;
el.setPointerCapture(e.pointerId);el.classList.add('dn');
if(a.hold)K[a.hold]=1;
else if(a.toggle){const v=K[a.toggle]?0:1;K[a.toggle]=v;el.classList.toggle('on',!!v);el.classList.remove('dn');if(v&&live())tone(300,900,.25,'sawtooth',.1)}
else a.tap()});
const up=()=>{el.classList.remove('dn');if(a.hold)K[a.hold]=0};
el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
el.addEventListener('contextmenu',e=>e.preventDefault())}
addBtn('up','▲','صعود',{hold:'Space'});
addBtn('dn','▼','نزول',{hold:'KeyC'});
addBtn('spd','⚡','سرعة',{toggle:'ShiftLeft'});
addBtn('thr','🚀','رمي',{tap:()=>{if(live())doThrow()}});
addBtn('grb','✋','إمساك',{tap:()=>{if(live())grab()}});
addBtn('low','⏬','إنزال',{tap:()=>{if(live())doLower()}});
addBtn('dl','↺','مراوغة',{tap:()=>{if(live())dodge(-1)}});
addBtn('dr','↻','مراوغة',{tap:()=>{if(live())dodge(1)}});
addBtn('chat','💬','شات',{tap:()=>{if(playing&&NET.peer)openChat()}});

// ---- joystick
const joy=mk('joy','tj'),kn=document.createElement('div');kn.className='kn';joy.appendChild(kn);
let jid=null;const KN0='translate(-50%,-50%)';
function jmove(e){const r=joy.getBoundingClientRect(),mx=r.width/2*.7;let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const d=Math.hypot(dx,dy);if(d>mx){dx*=mx/d;dy*=mx/d}
kn.style.transform=KN0+' translate('+dx+'px,'+dy+'px)';const nx=dx/mx,ny=dy/mx;
if(Math.hypot(nx,ny)<.15){JS.x=0;JS.y=0}else{JS.x=nx;JS.y=-ny}}
function jend(e){if(e.pointerId!==jid)return;jid=null;JS.x=0;JS.y=0;kn.style.transform=KN0}
joy.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(editing)return startDrag(joy,e);if(!playing||jid!==null)return;jid=e.pointerId;joy.setPointerCapture(e.pointerId);jmove(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===jid&&!editing)jmove(e)});
joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);

// ---- camera look (drag anywhere that is not a control)
let lid=null,lx=0,ly=0;
look.addEventListener('pointerdown',e=>{e.preventDefault();if(lid!==null||!playing)return;lid=e.pointerId;lx=e.clientX;ly=e.clientY;look.setPointerCapture(e.pointerId)});
look.addEventListener('pointermove',e=>{if(e.pointerId!==lid)return;const k=.0042*S.sens;cy-=(e.clientX-lx)*k;cp=Math.max(-.6,Math.min(1.3,cp+(e.clientY-ly)*k));lx=e.clientX;ly=e.clientY});
const lend=e=>{if(e.pointerId===lid)lid=null};
look.addEventListener('pointerup',lend);look.addEventListener('pointercancel',lend);
look.addEventListener('contextmenu',e=>e.preventDefault());

// ---- show / hide
window.tcShow=function(on,edit){editing=!!edit;
root.classList.toggle('show',!!on);root.classList.toggle('edit',!!edit);
look.style.display=(on&&!edit)?'block':'none';
K.Space=0;K.KeyC=0;K.ShiftLeft=0;JS.x=0;JS.y=0;jid=null;lid=null;kn.style.transform=KN0;
root.querySelectorAll('.on,.dn').forEach(x=>x.classList.remove('on','dn'));
btns.chat.style.display=(edit||NET.peer)?'':'none';
root.style.setProperty('--cs',S.cs);for(const id in L)pos(id=='joy'?joy:btns[id],id)};

// ---- landscape + fullscreen (needs a user gesture)
function lockLand(){try{const o=screen.orientation;o&&o.lock&&o.lock('landscape').catch(()=>{})}catch(e){}}
window.tryLandscape=function(){if(!touchOn())return;const d=document.documentElement,fs=d.requestFullscreen||d.webkitRequestFullscreen;
try{if(fs&&!document.fullscreenElement&&!document.webkitFullscreenElement){const p=fs.call(d);if(p&&p.then)p.then(lockLand,lockLand);else lockLand()}else lockLand()}catch(e){lockLand()}};
addEventListener('pointerdown',()=>{if(touchOn())tryLandscape()},{capture:true,once:true});
document.getElementById('rot').addEventListener('pointerdown',()=>tryLandscape());
function chk(){const t=touchOn();document.body.classList.toggle('touch',t);document.body.classList.toggle('portrait',t&&innerHeight>innerWidth)}
addEventListener('resize',chk);addEventListener('orientationchange',()=>setTimeout(chk,150));
document.addEventListener('gesturestart',e=>e.preventDefault());

// ---- settings UI
$('sCtl').value=S.ctl;$('sCs').value=S.cs;$('edCs').value=S.cs;$('sSens').value=S.sens;
$('sCtl').onchange=e=>{S.ctl=+e.target.value;save();chk()};
const setCs=v=>{S.cs=+v;$('sCs').value=v;$('edCs').value=v;root.style.setProperty('--cs',S.cs);save()};
$('sCs').oninput=e=>setCs(e.target.value);$('edCs').oninput=e=>setCs(e.target.value);
$('sSens').oninput=e=>{S.sens=+e.target.value;save()};
$('bEdit').onclick=()=>{snap=JSON.stringify(L);$('set').style.display='none';$('ttl').style.display='none';$('ed').style.display='flex';tcShow(true,true);tryLandscape()};
function endEdit(){$('ed').style.display='none';$('ttl').style.display='';$('set').style.display='flex';tcShow(false)}
$('edOk').onclick=()=>{save();endEdit()};
$('edNo').onclick=()=>{if(snap)L=JSON.parse(snap);endEdit()};
$('edRs').onclick=()=>{L=JSON.parse(JSON.stringify(DEF));for(const id in L)pos(id=='joy'?joy:btns[id],id)};
root.style.setProperty('--cs',S.cs);chk();
// ---- identity (name + color)
function tintOwn(){if(!GL)return;const c=tintC(S.col,S.tint);GL.scene.traverse(o=>{if(o.isMesh)[].concat(o.material).forEach(m=>m.color&&m.color.copy(c))})}
const iv=setInterval(()=>{if(GL){tintOwn();clearInterval(iv)}},300);
function setName(v){v=String(v).trim().slice(0,12);NET.name=v||'لاعب'+Math.floor(10+Math.random()*89);save()}
function setCol(v){S.col=v;$('sCol').value=v;$('fCol').value=v;save()}
$('sName').value=$('fName').value=NET.name;$('sCol').value=$('fCol').value=S.col;$('sTint').checked=!!S.tint;$('sMus').value=S.mus;$('sMus').onchange=e=>{S.mus=+e.target.value;save()};
$('sName').oninput=e=>{$('fName').value=e.target.value;setName(e.target.value)};
$('fName').oninput=e=>{$('sName').value=e.target.value;setName(e.target.value)};
$('sCol').oninput=e=>{setCol(e.target.value);tintOwn()};$('fCol').oninput=e=>{setCol(e.target.value);tintOwn()};
$('sTint').onchange=e=>{S.tint=e.target.checked?1:0;save();tintOwn()};
})();
