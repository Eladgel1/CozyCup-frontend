import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { http } from '@/lib/http';
import { useToast } from '@/components/ui/Toast';

export default function HostScannerPage() {
  const [token,setToken] = useState('');
  const [loading,setLoading] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e?.preventDefault();
    if (!token.trim()) return;
    try {
      setLoading(true);
      const { data } = await http.post(`/checkin/${encodeURIComponent(token.trim())}`, {});
      toast.show('Checked in successfully', 'success');
      console.debug('Checkin response:', data);
      setToken('');
    } catch (e) {
      toast.show(e?.message || 'Check-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <img src="/src/assets/icons/chef-hat.svg" alt="" className="w-6 h-6 opacity-80" />
        <h1 className="text-xl font-semibold">Scanner (placeholder)</h1>
      </div>

      <Card>
        <Card.Body>
          <p className="muted text-sm mb-3">
            Camera QR scanner will be integrated later. For now paste a token to check-in.
          </p>
          <form onSubmit={submit} className="flex items-center gap-2">
            <input
              className="w-full border radius-sm px-3 py-2"
              placeholder="Paste QR token…"
              value={token}
              onChange={(e)=>setToken(e.target.value)}
            />
            <Button type="submit" loading={loading} disabled={!token.trim() || loading}>
              Check in
            </Button>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}
