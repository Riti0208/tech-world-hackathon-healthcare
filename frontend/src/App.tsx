import { useState, useEffect } from 'react';

interface HealthStatus {
  status: string;
  timestamp: string;
}

interface User {
  uuid: string;
  prefectureId: number;
  steps: number;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
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

  const loadUsers = async () => {
    setUsersLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/test/users`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setMessage(`✓ Loaded ${data.count} users from database`);
      } else {
        setMessage('✗ Failed to load users');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setMessage('✗ Error loading users');
    } finally {
      setUsersLoading(false);
    }
  };

  const createTestUser = async () => {
    setCreating(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/test/create-user`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`✓ Created user: ${data.user.uuid}`);
        loadUsers();
      } else {
        setMessage('✗ Failed to create user');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      setMessage('✗ Error creating user');
    } finally {
      setCreating(false);
    }
  };

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
            <h2 className="text-2xl font-semibold mb-4">Database Test</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Test database connection and operations
              </p>

              <div className="flex gap-2">
                <button
                  onClick={loadUsers}
                  disabled={usersLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {usersLoading ? 'Loading...' : 'Load Users'}
                </button>
                <button
                  onClick={createTestUser}
                  disabled={creating}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Test User'}
                </button>
              </div>

              {message && (
                <p className={`font-medium ${message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}

              {users.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Recent Users</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border px-4 py-2 text-left">UUID</th>
                          <th className="border border-border px-4 py-2 text-left">Prefecture ID</th>
                          <th className="border border-border px-4 py-2 text-left">Steps</th>
                          <th className="border border-border px-4 py-2 text-left">Updated At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.uuid} className="hover:bg-muted/50">
                            <td className="border border-border px-4 py-2 font-mono text-sm">{user.uuid}</td>
                            <td className="border border-border px-4 py-2">{user.prefectureId}</td>
                            <td className="border border-border px-4 py-2">{user.steps.toLocaleString()}</td>
                            <td className="border border-border px-4 py-2 text-sm">
                              {new Date(user.updatedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-border bg-background p-6">
            <h2 className="text-2xl font-semibold mb-4">Environment Info</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>Frontend: React 19.2.1 + Vite 7.2.7</p>
              <p>Backend: Hono 4.10.8 + Prisma 7.1.0</p>
              <p>Database: PostgreSQL 16</p>
              <p>API URL: {API_URL}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
