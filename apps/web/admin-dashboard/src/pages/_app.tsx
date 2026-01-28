import type { AppProps } from 'next/app';
import { AdminProvider } from '../context/AdminContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AdminProvider>
        <Component {...pageProps} />
      </AdminProvider>
    </ErrorBoundary>
  );
}
