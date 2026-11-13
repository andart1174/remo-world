/**
 * Submit all canonical URLs from sitemap.xml to IndexNow (Bing, ChatGPT Search, Yandex, Seznam, Naver).
 * Usage:
 *   node scripts/ping-indexnow.js          # Live HTTP POST after deploying
 *   node scripts/ping-indexnow.js --dry-run # Validate payload locally without network
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'remoworld.com';
const KEY = 'remoindexnow2026key8f4a2b9c1d7e3a5f';
const ROOT = path.resolve(__dirname, '..');

function extractSitemapUrls(sitemapPath) {
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const seen = new Set();
  const urls = [];
  const regex = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const url = match[1].trim();
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

function postIndexNow(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      'https://api.indexnow.org/indexnow',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(body)
        },
        timeout: 15000
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('IndexNow request timed out')));
    req.write(body);
    req.end();
  });
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  const keyFilePath = path.join(ROOT, `${KEY}.txt`);

  if (!fs.existsSync(sitemapPath)) {
    throw new Error(`Missing sitemap.xml at ${sitemapPath}`);
  }
  if (!fs.existsSync(keyFilePath)) {
    throw new Error(`Missing IndexNow key file at ${keyFilePath}`);
  }

  const urlList = extractSitemapUrls(sitemapPath);
  if (urlList.length === 0) {
    throw new Error('No <loc> URLs found in sitemap.xml');
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList
  };

  if (dryRun) {
    console.log(`IndexNow dry-run OK: ${urlList.length} URLs ready for ${HOST} (${payload.keyLocation})`);
    return;
  }

  const res = await postIndexNow(payload);
  console.log(`IndexNow HTTP ${res.status}: submitted ${urlList.length} URLs for ${HOST}`);
  if (res.body && res.body.trim()) {
    console.log(`Response: ${res.body.trim()}`);
  }
  if (res.status < 200 || res.status >= 300) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(`IndexNow submission failed: ${err.message}`);
  process.exit(1);
});
