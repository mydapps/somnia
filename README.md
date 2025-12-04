# 🦁 dapps.co - Somnia Community Network

> Build Your Community Economy on Somnia

A decentralized social platform built on Somnia blockchain where communities can create, trade, and grow together. Think Friend.tech meets Reddit, but faster and more social.

[![Somnia](https://img.shields.io/badge/Built%20on-Somnia-blue)](https://somnia.network)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

### 🏘️ Communities
- **Create Communities**: Launch your own community with a unique bonding curve
- **Trade Shares**: Buy and sell community shares with dynamic pricing
- **Price Graphs**: Real-time visualization of trading history and price movements

### 💬 Social Features
- **Community Feed**: Post updates, share thoughts, engage with your community
- **Reactions**: Express yourself with the signature "Roar" 🦁 reaction
- **Comments**: Deep conversations on every post
- **Global Activity**: See what's happening across all communities

### 👤 User Identity
- **Unique Usernames**: Claim your identity with alphanumeric usernames
- **Profile Display**: Your username shows everywhere - no more wallet addresses
- **Seamless Wallet Connection**: RainbowKit integration with multiple wallet support

### 💰 Economics
- **Bonding Curve**: Automated market making with fair price discovery
- **Creator Rewards**: Community creators get initial shares
- **Trading Fees**: Sustainable ecosystem with built-in fee structure
- **USD Tracking**: Real-time price tracking in USD

## 🎨 Design Philosophy

**Neo-Brutalist, But Make It Clean**

We combine the boldness of neo-brutalism with the clarity of modern web design:
- High contrast black borders
- Vibrant accent colors (#FFDE00 yellow, #0096FF blue)
- Clean typography with Inter font
- Instant visual feedback and smooth animations
- Mobile-first responsive design

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org)** - React framework with App Router
- **[RainbowKit](https://www.rainbowkit.com/)** - Beautiful wallet connection
- **[wagmi](https://wagmi.sh/)** - React hooks for Ethereum
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Recharts](https://recharts.org/)** - Data visualization

### Backend
- **[Supabase](https://supabase.com/)** - PostgreSQL database
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Serverless functions

### Blockchain
- **[Somnia Mainnet](https://somnia.network)** - Ultra-fast EVM blockchain
- **[viem](https://viem.sh/)** - TypeScript Ethereum library
- **Bonding Curve Smart Contract** - Automated market making

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A wallet (MetaMask, Coinbase Wallet, etc.)
- Some SOMI tokens (for creating communities and trading)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mydapps/somnia.git
   cd somnia
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL=your_supabase_connection_string
   ```

4. **Set up the database**
   
   Run the database setup scripts:
   ```bash
   node scripts/setup-db.js
   node scripts/setup-posts-db.js
   node scripts/setup-users-db.js
   node scripts/update-db-schema.js
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Communities
- Stores community metadata and ownership
- Links to on-chain data via transaction hash

### Trades
- Complete trading history
- USD price tracking for analytics
- Powers the price graph feature

### Posts & Comments
- Community-specific feeds
- Supports text content and future media expansion

### Likes
- Simple reaction system
- Tracks user engagement

### Users
- Username registration
- Maps addresses to human-readable names

## 🎯 Key Concepts

### Shares vs Units
- **User-facing**: Shares (can have up to 3 decimals, e.g., 1.5 shares)
- **Contract**: Units (1 share = 1000 units)
- Example: Buying 2.5 shares sends 2500 units to the smart contract

### Bonding Curve
The smart contract implements a bonding curve where:
- Price increases as more shares are bought
- Price decreases as shares are sold
- Early buyers benefit from price appreciation
- Automatic liquidity provision

### Community Types
Currently supports Type 1 communities with plans for additional types:
- Different fee structures
- Varied creator incentives
- Custom bonding curve parameters

## 🌐 Deployment

See [deploy.md](deploy.md) for detailed production deployment instructions on Ubuntu with nginx and SSL.

Quick overview:
```bash
npm run build
npm start
```

For production with PM2:
```bash
pm2 start npm --name "dapps-somi" -- start
```

## 🔧 Configuration

### Smart Contract
The contract address is configured in `config/contract.ts`:
- **Address**: `0xeE32c30C1fAa0364d3022B6Ca2456363DadAF71b`
- **Chain**: Somnia Mainnet (Chain ID: 5031)
- **RPC**: `https://api.infra.mainnet.somnia.network/`

### Network Setup
Users will be prompted to add Somnia Mainnet to their wallet on first connection:
- Network Name: Somnia
- RPC URL: https://api.infra.mainnet.somnia.network/
- Chain ID: 5031
- Currency Symbol: SOMI
- Block Explorer: https://somnia.socialscan.io/

## 📱 Features Overview

### For Community Creators
1. **Create a Community**: Pay creation cost, receive initial shares
2. **Grow Your Community**: Engage members with posts and updates
3. **Earn from Trading**: Benefit from trading volume and fee structure

### For Traders
1. **Discover Communities**: Browse all communities on the homepage
2. **Trade Shares**: Buy low, sell high on the bonding curve
3. **Track Performance**: Monitor your holdings and P&L

### For Social Users
1. **Join Conversations**: Comment on posts, react with Roars
2. **Follow Activity**: Global feed shows all recent actions
3. **Build Reputation**: Claim your username and build your identity

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Website**: [somi.dapps.co](https://somi.dapps.co)
- **Somnia**: [somnia.network](https://somnia.network)
- **Block Explorer**: [somnia.socialscan.io](https://somnia.socialscan.io)

## 💡 Support

Need help? 
- Check our [deployment guide](deploy.md)
- Open an issue on GitHub
- Join our community

---

**Built with ❤️ on Somnia** 🦁
