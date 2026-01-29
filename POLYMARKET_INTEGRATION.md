# 🔮 Polymarket Integration - Complete Guide

## ✅ What's Been Added

Your 0G Prediction Market now has **full Polymarket cloning integration**! Users can browse live Polymarket markets and deploy them to 0G Network with one click.

---

## 🏗️ Architecture

### 1. **Backend API** (`/app/api/polymarket/route.ts`)
Fetches real-time data from Polymarket:

**Data Sources:**
- **Gamma API**: Market metadata (questions, categories, end dates)
- **CLOB API**: Live pricing for YES/NO outcomes

**Features:**
- Real-time price updates (30s cache)
- Filters for active, high-volume markets
- Only shows markets ending within 1 year
- Parallel API calls for performance

**Example Response:**
```json
{
  "success": true,
  "markets": [
    {
      "id": "...",
      "question": "Will BTC reach $100k by March 2026?",
      "category": "Crypto",
      "outcomePrices": ["0.62", "0.38"],
      "volume": 1250000,
      "hasLivePrice": true
    }
  ]
}
```

---

### 2. **Frontend Component** (`/components/PolymarketCard.tsx`)

**Visual Features:**
- Beautiful glass-morphism card design
- Live price indicator (pulsing dot)
- YES/NO probability bars
- Hover effect reveals "Clone to 0G" button

**Clone Flow:**
```
1. User hovers over Polymarket card
2. "Clone to 0G" button appears
3. User clicks → Market data saved to sessionStorage
4. Redirects to /create page
5. Form pre-filled with question, category, end date
6. User reviews and deploys to 0G Network
```

---

### 3. **Create Page Integration** (`/app/create/page.tsx`)

**Enhanced Features:**
- Detects cloned market data from sessionStorage
- Pre-fills form automatically
- Shows "Cloned from Polymarket" badge
- Changed description text for clarity

**Clone Indicator:**
```tsx
{clonedFrom && (
  <div className="...">
    <Copy className="w-4 h-4" />
    <span>Cloned from Polymarket</span>
  </div>
)}
```

---

### 4. **Home Page** (`/app/page.tsx`)

**New Section:**
- "Clone from Polymarket" section below 0G markets
- Grid of 12 live Polymarket markets
- Real-time odds and volume data
- Link to Polymarket.com for more markets

---

## 🎯 User Experience

### Browsing Polymarket Markets
1. Visit http://localhost:3004
2. Scroll down to "Clone from Polymarket" section
3. See 12 high-volume markets with live prices
4. Green pulsing dot = real-time CLOB pricing

### Cloning a Market
1. Hover over any Polymarket card
2. Click "Clone to 0G" button
3. Redirected to /create page
4. Form pre-filled with:
   - Question
   - Category
   - End Date
5. Customize outcomes, fees, etc.
6. Click "Create Market" to deploy on 0G

### Benefits vs Polymarket
- **Lower Fees**: 2% platform fee vs 5-10% on Polymarket
- **Transparent Resolution**: 0G Compute verification
- **Privacy**: Deployed on 0G Network
- **Creator Fees**: Earn 0-10% on your deployed market

---

## 📊 API Details

### Polymarket Gamma API
**Endpoint**: `https://gamma-api.polymarket.com/markets`

**Parameters:**
- `limit`: Number of markets to fetch
- `active`: Only active markets (true/false)
- `closed`: Exclude closed markets

**Response Fields:**
- `question`: Market question
- `category`: Category (Crypto, Politics, etc.)
- `volumeNum`: Total volume in USD
- `endDate`: Resolution date
- `clobTokenIds`: Token IDs for live pricing

### Polymarket CLOB API
**Endpoint**: `https://clob.polymarket.com/price?token_id={id}`

**Response:**
```json
{
  "price": "0.62"  // YES or NO token price (0-1)
}
```

---

## 🔧 Technical Implementation

### Data Flow
```
Home Page Load
   ↓
Fetch /api/polymarket?limit=12
   ↓
API: Fetch Gamma API (market metadata)
   ↓
API: Fetch CLOB API (live prices) - Parallel
   ↓
API: Filter + Sort by volume
   ↓
Return to Frontend
   ↓
Display PolymarketCard components
```

