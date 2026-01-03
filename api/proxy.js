
const https = require('https');

module.exports = async (req, res) => {
const backendHost = 'news.ayanakojixxx.shop';
const backendPath = req.url;

const options = {
hostname: backendHost,
port: 443,
path: backendPath,
method: req.method,
headers: { ...req.headers, host: backendHost },
};

const backendReq = https.request(options, backendRes => {
// Send headers immediately
res.writeHead(backendRes.statusCode, backendRes.headers);

// Stream response directly to client with small buffer  
backendRes.pipe(res, { end: true, highWaterMark: 16 * 1024 }); // 16 KB chunks

});

backendReq.on('error', err => {
console.error('Backend request error:', err);
if (!res.headersSent) res.status(502).send('Bad Gateway');
else res.end();
});

if (req.method !== 'GET' && req.method !== 'HEAD') {
// Stream request with small buffer to backend
req.pipe(backendReq, { end: true, highWaterMark: 16 * 1024 }); // 16 KB chunks
} else {
backendReq.end();
}
};
