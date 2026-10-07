const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dist = path.join(__dirname, 'dist');

app.disable('x-powered-by');
app.use('/dist', express.static(dist));
app.use(express.static(dist));

app.get('/', (req, res) => {
  const html = '<!doctype html><html lang="en"><meta charset="utf-8">' +
    '<title>Video.js HTTP Streaming</title>' +
    '<h1>Video.js HTTP Streaming</h1>' +
    '<p>The streaming library is available at ' +
    '<a href="/dist/videojs-http-streaming.min.js">' +
    '/dist/videojs-http-streaming.min.js</a>.</p></html>';

  res.type('html').send(html);
});

app.listen(port, '0.0.0.0', () => {
  process.stdout.write(`Video.js HTTP Streaming server listening on port ${port}\n`);
});
