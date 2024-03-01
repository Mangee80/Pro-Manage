// Sidebar.js

import React from 'react';
import './Sidebar.css';
import codesandbox from '../../assets/icons/codesandbox.png';

import layout from '../../assets/icons/layout.png';
import database from '../../assets/icons/database.png';
import settings from '../../assets/icons/settings.png';
import Logout from '../../assets/icons/Logout.png';



const Sidebar = ({ setSelectedComponent }) => {
  
  return (
    <div className="sidebar">
      <div>
        <div className='img_container'>
          <img src={codesandbox}/>
        </div>
      </div>
      <div className='comp1' onClick={() => setSelectedComponent('Dashboard')}>
        <div className='img_container'>
          <img src={layout}/>
        </div>
        Dashboard
      </div>
      <div onClick={() => setSelectedComponent('Analytics')}>
        <div className='img_container'>
          <img src={database}/>
        </div>
        Analytics
      </div>
      <div onClick={() => setSelectedComponent('Settings')}>
        <div className='img_container'>
          <img src={settings}/>
        </div>
        Settings
      </div>


      
      
      <div>
        <div className='img_container'>
          <img src={Logout}/>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

