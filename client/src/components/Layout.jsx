import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
      <footer className="py-6 border-t border-slate-100 bg-white mt-12 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} EduSubmit Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
