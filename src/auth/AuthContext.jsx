import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const authToken = getAuthToken();
    const savedUser = getAuthUser();

    if (validateToken(authToken) && savedUser) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }

    setIsAuthReady(true);
  }, []);

  const login = async (username, password, rememberMe) => {
    try {

      const apiBaseUrl = process.env.REACT_APP_API_URL;

      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData?.detail || errorData?.message || 'Login failed' };
      }
  
      const data = await response.json();
      const userObj = {
        userId: data.userId,
        name: data.name,
      };
      setUser(userObj);
      setIsAuthenticated(true);       
      storeAuthToken(data.token, rememberMe);
      storeAuthTokenExpiry(data.expiration, data.token, rememberMe);
      storeAuthUser(JSON.stringify(userObj), rememberMe);
  
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  };

  const signup = async (name, username, password) => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL;

      const response = await fetch(`${apiBaseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData?.detail || errorData?.message || 'Signup failed' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Network error' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    clearAuthStorage();
  };  

  function validateToken(authToken)
  {
    if (!authToken || isTokenExpired(authToken)) {
      clearAuthStorage();
      return null;
    }
    return true;
  }

  function clearAuthStorage() {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiry');
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authTokenExpiry');
  }

  function isTokenExpired(authToken) {
    const jwtExpiryMs = getJwtExpMs(authToken);
    if (jwtExpiryMs) {
      return Date.now() > jwtExpiryMs;
    }

    const expiry = getAuthTokenExpiry();
    if (!expiry) return true;

    const expiryMs = Number(expiry);
    if (!Number.isFinite(expiryMs)) return true;

    return Date.now() > expiryMs;
  }

  function getAuthUser(){    
    return localStorage.getItem('authUser') || sessionStorage.getItem('authUser');    
  }
 
  const getAuthToken = () => {    
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');    
  }

  function getAuthTokenExpiry(){
    return localStorage.getItem('authTokenExpiry') || sessionStorage.getItem('authTokenExpiry');
  }

  function parseExpiryToMs(expiration) {
    if (!expiration) return null;

    if (typeof expiration === 'number') {
      return Number.isFinite(expiration) ? expiration : null;
    }

    if (typeof expiration === 'string') {
      const hasTimezone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(expiration);
      const normalized = hasTimezone ? expiration : `${expiration}Z`;
      const parsed = new Date(normalized).getTime();
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  function getJwtExpMs(token) {
    if (!token || typeof token !== 'string') return null;

    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded));
      const expMs = Number(payload?.exp) * 1000;

      return Number.isFinite(expMs) ? expMs : null;
    } catch {
      return null;
    }
  }

  function storeAuthToken(token, isPersistent){
    if(isPersistent){
      localStorage.setItem('authToken', token);
    }
    else{
      sessionStorage.setItem('authToken', token);
    }
  }

  function storeAuthTokenExpiry(expiration, token, isPersistent){
    const expiryMs = parseExpiryToMs(expiration) || getJwtExpMs(token);
    if (!expiryMs) return;

    if(isPersistent){
      localStorage.setItem('authTokenExpiry', String(expiryMs));
    }
    else{
      sessionStorage.setItem('authTokenExpiry', String(expiryMs));
    }
  }

  function storeAuthUser(userObj, isPersistent){   
    if(isPersistent){
      localStorage.setItem('authUser', userObj);
    }
    else{
      sessionStorage.setItem('authUser', userObj);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthReady, user, login, signup, logout, getAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}