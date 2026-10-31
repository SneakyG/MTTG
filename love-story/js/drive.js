// Đọc cây thư mục Google Drive (Drive API v3) và dựng dữ liệu kỷ niệm
async function ls(q,f){let o=[],t='';do{let j;for(let k=0;;k++){const r=await fetch(`${API}?q=${encodeURIComponent(q)}&fields=nextPageToken,files(${f})&pageSize=1000&key=${CFG.key}${t?'&pageToken='+t:''}`);j=await r.json();if(r.ok)break;if(k>=3||!/ateLimit/.test(JSON.stringify(j.error)))throw Error(j.error?.message||r.status);await new Promise(z=>setTimeout(z,600*(k+1)))}o=o.concat(j.files);t=j.nextPageToken}while(t);return o}
// Key công khai chỉ được hỏi từng thư mục một ('ID' in parents); gộp nhiều thư mục bằng "or" sẽ bị Google trả 403
const NF=" and mimeType!='application/vnd.google-apps.folder' and trashed=false",
pool=async(a,fn,n=10)=>{const o=[];let i=0;await Promise.all(Array.from({length:Math.min(n,a.length)},async()=>{while(i<a.length){const k=i++;o[k]=await fn(a[k])}}));return o},
lsIn=async(ids,x,f)=>(await pool(ids,id=>ls(`'${id}' in parents`+x,f))).flat(),
isMedia=f=>/^(image|video)\//.test(f.mimeType);
function build(sf,it){X.items=it;X.sf=sf;const N=Math.max(DEF.length,...sf.map(f=>f.n));
X.stages=[...Array(N)].map((_,i)=>{const n=i+1,f=sf.find(x=>x.n==n),sl=f?f.slug:DEF[i],m=ST[sl]||[(sl||'Giai đoạn '+n).replace(/_/g,' '),'💞','đã bên nhau'],a=it.filter(x=>x.s==n),ds=a.map(x=>x.d).sort();
return{n,l:m[0],e:m[1],v:m[2],st:CFG.start[n]||ds[0]||'',last:ds[ds.length-1]||'',np:a.filter(x=>!x.v).length,nv:a.filter(x=>x.v).length}})}
async function load(){
const all=await ls(`'${CFG.root}' in parents`+FO,'id,name'),av=all.filter(f=>/ava/i.test(f.name)),
pa=av.length?lsIn(av.map(f=>f.id),FO,'id').then(x=>lsIn([...av,...x].map(f=>f.id),NF,'id,name,mimeType')).then(a=>a.filter(f=>f.mimeType.startsWith('image/'))).catch(()=>[]):Promise.resolve([]),
au=ls(`'${CFG.root}' in parents`+NF,'id,name,mimeType').catch(()=>[]),
sf=all.filter(f=>!/ava/i.test(f.name)).map(f=>{const m=/^(\d+)_(.+)$/.exec(f.name);return m&&{id:f.id,n:+m[1],slug:m[2]}}).filter(Boolean),
mf=sf.length?await lsIn(sf.map(f=>f.id),FO,'id,name,parents'):[],by={},mk={};
mf.forEach(f=>{by[f.id]=sf.find(s=>s.id==f.parents[0]).n;mk[f.id]=/^vid/i.test(f.name)?'videos':'images'});
const dfs=mf.length?await lsIn(mf.map(f=>f.id),FO,'id,name,parents'):[],dm={};
dfs.forEach(f=>{const m=/^(\d{4})(\d{2})(\d{2})(.*)$/.exec(f.name);if(!m||+m[2]<1||+m[2]>12||+m[3]<1||+m[3]>31)return;const c=m[4].replace(/^[\s_-]+/,'');
dm[f.id]={d:`${m[1]}-${m[2]}-${m[3]}`,s:by[f.parents[0]],k:mk[f.parents[0]],p:f.parents[0],c:/\p{L}/u.test(c)?c:''}});
const fl=Object.keys(dm).length?await lsIn(Object.keys(dm),NF,'id,name,mimeType,parents'):[],it=[];
fl.sort((a,b)=>a.name.localeCompare(b.name)).forEach(f=>{const x=dm[f.parents[0]];if(x&&isMedia(f))it.push({id:f.id,d:x.d,s:x.s,v:f.mimeType[0]=='v'?1:0,c:x.c})});
it.sort((a,b)=>b.d.localeCompare(a.d));build(sf,it);
const pics=(await pa).sort((x,y)=>x.name.localeCompare(y.name)),bn=f=>f.name.replace(/\.[^.]*$/,'').toLowerCase(),pk=(n,i)=>(pics.find(f=>bn(f)==n.toLowerCase())||pics[i])?.id;
AV={a:pk(CFG.a,0),b:pk(CFG.b,1)};AV.c=pics.filter(f=>f.id!=AV.a&&f.id!=AV.b).map(f=>f.id);
const rf=await au,aus=rf.filter(f=>/^audio\//.test(f.mimeType));AUD=(aus.find(f=>/gioi/i.test(f.name))||aus[0]||{}).id||'';EVF=(rf.find(f=>f.name=='sap_toi.txt')||{}).id||'';
X.mfs=mf.map(f=>({id:f.id,n:by[f.id],k:mk[f.id]}));X.dfs=Object.keys(dm).map(id=>({id,...dm[id]}));
await evLoad();saveCache()}
const saveCache=()=>{try{localStorage.mttg=JSON.stringify({sf:X.sf,it:X.items,AV,AUD,df:X.dfs,mf:X.mfs,evf:EVF,evt:EVT})}catch(e){}};
try{const c=JSON.parse(localStorage.mttg||'null');if(c){build(c.sf,c.it);AV=c.AV||{};AUD=c.AUD||'';X.dfs=c.df||[];X.mfs=c.mf||[];EVF=c.evf||'';EVT=c.evt||'';evParse(EVT)}}catch(e){}

