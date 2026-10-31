// Nhạc nền: bật thì to dần, tắt thì nhỏ dần rồi dừng (iPhone không cho chỉnh âm lượng bằng code nên sẽ dừng thẳng)
const AU=new Audio(),MV=.6;let mt,mon=0,want=0,mfail=0,duck=0;AU.loop=true;
const msrc=()=>CFG.music&&!mfail?CFG.music:AUD?`https://www.googleapis.com/drive/v3/files/${AUD}?alt=media&key=${CFG.key}`:'';
function fade(to,ms,done){clearInterval(mt);const f=AU.volume,t0=performance.now();mt=setInterval(()=>{const p=Math.min(1,(performance.now()-t0)/ms);AU.volume=Math.max(0,Math.min(1,f+(to-f)*p));if(p>=1){clearInterval(mt);done&&done()}},40)}
function paintM(){const b=$('#mb');if(!b)return;b.hidden=!msrc();b.classList.toggle('on',!!mon);b.title=mon?'Tắt nhạc':'Bật nhạc'}
function musicOn(){want=1;duck=0;const s=msrc();if(!s)return;if(AU.getAttribute('src')!=s)AU.src=s;AU.volume=0;AU.play().then(()=>{if(!want)return;mon=1;fade(MV,1500);paintM()}).catch(()=>{})}
function musicOff(){want=0;duck=0;mon=0;fade(0,1200,()=>AU.pause());paintM()}
AU.addEventListener('error',()=>{if(CFG.music&&!mfail){mfail=1;paintM();if(want)musicOn()}else{want=0;mon=0;paintM()}});
// Xem clip: nhạc nền nhỏ dần rồi dừng; đóng clip (hoặc chuyển sang ảnh) thì tự bật lại nếu trước đó đang phát
function musicDuck(){if(mon){duck=1;mon=0;fade(0,700,()=>{if(!mon)AU.pause()});paintM()}}
function musicUnduck(){if(duck)musicOn()}
