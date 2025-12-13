import { useState, useEffect } from 'react';
import { apiClient } from './lib/client';

interface HealthStatus {
  status: string;
  timestamp: string;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:3000/health');
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        console.error('Health check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Healthcare App</h1>
          <p className="mt-2 text-muted-foreground">
            TECH WORLD Hackathon 2025
          </p>
        </header>

        <main>
          <div className="rounded-lg border border-border bg-muted p-6">
            <h2 className="text-2xl font-semibold mb-4">System Status</h2>
            {loading ? (
              <p className="text-muted-foreground">Checking backend...</p>
            ) : health ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">
                  ✓ Backend is running
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {health.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last checked: {new Date(health.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-red-600 font-medium">
                ✗ Backend connection failed
              </p>
            )}
          </div>

          <div className="mt-8 rounded-lg border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <div className="prose max-w-none">
              <p className="text-muted-foreground">
                Welcome to your Healthcare application! The environment is ready for development.
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>Frontend: React 19.2.1 + Vite 7.2.7</li>
                <li>Backend: Hono 4.10.8 + Prisma 7.1.0</li>
                <li>Database: PostgreSQL 16</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
