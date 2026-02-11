import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, LogOut } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const { admin, logout } = useAdmin();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-4 md:pl-80">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} className="text-gray-700" />
        </button>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 flex-1 md:flex-initial md:hidden">
          Globalix Admin
        </h1>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* User Info */}
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-semibold text-gray-800">{admin?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500">{admin?.role || 'Administrator'}</p>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold hover:shadow-lg transition"
            >
              {admin?.name?.[0]?.toUpperCase() || 'A'}
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-semibold text-gray-800">{admin?.name}</p>
                  <p className="text-sm text-gray-500">{admin?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 font-medium flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
