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

// Function to generate Swagger spec dynamically
function generateSwaggerSpec(baseUrl) {
  return {
    "openapi": "3.0.0",
    "info": {
      "title": "PayPortal Demo API",
      "version": "1.0.0",
      "description": "Self-hosted blockchain payment gateway with 402/403 protocol support",
      "contact": {
        "name": "PayPortal",
        "url": "https://github.com/PayPortalWeb3/PP"
      },
      "license": {
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
      }
    },
    "servers": [
      {
        "url": baseUrl,
        "description": "Demo Server (Mock Mode - All payments auto-confirm)"
      }
    ],
    "tags": [
      {
        "name": "Public",
        "description": "Public endpoints (no authentication required)"
      },
      {
        "name": "Admin",
        "description": "Admin endpoints (require X-API-Key header)"
      }
    ],
    "components": {
      "securitySchemes": {
        "ApiKeyAuth": {
          "type": "apiKey",
          "in": "header",
          "name": "X-API-Key",
          "description": "API key for admin endpoints. Demo key: `your-secret-api-key`"
        }
      },
      "schemas": {
        "PaymentLink": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "targetUrl": { "type": "string" },
            "description": { "type": "string" },
            "price": {
              "type": "object",
              "properties": {
                "amount": { "type": "string" },
                "tokenSymbol": { "type": "string" },
                "chainId": { "type": "integer" }
              }
            },
            "recipientAddress": { "type": "string" },
            "createdAt": { "type": "string", "format": "date-time" }
          }
        },
        "Payment": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "paymentLinkId": { "type": "string" },
            "chainId": { "type": "integer" },
            "txHash": { "type": "string" },
            "fromAddress": { "type": "string" },
            "amount": { "type": "string" },
            "confirmed": { "type": "boolean" },
            "createdAt": { "type": "string", "format": "date-time" }
          }
        }
      }
    },
    "paths": {
      "/": {
        "get": {
          "tags": ["Public"],
          "summary": "Get server information",
          "responses": {
            "200": {
              "description": "Server info",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "name": { "type": "string" },
                      "version": { "type": "string" },
                      "chains": { "type": "array" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/links": {
        "post": {
          "tags": ["Admin"],
          "summary": "Create payment link",
          "security": [{ "ApiKeyAuth": [] }],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["targetUrl", "price", "recipientAddress"],
                  "properties": {
                    "targetUrl": { "type": "string", "example": "https://example.com/content" },
                    "description": { "type": "string", "example": "Premium content access" },
                    "price": {
                      "type": "object",
                      "required": ["amount", "tokenSymbol", "chainId"],
                      "properties": {
                        "amount": { "type": "string", "example": "0.01" },
                        "tokenSymbol": { "type": "string", "example": "ETH" },
                        "chainId": { "type": "integer", "example": 1 }
                      }
                    },
                    "recipientAddress": { "type": "string", "example": "0xYourWalletAddress" },
                    "maxUses": { "type": "integer", "example": 100 },
                    "expiresAt": { "type": "string", "format": "date-time" }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Payment link created",
              "content": {
                "application/json": {
                  "schema": { "$ref": "#/components/schemas/PaymentLink" }
                }
              }
            }
          }
        },
        "get": {
          "tags": ["Admin"],
          "summary": "List all payment links",
          "security": [{ "ApiKeyAuth": [] }],
          "responses": {
            "200": {
              "description": "List of payment links",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": { "$ref": "#/components/schemas/PaymentLink" }
                  }
                }
              }
            }
          }
        }
      },
      "/pay/{id}": {
        "get": {
          "tags": ["Public"],
          "summary": "Access payment link (returns 402 if unpaid)",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": { "type": "string" }
            }
          ],
          "responses": {
            "402": {
              "description": "Payment required",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "protocol": { "type": "string" },
                      "payment": { "type": "object" }
                    }
                  }
                }
              }
            },
            "302": {
              "description": "Redirect to target URL (payment confirmed)"
            }
          }
        }
      },
      "/pay/{id}/confirm": {
        "post": {
          "tags": ["Public"],
          "summary": "Confirm payment with transaction hash",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": { "type": "string" }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["txHash"],
                  "properties": {
                    "txHash": { 
                      "type": "string",
                      "example": "0xMockTransactionHash123456789",
                      "description": "In mock mode, ANY transaction hash will be auto-confirmed!"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Payment confirmed",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": { "type": "boolean" },
                      "payment": { "$ref": "#/components/schemas/Payment" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

// Serve Swagger JSON spec
app.get('/swagger.json', (req, res) => {
  try {
    // Generate swagger spec dynamically instead of reading from file
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const baseUrl = `${protocol}://${req.headers.host}`;
    
    const swaggerSpec = generateSwaggerSpec(baseUrl);
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  } catch (error) {
    console.error('Swagger generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate swagger spec',
      message: error.message 
    });
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

// For local development, start the server
if (require.main === module) {
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
}

// Export the Express app for Vercel serverless
module.exports = app;

