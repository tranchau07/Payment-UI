import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient, { setSessionToken, registerLogoutCallback, registerTokenRefreshCallback } from '../apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep apiClient in sync with memory token
  useEffect(() => {
    setSessionToken(accessToken);
  }, [accessToken]);

  // Handle automatic logout if refresh token expires in interceptor
  const forceLogout = () => {
    setAccessToken(null);
    setUser(null);
  };

  // Register callbacks on mount
  useEffect(() => {
    registerLogoutCallback(forceLogout);
    
    registerTokenRefreshCallback((newToken, username, roles) => {
      setAccessToken(newToken);
      setUser({ username, roles });
    });
  }, []);

  // Check if user is already logged in (using access token or refresh cookie on load)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to refresh token on startup to restore session
        const response = await apiClient.post('/auth/refresh');
        if (response.data && response.data.accessToken) {
          setAccessToken(response.data.accessToken);
          setUser({
            username: response.data.username,
            roles: response.data.roles,
          });
        }
      } catch (err) {
        console.log('No active session found on startup');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password, totpCode = '') => {
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
        totpCode,
      });

      const { data } = response;

      if (data.totpRequired) {
        return { totpRequired: true, username };
      }

      setAccessToken(data.accessToken);
      setUser({
        username: data.username,
        roles: data.roles,
      });

      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const getTotpSetup = async (username) => {
    try {
      const response = await apiClient.get(`/auth/totp/setup?username=${encodeURIComponent(username)}`);
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Không thể lấy thông tin thiết lập TOTP';
      throw new Error(errMsg);
    }
  };

  // Helper to check if user has a specific role
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(roleName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        error,
        login,
        logout,
        getTotpSetup,
        hasRole,
        setAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
