import express from 'express';
import fetch from 'node-fetch';
import { load as cheerioLoad } from 'cheerio';
import dotenv from 'dotenv';
import pLimit from 'p-limit';

dotenv.config();

const app = express();
app.use(express.json());

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN || '';
// New REST domains use regional hosts like production-sfo.browserless.io
const BROWSERLESS_BASE = process.env.BROWSERLESS_BASE || 'https://production-sfo.browserless.io';
const BROWSERLESS_CONTENT = `${BROWSERLESS_BASE}/content?token=${BROWSERLESS_TOKEN}`;

function buildSearchUrl(retailer, term) {
	const q = encodeURIComponent(term);
	if (retailer === 'woolworths') return `https://www.woolworths.com.au/shop/search/products?searchTerm=${q}`;
	if (retailer === 'coles') return `https://www.coles.com.au/search?q=${q}`;
	throw new Error('Unknown retailer');
}

function absolutize(base, path) {
	try {
		return new URL(path, base).toString();
	} catch {
		return path;
	}
}

function extractFirstProductUrl(retailer, baseUrl, html) {
    const $ = cheerioLoad(html);
	if (retailer === 'woolworths') {
		// Prefer productdetails links
		let href = $('a[href*="/shop/productdetails/"]').first().attr('href');
		if (!href) href = $('a[href*="/shop/product/"]').first().attr('href');
		if (href) return absolutize(baseUrl, href);
	}
	if (retailer === 'coles') {
		let href = $('a[href*="/product/"]').first().attr('href');
		if (!href) href = $('a[href*="/p/"]').first().attr('href');
		if (href) return absolutize(baseUrl, href);
	}
	return null;
}

async function fetchContent(url) {
    const res = await fetch(BROWSERLESS_CONTENT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url })
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`browserless content failed ${res.status}: ${text}`);
    return text;
}

async function fetchContentWithRetry(url, attempts = 3) {
    let lastErr = null;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fetchContent(url);
        } catch (e) {
            lastErr = e;
            const msg = String(e.message || e);
            // Backoff on 429/5xx
            if (/\b(429|5\d\d)\b/.test(msg)) {
                const base = 1000 * Math.pow(2, i); // 1s, 2s, 4s
                const jitter = Math.floor(Math.random() * 500);
                await new Promise(r => setTimeout(r, base + jitter));
                continue;
            }
            break;
        }
    }
    throw lastErr;
}

app.post('/add-plan', async (req, res) => {
	try {
		const { retailer, items } = req.body || {};
		if (!retailer || !Array.isArray(items)) {
			return res.status(400).json({ error: 'retailer and items[] required' });
		}
		if (!BROWSERLESS_TOKEN) {
			return res.status(500).json({ error: 'BROWSERLESS_TOKEN missing on server' });
		}

        // Be gentle with Browserless to avoid 429s
        const limit = pLimit(Number(process.env.BROWSERLESS_CONCURRENCY || 1));
        const results = await Promise.all(items.map((it) => limit(async () => {
			const term = (it.name || '').trim();
			if (!term) return null;
			const searchUrl = buildSearchUrl(retailer, term);
            const html = await fetchContentWithRetry(searchUrl, 3);
			const productUrl = extractFirstProductUrl(retailer, searchUrl, html);
			if (!productUrl) return null;
			return { productUrl, qty: it.quantity || 1 };
		})));

		const planItems = results.filter(Boolean);
		return res.json({ retailer, items: planItems });
	} catch (e) {
		console.error(e);
		return res.status(500).json({ error: String(e.message || e) });
	}
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Auto Shop server running on :${PORT}`);
});


