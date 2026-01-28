import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const IndexPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard immediately, skip login
    router.push('/dashboard');
  }, [router]);

  return null;
};

export default IndexPage;
