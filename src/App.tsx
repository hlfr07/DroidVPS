import { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const [serverUrl, setServerUrl] = useState('http://192.168.1.105:3001');
  const { token, username, isAuthenticated, isLoading, error, login, logout } = useAuth(serverUrl);

  const handleLogin = async (user: string, password: string, url: string) => {
    setServerUrl(url);
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
