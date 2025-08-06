import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-secondary-900">Welcome back!</h2>
          <p className="text-sm text-secondary-500">
            Manage your government contracting workflow with AI assistance
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
            <p className="text-xs text-secondary-500 capitalize">{user?.tier} Plan</p>
          </div>
          <button
            onClick={logout}
            className="btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
