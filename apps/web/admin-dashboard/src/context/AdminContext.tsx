import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface AdminContextType {
  token: string | null;
  admin: { id: string; email: string; name: string; role: string } | null;
  setToken: (token: string | null) => void;
  setAdmin: (admin: any) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    // Restore admin data from localStorage on mount
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setAdmin(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored admin user:', e);
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  return (
    <AdminContext.Provider
      value={{
        token,
        admin,
        setToken: (t) => {
          setToken(t);
          if (t) localStorage.setItem('adminToken', t);
        },
        setAdmin: (a) => {
          setAdmin(a);
          if (a) localStorage.setItem('adminUser', JSON.stringify(a));
        },
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
