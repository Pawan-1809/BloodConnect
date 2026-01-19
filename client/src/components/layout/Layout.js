import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import Footer from '../common/Footer';

const Layout = ({ children, showSidebar = true }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex">
        {user && showSidebar && <Sidebar />}
        <main className={`flex-1 ${user && showSidebar ? '' : 'w-full'}`}>
          <div className="min-h-[calc(100vh-80px)]">
            {children}
          </div>
          {!user && <Footer />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
