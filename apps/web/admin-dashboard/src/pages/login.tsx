import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const LoginPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Bypass login, redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return null;
};

export default LoginPage;
