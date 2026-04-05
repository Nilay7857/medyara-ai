import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing URL' });

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch URL');

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, and nav elements
    $('script, style, nav, header, footer, aside, .ads, .advertisement').remove();

    // Get main content
    let text = $('article').text() || $('main').text() || $('body').text();
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Limit to 5000 characters
    if (text.length > 5000) {
      text = text.substring(0, 5000) + '...';
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error('Fetch link error:', err);
    return res.status(500).json({ error: err.message });
  }
}
