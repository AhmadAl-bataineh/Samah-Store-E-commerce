import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { normalizeRole, isValidRole, ROLES } from '../utils/roleUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');

    if (token && userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setUser({ ...parsed, token });
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);

    // Listen for global logout events (e.g., refresh failure from api client)
    const handleGlobalLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      setIsAuthenticated(false);
      setUser(null);
      // redirect to login safely
      try { window.location.href = '/login'; } catch (e) { /* noop */ }
    };

    window.addEventListener('samah_logout', handleGlobalLogout);

    return () => {
      window.removeEventListener('samah_logout', handleGlobalLogout);
    };
  }, []);

  const login = async (usernameOrEmail, password) => {
    const response = await authApi.login(usernameOrEmail, password);

    // Normalize and validate role
    const normalizedRole = normalizeRole(response.user?.role);
    if (!normalizedRole || !isValidRole(normalizedRole)) {
      throw new Error('INVALID_ROLE');
    }

    const userInfo = { ...response.user, role: normalizedRole };

    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setIsAuthenticated(true);
    setUser({ ...userInfo, token: response.accessToken });
    return response;
  };

  const register = async (username, email, password, phone) => {
    const response = await authApi.register(username, email, password, phone);

    // Normalize and validate role
    const normalizedRole = normalizeRole(response.user?.role);
    if (!normalizedRole || !isValidRole(normalizedRole)) {
      throw new Error('INVALID_ROLE');
    }

    const userInfo = { ...response.user, role: normalizedRole };

    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setIsAuthenticated(true);
    setUser({ ...userInfo, token: response.accessToken });
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Role-based helpers (using normalized constants)
  const isAdmin = user?.role === ROLES.ADMIN;
  const isEmployee = user?.role === ROLES.EMPLOYEE;
  const isCustomer = user?.role === ROLES.CUSTOMER;

  // Get default route based on role
  const getDefaultRoute = () => {
    if (!user?.role) return '/';

    const normalizedRole = normalizeRole(user.role);

    // Both ADMIN and EMPLOYEE go to admin dashboard
    switch (normalizedRole) {
      case ROLES.ADMIN:
      case ROLES.EMPLOYEE:
        return '/admin/dashboard';
      case ROLES.CUSTOMER:
        return '/';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      isAdmin,
      isEmployee,
      isCustomer,
      getDefaultRoute,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
