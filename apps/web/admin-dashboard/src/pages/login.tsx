import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdmin } from '../context/AdminContext';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { setToken, setAdmin } = useAdmin();

  useEffect(() => {
    // Set demo admin and redirect to dashboard
    setToken('demo-token-bypass');
    setAdmin({
      id: 'admin-1',
      email: 'admin@globalix.com',
      name: 'Admin',
      role: 'administrator'
    });
    router.push('/dashboard');
  }, [router, setToken, setAdmin]);

  return null;
};

export default LoginPage;
