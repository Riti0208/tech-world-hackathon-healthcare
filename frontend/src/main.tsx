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

const router = createBrowserRouter([
  { path: '/v1', element: <App /> },
  { path: '/v2', element: <V2Leaderboard /> },
  { path: '/v3', element: <V3PlayfulBoard /> },
  { path: '/', element: <Navigate to="/v3" replace /> },
  { path: '*', element: <Navigate to="/v3" replace /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
