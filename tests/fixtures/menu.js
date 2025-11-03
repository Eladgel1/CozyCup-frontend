// Full menu fixtures used by MSW tests.
// Prices are in cents; imageUrl paths match the app assets.

export const menuFixtures = [
  { id: 'm-affogato',        name: 'Affogato',          priceCents: 590, category: 'coffee', description: 'Espresso over vanilla',           imageUrl: '/src/assets/images/menu/affogato.jpg' },
  { id: 'm-almond-croissant',name: 'Almond Croissant',  priceCents: 390, category: 'pastry', description: 'With almond cream',               imageUrl: '/src/assets/images/menu/almond_croissant.jpg' },
  { id: 'm-americano',       name: 'Americano',         priceCents: 400, category: 'coffee', description: 'Espresso + hot water',            imageUrl: '/src/assets/images/menu/americano.jpg' },
  { id: 'm-banana-bread',    name: 'Banana Bread',      priceCents: 350, category: 'pastry', description: 'Moist slice',                     imageUrl: '/src/assets/images/menu/banana_bread.jpg' },
  { id: 'm-croissant',       name: 'Butter Croissant',  priceCents: 320, category: 'pastry', description: 'Flaky & fresh',                   imageUrl: '/src/assets/images/menu/croissant.jpg' },
  { id: 'm-cappuccino',      name: 'Cappuccino',        priceCents: 500, category: 'coffee', description: 'Foamy top',                       imageUrl: '/src/assets/images/menu/cappuccino.jpg' },
  { id: 'm-chai-latte',      name: 'Chai Latte',        priceCents: 490, category: 'tea',    description: 'Spiced milk tea',                 imageUrl: '/src/assets/images/menu/chai.jpg' },
  { id: 'm-choc-muffin',     name: 'Chocolate Muffin',  priceCents: 360, category: 'pastry', description: 'Dark choc chips',                 imageUrl: '/src/assets/images/menu/muffin.jpg' },
  { id: 'm-earl-grey',       name: 'Earl Grey',         priceCents: 380, category: 'tea',    description: 'Black tea, bergamot',             imageUrl: '/src/assets/images/menu/earlgrey.jpg' },
  { id: 'm-espresso',        name: 'Espresso',          priceCents: 350, category: 'coffee', description: 'Rich shot, 30ml',                 imageUrl: '/src/assets/images/menu/espresso.jpg' },
  { id: 'm-flat-white',      name: 'Flat White',        priceCents: 520, category: 'coffee', description: 'Velvety microfoam',               imageUrl: '/src/assets/images/menu/flatwhite.jpg' },
  { id: 'm-green-tea',       name: 'Green Tea',         priceCents: 380, category: 'tea',    description: 'Sencha style',                    imageUrl: '/src/assets/images/menu/green.jpg' },
  { id: 'm-iced-latte',      name: 'Iced Latte',        priceCents: 520, category: 'coffee', description: 'Over ice',                        imageUrl: '/src/assets/images/menu/iced_latte.jpg' },
  { id: 'm-latte',           name: 'Latte',             priceCents: 520, category: 'coffee', description: 'Milk-forward, smooth',            imageUrl: '/src/assets/images/menu/latte.jpg' },
  { id: 'm-mocha',           name: 'Mocha',             priceCents: 580, category: 'coffee', description: 'With chocolate',                  imageUrl: '/src/assets/images/menu/mocha.jpg' },
];

// For convenience some parts of the FE still read .price – mirror priceCents:
menuFixtures.forEach((m) => { m.price = m.priceCents; });
