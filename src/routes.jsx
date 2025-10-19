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
import ProtectedRoute from '@/features/auth/ProtectedRoute.jsx';
import PublicOnlyRoute from '@/features/auth/PublicOnlyRoute.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },

      // Public:
      { path: 'login', element: <PublicOnlyRoute><Login /></PublicOnlyRoute> },
      { path: 'register', element: <PublicOnlyRoute><Register /></PublicOnlyRoute> },

      // Protected examples:
      { path: 'menu', element: <ProtectedRoute />, children: [{ index: true, element: <Menu /> }] },
      { path: 'bookings', element: <ProtectedRoute />, children: [{ index: true, element: <Bookings /> }] },
      { path: 'orders', element: <ProtectedRoute />, children: [{ index: true, element: <Orders /> }] },
      { path: 'checkin', element: <ProtectedRoute />, children: [{ index: true, element: <Checkin /> }] },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
