// Tiện ích, hằng số và trạng thái dùng chung
const $=s=>document.querySelector(s),E=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'),
DAY=864e5,P=n=>String(n).padStart(2,0),iso=d=>d.getFullYear()+'-'+P(d.getMonth()+1)+'-'+P(d.getDate()),
D=s=>new Date(s+'T00:00:00'),fmt=s=>D(s).toLocaleDateString('vi-VN'),dd=(a,b)=>Math.round((b-a)/DAY),
today=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())},
IMG=(id,w)=>[`https://lh3.googleusercontent.com/d/${id}=w${w}`,`https://drive.google.com/thumbnail?id=${id}&sz=w${w}`,`https://drive.google.com/uc?export=view&id=${id}`],
im=(id,w,x='')=>`<img ${x} data-f="${id},${w}" referrerpolicy=no-referrer src="${IMG(id,w)[0]}" alt="">`,
ST={tim_hieu:['Tìm hiểu','🌱','đang tìm hiểu nhau'],nguoi_yeu:['Người yêu','💕','đã yêu nhau'],vo_chong:['Vợ chồng','💍','đã là vợ chồng'],co_con:['Có con','👶','đã làm ba mẹ'],ve_gia:['Về già','🌅','đã bên nhau trọn đời']},DEF=Object.keys(ST),
API='https://www.googleapis.com/drive/v3/files',FO=" and mimeType='application/vnd.google-apps.folder' and trashed=false",
TABS=[['home','🏠','Trang chủ'],['mem','📖','Kỷ niệm'],['road','🗺️','Hành trình']];
let X={items:[],stages:[],dfs:[],mfs:[],sf:[]},tab='home',F={s:0,t:'',y:0},Q='',opened=0,R=[],LB={l:[],i:0},err='',AV={},AUD='',EVF='',EVT='',EV=[],SEL=new Set(),selm=0,CURL=[],TK='',TX=0;

// sap_toi.txt: mỗi dòng "yyyy-MM-dd|Tên sự kiện|y" (y = lặp hằng năm, bỏ trống = một lần); dòng bắt đầu bằng # là ghi chú
function evParse(t){EV=(t||'').split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&l[0]!='#').map(l=>{const[d,n,r]=l.split('|');return /^\d{4}-\d{2}-\d{2}$/.test(d||'')&&n&&n.trim()?{d,n:n.trim(),r:(r||'').trim()=='y'}:null}).filter(Boolean)}
const evText=a=>'# Sắp tới - mỗi dòng: yyyy-MM-dd|Tên sự kiện|y (y = lặp hằng năm)\n'+a.map(e=>`${e.d}|${e.n}${e.r?'|y':''}`).join('\n')+'\n';
