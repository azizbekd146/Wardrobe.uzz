import { firebaseConfig } from './firebase-config.js';

const CATS=['tops','outerwear','trousers','shoes','caps','bags'];
const TEXT={
  uz:{
    storeSubtitle:'VIRTUAL DO‘KON',all:'Barchasi',tops:'Ko‘ylaklar',outerwear:'Ustki kiyim',trousers:'Shimlar',shoes:'Oyoq kiyimlar',caps:'Bosh kiyimlar',bags:'Sumkalar',
    ok:'Sinxronlandi',busy:'Sinxronlanmoqda...',off:'Oflayn',upload:'+ Kiyim qo‘shish',aiMatch:'AI bilan moslash',
    menuTitle:'Menyu',menuOpen:'Menyuni ochish',menuClose:'Menyuni yopish',
    favorites:'♥ Sevimlilar',favoritesEmpty:'Hali sevimli kiyim yo‘q.',
    addFavorite:'Sevimlilarga qo‘shish',removeFavorite:'Sevimlilardan olib tashlash',
    favoriteAdded:'Sevimlilarga saqlandi',favoriteRemoved:'Sevimlilardan olib tashlandi',
    favoritesLoadFailed:'Sevimlilarni yuklab bo‘lmadi',
    settingsTitle:'Sozlamalar',menuSettings:'⚙️ Sozlamalar',closeSettings:'Sozlamalarni yopish',
    themeTitle:'Mavzu',lightMode:'Light',darkMode:'Dark',
    outfitHistory:'Obrazlar tarixi',historyClose:'Tarixni yopish',historyEmpty:'Saqlangan obrazlar hozircha yo‘q.',
    saveOutfit:'Obrazni saqlash',outfitSaved:'Saqlandi',itemName:'Kiyim nomi',historyLoadFailed:'Obrazlar tarixini o‘qib bo‘lmadi',
    syncHint:'Qurilmalarni sinxronlash kodi orqali ulang.',uploadTitle:'Kiyim qo‘shish',editItem:'Kiyimni tahrirlash',takePhoto:'Rasmga olish',chooseFile:'Fayl tanlash',
    cancel:'Bekor qilish',save:'Saqlash',edit:'Tahrirlash',delete:'O‘chirish',close:'Yopish',shuffle:'Yana taklif',
    syncTitle:'Sinxronlash',syncDescription:'Barcha qurilmalaringizda bir xil sinxronlash kodidan foydalaning. Uni maxfiy saqlang.',
    syncCode:'Sinxronlash kodi',generate:'Yaratish',
    storageFull:'Mahalliy xotira to‘ldi',syncError:'Sinxronlashda xatolik: ',loadFirebase:'Firebase yuklanmadi',
    saveFailed:'Saqlab bo‘lmadi: ',deleteFailed:'O‘chirib bo‘lmadi',imageRead:'Rasmni o‘qib bo‘lmadi',photoRequired:'Avval rasm tanlang',
    confirmDelete:'“{name}” kiyimini o‘chirmoqchimisiz?',
    styling:'Gemini obraz tuzmoqda…',bestLook:'Eng mos obraz',
    aiNotConfigured:'Gemini API kaliti serverda sozlanmagan.',aiFailed:'AI obraz tuza olmadi. Keyinroq qayta urinib ko‘ring.',
    needCategories:'Obraz tavsiyasini olish uchun kamida bitta ustki kiyim, shim va oyoq kiyim qo‘shing.',
    syncCodeLength:'Kamida 8 ta belgidan foydalaning',
    localMode:'Mahalliy rejim: sinxronlash uchun js/firebase-config.js fayliga Firebase kalitlarini kiriting.',
  },
  en:{
    storeSubtitle:'VIRTUAL STORE',all:'All',tops:'Tops',outerwear:'Outerwear',trousers:'Trousers',shoes:'Shoes',caps:'Caps',bags:'Bags',
    ok:'Synced',busy:'Syncing...',off:'Offline',upload:'+ Upload item',aiMatch:'AI match',
    menuTitle:'Menu',menuOpen:'Open menu',menuClose:'Close menu',
    favorites:'♥ Favorites',favoritesEmpty:'No favorite items yet.',
    addFavorite:'Add to favorites',removeFavorite:'Remove from favorites',
    favoriteAdded:'Added to favorites',favoriteRemoved:'Removed from favorites',
    favoritesLoadFailed:'Could not load favorites',
    settingsTitle:'Settings',menuSettings:'⚙️ Settings',closeSettings:'Close settings',
    themeTitle:'Theme',lightMode:'Light',darkMode:'Dark',
    outfitHistory:'Outfit history',historyClose:'Close history',historyEmpty:'No saved outfits yet.',
    saveOutfit:'Save outfit',outfitSaved:'Saved',itemName:'Item name',historyLoadFailed:'Could not load outfit history',
    syncHint:'Tap the status badge to link your devices with a sync code.',uploadTitle:'Upload item',editItem:'Edit item',takePhoto:'Take photo',chooseFile:'Choose file',
    cancel:'Cancel',save:'Save',edit:'Edit',delete:'Delete',close:'Close',shuffle:'Try another',
    syncTitle:'Sync',syncDescription:'Use the same sync code on all your devices. Keep it private.',
    syncCode:'Sync code',generate:'Generate',
    storageFull:'Local storage is full',syncError:'Sync error: ',loadFirebase:'Could not load Firebase',
    saveFailed:'Save failed: ',deleteFailed:'Delete failed',imageRead:'Could not read that image',photoRequired:'Please add a photo first',
    confirmDelete:'Delete “{name}”?',
    styling:'Gemini is styling…',bestLook:'Best outfit',
    aiNotConfigured:'The Gemini API key is not configured on the server.',aiFailed:'AI could not create an outfit. Please try again later.',
    needCategories:'Add at least one top, one pair of trousers and one pair of shoes to get outfit ideas.',
    syncCodeLength:'Use at least 8 characters',
    localMode:'Local mode: add Firebase keys in js/firebase-config.js to sync.',
  }
};
const $=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const configured=!firebaseConfig.apiKey.startsWith('PASTE');
let items=[],filter='all',editing=null,photo=null,viewing=null,fb=null,outfitHistory=[],currentOutfits=[],favorites=new Set();
let lang=localStorage.getItem('language')==='en'?'en':'uz',status='off';
let theme=localStorage.getItem('theme')==='dark'?'dark':'light';
localStorage.removeItem('aiKey');

