/**
 * PayPortal Demo Server
 * 
 * This demo server includes:
 * - Full PayPortal API with mock chains
 * - Interactive web demo UI at /demo
 * - Swagger API documentation at /swagger
 * 
 * Run: node demo-server.js
 */

const { createServer } = require('./dist/index.js');
const express = require('express');
const path = require('path');
const fs = require('fs');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║            🚀 PayPortal Demo Server 🚀                   ║
║                                                           ║
║  Self-hosted blockchain payment gateway                  ║
║  Multi-chain • Multi-currency • Subscriptions            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// Create the PayPortal server with mock chains for easy testing
const PORT = process.env.PORT || 3003;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const server = createServer({
  port: PORT,
  baseUrl: BASE_URL,
  apiKey: process.env.API_KEY || 'your-secret-api-key',
  
  // Mock chains for easy testing (no real RPC needed)
  chains: [
    {
      chainId: 1,
      name: 'Mock Ethereum',
      symbol: 'ETH',
      rpcUrl: 'mock', // Special value for mock mode
      confirmations: 1,
    },
    {
      chainId: 137,
      name: 'Mock Polygon',
      symbol: 'MATIC',
      rpcUrl: 'mock',
      confirmations: 1,
    },
    {
      chainId: 56,
      name: 'Mock BSC',
      symbol: 'BNB',
      rpcUrl: 'mock',
      confirmations: 1,
    },
    {
      chainId: 101,
      name: 'Mock Solana',
      symbol: 'SOL',
      rpcUrl: 'mock',
      type: 'solana',
      confirmations: 1,
    },
  ],
  
  // Enable CORS for demo
  cors: true,
});

// Get the Express app from the server
const app = server.app;

// Relaxed CSP for Swagger and Demo routes (allows CDN resources and inline scripts)
app.use(['/swagger', '/demo'], (req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; " +
    "script-src-attr 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://unpkg.com; " +
    "font-src 'self' https:; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://unpkg.com"
  );
  next();
});

// Serve the web demo
app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve Swagger UI
app.get('/swagger', (req, res) => {
  const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PayPortal API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .swagger-ui .topbar {
      background-color: #667eea;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .swagger-ui .topbar .download-url-wrapper {
      display: none;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
  `;
  res.send(swaggerHtml);
});

// Serve Swagger JSON spec
app.get('/swagger.json', (req, res) => {
  const swaggerPath = path.join(__dirname, 'swagger.json');
  if (fs.existsSync(swaggerPath)) {
    const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    // Update server URL to match current request
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    swagger.servers = [{ url: `${protocol}://${req.headers.host}`, description: 'Demo server' }];
    res.json(swagger);
  } else {
    res.status(404).json({ error: 'Swagger spec not found' });
  }
});

// Redirect root to demo
app.get('/', (req, res, next) => {
  // If this is the original root handler from PortalServer, let it pass through
  // Otherwise redirect to demo
  if (req.path === '/' && req.method === 'GET') {
    // Check if we want server info (JSON) or demo (HTML)
    const acceptsJson = req.accepts(['json', 'html']) === 'json';
    if (!acceptsJson) {
      return res.redirect('/demo');
    }
  }
  next();
});

// Start the server
server.start();

console.log(`
📚 Resources:
   - Demo UI:          ${BASE_URL}/demo
   - API Docs:         ${BASE_URL}/swagger
   - Server Info:      ${BASE_URL}/
   - Health Check:     ${BASE_URL}/health

🔑 API Key: ${process.env.API_KEY || 'your-secret-api-key'}

💡 Quick Start:
   1. Open ${BASE_URL}/demo in your browser
   2. Create a payment link in the UI
   3. Test the payment flow
   4. Check the Swagger docs for full API reference

🧪 Mock Chains:
   All chains are in MOCK mode - payments are automatically confirmed!
   Perfect for testing without real blockchain transactions.

📖 Documentation: https://github.com/PayPortalWeb3/PP
`);

// Create a sample payment link on startup
setTimeout(async () => {
  try {
    const link = await server.createPaymentLink({
      targetUrl: 'https://example.com/premium-content',
      price: {
        amount: '0.01',
        tokenSymbol: 'ETH',
        chainId: 1,
      },
      recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      description: 'Sample payment link - Premium content access',
      paymentOptions: [
        {
          tokenSymbol: 'SOL',
          chainId: 101,
          amount: '0.5',
          recipientAddress: 'DemoSolanaAddress123456789',
        },
        {
          tokenSymbol: 'MATIC',
          chainId: 137,
          amount: '15',
        },
      ],
    });
    
    console.log(`
✅ Sample payment link created!
   Link ID:  ${link.id}
   URL:      ${BASE_URL}/pay/${link.id}
   
   Try accessing this link in your browser or use it in the demo UI!
`);
  } catch (error) {
    console.error('Error creating sample link:', error.message);
  }
}, 1000);

