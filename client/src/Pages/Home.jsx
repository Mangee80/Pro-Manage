// Home.js
import React from 'react';
import './Home.css'; // Home ke styles ke liye CSS file ko import karein
import Sidebar from '../Components/Sidebar/Sidebar';
import Dashboard from '../Components/Dashboard/Dashboard';

export const Home = () => {
  return (
    <div className="home">
      {/* Sidebar component */}
      <Sidebar />
      {/* Dashboard component */}
      <Dashboard />
    </div>
  );
};

