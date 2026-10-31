// Ghi lên Google Drive (cần đăng nhập Google): thêm/xoá ảnh-clip, lưu danh sách Sắp tới vào sap_toi.txt
const SCOPE='https://www.googleapis.com/auth/drive',UP='https://www.googleapis.com/upload/drive/v3/files';
let tc,tp,EO=null;
const mOpen=h=>{$('#mi').innerHTML=h;$('#md').className='on'},mClose=()=>{$('#md').className='';$('#mi').innerHTML=''},
toast=m=>{const t=$('#ts');t.textContent=m;t.className='on';clearTimeout(t._t);t._t=setTimeout(()=>t.className='',3200)};
function auth(){return new Promise((ok,no)=>{if(TK&&Date.now()<TX)return ok(TK);
if(!CFG.clientId)return no(Error('Chưa cấu hình clientId để đăng nhập Google (xem README)'));
if(!window.google||!google.accounts)return no(Error('Chưa tải được Google Sign-In, hãy thử lại sau ít giây'));
tp={ok,no};tc=tc||google.accounts.oauth2.initTokenClient({client_id:CFG.clientId,scope:SCOPE,
callback:r=>{if(r.error)tp.no(Error(r.error_description||r.error));else{TK=r.access_token;TX=Date.now()+(r.expires_in-60)*1000;tp.ok(TK)}},
error_callback:e=>tp.no(Error(e.type=='popup_closed'?'Bạn đã đóng cửa sổ đăng nhập':'Không đăng nhập được, hãy cho phép cửa sổ bật lên (popup)'))});
tc.requestAccessToken({prompt:''})})}
async function gf(u,o={}){const r=await fetch(u,{...o,headers:{Authorization:'Bearer '+await auth(),...(o.headers||{})}});
if(!r.ok){let m=r.status;try{m=(await r.json()).error.message}catch(e){}throw Error((r.status==403||r.status==404?'Chưa có quyền chỉnh sửa thư mục MTTG. ':'')+m)}return r}
const J={'Content-Type':'application/json'},
mkdir=async(name,p)=>(await(await gf(`${API}?fields=id`,{method:'POST',headers:J,body:JSON.stringify({name,mimeType:'application/vnd.google-apps.folder',parents:[p]})})).json()).id,
trash=id=>gf(`${API}/${id}?fields=id`,{method:'PATCH',headers:J,body:'{"trashed":true}'});
function upload(file,parent,onp){return new Promise(async(ok,no)=>{try{const t=await auth(),b='b'+Date.now(),x=new XMLHttpRequest(),
body=new Blob([`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name:file.name,parents:[parent]})}\r\n--${b}\r\nContent-Type: ${file.type||'application/octet-stream'}\r\n\r\n`,file,`\r\n--${b}--`]);
x.open('POST',`${UP}?uploadType=multipart&fields=id,name,mimeType`);x.setRequestHeader('Authorization','Bearer '+t);x.setRequestHeader('Content-Type','multipart/related; boundary='+b);
x.upload.onprogress=e=>onp&&onp(e.loaded/e.total);x.onerror=()=>no(Error('Mất kết nối khi tải lên'));
x.onload=()=>{if(x.status<300)ok(JSON.parse(x.responseText));else{let m=x.status;try{m=JSON.parse(x.responseText).error.message}catch(e){}no(Error(m))}};x.send(body)}catch(e){no(e)}})}

