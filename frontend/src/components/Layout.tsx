import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AIAssistant from './AIAssistant';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary-50 p-6">
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  );
};

export default Layout;
