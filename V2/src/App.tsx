import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  // Usa URL pública si existe (VITE_API_URL) o el mismo host con puerto 3001
  const serverUrl = (import.meta as any).env?.VITE_API_URL || `http://192.168.1.22:3001`;
  const { token, username, isAuthenticated, isLoading, error, login, logout } = useAuth(serverUrl);

  const handleLogin = async (user: string, password: string) => {
    return await login(user, password);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} isLoading={isLoading} error={error} />;
  }

  return (
    <Dashboard
      serverUrl={serverUrl}
      token={token!}
      username={username!}
      onLogout={logout}
    />
  );
}

export default App;
