require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/scrape', async (req, res) => {
  const { groupUrl } = req.body;

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(groupUrl, { waitUntil: 'networkidle2' });

    // Dummy data for demo purposes
    const numbers = ['+1234567890', '+1987654321'];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Contacts');
    worksheet.columns = [{ header: 'Phone Number', key: 'number' }];
    numbers.forEach((num) => worksheet.addRow({ number: num }));

    const filePath = path.join(__dirname, 'contacts.xlsx');
    await workbook.xlsx.writeFile(filePath);

    await browser.close();
    res.status(200).json({ message: 'Scraped successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.get('/api/download', (req, res) => {
  const filePath = path.join(__dirname, 'contacts.xlsx');
  res.download(filePath, 'contacts.xlsx');
});

app.post('/api/generate-message', async (req, res) => {
  const { productDescription } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a marketing expert.' },
        { role: 'user', content: `Write a short WhatsApp promotional message for: ${productDescription}` }
      ],
      model: 'gpt-3.5-turbo',
    });

    const message = completion.choices[0].message.content;
    res.json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate message' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
