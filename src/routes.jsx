import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Bookings from './pages/Bookings.jsx';
import Orders from './pages/Orders.jsx';
import Checkin from './pages/Checkin.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Wallet from './pages/Wallet.jsx';
import History from './pages/History.jsx';

import ProtectedRoute from '@/features/auth/ProtectedRoute.jsx';
import PublicOnlyRoute from '@/features/auth/PublicOnlyRoute.jsx';
import HostRoute from '@/features/auth/HostRoute.jsx';

// Host placeholders
const HostDashboard = () => <div className="card p-4">Host Dashboard</div>;
const HostOrdersBoard = () => <div className="card p-4">Host Orders Board</div>;
const HostScanner = () => <div className="card p-4">Host Scanner</div>;
const HostReports = () => <div className="card p-4">Day Summary Report</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },

      // Public
      { path: 'login', element: <PublicOnlyRoute><Login /></PublicOnlyRoute> },
      { path: 'register', element: <PublicOnlyRoute><Register /></PublicOnlyRoute> },

      // Protected (customer)
      { path: 'menu', element: <ProtectedRoute />, children: [{ index: true, element: <Menu /> }] },
      { path: 'bookings', element: <ProtectedRoute />, children: [{ index: true, element: <Bookings /> }] },
      { path: 'orders', element: <ProtectedRoute />, children: [{ index: true, element: <Orders /> }] },
      { path: 'checkin', element: <ProtectedRoute />, children: [{ index: true, element: <Checkin /> }] },
      { path: 'wallet', element: <ProtectedRoute />, children: [{ index: true, element: <Wallet /> }] },
      { path: 'history', element: <ProtectedRoute />, children: [{ index: true, element: <History /> }] },

      // Host-only
      {
        path: 'host',
        element: <HostRoute />,
        children: [
          { path: 'dashboard', element: <HostDashboard /> },
          { path: 'orders', element: <HostOrdersBoard /> },
          { path: 'scanner', element: <HostScanner /> },
          { path: 'reports', element: <HostReports /> },
        ],
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
