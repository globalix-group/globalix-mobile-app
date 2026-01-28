import React from 'react';
import { useRouter } from 'next/router';
import { useAdmin } from '../context/AdminContext';
import { useEffect } from 'react';

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const router = useRouter();
    const { token } = useAdmin();
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
      if (!token) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }, [token, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
