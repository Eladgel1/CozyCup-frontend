import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const postMock = vi.fn();
const toastSpy = vi.fn();

vi.mock('@/lib/http', () => ({
  http: { post: (...a) => postMock(...a) },
}));
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ show: toastSpy }),
}));

import HostScannerPage from '@/features/host/ScannerPage.jsx';

describe('HostScannerPage (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits token and shows success toast, clears input', async () => {
    postMock.mockResolvedValueOnce({ data: { ok: true } });

    render(<HostScannerPage />);
    const input = screen.getByPlaceholderText(/Paste QR token/i);
    fireEvent.change(input, { target: { value: 'ABC-123' } });
    fireEvent.click(screen.getByRole('button', { name: /Check in/i }));

    await waitFor(() => expect(postMock).toHaveBeenCalledWith('/checkin/ABC-123', {}));
    expect(toastSpy).toHaveBeenCalledWith('Checked in successfully', 'success');
    expect(input).toHaveValue('');
  });

  it('shows error toast on failure', async () => {
    postMock.mockRejectedValueOnce(new Error('bad'));
    render(<HostScannerPage />);
    const input = screen.getByPlaceholderText(/Paste QR token/i);
    fireEvent.change(input, { target: { value: 'XYZ' } });
    fireEvent.click(screen.getByRole('button', { name: /Check in/i }));
    await waitFor(() => expect(toastSpy).toHaveBeenCalledWith('bad', 'error'));
  });
});
