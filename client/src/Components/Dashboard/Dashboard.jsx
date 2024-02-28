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
      // Fetch user-specific cards with token included in the headers
      const userID = localStorage.getItem('userID'); // Retrieve userID from localStorage
      const response = await fetch(`http://localhost:5000/api/card/getcards?userID=${userID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user cards');
      }
  
      const { boards } = await response.json();
      console.log(boards);
      setBoards(boards);
    } catch (error) {
      console.error('Error fetching user cards:', error);
    }
  };
  
  

  
  return (
    
    <div style={{display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div className="dashboard-header">
          <h1>Dashboard</h1>
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
