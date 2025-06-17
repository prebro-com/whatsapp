const express = require('express');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

const FILE_PATH = path.join(__dirname, 'contacts.xlsx');

app.post('/api/scrape', async (req, res) => {
  const { groupUrl } = req.body;

  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://web.whatsapp.com');
    console.log('Please scan the QR code to log in...');

    await page.waitForSelector('._3m_Xw', { timeout: 0 });
    await page.goto(groupUrl);

    await page.waitForSelector('._ak8n');
    await page.click('._ak8n');
    await page.waitForTimeout(3000);

    const numbers = await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll('._ak72'));
      return list.map(el => el.textContent).filter(t => /\+\d{6,}/.test(t));
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('WhatsApp Contacts');
    worksheet.columns = [{ header: 'Phone Number', key: 'phone', width: 20 }];
    numbers.forEach(num => worksheet.addRow({ phone: num }));

    await workbook.xlsx.writeFile(FILE_PATH);
    await browser.close();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.get('/api/download', async (req, res) => {
  try {
    res.sendFile(FILE_PATH);
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

app.post('/api/generate-message', async (req, res) => {
  const { productDescription } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a marketing assistant generating short promotional WhatsApp messages.',
        },
        {
          role: 'user',
          content: `Generate a promotional WhatsApp message for this product: ${productDescription}`,
        },
      ],
    });
    const message = completion.choices[0].message.content;
    res.json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Message generation failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
