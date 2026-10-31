// Hiệu ứng dung hợp khi bấm trái tim và popup lời chúc
const pick=a=>a[Math.floor(Math.random()*a.length)],
wishTxt=()=>E(pick(CFG.wishes).replace(/\{a\}/g,CFG.a).replace(/\{b\}/g,CFG.b));
// Ảnh có cả hai người: ưu tiên ảnh đặt trong thư mục avatar (ngoài 2 ảnh đại diện); không có thì lấy ngẫu nhiên ảnh kỷ niệm
function wishPhoto(){const c=AV.c||[];if(c.length)return pick(c);const L=X.items.filter(x=>!x.v&&x.s<=CFG.current);return L.length?pick(L).id:''}
function fuse(b){const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,o=document.createElement('div');b.classList.add('fz');o.className='orb';o.style.cssText=`left:${x}px;top:${y}px`;document.body.appendChild(o);
setTimeout(()=>burst(x,y,50),650);setTimeout(()=>{wishOpen();o.style.opacity=0},1150);setTimeout(()=>{o.remove();b.classList.remove('fz')},1900)}
function wishOpen(){const p=wishPhoto();let w=$('#wp');if(!w){w=document.createElement('div');w.id='wp';w.dataset.a='wc';document.body.appendChild(w)}
w.innerHTML=`<div class="wc gl${w.className=='on'?' nopop':''}"><div class=wr></div><div class=wi><div class=wph>${p?im(p,1000):'<div class=big2>💗</div>'}</div><h3 class=nm>Gửi ${E(CFG.a)} & ${E(CFG.b)}</h3><p class=wt>${wishTxt()}</p><div class=wb><button class=btp data-a=wm>💗 Cảm ơn</button><button class=bt data-a=wn>Lời chúc khác</button></div></div></div>`;
rain(w.querySelector('.wr'),10);w.className='on'}
