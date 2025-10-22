import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import SlotsPage from '@/features/bookings/SlotsPage';
import MyBookings from '@/features/bookings/MyBookings';

export default function Bookings() {
  const [tab, setTab] = useState('find');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
        <Tabs
          tabs={[
            { label: 'Find a seat', value: 'find' },
            { label: 'My bookings', value: 'mine' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'find' ? <SlotsPage /> : <MyBookings />}
    </div>
  );
}
