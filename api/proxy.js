module.exports = async (req, res) => {
  const backendHost = 'news.ayanakojixxx.shop';
  const backendUrl = `https://${backendHost}${req.url}`;

  // Use 307 to preserve method & body (VERY IMPORTANT)
  res.writeHead(307, {
    Location: backendUrl,

    // Cache redirect at CDN + browser
    // Client will skip Vercel on future requests
    'Cache-Control': 'public, max-age=86400, s-maxage=86400',

    // Optional: security hardening
    'Referrer-Policy': 'no-referrer',
  });

  res.end();
};
