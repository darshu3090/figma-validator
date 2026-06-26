// figma-validator-api.js
const http = require('http');
const https = require('https');

const FIGMA_API_KEY = 'process.env.FIGMA_API_KEY'; // Paste your key
const FIGMA_FILE_ID = 'process.env.FIGMA_FILE_ID'; // Get from Figma URL

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Endpoint: Fetch design from Figma
  if (req.url === '/api/design' && req.method === 'GET') {
    const options = {
      hostname: 'api.figma.com',
      path: `/v1/files/${FIGMA_FILE_ID}`,
      method: 'GET',
      headers: { 'X-Figma-Token': FIGMA_API_KEY }
    };

    https.request(options, (figmaRes) => {
      let data = '';
      figmaRes.on('data', chunk => data += chunk);
      figmaRes.on('end', () => {
        try {
          const figmaData = JSON.parse(data);
          const report = {
            fileName: figmaData.name,
            components: figmaData.components || {},
            message: 'Design data fetched successfully',
            readyForValidation: true
          };
          res.writeHead(200);
          res.end(JSON.stringify(report, null, 2));
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to parse Figma data' }));
        }
      });
    }).on('error', err => {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }).end();
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(3000, () => {
  console.log('✓ Figma Validator running on http://localhost:3000');
  console.log('✓ Your Figma API is now accessible to ICA');
});