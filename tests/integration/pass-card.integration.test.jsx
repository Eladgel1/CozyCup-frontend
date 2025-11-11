import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

const tokenStoreMock = { getAccessToken: vi.fn() };

vi.mock('@/lib/token.store', () => ({
  tokenStore: tokenStoreMock,
}));

function makeJwt(subValue) {
  const base64 = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'');
  return ['hdr','pld','sig'].map((part,i)=> i===1 ? base64({ sub: subValue }) : base64({})).join('.');
}

describe('PassCard (integration)', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  it('renders balance and expiry, and updates when prop changes', async () => {
  tokenStoreMock.getAccessToken.mockReturnValue(makeJwt('u1'));
  localStorage.setItem('cozy.wallet.u1', JSON.stringify({ balanceCents: 450 }));

  const { default: PassCard } = await import('@/features/wallet/PassCard.jsx');
  const { rerender } = render(<PassCard balanceCents={450} expiresAt="2025-01-10T00:00:00Z" />);

  expect(await screen.findByText(/\$4\.50/)).toBeInTheDocument();
  expect(screen.getByText(/Pass expiry/i)).toBeInTheDocument();
  
  localStorage.setItem('cozy.wallet.u1', JSON.stringify({ balanceCents: 990 }));
  rerender(<PassCard balanceCents={990} expiresAt="2025-01-10T00:00:00Z" />);
  await waitFor(() => {
    expect(screen.getByText(/\$9\.90/)).toBeInTheDocument();
  });
});


  it('syncs from user-scoped localStorage via storage event', async () => {
    tokenStoreMock.getAccessToken.mockReturnValue(makeJwt('user-42'));
    const { default: PassCard } = await import('@/features/wallet/PassCard.jsx');

    render(<PassCard balanceCents={0} expiresAt={null} />);

    const key = `cozy.wallet.user-42`;
    localStorage.setItem(key, JSON.stringify({ balanceCents: 1234 }));

    window.dispatchEvent(new StorageEvent('storage', { key }));

    await waitFor(() => expect(screen.getByText('$12.34')).toBeInTheDocument());
  });
});
