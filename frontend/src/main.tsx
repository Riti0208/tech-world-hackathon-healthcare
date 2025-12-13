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
import { V3PlayfulBoard } from './V3PlayfulBoard';
import { V4TileBoard } from './V4TileBoard';

const router = createBrowserRouter([
  { path: '/v1', element: <App /> },
  { path: '/v2', element: <V2Leaderboard /> },
  { path: '/v3', element: <V3PlayfulBoard /> },
  { path: '/v4', element: <V4TileBoard /> },
  { path: '/', element: <Navigate to="/v4" replace /> },
  { path: '*', element: <Navigate to="/v4" replace /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
