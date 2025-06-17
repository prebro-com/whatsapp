import { useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

export default function Home() {
  const [groupUrl, setGroupUrl] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!groupUrl || !groupUrl.includes('whatsapp.com')) {
      alert('Please enter a valid WhatsApp group link.');
      return;
    }

    try {
      setLoading(true);
      alert('Starting scrape request to backend...');
      const scrapeRes = await fetch(`${apiBase}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupUrl }),
      });

      if (!scrapeRes.ok) throw new Error('Scrape request failed. Backend might be down.');
      alert('Scrape finished. Preparing download...');

      const downloadRes = await fetch(`${apiBase}/api/download`);
      if (!downloadRes.ok) throw new Error('Download failed. File not generated on server.');

      const blob = await downloadRes.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'contacts.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      alert('Download started.');
    } catch (err) {
      console.error('Error:', err);
      const message = err instanceof Error ? err.message : String(err);
      alert('Error during scrape/download: ' + message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      const res = await fetch(`${apiBase}/api/generate-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productDescription }),
      });

      if (!res.ok) throw new Error('Failed to generate promotional message.');

      const data = await res.json();
      if (data.message) {
        setPromoMessage(data.message);
      } else {
        throw new Error('No message returned from server.');
      }
    } catch (err) {
      console.error('Error generating message:', err);
      const message = err instanceof Error ? err.message : String(err);
      alert('Error generating message: ' + message);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WhatsApp Group Scraper + AI Promotion</h1>

      <div className="mb-6">
        <input
          value={groupUrl}
          onChange={(e) => setGroupUrl(e.target.value)}
          placeholder="Enter WhatsApp Group Invite URL"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Processing...' : 'Scrape & Download'}
        </button>
      </div>

      <div className="mb-6">
        <textarea
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="Enter product/service description"
          rows={4}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleGenerate}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Generate Promotional Message
        </button>
      </div>

      {promoMessage && (
        <div className="bg-gray-100 p-4 rounded">
          <strong>Generated Message:</strong>
          <p>{promoMessage}</p>
        </div>
      )}
    </div>
  );
}
