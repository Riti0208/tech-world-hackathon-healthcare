import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';
import { Leaderboard } from './Leaderboard';
import { LiveDemo } from './LiveDemo';

const router = createBrowserRouter([
  { path: '/', element: <Leaderboard /> },
  { path: '/live', element: <LiveDemo /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
