const https = require('https');

module.exports = (req, res) => {
  const backendReq = https.request(
    {
      hostname: 'news.ayanakojixxx.shop',
      port: 443,
      path: req.url,
      method: req.method,

      // Strip unnecessary headers (VERY IMPORTANT)
      headers: {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
        'user-agent': req.headers['user-agent'],
      },
    },
    backendRes => {
      // Forward status + minimal headers
      res.writeHead(backendRes.statusCode, {
        'content-type': backendRes.headers['content-type'],
        'content-length': backendRes.headers['content-length'],
      });

      // Pure streaming (no buffering)
      backendRes.pipe(res);
    }
  );

  backendReq.on('error', () => {
    if (!res.headersSent) res.writeHead(502);
    res.end();
  });

  // Pure streaming
  req.pipe(backendReq);
};
