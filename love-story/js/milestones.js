// Tính thời gian bên nhau và các mốc sắp tới
function ymd(a,b){let y=b.getFullYear()-a.getFullYear(),m=b.getMonth()-a.getMonth(),d=b.getDate()-a.getDate();if(d<0){m--;d+=new Date(b.getFullYear(),b.getMonth(),0).getDate()}if(m<0){y--;m+=12}return[y,m,d]}
function ups(s,cs){const t=today(),L=[],v=cs.v.replace('đã ',''),add=(n,d,o)=>d>=t&&L.push({n,d,k:dd(t,d),...o});
[100,200,300,365,500,666,777,888,999,1000,1111,1314,1500,2000,2500,3000,3650,5000].forEach(n=>add(n+' ngày '+v,new Date(s.getFullYear(),s.getMonth(),s.getDate()+n)));
for(let y=1;y<80;y++){const d=new Date(s.getFullYear()+y,s.getMonth(),s.getDate());if(d>=t){add('Kỷ niệm '+y+' năm',d);break}}
EV.forEach((e,i)=>{const o=D(e.d);let d=o;if(e.r){d=new Date(t.getFullYear(),o.getMonth(),o.getDate());if(d<t)d.setFullYear(d.getFullYear()+1)}add(e.n,d,{ei:i,r:e.r})});
CFG.events.forEach(e=>{const o=D(e.d),d=new Date(t.getFullYear(),o.getMonth(),o.getDate());if(d<t)d.setFullYear(d.getFullYear()+1);add(e.n,d,{cf:1})});
L.sort((a,b)=>a.d-b.d);const au=L.filter(u=>u.ei==null&&!u.cf).slice(0,3),cu=L.filter(u=>u.ei!=null||u.cf);return[...au,...cu].sort((a,b)=>a.d-b.d)}

