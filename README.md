# WhatsApp Scraper + AI Message Generator

This project allows:
- Extracting WhatsApp group numbers via Puppeteer
- Saving contacts in Excel using ExcelJS
- Generating promotional messages using OpenAI
- UI built in React / Next.js

---

## 🔧 Backend Setup (Express + Puppeteer)

### Local
1. Run `cd backend`
2. Run `npm install`
3. Create `.env` file with:
   ```
   OPENAI_API_KEY=your_key_here
   ```
4. Run `node server.js`
   - It will open WhatsApp Web in Puppeteer
   - Scan the QR code
   - It will scrape numbers and save to `contacts.xlsx`

---

## 🌐 Frontend Setup (Next.js)

1. Go to `frontend`
2. Place it inside your Next.js app or host separately
3. Update API calls to match your backend URL

---

## 📦 Deployment
You can deploy:
- Frontend on Vercel
- Backend on Render.com (Node Service)

Make sure to:
- Set `OPENAI_API_KEY` as env var on Render
- Allow Puppeteer Chromium in Render runtime