const t=key=>TEXT[lang][key];
function applyTheme(){
  document.documentElement.dataset.theme=theme;
  document.querySelectorAll('[data-theme-choice]').forEach(button=>{
    button.setAttribute('aria-pressed',String(button.dataset.themeChoice===theme));
  });
  $('themeOptions').setAttribute('aria-label',t('themeTitle'));
}
function setStatus(s){status=s;const b=$('badge');b.className='badge '+s;b.textContent=t(s)}
function toast(message){const e=$('toast');e.textContent=message;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2600)}
const code=()=>localStorage.getItem('syncCode');
const label=id=>TEXT[lang][id]||id;
function readOutfitHistory(){
  try{
    const saved=JSON.parse(localStorage.getItem('outfitHistory')||'[]');
    if(!Array.isArray(saved))throw new TypeError('Outfit history must be an array');
    return saved.filter(o=>o&&typeof o.id==='string'&&Array.isArray(o.ids));
  }catch(error){console.error(error);toast(t('historyLoadFailed'));return []}
}
outfitHistory=readOutfitHistory();
function readFavorites(){
  try{
    const saved=JSON.parse(localStorage.getItem('favorites')||'[]');
    if(!Array.isArray(saved))throw new TypeError('Favorites must be an array');
    return saved.filter(id=>typeof id==='string');
  }catch(error){console.error(error);toast(t('favoritesLoadFailed'));return []}
}
favorites=new Set(readFavorites());
function updateFavorites(next){
  try{localStorage.setItem('favorites',JSON.stringify([...next]));favorites=next;return true}
  catch(error){console.error(error);toast(t('storageFull'));return false}
}
function toggleFavorite(id){
  const next=new Set(favorites),removing=next.has(id);
  if(removing)next.delete(id);else next.add(id);
  if(updateFavorites(next)){render();toast(t(removing?'favoriteRemoved':'favoriteAdded'))}
}
function clearFavorite(id){
  if(!favorites.has(id))return;
  const next=new Set(favorites);next.delete(id);updateFavorites(next);
}
function persistOutfitHistory(next){
  try{localStorage.setItem('outfitHistory',JSON.stringify(next));outfitHistory=next;return true}
  catch(error){console.error(error);toast(t('storageFull'));return false}
}
function saveOutfit(outfit){
  const saved={id:crypto.randomUUID(),title:outfit.title,ids:[...outfit.ids],why:outfit.why,savedAt:Date.now()};
  if(!persistOutfitHistory([saved,...outfitHistory]))return false;
  renderHistory();toast(t('outfitSaved'));return true;
}
function renderHistory(){
  const box=$('historyOut');
  if(!outfitHistory.length){box.innerHTML=`<p class="history-empty">${t('historyEmpty')}</p>`;return}
  box.innerHTML=outfitHistory.map(outfit=>{
    const date=new Date(outfit.savedAt).toLocaleDateString(lang==='uz'?'uz-UZ':'en-US');
    const images=outfit.ids.map(id=>items.find(item=>item.id===id)).filter(Boolean);
    return `<article class="history-entry">
      <div class="history-meta"><b>${esc(outfit.title)}</b><small>${date}</small></div>
      <div class="th">${images.map(item=>`<img src="${esc(item.img)}" alt="${esc(item.name)}">`).join('')}</div>
      <small>${esc(outfit.why)}</small>
      <button type="button" class="btn danger history-delete" data-history-delete="${esc(outfit.id)}">${t('delete')}</button>
    </article>`;
  }).join('');
}
function applyLanguage(){
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(e=>{e.textContent=t(e.dataset.i18n)});
  document.querySelectorAll('[data-i18n-placeholder]').forEach(e=>{e.placeholder=t(e.dataset.i18nPlaceholder)});
  $('langToggle').textContent=lang==='uz'?'UZB':'ENG';
  $('menuToggle').setAttribute('aria-label',t('menuOpen'));
  $('menuClose').setAttribute('aria-label',t('menuClose'));
  $('settingsClose').setAttribute('aria-label',t('closeSettings'));
  $('historyClose').setAttribute('aria-label',t('historyClose'));
  $('aiX').setAttribute('aria-label',t('close'));
  $('langMenu').querySelector('button').textContent=lang==='uz'?'ENG':'UZB';
  $('langMenu').querySelector('button').dataset.lang=lang==='uz'?'en':'uz';
  $('cat').innerHTML=CATS.map(id=>`<option value="${id}">${label(id)}</option>`).join('');
  $('upT').textContent=editing?t('editItem'):t('uploadTitle');
  $('langToggle').setAttribute('aria-expanded',String(!$('langMenu').hidden));
  if(viewing)$('vInfo').innerHTML=`<b>${esc(viewing.name)}</b><br>${label(viewing.cat)}${viewing.color?' · '+esc(viewing.color):''}`;
  setStatus(status);
  render();
  if($('dHistory').open)renderHistory();
}

