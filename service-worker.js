const V='wardrobe-vs-v24',SHELL=['./','./index.html','./css/styles.css','./js/app.js','./js/firebase-config.js','./manifest.json','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.hostname==='www.gstatic.com'){ // Firebase SDK: cached so the app also loads offline
    e.respondWith(caches.open(V).then(async c=>{const h=await c.match(e.request);const n=fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}).catch(()=>h);return h||n}));return}
  if(u.origin!==location.origin)return; // Firestore / AI traffic is not intercepted
  e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request).then(r=>{const cl=r.clone();caches.open(V).then(c=>c.put(e.request,cl));return r}).catch(()=>caches.match('./index.html'))));
});
