import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import './index.css';
import App from './App';
import { V2Leaderboard } from './V2Leaderboard';

const router = createBrowserRouter([
  { path: '/v1', element: <App /> },
  { path: '/v2', element: <V2Leaderboard /> },
  { path: '/', element: <Navigate to="/v2" replace /> },
  { path: '*', element: <Navigate to="/v2" replace /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
