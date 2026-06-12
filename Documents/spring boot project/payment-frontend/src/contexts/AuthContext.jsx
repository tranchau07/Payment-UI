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

  // Check if user is already logged in by retrieving token from sessionStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = sessionStorage.getItem('identity_token');
      if (savedToken) {
        try {
          setAccessToken(savedToken);
          const response = await apiClient.get('/identity/me', {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          
          if (response.data && response.data.username) {
            const rolesMapped = (response.data.authorities || [])
              .map(auth => auth.replace('ROLE_', ''));
            setUser({
              username: response.data.username,
              roles: rolesMapped,
            });
          }
        } catch (err) {
          console.warn('Session restoration failed, clearing token');
          sessionStorage.removeItem('identity_token');
          setAccessToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await apiClient.post('/identity/login', {
        username,
        password,
      });

      const { data } = response;
      if (data.token) {
        sessionStorage.setItem('identity_token', data.token);
        setAccessToken(data.token);

        // Fetch user info (me) to get authorities
        const meResponse = await apiClient.get('/identity/me', {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        
        const rolesMapped = (meResponse.data.authorities || [])
          .map(auth => auth.replace('ROLE_', ''));

        setUser({
          username: meResponse.data.username,
          roles: rolesMapped,
        });

        return { success: true };
      } else {
        throw new Error('Token not received from authentication service');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (username, password, email, phone, roles) => {
    setError(null);
    try {
      const response = await apiClient.post('/identity/register', {
        username,
        password,
        email,
        phone,
        roles
      });
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Đăng ký tài khoản thất bại.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = async () => {
    try {
      const currentToken = accessToken || sessionStorage.getItem('identity_token');
      if (currentToken) {
        await apiClient.post('/identity/logout', {}, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
      }
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      sessionStorage.removeItem('identity_token');
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
        register,
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
