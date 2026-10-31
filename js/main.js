// Vẽ giao diện, xử lý sự kiện và khởi động
function render(){R=[];
$('#app').innerHTML=!CFG.key||!CFG.root?'<h1>Cần cấu hình</h1><p>Điền <b>key</b> (Google API key) và <b>root</b> (ID thư mục MTTG) trong file js/env.js (xem README).</p>':(err?`<p class=er>Không tải được từ Google Drive: ${E(err)}<br><small>Kiểm tra API key (đã bật Drive API, đúng domain), ID thư mục, và thư mục đã chia sẻ “Anyone with the link”.</small></p>`:'')+(X.stages.length?V[tab]():err?'':'<p class=mu>Đang tải kỷ niệm từ Google Drive…</p>');
const th=TABS.map(([k,i,n])=>`<button class="${k==tab?'on':''}" data-a=go data-k=${k}><b>${i}</b>${n}</button>`).join('');$('#nav').innerHTML=th;$('#tabs').innerHTML=th;tick();cnt();reveal();paintSp();paintM();paintSel()}
const tick=()=>{const el=$('#hms');if(el){const n=new Date();el.textContent=[n.getHours(),n.getMinutes(),n.getSeconds()].map(P).join(':')}};setInterval(tick,1000);
let cdone=0,io;
function cnt(){const e=$('#cn');if(!e||!opened)return;const n=+e.dataset.n;if(cdone){e.textContent=n;return}cdone=1;const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/1600);e.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(t0)}
function reveal(){if(!opened)return;io&&io.disconnect();io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.rv').forEach((e,i)=>{e.style.transitionDelay=Math.min(i,8)*70+'ms';io.observe(e)})}
const upd=()=>{R=[];$('#res').innerHTML=mres();$('.sb').classList.toggle('has',!!Q);reveal()};
const ACT={...ACTX,go:k=>{if(selm){selm=0;SEL.clear()}tab=k;render();scrollTo(0,0)},fs:(k,i)=>{F.s=+i;render()},ft:(k,i)=>{F.t=i;render()},fy:(k,i)=>{F.y=i;render()},qc:()=>{Q='';render();$('#q')?.focus()},fr:()=>{Q='';F={s:0,t:'',y:0};render()},cal:()=>{const i=$('#qd');try{i.showPicker()}catch(e){i.focus();i.click()}},
sf:(k,i)=>{F.s=+i;F.t='';F.y='';Q='';tab='mem';render();scrollTo(0,0)},
lb:(k,i,b)=>{const l=R[b.dataset.l],x=l[+i];if(selm){SEL.has(x.id)?SEL.delete(x.id):SEL.add(x.id);b.classList.toggle('sl',SEL.has(x.id));paintSel();return}LB={l,i:+i};show()},lc:()=>{lb.className='';lb.innerHTML='';musicUnduck()},lp:()=>step(-1),lq:()=>step(1),
rn:()=>{const L=X.items.filter(x=>x.s<=CFG.current);if(L.length){LB={l:L,i:Math.floor(Math.random()*L.length)};show()}},
bl:(k,i,b)=>{const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,22)},sp:(k,i,b,e)=>openApp(e),mu:()=>mon?musicOff():musicOn(),fz:(k,i,b)=>fuse(b.parentElement),wc:(k,i,b,e)=>{if(e.target===b)b.className=''},wm:()=>{$('#wp').className=''},wn:()=>wishOpen(),
dr:()=>window.open('https://drive.google.com/drive/folders/'+CFG.root,'_blank'),
rf:async(k,i,b)=>{b.classList.add('spin');err='';try{await load()}catch(e){err=String(e.message||e)}b.classList.remove('spin');render()}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)ACT[b.dataset.a]?.(b.dataset.k,b.dataset.i,b,e)});
document.addEventListener('input',e=>{const t=e.target;if(t.id=='q'){Q=t.value;upd()}if(t.id=='qd'&&t.value){const[y,m,d]=t.value.split('-');Q=`${+d}/${+m}/${y}`;$('#q').value=Q;upd()}});
// Ảnh Drive lỗi thì thử nguồn khác (lh3 → thumbnail → uc), hết cách thì ẩn
addEventListener('error',e=>{const t=e.target;if(t.tagName!='IMG'||!t.dataset.f)return;const[id,w]=t.dataset.f.split(','),n=+(t.dataset.n||0)+1,u=IMG(id,w)[n];if(u){t.dataset.n=n;t.src=u}else t.classList.add('bad')},true);
render();initBg();if(CFG.key&&CFG.root)load().catch(e=>{err=String(e.message||e)}).finally(()=>{render();if(want&&!mon)musicOn()});
