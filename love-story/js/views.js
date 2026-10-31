// Các màn hình: Trang chủ, Kỷ niệm, Hành trình
const lst=l=>R.push(l)-1,cell=(x,l,i)=>`<div class="ce${x.v?' v':''}${SEL.has(x.id)?' sl':''}" data-a=lb data-l=${l} data-i=${i}>${im(x.id,400)}<span class=ck></span></div>`,
avh=(id,n)=>id?im(id,200,'class=av'):`<span class=av>${E(n[0])}</span>`,lk=g=>g.n>CFG.current,
nz=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase(),V={};
// Tìm theo ngày/tháng/năm: 14/2/2024, 02/2024, 2024, 20240214, "tháng 2", "ngày 14", hoặc chữ trong chú thích
function hit(x,q){const t=nz(q.trim());if(!t)return true;const ns=t.match(/\d+/g)||[],n=ns.map(Number),tx=t.replace(/\d+|[\/\-.,]|\b(thang|ngay|nam)\b/g,' ').trim(),[Y,M,Dd]=x.d.split('-').map(Number);
if(tx&&!nz(x.c||'').includes(tx))return false;if(!n.length)return true;
if(ns[0].length==8)return x.d.replace(/-/g,'')==ns[0];
if(n.length==1)return ns[0].length==4?Y==n[0]:/thang/.test(t)?M==n[0]:/ngay/.test(t)?Dd==n[0]:Dd==n[0]||M==n[0];
if(n.length==2)return ns[0].length==4?Y==n[0]&&M==n[1]:ns[1].length==4?M==n[0]&&Y==n[1]:Dd==n[0]&&M==n[1];
return ns[0].length==4?Y==n[0]&&M==n[1]&&Dd==n[2]:Dd==n[0]&&M==n[1]&&Y==n[2]}
const road=()=>`<div class="rd rv">${X.stages.map(g=>{const c=g.n<CFG.current?'done':g.n==CFG.current?'cur':'lock';return `<div class="nd ${c}" ${c=='lock'?'':`data-a=sf data-i=${g.n}`}><i>${c=='lock'?'?':g.e}</i>${c=='lock'?'???':E(g.l)}</div>`}).join('')}</div>`;
V.home=()=>{const t=today(),cs=X.stages[CFG.current-1]||X.stages[0],s=D(cs.st||iso(t)),[y,m,d]=ymd(s,t),it=X.items.filter(x=>x.s<=CFG.current),
od=it.filter(x=>+x.d.slice(5,7)==t.getMonth()+1&&+x.d.slice(8)==t.getDate()&&+x.d.slice(0,4)<t.getFullYear()).slice(0,6),lo=od.length?lst(od):0,nx=ups(s,cs);
return `<div class=home><div class="hero rv"><div class=avs data-a=bl>${avh(AV.a,CFG.a)}<span class=hb data-a=fz title="Bấm vào trái tim nhé">💗</span>${avh(AV.b,CFG.b)}</div><h1 class=nm>${E(CFG.a)} & ${E(CFG.b)}</h1><div class=mu>${cs.v}</div><div class=cnt id=cn data-n=${dd(s,t)}>${dd(s,t)}</div><div class=mu>ngày bên nhau</div><small>${y} năm ${m} tháng ${d} ngày, thêm <span id=hms>00:00:00</span></small><div><button class=bt data-a=rn style="margin-top:14px">🎲 Nhớ lại ngẫu nhiên</button></div></div>
<div class=side><div class=h2r><h2>Sắp tới</h2><button class=btp data-a=evn>＋ Thêm</button></div><div class="gl rv">${nx.length?nx.map((u,i)=>`<div class="row${i?'':' hi'}"><div><b>${E(u.n)}</b><br><small>${u.d.toLocaleDateString('vi-VN')}${u.r?', hằng năm':''}</small></div><div class=rr><b class=rs>${u.k?'còn '+u.k+' ngày':'Hôm nay 🎉'}</b>${u.ei!=null?`<button class=ib data-a=eve data-i=${u.ei} title="Sửa">${IC.e}</button>`:''}</div></div>`).join(''):'<p class=mu style="margin:0">Chưa có mục nào. Bấm “Thêm” để lưu một dịp sắp tới nhé.</p>'}</div></div>
<div class=rdw>${road()}</div>${od.length?`<div class=otd><h2>Ngày này năm xưa</h2><div class="mm rv">${od.map((x,i)=>cell(x,lo,i)).join('')}</div></div>`:''}</div>`};
function mres(){const L=X.items.filter(x=>x.s<=CFG.current&&(!F.s||x.s==F.s)&&(!F.t||(F.t=='v')==!!x.v)&&(!F.y||x.d.startsWith(F.y))&&hit(x,Q)),G={},l=lst(L),s0=D(X.stages[CFG.current-1].st||iso(today()));
CURL=L;L.forEach(x=>(G[x.d]??=[]).push(x));const ds=Object.keys(G).sort().reverse();let h='',mo='',i=0;
for(const d of ds){const g=G[d],n=dd(s0,D(d)),st=X.stages[g[0].s-1],cap=[...new Set(g.map(x=>x.c).filter(Boolean))].join(', ');
if(d.slice(0,7)!=mo){mo=d.slice(0,7);h+=`<h4>Tháng ${+d.slice(5,7)}, ${d.slice(0,4)}</h4>`}
h+=`<div class="m rv"><div class=mh><h3>${fmt(d)}</h3><small>${n>=0?'ngày thứ '+n:''} ${st?st.e:''}</small><button class="lk2 sa" data-a=sd data-i="${d}">Chọn cả ngày</button></div>${cap?`<div class=cap>${E(cap)}</div>`:''}<div class="mm${g.length>4?' b':''}">${g.map(x=>cell(x,l,i++)).join('')}</div></div>`}
return `<div class=rh><span>${ds.length} ngày, ${L.length} ảnh/clip</span>${Q||F.s||F.t||F.y?'<button class=lk2 data-a=fr>Xoá bộ lọc</button>':''}</div><div class=tl>${h||'<p class=mu>Không tìm thấy kỷ niệm nào. Thử gõ 14/2/2024, 02/2024, 2024 hoặc một từ trong chú thích.</p>'}</div>`}
const ic=p=>`<svg width=18 height=18 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>${p}</svg>`,
IC={s:ic('<circle cx=11 cy=11 r=7></circle><path d="m20 20-3.5-3.5"></path>'),c:ic('<rect x=3 y=5 width=18 height=16 rx=3></rect><path d="M3 10h18M8 3v4M16 3v4"></path>'),x:ic('<path d="M6 6l12 12M18 6 6 18"></path>'),e:ic('<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path>')};
V.mem=()=>{const ys=[...new Set(X.items.filter(x=>x.s<=CFG.current).map(x=>x.d.slice(0,4)))].sort().reverse(),
grp=(t,a,k)=>`<div class=fg><span class=fgl>${t}</span><div class="chs${k=='y'?' ys':''}">${a.map(([v,x])=>`<button class="ch${F[k]==v?' on':''}" data-a=f${k} data-i="${v}">${E(x)}</button>`).join('')}</div></div>`;
return `<h2>Kỷ niệm</h2><div class=mem><aside class=mf><div class=tb><button class=btp data-a=add>＋ Thêm ảnh/clip</button><button class="bt${selm?' on':''}" data-a=sm>${selm?'Thoát chọn':'Chọn để xoá'}</button></div><div class="sb${Q?' has':''}">${IC.s}<input id=q placeholder="Tìm ngày, tháng, năm…" value="${E(Q)}" autocomplete=off><button class="ib clr" data-a=qc title="Xoá nội dung tìm">${IC.x}</button><span class=cw><button class=ib data-a=cal title="Chọn ngày trên lịch">${IC.c}</button><input id=qd type=date tabindex=-1></span></div>
<div class=fp>${grp('Giai đoạn',[[0,'Tất cả'],...X.stages.filter(g=>!lk(g)).map(g=>[g.n,g.e+' '+g.l])],'s')}${grp('Loại',[['','Tất cả'],['i','Ảnh'],['v','Clip']],'t')}${grp('Năm',[['','Mọi năm'],...ys.map(y=>[y,y])],'y')}</div></aside><div id=res>${mres()}</div></div>`};
V.road=()=>`<h2>Con đường của mình</h2><div class=jr>${X.stages.map(g=>{const k=g.n<CFG.current?'done':g.n==CFG.current?'cur':'lock';
if(k=='lock')return `<div class="sc lock rv"><i>?</i><div class=lc><b class=fr>Chặng bí mật</b><br><small>Còn một điều gì đó đang chờ phía trước…</small></div></div>`;
const nx=X.stages[g.n],en=k=='cur'?iso(today()):(nx&&nx.st&&!lk(nx)?nx.st:'')||g.last,th=X.items.filter(x=>x.s==g.n&&!x.v).slice(0,4),l=lst(th),
rg=g.st?`Từ ${fmt(g.st)} đến ${k=='cur'?'nay':en?fmt(en):'…'}, ${en?dd(D(g.st),D(en)):0} ngày`:'Chưa có ảnh hay clip';
return `<div class="sc ${k} rv"><i>${g.e}</i><div class=gl><b class=fr>${g.n}. ${E(g.l)}</b>${k=='cur'?' <small>đang ở đây</small>':''}<br><small>${rg}</small><br><small>${g.np} ảnh, ${g.nv} clip</small>${th.length?`<div class=mm style="margin:10px 0">${th.map((x,i)=>cell(x,l,i)).join('')}</div>`:''}${g.np+g.nv?`<button class=bt data-a=sf data-i=${g.n}>Xem kỷ niệm</button>`:''}</div></div>`}).join('')}</div>`;
