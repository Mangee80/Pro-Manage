import React, { useState } from 'react';
import './Sidebar.css';
import { useNavigate } from "react-router"
import codesandbox from '../../assets/icons/codesandbox.png';
import layout from '../../assets/icons/layout.png';
import database from '../../assets/icons/database.png';
import settings from '../../assets/icons/settings.png';
import Logout from '../../assets/icons/Logout.png';

const Sidebar = ({ setSelectedComponent }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  const handleOptionClick = (option) => {
    setSelectedComponent(option);
    setSelectedOption(option);
    if (option === 'Logout') {
      // Clear user-related data from local storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userID');
      // Redirect to login page
      navigate("/");
    }
  };

  return (
    <div className="sidebar">
      <div className='Heading'>
        <div className='img_container'>
          <img src={codesandbox} alt="Pro Manage Logo"/>
        </div>
        <p style={{ marginTop: '4px', fontFamily: 'Poppins, sans-serif', fontWeight: '750', fontSize: '18.8px'}}>Pro Manage</p>
      </div>
      <div className={`sidebarOption ${selectedOption === 'Dashboard' ? 'selected' : ''}`} onClick={() => handleOptionClick('Dashboard')}>
        <div className='img_container'>
          <img src={layout} alt="Dashboard Icon"/>
        </div>
        <p>Dashboard</p>
      </div>
      <div className={`sidebarOption ${selectedOption === 'Analytics' ? 'selected' : ''}`} onClick={() => handleOptionClick('Analytics')}>
        <div className='img_container'>
          <img src={database} alt="Analytics Icon"/>
        </div>
        <p>Analytics</p>
      </div>
      <div className={`sidebarOption ${selectedOption === 'Setting' ? 'selected' : ''}`} onClick={() => handleOptionClick('Setting')}>
        <div className='img_container'>
          <img src={settings} alt="Settings Icon"/>
        </div>
        <p>Settings</p>
      </div>
      <div className='logoutOption' onClick={() => handleOptionClick('Logout')}>
        <div className='img_container'>
          <img src={Logout} alt="Logout Icon"/>
        </div>
        <p>Logout</p>
      </div>
    </div>
  );
};

export default Sidebar;
