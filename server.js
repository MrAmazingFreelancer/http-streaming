const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dist = path.join(__dirname, 'dist');
const videojsDist = path.join(path.dirname(require.resolve('video.js/package.json')), 'dist');

app.disable('x-powered-by');
app.use('/assets/videojs', express.static(videojsDist));
app.use('/dist', express.static(dist));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(dist));

app.listen(port, '0.0.0.0', () => {
  process.stdout.write(`Video.js HTTP Streaming server listening on port ${port}\n`);
});
