import React, { useState } from 'react';
import './Sidebar.css';
import { useNavigate } from "react-router"
import { logout } from '../../utils/authUtils';
import { MdDashboard } from "react-icons/md";
import { BiBarChartAlt2 } from "react-icons/bi";
import { IoSettingsOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { HiOutlineViewGridAdd } from "react-icons/hi";

const Sidebar = ({ setSelectedComponent }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  const handleOptionClick = (option) => {
    setSelectedComponent(option);
    setSelectedOption(option);
    if (option === 'Logout') {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // logout function will handle redirect
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      navigate("/");
    }
  };

  return (
    <div className="sidebar">
      <div className='Heading'>
        <div className='logo_container'>
          <HiOutlineViewGridAdd className='logo-icon'/>
        </div>
        <p className='pro-manage-text'>Pro Manage</p>
      </div>
      <div className={`sidebarOption ${selectedOption === 'Dashboard' ? 'selected' : ''}`} onClick={() => handleOptionClick('Dashboard')}>
        <div className='icon_container'>
          <MdDashboard />
        </div>
        <p>Dashboard</p>
      </div>
      <div className={`sidebarOption ${selectedOption === 'Analytics' ? 'selected' : ''}`} onClick={() => handleOptionClick('Analytics')}>
        <div className='icon_container'>
          <BiBarChartAlt2 />
        </div>
        <p>Analytics</p>
      </div>
      <div className={`sidebarOption ${selectedOption === 'Setting' ? 'selected' : ''}`} onClick={() => handleOptionClick('Setting')}>
        <div className='icon_container'>
          <IoSettingsOutline />
        </div>
        <p>Settings</p>
      </div>
      <div className='logoutOption' onClick={() => handleOptionClick('Logout')}>
        <div className='icon_container'>
          <FiLogOut />
        </div>
        <p>Logout</p>
      </div>
    </div>
  );
};

export default Sidebar;