// Thư mục ngày: dùng cái có sẵn hoặc tạo mới trong images/videos của giai đoạn hiện tại
async function ensureDay(kind,d,cap){const n=CFG.current,ex=X.dfs.find(f=>f.s==n&&f.k==kind&&f.d==d);if(ex)return ex.id;
let mf=X.mfs.find(m=>m.n==n&&m.k==kind);
if(!mf){const sf=X.sf.find(s=>s.n==n);if(!sf)throw Error('Không tìm thấy thư mục giai đoạn hiện tại trên Drive');mf={id:await mkdir(kind,sf.id),n,k:kind};X.mfs.push(mf)}
const id=await mkdir(d.replace(/-/g,'')+(cap?'_'+cap:''),mf.id);X.dfs.push({id,d,s:n,k:kind,p:mf.id,c:cap||''});return id}
const selOpts=k=>{const g={};X.dfs.filter(f=>f.k==k&&f.s<=CFG.current).sort((a,b)=>b.d.localeCompare(a.d)).forEach(f=>(g[f.s]??=[]).push(f));
return Object.keys(g).sort((a,b)=>b-a).map(s=>{const st=X.stages[s-1];return `<optgroup label="${E(st.e+' '+st.l)}">${g[s].map(f=>`<option value="${f.id}">${fmt(f.d)}${f.c?' - '+E(f.c):''}</option>`).join('')}</optgroup>`}).join('')};
function upDlg(){const cs=X.stages[CFG.current-1],o=selOpts('images'),has=!!o;
mOpen(`<h3>Thêm ảnh / clip</h3><span class=fgl>Loại</span><div class=sg><label class=sgi><input type=radio name=uk value=images checked><span>🖼️ Ảnh</span></label><label class=sgi><input type=radio name=uk value=videos><span>🎬 Clip</span></label></div>
<span class=fgl>Thư mục ngày</span><div class=sg><label class=sgi><input type=radio name=um value=ex ${has?'checked':''}><span>Chọn có sẵn</span></label><label class=sgi><input type=radio name=um value=new ${has?'':'checked'}><span>Tạo mới</span></label></div>
<div id=uex ${has?'':'hidden'}><select id=ufo>${o||'<option value="">(chưa có thư mục nào)</option>'}</select></div>
<div id=unw ${has?'hidden':''}><input id=ud type=date value="${iso(today())}"><input id=ucap placeholder="Chú thích (tuỳ chọn)" maxlength=50><p class=mu><small>Giai đoạn hiện tại: ${cs.e} ${E(cs.l)}, giữ nguyên. Nếu thư mục ngày này đã có thì tệp được thêm vào đó.</small></p></div>
<span class=fgl>Tệp</span><input id=uf type=file accept="image/*" multiple><p class=mu id=ufi></p><div class=pb id=upb hidden><i></i></div><p class=er id=em></p>
<div class=wb><button class=btp data-a=usv>Tải lên</button><button class=bt data-a=mc>Huỷ</button></div>`)}
async function upSave(b){const kind=$('input[name=uk]:checked').value,mode=$('input[name=um]:checked').value,fs=[...$('#uf').files],em=$('#em'),
ok=f=>kind=='images'?(f.type.startsWith('image/')||/\.(jpe?g|png|gif|webp|heic|heif|avif|bmp)$/i.test(f.name)):(f.type.startsWith('video/')||/\.(mp4|mov|m4v|webm|avi|mkv|3gp)$/i.test(f.name));
em.textContent='';if(!fs.length)return em.textContent='Hãy chọn ít nhất một tệp';
const bad=fs.filter(f=>!ok(f));if(bad.length)return em.textContent=`${bad.length} tệp không đúng loại ${kind=='images'?'ảnh':'clip'}: ${bad[0].name}`;
let d,fid,cap='';
if(mode=='ex'){fid=$('#ufo').value;const r=X.dfs.find(f=>f.id==fid);if(!r)return em.textContent='Hãy chọn một thư mục ngày';d=r.d}
else{d=$('#ud').value;if(!d)return em.textContent='Hãy chọn ngày';cap=$('#ucap').value.replace(/[\\/:*?"<>|]/g,' ').trim()}
b.disabled=true;$('#upb').hidden=false;
try{await auth();if(mode=='new')fid=await ensureDay(kind,d,cap);
const rec=X.dfs.find(f=>f.id==fid),tot=fs.reduce((s,f)=>s+f.size,0);let dn=0,n=0;
for(const f of fs){b.textContent=`Đang tải ${++n}/${fs.length}…`;const r=await upload(f,fid,p=>{$('#upb i').style.width=Math.round((dn+p*f.size)/tot*100)+'%'});dn+=f.size;X.items.push({id:r.id,d:rec.d,s:rec.s,v:kind=='videos'?1:0,c:rec.c})}
X.items.sort((a,c)=>c.d.localeCompare(a.d));build(X.sf,X.items);saveCache();mClose();render();toast(`Đã thêm ${fs.length} tệp`)}
catch(e){em.textContent=e.message;b.disabled=false;b.textContent='Thử lại'}}
document.addEventListener('change',e=>{const t=e.target;
if(t.name=='uk'){const o=selOpts(t.value);$('#ufo').innerHTML=o||'<option value="">(chưa có thư mục nào)</option>';$('#uf').accept=t.value=='images'?'image/*':'video/*';$('#uf').value='';$('#ufi').textContent='';
document.querySelector(`[name=um][value=${o?'ex':'new'}]`).checked=true;$('#uex').hidden=!o;$('#unw').hidden=!!o}
if(t.name=='um'){$('#uex').hidden=t.value!='ex';$('#unw').hidden=t.value!='new'}
if(t.id=='uf'){const f=[...t.files];$('#ufi').textContent=f.length?`${f.length} tệp, ${(f.reduce((s,x)=>s+x.size,0)/1048576).toFixed(1)} MB`:''}});
addEventListener('keydown',e=>{if(e.key=='Escape'&&$('#md').className=='on')mClose()});

// Chọn nhiều ảnh/clip rồi xoá (chuyển vào thùng rác Drive)
function paintSel(){const b=$('#sbar');document.body.classList.toggle('selm',!!selm);b.className=selm?'on':'';b.innerHTML=selm?`<span>Đã chọn ${SEL.size}</span><button class=bt data-a=sx>Huỷ</button><button class=btp data-a=sdl ${SEL.size?'':'disabled'}>Xoá</button>`:''}
let DM=[];
async function delAsk(){if(!SEL.size)return;try{await auth()}catch(e){return toast(e.message)}
mOpen('<h3>Đang kiểm tra quyền…</h3>');
try{DM=await pool([...SEL],id=>gf(`${API}/${id}?fields=id,ownedByMe,parents,owners(displayName)`).then(r=>r.json()))}
catch(e){return mOpen(`<h3>Không đọc được thông tin tệp</h3><p class=er>${E(e.message)}</p><div class=wb><button class=bt data-a=mc>Đóng</button></div>`)}
const ot=DM.filter(f=>f.ownedByMe===false),nm=[...new Set(ot.map(f=>f.owners&&f.owners[0]&&f.owners[0].displayName).filter(Boolean))].join(', ');
mOpen(`<h3>Xoá ${DM.length} tệp?</h3>${DM.length>ot.length?`<p class=mu>${DM.length-ot.length} tệp của bạn sẽ chuyển vào thùng rác Google Drive, khôi phục được trong 30 ngày.</p>`:''}${ot.length?`<p>${ot.length} tệp do ${E(nm||'người khác')} tải lên: Google chỉ cho người tải lên xoá hẳn, nên app sẽ <b>gỡ khỏi album</b>. Tệp vẫn còn trong Drive của họ, họ có thể tự xoá.</p>`:''}<p class=er id=em></p><div class=wb><button class=btp data-a=sdc>${ot.length==DM.length?'Gỡ khỏi album':'Xoá'}</button><button class=bt data-a=mc>Huỷ</button></div>`)}
const unpar=(id,ps)=>gf(`${API}/${id}?removeParents=${(ps||[]).join(',')}&fields=id`,{method:'PATCH',headers:J,body:'{}'});
async function delSel(b){const L=[...DM];b.disabled=true;let n=0;
try{for(const f of L){b.textContent=`Đang xử lý ${++n}/${L.length}…`;if(f.ownedByMe===false)await unpar(f.id,f.parents);else await trash(f.id);X.items=X.items.filter(x=>x.id!=f.id);SEL.delete(f.id)}
selm=0;build(X.sf,X.items);saveCache();mClose();render();toast(`Đã xoá ${L.length} tệp`)}
catch(e){build(X.sf,X.items);saveCache();render();$('#em').textContent=e.message;b.disabled=false;b.textContent='Thử lại'}}

// Mục Sắp tới lưu trong sap_toi.txt (thư mục MTTG)
async function evLoad(){if(!EVF){EVT='';evParse('');return}try{const r=await fetch(`${API}/${EVF}?alt=media&key=${CFG.key}&_=${Date.now()}`);if(r.ok){EVT=await r.text();evParse(EVT)}}catch(e){}}
async function evWrite(list){const body=evText(list);
if(EVF)await gf(`${UP}/${EVF}?uploadType=media`,{method:'PATCH',headers:{'Content-Type':'text/plain; charset=UTF-8'},body});
else{const b='b'+Date.now(),r=await gf(`${UP}?uploadType=multipart&fields=id`,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},
body:`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name:'sap_toi.txt',parents:[CFG.root],mimeType:'text/plain'})}\r\n--${b}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${body}\r\n--${b}--`});EVF=(await r.json()).id}
EVT=body;evParse(body);saveCache()}
async function evSave(old,n){await auth();if(EVF)evParse(await(await gf(`${API}/${EVF}?alt=media`)).text());
const a=EV.filter(e=>!(old&&e.d==old.d&&e.n==old.n));if(n)a.push(n);a.sort((x,y)=>x.d.localeCompare(y.d));await evWrite(a)}
function evDlg(old){EO=old||null;mOpen(`<h3>${old?'Sửa mục sắp tới':'Thêm mục sắp tới'}</h3><span class=fgl>Tên</span><input id=en value="${E(old?old.n:'')}" placeholder="Vd: Đi Đà Lạt, sinh nhật em…" maxlength=60><span class=fgl>Ngày</span><input id=ed type=date value="${old?old.d:iso(today())}"><label class=ckl><input type=checkbox id=er ${old&&old.r?'checked':''}> Lặp lại hằng năm</label><p class=er id=em></p><div class=wb><button class=btp data-a=evs>Lưu</button>${old?'<button class=bt data-a=evx>Xoá</button>':''}<button class=bt data-a=mc>Huỷ</button></div>`)}
async function evSubmit(b){const n=$('#en').value.replace(/[|\r\n]/g,' ').trim(),d=$('#ed').value,r=$('#er').checked,em=$('#em');
if(!n)return em.textContent='Hãy nhập tên mục này';if(!d)return em.textContent='Hãy chọn ngày';if(!r&&D(d)<today())return em.textContent='Ngày này đã qua, hãy chọn ngày sắp tới (hoặc bật lặp lại hằng năm)';
b.disabled=true;b.textContent='Đang lưu…';try{await evSave(EO,{d,n,r});mClose();render();toast('Đã lưu')}catch(e){em.textContent=e.message;b.disabled=false;b.textContent='Lưu'}}
async function evRemove(b){b.disabled=true;b.textContent='Đang xoá…';try{await evSave(EO,null);mClose();render();toast('Đã xoá')}catch(e){$('#em').textContent=e.message;b.disabled=false;b.textContent='Xoá'}}

const ACTX={mc:()=>mClose(),add:()=>upDlg(),usv:(k,i,b)=>upSave(b),
sm:()=>{selm=selm?0:1;SEL.clear();render()},sx:()=>{selm=0;SEL.clear();render()},
sd:(k,i)=>{const L=CURL.filter(x=>x.d==i),all=L.every(x=>SEL.has(x.id));L.forEach(x=>all?SEL.delete(x.id):SEL.add(x.id));render()},
sdl:()=>delAsk(),
sdc:(k,i,b)=>delSel(b),evn:()=>evDlg(),eve:(k,i)=>evDlg(EV[+i]),evs:(k,i,b)=>evSubmit(b),evx:(k,i,b)=>evRemove(b)};
