# Pay Portal Whitepaper

Modern, animated whitepaper for Pay Portal ($PP) token.

## Deployment to Vercel

This site is configured for Vercel deployment. Simply:

1. **Connect your repository** to Vercel
2. **Set the root directory** to `whitepaper` (if deploying from monorepo)
3. **Deploy** - Vercel will automatically detect the static site

Or use the Vercel CLI:

```bash
cd whitepaper
vercel
```

## Local Development

Open `index.html` in a browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Features

- ✨ Modern, animated design with Three.js 3D background
- 📱 Fully responsive
- 🎨 Smooth scroll animations
- 💻 Code syntax highlighting
- 🔗 Navigation with social links (X, GitHub, Pump.fun)

## Updating Links

Edit `script.js` to update the placeholder URLs:

- X/Twitter link
- GitHub repository link
- Pump.fun chart link

Search for `TODO: Add` comments in the script file.
