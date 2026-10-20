# Royal Rajasthani Multi-Wedding Photographer Platform
## सुरक्षित मल्टी-वेडिंग फोटोग्राफर प्लेटफॉर्म

A production-grade, multi-wedding photographer platform built with **React 19**, **Vite**, **Express**, **Three.js / React Three Fiber**, and **Node.js Cryptography**.

---

## 🏛️ Three Primary Entry Points

1. **Photographer Portal:** `/photographer`
   - Single secure photographer account with master PIN authentication (`PHOTOGRAPHER_PIN`, default `88889999`).
   - Project dashboard managing all weddings (e.g., *Rahul & Priya*, *Amit & Neha*, *Rohan & Kavya*).
   - Create new weddings with automatic slug and 8-digit high-entropy PIN generation.
   - Publish / Unpublish toggles and preview before release.
   - Single-display PIN reveal modal (PIN is shown only once on creation or reset).
   - Reset wedding PINs (automatically invalidates previous credentials and active sessions).
   - Overall RSVP metrics across all weddings.
   - Edit couple details, dates, venues, ceremony schedules, and custom routed pages.
   - Archive/Delete projects.

2. **Shared Wedding Admin Portal:** `/wedding-admin`
   - A single, shared PIN entry point for all wedding families.
   - The user enters their 8-digit PIN; the backend validates it against server-side salted scrypt hashes, identifies the associated wedding, creates an authenticated session, and loads that specific dashboard.
   - Strict server-side data isolation: Wedding A's admin cannot view or edit Wedding B's records.
   - Real-time RSVP analytics: total submissions, confirmed attendees (party sizes aggregated), declined responses.
   - Searchable and filterable guest table.
   - One-click CSV export of guest lists.
   - Family photo & ceremony details editor.

3. **Public Wedding Invitation:** `/w/:weddingSlug`
   - Dynamic public invitation loaded by validated slug (e.g., `/w/rahul-weds-priya`).
   - Shri Ganesh Ji devotional section with custom/default photos.
   - Ganesh Mantra audio player with synced, scrollable lyrics.
   - Royal Rajasthani 3D palace experience (`PalaceScene`).
   - Traditional Rajasthani arch portraits for bride and groom (`RajPortrait`).
   - Live wedding countdown timer.
   - Ceremony schedule with attire and timing notes.
   - Venue details and Google Maps integration.
   - Live functioning RSVP form with server validation, rate limiting, and duplicate submission prevention.
   - Dedicated ceremony subroutes:
     - `/w/:weddingSlug/ganesh`
     - `/w/:weddingSlug/story`
     - `/w/:weddingSlug/events`
     - `/w/:weddingSlug/venue`
     - `/w/:weddingSlug/gallery`
     - `/w/:weddingSlug/rsvp`
     - `/w/:weddingSlug/:subSlug` (custom pages created for that wedding)

---

## 🔒 Security Architecture & PIN Implementation

- **Salted Scrypt Hashing:** PINs are hashed using Node.js native `crypto.scryptSync` (RFC 7914, $N=16384, r=8, p=1, keylen=64$) with 16-byte random salts. Plaintext PINs are **never** stored in the database.
- **Timing-Safe Verification:** Password comparisons utilize `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
- **Cryptographic Random PINs:** Generated using `crypto.randomInt` (8-digit high-entropy numerical PINs, e.g. `83920147`).
- **Single-Display PIN Policy:** When a wedding is created or its PIN reset, the plaintext PIN is displayed to the photographer **only once**. Ordinary API reads never return PINs or hashes.
- **Session Scoping & Data Isolation:** The backend derives the `weddingId` strictly from the session token. Client-supplied wedding IDs in request bodies are ignored.
- **Session Revocation on Reset:** Resetting a wedding PIN immediately revokes all active sessions tied to that wedding.
- **Brute-Force & Rate Limiting:** 5 failed PIN attempts trigger a 15-minute temporary lockout. Error messages are generic to prevent user/wedding enumeration.
- **Guest Privacy:** Public endpoints strictly exclude RSVP records, phone numbers, and guest lists.

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
*(Default Photographer PIN: `88889999`)*

### 3. Run Locally (Full-Stack)
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`
- Vite automatically proxies `/api` to the Express backend.

---

## 🧪 Automated Verification Suite

Run all automated unit, integration, system, and security test suites:
```bash
npm test
```

---

## ☁️ Production Deployment on Render

1. Push code to your GitHub repository.
2. In the [Render Dashboard](https://dashboard.render.com), click **New > Web Service** and select this repository.
3. Configuration:
   - **Root Directory:** Leave empty / blank
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server/index.js`
4. Environment Variables:
   - `PHOTOGRAPHER_PIN`: `<your-secret-pin>` (e.g. `88889999`)
   - `NODE_ENV`: `production`

---


