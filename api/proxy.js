const https = require('https');

const STATIC_REGEX =
  /\.(css|js|mjs|png|jpg|jpeg|webp|gif|svg|ico|woff|woff2|ttf|mp4|mp3|zip|exe)$/i;

module.exports = async (req, res) => {
  const backendHost = 'news.ayanakojixxx.shop';
  const path = req.url;

  // 1️⃣ Drop useless traffic immediately
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Cache-Control': 'public, max-age=86400',
    });
    return res.end();
  }

  // 2️⃣ NEVER proxy static assets (zero origin transfer)
  if (STATIC_REGEX.test(path)) {
    res.writeHead(302, {
      Location: `https://${backendHost}${path}`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    return res.end();
  }

  // 3️⃣ Kill abusive bots cheaply
  const ua = req.headers['user-agent'] || '';
  if (!ua || ua.length < 8) {
    res.writeHead(403, { 'Cache-Control': 'public, max-age=600' });
    return res.end();
  }

  // 4️⃣ Minimal headers ONLY
  const headers = {
    host: backendHost,
    accept: req.headers.accept || '*/*',
    'accept-encoding': 'br,gzip',
  };

  if (req.headers['if-none-match'])
    headers['if-none-match'] = req.headers['if-none-match'];
  if (req.headers['if-modified-since'])
    headers['if-modified-since'] = req.headers['if-modified-since'];

  const backendReq = https.request(
    {
      hostname: backendHost,
      port: 443,
      path,
      method: req.method,
      headers,
    },
    backendRes => {
      // 5️⃣ Aggressive CDN cache (EDGE-FIRST)
      res.writeHead(backendRes.statusCode, {
        ...backendRes.headers,
        'Cache-Control':
          'public, s-maxage=300, max-age=60, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=300',
      });

      // 6️⃣ Stream ONLY (constant memory)
      backendRes.pipe(res, { highWaterMark: 16 * 1024 });
    }
  );

  backendReq.on('error', () => {
    if (!res.headersSent) res.writeHead(502);
    res.end();
  });

  // 7️⃣ Stream request body (no buffering)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(backendReq, { highWaterMark: 16 * 1024 });
  } else {
    backendReq.end();
  }
};