// ---------- storage: Firestore (real-time) or localStorage ----------
function local(){try{items=JSON.parse(localStorage.getItem('items')||'[]')}catch(e){items=[]}}
function persist(){try{localStorage.setItem('items',JSON.stringify(items))}catch(e){toast(t('storageFull'))}}
async function startStore(){
  if(!configured||!code()){local();setStatus('off');render();return}
  try{
    const A=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const F=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const app=A.initializeApp(firebaseConfig);
    const db=F.initializeFirestore(app,{localCache:F.persistentLocalCache({tabManager:F.persistentMultipleTabManager()})});
    const col=F.collection(db,'wardrobes',code(),'items');
    fb={save:it=>F.setDoc(F.doc(col,it.id),it),del:id=>F.deleteDoc(F.doc(col,id))};
    F.onSnapshot(col,{includeMetadataChanges:true},s=>{
      items=s.docs.map(d=>d.data()).sort((a,b)=>b.created-a.created);
      setStatus(!navigator.onLine?'off':(s.metadata.hasPendingWrites||s.metadata.fromCache)?'busy':'ok');
      render()},e=>{console.error(e);setStatus('off');toast(t('syncError')+e.code)});
  }catch(e){console.error(e);local();setStatus('off');toast(t('loadFirebase'));render()}
}
async function saveItem(it){
  if(fb){setStatus('busy');try{await fb.save(it)}catch(e){toast(t('saveFailed')+e.message)}}
  else{const i=items.findIndex(x=>x.id===it.id);i<0?items.unshift(it):items[i]=it;persist();render()}}
async function delItem(id){
  if(fb){try{await fb.del(id);clearFavorite(id)}catch(e){toast(t('deleteFailed'))}}
  else{items=items.filter(x=>x.id!==id);clearFavorite(id);persist();render()}}

