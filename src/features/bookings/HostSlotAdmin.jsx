import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { slotsApi } from '@/lib/slots.api';
import { useToast } from '@/components/ui/Toast';

const pad = (n) => String(n).padStart(2, '0');
const fmtLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayLocal = () => fmtLocal(new Date());

export default function HostSlotAdmin({ date, onCreated }) {
  const [form, setForm] = useState({
    date,
    start: '10:00',
    end: '11:00',
    capacity: 8,
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setForm((f) => ({ ...f, date }));
  }, [date]);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const min = todayLocal();
      if (!form.date || form.date < min) {
        throw new Error('Date cannot be in the past.');
      }

      if (form.start && form.end && form.start >= form.end) {
        throw new Error('Start time must be earlier than end time.');
      }

      const cap = Number(form.capacity || 0);
      if (!Number.isFinite(cap) || cap <= 0) {
        throw new Error('Capacity must be a positive number.');
      }

      await slotsApi.create({
        date: form.date,
        start: form.start,
        end: form.end,
        capacity: cap,
      });

      toast.show('Slot created', 'success');
      onCreated?.();
    } catch (err) {
      toast.show(err.message || 'Failed to create slot', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <Card.Header>
        <Card.Title>Host tools</Card.Title>
        <Card.Description>Create a slot for the selected day.</Card.Description>
      </Card.Header>
      <Card.Body>
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            className="border radius-sm px-3 py-2"
            type="date"
            value={form.date}
            min={todayLocal()}
            onChange={(e) => onChange('date', e.target.value)}
          />
          <input
            className="border radius-sm px-3 py-2"
            type="time"
            value={form.start}
            onChange={(e) => onChange('start', e.target.value)}
          />
          <input
            className="border radius-sm px-3 py-2"
            type="time"
            value={form.end}
            onChange={(e) => onChange('end', e.target.value)}
          />
          <input
            className="border radius-sm px-3 py-2"
            type="number"
            min="1"
            value={form.capacity}
            onChange={(e) => onChange('capacity', e.target.value)}
          />
          <div className="sm:col-span-4 flex justify-end">
            <Button loading={loading} type="submit">Create slot</Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}
