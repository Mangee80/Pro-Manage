// Home.js
import {React, useState} from 'react';
import './Home.css'; // Home ke styles ke liye CSS file ko import karein
import Sidebar from '../Components/Sidebar/Sidebar';
import Dashboard from '../Components/Dashboard/Dashboard';

export const Home = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const componentMap = {
    Dashboard
  };
  const SelectedComponent = componentMap[selectedComponent];

  return (
    <div className="home">
      <Sidebar setSelectedComponent={setSelectedComponent} />
      <div className="main-content">
        {SelectedComponent ? <SelectedComponent /> : <Dashboard />}
      </div>
    </div>
  );
};

