import React, { useState, useEffect } from 'react';
import './Dashboard.css'; // Import CSS file for Dashboard styles
import Board from '../Board/Board';

function Dashboard() {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    // Fetch cards from backend when the component mounts
    fetchUserCards();
  }, []);

  
  const fetchUserCards = async () => {
    try {
      // Retrieve userID from localStorage
      const userID = localStorage.getItem('userID');
      
      // Check if userID is available
      if (!userID) {
        throw new Error('User ID not found in localStorage');
      }
  
      // Fetch user-specific cards with token included in the headers
      const response = await fetch(`https://pro-manage-one.vercel.app/api/card/getcards?userID=${userID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user cards');
      }
  
      const { boards } = await response.json();
      setBoards(boards);
    } catch (error) {
      console.error('Error fetching user cards:', error);
    }
  };
  const userName = localStorage.getItem('user');
  
  

  
  return (
    
    <div style={{display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div className="dashboard-header">
          <h1>Welcome! {userName}</h1>
      </div>
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard">
            {/* Render boards dynamically */}
            {boards.map((board, index) => (
              <div key={index}>
                <Board title={board.title} cards={board.cards} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
