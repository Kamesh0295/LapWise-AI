import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top sticky navigation bar */}
      <Navbar />
      
      {/* Main content body */}
      <main className="flex-grow pt-16">
        {children}
      </main>
      
      {/* Bottom footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