### Clone Flow
```
User clicks "Clone to 0G"
   ↓
Save to sessionStorage:
{
  question: "...",
  category: "...",
  endDate: "2026-03-15"
}
   ↓
router.push('/create')
   ↓
useEffect checks sessionStorage
   ↓
Pre-fill form with data
   ↓
Clear sessionStorage
   ↓
Show "Cloned from Polymarket" badge
```

---

## 🎨 UI Components

### PolymarketCard Features
- **Glass Background**: `bg-white/5 backdrop-blur-sm`
- **Hover Animation**: `-5px` vertical translate
- **Live Indicator**: Pulsing green dot with animation
- **Odds Display**: Gradient-filled bars showing YES/NO %
- **Clone Overlay**: Appears on hover with opacity transition

### Color Scheme
- **Polymarket Badge**: Purple (`bg-purple-500/10`, `text-purple-400`)
- **Live Price**: Green (`bg-green-500/10`, `text-green-400`)
- **YES Option**: Green (`bg-green-500/10`)
- **NO Option**: Red (`bg-red-500/10`)

---

## 📈 Performance

### Caching Strategy
- **Gamma API**: 60 second cache (`next: { revalidate: 60 }`)
- **CLOB API**: 30 second cache (`next: { revalidate: 30 }`)

### Parallel Fetching
```typescript
const [yesPrice, noPrice] = await Promise.all([
  fetchCLOBPrice(tokenIds[0]),
  fetchCLOBPrice(tokenIds[1]),
]);
```

### Filtering
- Only active markets (not closed/archived)
- Volume > $50
- Ends within 1 year
- Sorted by 24hr volume

---

## 🚀 Live Demo

**URL**: http://localhost:3004

**Test Flow:**
1. View Polymarket markets (bottom of homepage)
2. Hover over "Will BTC reach $100k?" market
3. Click "Clone to 0G"
4. See pre-filled form on /create page
5. Deploy to 0G Network

---

## 🔮 Future Enhancements

### Phase 2
- Category filtering for Polymarket markets
- Search functionality
- Historical price charts
- Volume/liquidity sorting

### Phase 3
- Auto-sync Polymarket outcomes to 0G
- Arbitrage detection between platforms
- Multi-chain deployment (clone to multiple networks)
- Batch cloning (deploy multiple markets at once)

---

## 📝 Code Examples

### Fetch Polymarket Data
```typescript
const response = await fetch('/api/polymarket?limit=12');
const data = await response.json();

if (data.success) {
  console.log(`Loaded ${data.markets.length} markets`);
  console.log(`Total volume: $${data.markets.reduce((sum, m) => sum + m.volume, 0)}`);
}
```

### Clone Market Programmatically
```typescript
const cloneMarket = (market: PolymarketData) => {
  sessionStorage.setItem('cloneMarket', JSON.stringify({
    question: market.question,
    category: market.category,
    endDate: new Date(market.endDate).toISOString().split('T')[0],
  }));
  router.push('/create');
};
```

---

## ✅ Testing Checklist

- [x] API route fetches Polymarket data
- [x] Live prices display correctly
- [x] Cards show proper YES/NO percentages
- [x] Clone button appears on hover
- [x] SessionStorage saves market data
- [x] Create form pre-fills correctly
- [x] "Cloned from Polymarket" badge shows
- [x] Markets can be deployed to 0G Network

---

## 🎯 Key Advantages

### For Users
- **Familiar Markets**: Same markets as Polymarket
- **Lower Fees**: 2% vs 5-10%
- **Transparent**: 0G Compute verification
- **Privacy**: On 0G Network

### For Platform
- **User Acquisition**: Leverage Polymarket's liquidity
- **Market Variety**: Access to hundreds of markets
- **Competitive**: Lower fees attract users
- **Innovation**: First to bridge Polymarket to 0G

---

**Built with ❤️ for 0G Hackathon**
