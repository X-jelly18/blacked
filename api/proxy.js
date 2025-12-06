const http = require('http');

module.exports = async (req, res) => {
  const backendHost = 'gk.33ffkiyotaka222.ggff.net';
  const backendPath = req.url;

  const options = {
    hostname: backendHost,
    port: 80, // changed from 443 to 80
    path: backendPath,
    method: req.method,
    headers: { ...req.headers, host: backendHost },
  };

  const backendReq = http.request(options, backendRes => {
    res.writeHead(backendRes.statusCode, backendRes.headers);
    backendRes.pipe(res, { end: true });
  });

  backendReq.on('error', err => {
    console.error('Backend request error:', err);
    res.status(502).send('Bad Gateway');
  });

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(backendReq, { end: true });
  } else {
    backendReq.end();
  }
};