// ---------- image compression (900px, JPEG .65 => ~100KB; fits Firestore's 1MB limit) ----------
function compress(file){return new Promise((res,rej)=>{
  const img=new Image(),url=URL.createObjectURL(file);
  img.onload=()=>{const k=Math.min(1,900/Math.max(img.width,img.height)),c=document.createElement('canvas');
    c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',.65))};
  img.onerror=()=>rej(new Error(t('imageRead')));img.src=url})}

// ---------- render ----------
function render(){
  const categories=filter==='all'?CATS:filter==='favorites'
    ?CATS.filter(id=>items.some(i=>i.cat===id&&favorites.has(i.id)))
    :CATS.filter(id=>id===filter);
  if(filter==='favorites'&&!categories.length){$('shelves').innerHTML=`<p class="favorites-empty">${t('favoritesEmpty')}</p>`;return}
  $('shelves').innerHTML=categories.map(id=>{
    const l=items.filter(i=>i.cat===id&&(filter!=='favorites'||favorites.has(i.id)));
    return `<section><h3>${label(id)}</h3>${l.length
      ?`<div class="rail">${l.map(i=>`<div class="item" data-id="${esc(i.id)}"><img src="${esc(i.img)}" alt="${esc(i.name)}" loading="lazy"><button type="button" class="favorite-toggle${favorites.has(i.id)?' is-favorite':''}" data-favorite-id="${esc(i.id)}" aria-label="${t(favorites.has(i.id)?'removeFavorite':'addFavorite')}" aria-pressed="${favorites.has(i.id)}" title="${t(favorites.has(i.id)?'removeFavorite':'addFavorite')}"><span aria-hidden="true">${favorites.has(i.id)?'♥':'♡'}</span></button><b>${esc(i.name)}</b></div>`).join('')}</div>`
      :'<div class="empty" aria-hidden="true"></div>'}</section>`}).join('')}
$('shelves').onclick=e=>{
  const favoriteButton=e.target.closest('button[data-favorite-id]');
  if(favoriteButton){toggleFavorite(favoriteButton.dataset.favoriteId);return}
  const c=e.target.closest('.item');if(!c)return;
  viewing=items.find(i=>i.id===c.dataset.id);if(!viewing)return;
  $('vImg').src=viewing.img;
  $('vInfo').innerHTML=`<b>${esc(viewing.name)}</b><br>${label(viewing.cat)}${viewing.color?' · '+esc(viewing.color):''}`;
  $('dView').showModal()};

// ---------- upload / edit ----------
function openUp(it){editing=it||null;photo=it?it.img:null;
  $('upT').textContent=it?t('editItem'):t('uploadTitle');
  $('cat').value=it?.cat||(filter!=='all'?filter:'tops');
  $('name').value=it?.name||'';
  $('name').hidden=!it;
  $('name').required=Boolean(it);
  $('prev').hidden=!photo;if(photo)$('prev').src=photo;$('dUp').showModal()}
async function pick(e){const f=e.target.files[0];if(!f)return;
  try{photo=await compress(f);$('prev').src=photo;$('prev').hidden=false}catch(err){toast(err.message)}e.target.value=''}
$('cam').onchange=pick;$('file').onchange=pick;
$('bUp').onclick=()=>openUp();$('upX').onclick=()=>$('dUp').close();
$('fUp').onsubmit=async e=>{
  if(!photo){e.preventDefault();toast(t('photoRequired'));return}
  await saveItem({id:editing?.id||crypto.randomUUID(),created:editing?.created||Date.now(),updated:Date.now(),
    img:photo,cat:$('cat').value,name:editing?$('name').value.trim():label($('cat').value),color:editing?.color||''})};
$('vX').onclick=()=>$('dView').close();
$('vEdit').onclick=()=>{$('dView').close();openUp(viewing)};
$('vDel').onclick=()=>{if(confirm(t('confirmDelete').replace('{name}',viewing.name))){delItem(viewing.id);$('dView').close()}};
$('cat').innerHTML=CATS.map(id=>`<option value="${id}">${label(id)}</option>`).join('');

// ---------- AI match ----------
async function runAi(){
  const box=$('aiOut');
  currentOutfits=[];
  const required=['tops','trousers','shoes'];
  if(required.some(category=>!items.some(item=>item.cat===category))){box.innerHTML=`<p>${t('needCategories')}</p>`;return}
  box.innerHTML=`<p>${t('styling')}</p>`;
  $('aiAgain').disabled=true;
  try{
    const response=await fetch('/api/match',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({language:lang,items:items.map(({id,name,cat,color})=>({id,name,category:cat,color}))})});
    const result=await response.json().catch(()=>null);
    if(response.status===503)throw new Error(t('aiNotConfigured'));
    if(!response.ok)throw new Error(response.status>=500?t('aiFailed'):result?.error||t('aiFailed'));
    if(!Array.isArray(result?.outfit)||typeof result.stylistNote!=='string'||!result.stylistNote.trim())throw new Error(t('aiFailed'));
    const selected=result.outfit.map(id=>items.find(item=>item.id===id));
    if(selected.length<3||selected.some(item=>!item))throw new Error(t('aiFailed'));
    const outfit={title:t('bestLook'),ids:selected.map(item=>item.id),why:result.stylistNote.trim()};
    currentOutfits=[outfit];
    box.innerHTML=`<div class="outfit"><b>${esc(outfit.title)}</b><div class="th">${
      selected.map(item=>`<img src="${esc(item.img)}" alt="${esc(item.name)}">`).join('')}</div><small>${esc(outfit.why)}</small><button type="button" class="btn save-look" data-save-outfit="0">${t('saveOutfit')}</button></div>`;
  }catch(error){
    console.error('AI outfit generation failed:',error);
    box.innerHTML=`<p>${esc(error instanceof Error?error.message:t('aiFailed'))}</p>`;
  }finally{$('aiAgain').disabled=false}
}
$('aiOut').onclick=e=>{
  const button=e.target.closest('button[data-save-outfit]');if(!button)return;
  const outfit=currentOutfits[Number(button.dataset.saveOutfit)];if(!outfit)return;
  if(saveOutfit(outfit)){button.disabled=true;button.textContent=t('outfitSaved')}
};
$('bAi').onclick=()=>{$('dAi').showModal();runAi()};
$('aiAgain').onclick=runAi;$('aiX').onclick=()=>$('dAi').close();

