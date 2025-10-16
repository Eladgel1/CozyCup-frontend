import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Bookings from './pages/Bookings.jsx';
import Orders from './pages/Orders.jsx';
import Checkin from './pages/Checkin.jsx';
import NotFound from './pages/NotFound.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'menu', element: <Menu /> },
      { path: 'bookings', element: <Bookings /> },
      { path: 'orders', element: <Orders /> },
      { path: 'checkin', element: <Checkin /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
