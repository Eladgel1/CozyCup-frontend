export const EP = {
  // Menu & Pickup
  menu: {
    list: '/menu',
    create: '/menu',
    update: (id) => `/menu/${id}`,
  },
  pickup: {
    list: '/pickup-windows',
    create: '/pickup-windows',
    update: (id) => `/pickup-windows/${id}`,
  },

  // Orders (pickup)
  orders: {
    create: '/orders',
    mine: '/orders/me',
    updateStatus: (id) => `/orders/${id}/status`,
  },

  // Slots / Bookings + QR/Check-in
  slots: {
    list: '/slots',
    create: '/slots',
  },
  bookings: {
    create: '/bookings',
    mine: '/bookings/me',
    cancel: (id) => `/bookings/${id}/cancel`,
    qrToken: (id) => `/bookings/${id}/qr-token`,
  },
  checkin: {
    byToken: (token) => `/checkin/${token}`,
  },

  // Wallet / Packages / Redeem
  packages: {
    list: '/packages',
    create: '/packages',
  },
  purchase: {
    create: '/purchase',
    walletMe: '/purchase/me/wallet',
  },
  redeem: {
    byCode: '/redeem',
    byQrToken: '/redeem/qr-token',
  },

  // Reports
  reports: {
    daySummary: '/reports/day-summary',
  },
};
