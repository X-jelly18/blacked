    const http = require('http');

module.exports = async (req, res) => {
  const backendHost = '102.219.85.116';
  const backendPath = req.url;

  const options = {
    hostname: backendHost,
    port: 80,
    path: backendPath,
    method: req.method,
    headers: { ...req.headers, host: backendHost },
  };

  const backendReq = http.request(options, backendRes => {
    // Send headers immediately
    res.writeHead(backendRes.statusCode, backendRes.headers);

    // Stream response directly to client with small buffer
    backendRes.pipe(res, { end: true, highWaterMark: 16 * 1024 }); // 16 KB chunks
  });

  backendReq.on('error', err => {
    console.error('Backend request error:', err);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end('Bad Gateway');
    } else {
      res.end();
    }
  });

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Stream request with small buffer to backend
    req.pipe(backendReq, { end: true, highWaterMark: 16 * 1024 }); // 16 KB chunks
  } else {
    backendReq.end();
  }
};
