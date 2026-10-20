# 🚀 संपूर्ण डिप्लॉयमेंट गाइड (Full Deployment Guide)

इस प्रोजेक्ट में **Frontend (React 19 + Vite)** और **Backend (Express 5 API)** दोनों एक ही एकीकृत सेवा (Single Full-Stack Service) के रूप में कार्य करते हैं। 

---

## 🌟 विकल्प 1: Render.com पर 1-Click डिप्लॉयमेंट (Recommended)

Render पर यह प्रोजेक्ट पूरी तरह मुफ़्त (Free Tier) या पेड प्लान पर चल सकता है।

### चरण:
1. अपना कोड **GitHub** पर पुश करें:
   ```bash
   git init
   git add .
   git commit -m "feat: royal rajasthani wedding multi-tenant platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. [Render.com](https://render.com) पर लॉगिन करें।
3. **New +** बटन पर क्लिक करें और **Web Service** चुनें।
4. अपना GitHub रिपॉजिटरी कनेक्ट करें।
5. निम्नलिखित सेटिंग्स भरें:
   - **Name:** `rajasthani-wedding-invitation` (या अपनी पसंद का नाम)
   - **Region:** `Singapore` (भारत के लिए सबसे तेज़)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server/index.js`
   - **Instance Type:** `Free`
6. **Environment Variables (पर्यावरण चर)** जोड़ें:
   - `NODE_ENV`: `production`
   - `PHOTOGRAPHER_PIN`: `88889999` (या अपना निजी 8-अंकीय फ़ोटोग्राफ़र पासवर्ड)
   - `SESSION_SECRET`: `rajasthani_royal_wedding_secret_key_2027`
7. **Create Web Service** पर क्लिक करें।
8. 2 मिनट में आपकी वेबसाइट लाइव हो जाएगी:
   `https://rajasthani-wedding-invitation.onrender.com`

> **टिप:** हमने आपके लिए रिपॉजिटरी में `render.yaml` भी तैयार कर दिया है। आप चाहें तो Render में **Blueprints** चुनकर इसे बिना किसी टाइपिंग के सीधे डिप्लॉय कर सकते हैं।

---

## 🚂 विकल्प 2: Railway.app पर डिप्लॉयमेंट

Railway भी इस प्रोजेक्ट को स्वतः पहचान लेता है (`railway.json` पहले से शामिल है)।

### चरण:
1. [Railway.app](https://railway.app) पर जाएँ।
2. **New Project** > **Deploy from GitHub repo** चुनें।
3. अपना रिपॉजिटरी चुनें।
4. **Variables** टैब में जाकर ये जोड़ें:
   - `PHOTOGRAPHER_PIN`: `88889999`
   - `SESSION_SECRET`: `your_random_secret_string`
5. Railway अपने आप `npm install && npm run build` चलाएगा और `node server/index.js` को लाइव कर देगा।
6. **Settings** > **Generate Domain** पर क्लिक करें। आपका लाइव यूआरएल तैयार हो जाएगा।

---

## 🐳 विकल्प 3: Docker / Fly.io / VPS (DigitalOcean / AWS / Hetzner)

हमने रिपॉजिटरी में दो-चरणीय हल्का प्रोडक्शन **`Dockerfile`** बना दिया है।

### Docker से लोकल या सर्वर पर चलाना:
```bash
# 1. इमेज बनाएँ
docker build -t wedding-platform .

# 2. कंटेनर चलाएँ (डेटाबेस फ़ाइल को सुरक्षित रखने के लिए वॉल्यूम माउंट करें)
docker run -d \
  -p 5001:5001 \
  -e PHOTOGRAPHER_PIN=88889999 \
  -e SESSION_SECRET=my_secret_key \
  -v $(pwd)/server/data:/app/server/data \
  --name royal-wedding \
  wedding-platform
```

### Fly.io पर डिप्लॉय करना:
```bash
fly launch
fly deploy
```

---

## 🔒 महत्वपूर्ण सुरक्षा जाँच (Post-Deployment Checklist)

1. **फोटोग्राफर PIN बदलें:** प्रोडक्शन में पर्यावरण चर `PHOTOGRAPHER_PIN` में अपना स्वयं का कठिन 8-अंकीय नंबर सेट करें।
2. **कस्टम डोमेन (वैकल्पिक):** आप Render या Railway की सेटिंग्स में जाकर अपना खुद का डोमेन (जैसे `weddings.yourstudio.com`) जोड़ सकते हैं।
3. **डेटाबेस बैकअप:** `server/data/store.json` में सभी विवाह प्रोजेक्ट्स, पिन हैश और RSVP उत्तर सुरक्षित रहते हैं।
