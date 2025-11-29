import React, { useState, useEffect } from 'react';
import './Dashboard.css'; // Import CSS file for Dashboard styles
import Board from '../Board/Board';
import { getApiUrl } from '../../config/apiConfig';
import { apiRequest } from '../../utils/authUtils';

function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch cards from backend when the component mounts
    fetchUserCards();
  }, []);

  
  const fetchUserCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Retrieve userID from localStorage
      const userID = localStorage.getItem('userID');
      
      // Check if userID is available
      if (!userID) {
        throw new Error('User ID not found in localStorage');
      }
  
      // Fetch user-specific cards with authentication token
      const response = await apiRequest(`${getApiUrl('api/card/getcards')}?userID=${userID}`, {
        method: 'GET'
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `Failed to fetch user cards: ${response.status}`;
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorMessage);
      }
  
      const responseData = await response.json();
      const { boards } = responseData;
      
      if (!boards || !Array.isArray(boards)) {
        console.warn('Invalid boards data received:', responseData);
        setBoards([]);
        return;
      }
      
      setBoards(boards);
    } catch (error) {
      console.error('Error fetching user cards:', error);
      setError(error.message || 'Failed to load board data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };
  const userName = localStorage.getItem('user');
  
  
  
  
  const currentDate = new Date();
  const formattedDate = currentDate.toDateString();
  
  return (
    
    <div style={{display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div className="dashboard-header">
          <p style={{ fontSize: '17px', fontFamily: 'Poppins, sans-serif', fontWeight: 'bold'}}>Welcome! {userName}</p>
          <p className='headerboard'>Board</p>
          <div className='currentDate'>{formattedDate}</div>
      </div>
      <div className="dashboard-container">
        <div className="dashboard-content">
          {loading && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p>Loading board...</p>
            </div>
          )}
          {error && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
              <p style={{ marginBottom: '10px' }}>Error: {error}</p>
              <button 
                onClick={fetchUserCards} 
                style={{ 
                  marginTop: '10px', 
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}
          {!loading && !error && (
            <div className="dashboard">
              {/* Render boards dynamically */}
              {boards && boards.length > 0 ? (
                boards.map((board, index) => (
                  <div key={index}>
                    <Board title={board.title} cards={board.cards || []} />
                  </div>
                ))
              ) : (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p>No tasks yet. Create your first task to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
