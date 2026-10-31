// Màn hình mở đầu, nền động và hiệu ứng tim
function rain(el,n){for(let i=0;i<n;i++){const s=document.createElement('span');s.className='fl';s.textContent=['💗','💕','✨','🌸','💖'][i%5];s.style.cssText=`left:${Math.random()*100}%;font-size:${12+Math.random()*18}px;animation-duration:${9+Math.random()*10}s;animation-delay:-${Math.random()*14}s`;el.appendChild(s)}}
function burst(x,y,n=30){for(let i=0;i<n;i++){const s=document.createElement('span'),a=Math.random()*6.28,d=80+Math.random()*(innerWidth>500?260:170);s.className='pt';s.textContent=['💗','💖','💕','✨','🌸','💛'][i%6];s.style.cssText=`left:${x}px;top:${y}px;--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d-40}px;--r:${Math.random()*360-180}deg;animation-delay:${Math.random()*.15}s`;document.body.appendChild(s);setTimeout(()=>s.remove(),1800)}}
function initBg(){const b=$('#bg');b.innerHTML='<b></b><b></b><b></b>';rain(b,12);rain($('#sp'),16);$('#spnm').textContent=$('#brand').textContent=`${CFG.a} & ${CFG.b}`}
function paintSp(){const e=$('#spd'),cs=X.stages[CFG.current-1];if(e&&cs&&cs.st)e.textContent=`Đã bên nhau ${dd(D(cs.st),today())} ngày`}
function openApp(e){if(opened)return;opened=1;musicOn();document.body.classList.add('ok');burst(e?e.clientX:innerWidth/2,e?e.clientY:innerHeight/2,44);$('#sp').classList.add('go');
setTimeout(()=>{render();const cs=X.stages[CFG.current-1],u=cs&&ups(D(cs.st||iso(today())),cs)[0];if(u&&!u.k)burst(innerWidth/2,innerHeight/3,60)},800);
setTimeout(()=>$('#sp').remove(),2200)}
