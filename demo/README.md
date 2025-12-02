# PayPortal Demo

This is an interactive demo of the PayPortal payment gateway system.

## 🚀 Quick Start

```bash
# From the project root
npm run demo
```

Then open your browser to:
- **Interactive Demo UI**: http://localhost:3003/demo
- **API Documentation (Swagger)**: http://localhost:3003/swagger
- **Server Info API**: http://localhost:3003/

## 🎯 What's Included

### Interactive Web Demo (`/demo`)
A beautiful web interface where you can:
- ✨ Create payment links (single and multi-currency)
- 🔄 Set up subscription links with recurring payments
- 📱 Generate QR codes for wallet deep links
- 🧪 Test the complete payment flow
- 📊 View all links and payments
- 💳 Test payment confirmations

### Swagger API Documentation (`/swagger`)
Complete API documentation with:
- 📚 All endpoint specifications
- 🔧 Interactive API testing
- 📝 Request/response examples
- 🔐 Authentication details

## 🧪 Mock Mode

The demo server runs with **mock blockchains** which means:
- ✅ No real RPC nodes needed
- ✅ All payments are automatically confirmed
- ✅ Perfect for testing and development
- ✅ No real cryptocurrency required

Supported mock chains:
- **Ethereum** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **BSC** (Chain ID: 56)
- **Solana** (Chain ID: 101)

## 🔑 API Key

For testing admin endpoints, use:
```
X-API-Key: your-secret-api-key
```

This is already pre-filled in the demo UI!

## 📖 Features to Test

### 1. Simple Payment Link
Create a basic payment link that requires a single payment:
- Enter a target URL
- Set amount and token
- Choose a blockchain
- Get a payment link

### 2. Multi-Currency Payment Link
Accept multiple cryptocurrencies for the same content:
- Enable "Multi-Currency" option
- Add payment options for different chains
- Set different amounts for each token
- Users can pay with any accepted token

### 3. Subscription Link
Create recurring payment links:
- Enable "Subscription" option
- Set billing interval (daily, weekly, monthly, yearly)
- Configure grace periods
- Add trial periods

### 4. Test Payment Flow
Complete end-to-end testing:
1. Create a payment link
2. Access the payment link (GET `/pay/:id`)
3. Get a QR code for the payment
4. Confirm with a transaction hash
5. Verify payment status

## 🌐 API Examples

### Create a Payment Link
```bash
curl -X POST http://localhost:3003/api/links \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key" \
  -d '{
    "targetUrl": "https://example.com/premium",
    "amount": "0.01",
    "tokenSymbol": "ETH",
    "chainId": 1,
    "recipientAddress": "0xYourAddress",
    "description": "Premium content"
  }'
```

### Access a Payment Link
```bash
curl http://localhost:3003/pay/YOUR_LINK_ID
```

Returns:
- `402 Payment Required` - Need to pay
- `403 Forbidden` - Link expired/disabled
- `302 Redirect` - Already paid, redirect to content

### Confirm Payment
```bash
curl -X POST http://localhost:3003/pay/YOUR_LINK_ID/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x123...",
    "chainId": 1
  }'
```

## 📱 QR Code Integration

Get QR codes for wallet integration:

```bash
# Get QR as SVG
curl http://localhost:3003/pay/YOUR_LINK_ID/qr

# Get QR as JSON with data URL
curl http://localhost:3003/pay/YOUR_LINK_ID/qr?format=json
```

QR codes include:
- **Solana Pay** URIs for Solana payments
- **EIP-681** URIs for EVM chains
- Wallet deep links

## 🔄 Subscriptions

Test recurring payments:

1. Create a subscription link with billing interval
2. User subscribes with initial payment
3. Check subscription status
4. Renew subscription with new payment
5. Cancel/pause/resume subscriptions via API

## 💡 Tips

1. **Sample Link**: A sample payment link is automatically created when you start the demo
2. **Mock Payments**: In mock mode, any transaction hash will be accepted and confirmed
3. **Multi-Currency**: Try accepting ETH, SOL, and MATIC on the same link
4. **Subscriptions**: Test trial periods and grace periods
5. **QR Codes**: Scan QR codes with compatible wallets

## 📚 Documentation

For full documentation, see:
- Main README: `../README.md`
- API Docs: http://localhost:3003/swagger
- GitHub: https://github.com/PayPortalWeb3/PP

## 🛠️ Customization

The demo server code is in `demo-server.js`. You can modify:
- Port number
- Mock chains configuration
- Sample data creation
- Routes and middleware

## ⚡ Production Use

For production deployment:
1. Replace mock chains with real RPC nodes
2. Set a secure API key
3. Configure webhooks for notifications
4. Implement persistent storage (e.g., PostgreSQL)
5. Set up proper SSL/TLS
6. Configure CORS appropriately

See the main README for production setup instructions.

## 🆘 Troubleshooting

**Port already in use?**
Change the port in `demo-server.js`:
```javascript
const server = createServer({
  port: 3003, // Change this
  baseUrl: 'http://localhost:3003', // And this
  // ...
});
```

**Build errors?**
```bash
npm run build
```

**Need help?**
Check the main README or open an issue on GitHub.

