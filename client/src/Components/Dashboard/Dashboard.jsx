// Dashboard.js
import React from 'react';
import './Dashboard.css'; // Dashboard ke styles ke liye CSS file ko import karein
import Board from '../Board/Board';

const Dashboard = () => {
  // Define your boards in an array
  const boards = [
    { title: 'Todo', cards: [{ title: 'Task 1' }, { title: 'Task 2' }] },
    { title: 'In Progress', cards: [{ title: 'Task 3' }, { title: 'Task 4' }] },
    { title: 'Done', cards: [] }, // Empty board example
    { title: 'Backlog', cards: [] }, // Empty board example
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        {/* Render boards dynamically from the array */}
        {boards.map((board, index) => (
          <div key={index} >
            <Board title={board.title} cards={board.cards} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
