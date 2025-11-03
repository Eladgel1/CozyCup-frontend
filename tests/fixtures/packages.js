// Wallet credit packages (credits = 0) and drink passes (credits > 0).
// Prices are in cents.

export const packageFixtures = [
  // Wallet credit
  { id: 'pkg-50usd',   name: 'Add $50 credit', priceCents: 5000, credits: 0,  isActive: true, description: '50 Dollars' },
  { id: 'pkg-30usd',   name: 'Add $30 credit', priceCents: 3000, credits: 0,  isActive: true, description: '30 Dollars' },
  { id: 'pkg-20usd',   name: 'Add $20 credit', priceCents: 2000, credits: 0,  isActive: true, description: '20 Dollars' },
  { id: 'pkg-10usd',   name: 'Add $10 credit', priceCents: 1000, credits: 0,  isActive: true, description: '10 Dollars' },

  // Drink passes
  { id: 'pkg-20drinks', name: '20 Coffees',    priceCents: 5200, credits: 20, isActive: true, description: '20 Drinks' },
  { id: 'pkg-15drinks', name: '15 Coffees',    priceCents: 4000, credits: 15, isActive: true, description: '15 Drinks' },
  { id: 'pkg-10drinks', name: '10 Coffees',    priceCents: 2800, credits: 10, isActive: true, description: '10 Drinks' },
  { id: 'pkg-5drinks',  name: '5 Coffees',     priceCents: 1500, credits: 5,  isActive: true, description: '5 Drinks' },
];

// Mirror .price for FE code paths that still read `price`:
packageFixtures.forEach((p) => { p.price = p.priceCents; });
