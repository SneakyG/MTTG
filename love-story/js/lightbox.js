// Xem ảnh/clip toàn màn hình (vuốt hoặc phím mũi tên để chuyển)
const lb=$('#lb'),step=n=>{LB.i=(LB.i+n+LB.l.length)%LB.l.length;show()};
function show(){const x=LB.l[LB.i];if(!x)return;lb.className='on';x.v?musicDuck():musicUnduck();
lb.innerHTML=`<button class=lx data-a=lc>✕</button>${LB.l.length>1?'<button class=lp data-a=lp>‹</button><button class=lq data-a=lq>›</button>':''}<div class=lm>${x.v?`<iframe src="https://drive.google.com/file/d/${x.id}/preview" allow="autoplay;fullscreen" allowfullscreen></iframe>`:im(x.id,1600)}</div><p>${fmt(x.d)}${x.c?', '+E(x.c):''}. <a href="https://drive.google.com/file/d/${x.id}/view" target=_blank rel=noopener>Mở bản gốc</a></p>`}
let tx=0;lb.addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});lb.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>60)step(d<0?1:-1)});
addEventListener('keydown',e=>{if(!lb.className)return;if(e.key=='Escape')ACT.lc();if(e.key=='ArrowRight')step(1);if(e.key=='ArrowLeft')step(-1)});

