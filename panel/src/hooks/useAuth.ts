import { useState, useEffect } from 'react';
import { AuthResponse } from '../types/system';

export function useAuth(serverUrl: string) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('auth_username');
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }

    if (username) {
      localStorage.setItem('auth_username', username);
    } else {
      localStorage.removeItem('auth_username');
    }
  }, [token, username]);

  const login = async (user: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      setToken(data.token);
      setUsername(data.username);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${serverUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setToken(null);
    setUsername(null);
  };

  return {
    token,
    username,
    isAuthenticated: !!token,
    isLoading,
    error,
    login,
    logout
  };
}
