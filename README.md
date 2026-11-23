# Wardrobe – Virtual Store (PWA)

```
wardrobe-virtual-store/
├── index.html
├── css/styles.css
├── js/firebase-config.js   <- paste your Firebase keys here
├── js/app.js
├── icons/ (icon.svg, icon-192.png, icon-512.png)
├── manifest.json
├── service-worker.js
└── README.md
```

## 1. Firebase (free)
1. console.firebase.google.com -> Add project (Analytics off).
2. Build -> Firestore Database -> Create database -> production mode -> choose a region.
3. Project settings (gear) -> Your apps -> Web (`</>`) -> register -> copy the values into `js/firebase-config.js`.
4. Firestore -> Rules -> paste and Publish:
```
rules_version = '2';
service cloud.firestore { match /databases/{db}/documents {
  match /wardrobes/{code}/items/{item} { allow read, write: if true; }
} }
```
Your private sync code works like a password for your data. Don't share it.
Photos are compressed to about 100 KB and saved inside Firestore, so Firebase Storage (paid-plan only now) is not needed.

## 2. Deploy over HTTPS
- **Netlify:** app.netlify.com/drop -> drag the `wardrobe-virtual-store` folder in.
- **GitHub Pages:** upload the folder contents to a repo -> Settings -> Pages -> Deploy from `main` / root.
- **Vercel:** import the repo or run `vercel` in the folder (framework: Other).

## 3. Link your devices
Tap the status badge (Synced / Syncing... / Offline) on your computer -> Generate -> Save. On your phone, open the same site, tap the badge and enter the **same code**.

## 4. Install on your phone
- **iPhone (Safari):** Share -> Add to Home Screen -> Add.
- **Android (Chrome/Edge):** menu -> Install app / Add to Home screen.

## AI match
- Works with no setup: smart local matching picks a top, trousers and shoes (plus optional outerwear, cap, bag) using the colors you typed in, favouring neutrals with at most one accent.
- Optional: tap "AI key" and save an Anthropic API key (sk-ant-…). Only item names, categories and colors are sent to Anthropic, never photos. The key is stored only in that device's browser.
