import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const Sidebar: React.FC<{ open?: boolean; onClose?: () => void }> = ({ open = true, onClose }) => {
  const router = useRouter();
  const { logout } = useAdmin();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Properties', path: '/properties', icon: '🏠' },
    { name: 'Cars', path: '/cars', icon: '🚗' },
    { name: 'Inquiries', path: '/inquiries', icon: '📧' },
    { name: 'Contacts', path: '/contacts', icon: '💬' },
    { name: 'Reservations', path: '/reservations', icon: '📅' },
    { name: 'Users', path: '/users', icon: '👥' },
    { name: 'Activity Logs', path: '/activity', icon: '📝' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
    { name: 'Earnings', path: '/earnings', icon: '💰' },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Globalix Admin</h1>
        <p className="text-xs text-gray-400">Control Center</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition block ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'hover:bg-gray-700 text-gray-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <aside className="w-64 bg-gray-900 h-screen fixed left-0 top-0 shadow-xl">
        {sidebarContent}
      </aside>
    );
  }

  // Mobile Sidebar
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 w-64 h-screen z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
