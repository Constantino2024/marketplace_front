import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PublicLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <div className="sticky top-0 z-50">
      <Header />
    </div>
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default PublicLayout;