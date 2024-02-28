// Sidebar.js

import React from 'react';
import './Sidebar.css';
import codesandbox from '../../assets/icons/codesandbox.png';

const Sidebar = ({ setSelectedComponent }) => {
  return (
    <div className="sidebar">
      <div className='comp1' onClick={() => setSelectedComponent('Component1')}>
        <div className='img_container'>
          <img src={codesandbox}/>
        </div>
        Component 1
      </div>
      <div onClick={() => setSelectedComponent('Component2')}>Component 2</div>
    </div>
  );
};

export default Sidebar;