// ---------- sync code ----------
function closeMenu(){
  if($('dMenu').open)$('dMenu').close();
  $('menuToggle').setAttribute('aria-expanded','false');
}
$('badge').onclick=()=>{closeMenu();$('code').value=code()||'';$('dSync').showModal()};
$('gen').onclick=()=>$('code').value=crypto.randomUUID().replace(/-/g,'').slice(0,16);
$('codeOk').onclick=()=>{const v=$('code').value.trim();
  if(v.length<8){toast(t('syncCodeLength'));return}
  localStorage.setItem('syncCode',v);location.reload()};

$('menuToggle').onclick=()=>{
  if($('dMenu').open){closeMenu();return}
  $('dMenu').showModal();
  $('menuToggle').setAttribute('aria-expanded','true');
};
$('dMenu').addEventListener('close',()=>$('menuToggle').setAttribute('aria-expanded','false'));
$('menuClose').onclick=closeMenu;
$('settingsOpen').onclick=()=>{closeMenu();$('dSettings').showModal()};
$('settingsClose').onclick=()=>$('dSettings').close();
$('historyOpen').onclick=()=>{closeMenu();renderHistory();$('dHistory').showModal()};
$('historyClose').onclick=()=>$('dHistory').close();
$('historyOut').onclick=e=>{
  const button=e.target.closest('button[data-history-delete]');if(!button)return;
  const next=outfitHistory.filter(outfit=>outfit.id!==button.dataset.historyDelete);
  if(persistOutfitHistory(next))renderHistory();
};
$('themeOptions').onclick=e=>{
  const button=e.target.closest('button[data-theme-choice]');if(!button)return;
  theme=button.dataset.themeChoice;localStorage.setItem('theme',theme);applyTheme();
};
$('dMenu').onclick=e=>{
  const b=e.target.closest('button[data-menu-filter]');if(!b)return;
  filter=b.dataset.menuFilter;render();closeMenu();
};
$('langToggle').onclick=()=>{
  $('langMenu').hidden=!$('langMenu').hidden;
  $('langToggle').setAttribute('aria-expanded',String(!$('langMenu').hidden));
};
$('langMenu').onclick=e=>{
  const b=e.target.closest('button[data-lang]');if(!b)return;
  lang=b.dataset.lang;localStorage.setItem('language',lang);$('langMenu').hidden=true;applyLanguage();
};
addEventListener('click',e=>{
  if(!e.target.closest('#language')){$('langMenu').hidden=true;$('langToggle').setAttribute('aria-expanded','false')}
});

applyTheme();
applyLanguage();

addEventListener('online',()=>fb&&setStatus('busy'));
addEventListener('offline',()=>setStatus('off'));
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.error));
startStore();
if(!configured)setTimeout(()=>toast(t('localMode')),900);
else if(!code())setTimeout(()=>$('badge').click(),400);
