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
  // Bypass authentication - set default admin token
  const [token, setToken] = useState<string | null>('dev-token-bypass');
  const [admin, setAdmin] = useState<any>({
    id: 'admin-1',
    email: 'admin@globalix.com',
    name: 'Admin',
    role: 'administrator'
  });

  useEffect(() => {
    // Skip localStorage checks for development
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
