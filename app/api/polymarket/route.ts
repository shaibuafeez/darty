import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '12';
    const active = searchParams.get('active') || 'true';

    // Fetch more markets initially to have better selection
    const fetchLimit = Math.max(parseInt(limit) * 4, 50);

    // Fetch from Polymarket Gamma API (Market metadata)
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?limit=${fetchLimit}&active=${active}&closed=false`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Polymarket Gamma API');
    }

    const markets = await response.json();

    // Function to fetch real-time price from CLOB API
    const fetchCLOBPrice = async (tokenId: string) => {
      try {
        const clobResponse = await fetch(
          `https://clob.polymarket.com/price?token_id=${tokenId}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            next: { revalidate: 30 }, // Cache for 30 seconds
          }
        );

        if (clobResponse.ok) {
          const priceData = await clobResponse.json();
          return priceData.price || null;
        }
      } catch (error) {
        console.error(`CLOB API error for token ${tokenId}:`, error);
      }
      return null;
    };

    // Filter and transform data
    const now = new Date();
    const filteredMarkets = markets.filter((market: any) => {
      const endDate = market.endDate ? new Date(market.endDate) : null;
      const hasEnded = endDate && endDate < now;

      return (
        market.active &&
        !market.closed &&
        !market.archived &&
        !hasEnded &&
        market.volumeNum > 50
      );
    }).slice(0, parseInt(limit) * 3);

    // Enrich with CLOB real-time pricing
    const enrichedMarkets = await Promise.all(
      filteredMarkets.map(async (market: any) => {
        let livePrices = null;

        if (market.clobTokenIds) {
          try {
            const tokenIds = JSON.parse(market.clobTokenIds);
            if (tokenIds && tokenIds.length >= 2) {
              const [yesPrice, noPrice] = await Promise.all([
                fetchCLOBPrice(tokenIds[0]),
                fetchCLOBPrice(tokenIds[1]),
              ]);

              if (yesPrice !== null && noPrice !== null) {
                livePrices = [yesPrice, noPrice];
              }
            }
          } catch (err) {
            console.error('Error parsing token IDs:', err);
          }
        }

        const outcomePrices = livePrices ||
          (market.outcomePrices ? JSON.parse(market.outcomePrices) : ['0.5', '0.5']);

        return {
          id: market.id,
          question: market.question,
          description: market.description,
          endDate: market.endDate,
          category: market.category || 'Other',
          volume: market.volumeNum || 0,
          liquidity: market.liquidityNum || 0,
          image: market.image,
          icon: market.icon,
          outcomePrices,
          outcomes: market.outcomes ? JSON.parse(market.outcomes) : ['Yes', 'No'],
          slug: market.slug,
          volume24hr: market.volume24hr || 0,
          hasLivePrice: livePrices !== null,
        };
      })
    );

    // Filter markets ending within 1 year
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    const nearTermMarkets = enrichedMarkets.filter(market => {
      if (!market.endDate) return true;
      const endDate = new Date(market.endDate);
      return endDate <= oneYearFromNow;
    });

    // Sort by 24hr volume
    const sortedMarkets = nearTermMarkets
      .sort((a, b) => (b.volume24hr || b.volume) - (a.volume24hr || a.volume))
      .slice(0, parseInt(limit));

    return NextResponse.json({
      success: true,
      markets: sortedMarkets,
      count: sortedMarkets.length,
      meta: {
        gammaApi: 'https://gamma-api.polymarket.com',
        clobApi: 'https://clob.polymarket.com',
        cacheDuration: '60s',
      },
    });
  } catch (error: any) {
    console.error('Polymarket API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}
