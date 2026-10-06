// ponytail: server statis + API JSON file-based, cukup untuk katalog kecil; ganti DB beneran kalau ada transaksi/uang
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

http.createServer((req, res) => {
  if (req.url.split('?')[0] === '/api/data') {
    if (req.method === 'PUT') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        if (body.length > 10e6) { res.writeHead(413, { 'Content-Type': 'application/json' }); return res.end('{"error":"too large"}'); }
        try {
          const d = JSON.parse(body);
          if (!d.settings || !d.products) throw 0;
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end('{"error":"bad json"}');
        }
        fs.writeFile(DATA_FILE, body, err => {
          if (err) { res.writeHead(500); return res.end('{"error":"write failed"}'); }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"ok":true}');
        });
      });
      return;
    }
    fs.readFile(DATA_FILE, (err, data) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(err ? '{}' : data);
    });
    return;
  }

  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  filePath = path.join(__dirname, filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Jalan di http://localhost:${PORT}`));
