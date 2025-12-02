# PayPortal Demo - Deployment Guide

## 🐛 What Was Fixed

### Issue
Swagger documentation was returning 500 errors on Vercel because `swagger.json` was empty.

### Solution
1. **Dynamic Swagger Generation**: Modified `demo-server.js` to generate Swagger spec dynamically at runtime
2. **Proper Error Handling**: Added try-catch blocks and proper error messages
3. **Vercel Configuration**: Updated `vercel.json` to ensure proper file inclusion
4. **Backup Swagger File**: Populated `swagger.json` as a fallback

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Navigate to demo folder
cd demo

# Deploy
vercel

# For production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set **Root Directory** to: `demo`
4. Click **Deploy**

## ⚙️ Environment Variables

No environment variables are required! The demo works out of the box.

Optional:
```
NODE_ENV=production
BASE_URL=https://your-domain.vercel.app
```

## ✅ Verify Deployment

After deployment, test these URLs:

1. **Demo Homepage**: `https://your-domain.vercel.app/demo`
2. **Swagger UI**: `https://your-domain.vercel.app/swagger`
3. **Swagger JSON**: `https://your-domain.vercel.app/swagger.json`
4. **API Info**: `https://your-domain.vercel.app/`

## 🧪 Mock Mode

The demo runs in **mock mode** by default:
- ✨ All chains are mocked
- ⚡ Payments auto-confirm instantly
- 🔗 No real blockchain connections needed
- 💡 ANY transaction hash will work

Perfect for testing and demonstrations!

## 📝 Key Files

- `demo-server.js` - Main server file with dynamic Swagger generation
- `swagger.json` - Backup Swagger spec (not used in production)
- `vercel.json` - Vercel deployment configuration
- `dist/` - Compiled PayPortal library

## 🔧 Troubleshooting

### Swagger Still Not Working?

1. Check Vercel function logs
2. Verify `/swagger.json` returns valid JSON
3. Clear Vercel cache: `vercel --prod --force`

### Need Real Blockchain Support?

Modify the chains configuration in `demo-server.js`:

```javascript
chains: [
  {
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com', // Real RPC
    confirmations: 3
  }
]
```

## 📚 Documentation

- **GitHub**: https://github.com/PayPortalWeb3/PP
- **Live Demo**: https://ppweb3demo.vercel.app/demo
- **Whitepaper**: https://ppweb3demo.vercel.app/

## 🆘 Support

If you encounter issues, check:
1. Vercel deployment logs
2. Browser console for errors
3. Network tab for API responses

---

Made with ❤️ by PayPortal Team

