const https = require('https'); // kept to match your structure

module.exports = async (req, res) => {
  const backendHost = 'news.ayanakojixxx.shop';
  const backendPath = req.url;

  // Immediately hand off to backend
  res.writeHead(302, {
    Location: `https://${backendHost}${backendPath}`,

    // Cache redirect so client/CDN skips Vercel next time
    'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  });

  res.end();
};
