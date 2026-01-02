import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const VITE_API_URL = 'https://vps-a70_backend.humanibot.online';
  // Usa URL pública si existe (VITE_API_URL) o detecta automáticamente el host
  const serverUrl = VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001`;
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
