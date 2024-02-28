import {React, useState, useEffect} from 'react';
import './card.css';

const Card = ({ card, isChecklistOpen, toggleChecklist }) => {
  const [checklistItems, setChecklistItems] = useState(card.checklists);

  const [totalCompleted, setTotalCompleted] = useState(0);

   const handleCheckboxChange = async (index) => {
    const updatedChecklistItems = [...checklistItems];
    updatedChecklistItems[index].completed = !updatedChecklistItems[index].completed;
    setChecklistItems(updatedChecklistItems);

    // Update backend here
    try {
      const response = await fetch(`http://localhost:5000/api/card/updateChecklistItem/${card._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checklistItems: updatedChecklistItems }),
      });
      if (!response.ok) {
        throw new Error('Failed to update checklist item');
      }
      // If successful, do something
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };
  

  // Update totalCompleted whenever the card prop changes
  useEffect(() => {
    // Calculate the total number of completed checklist items
    const completedCount = card.checklists.reduce((acc, checklist) => {
      return acc + (checklist.completed ? 1 : 0);
    }, 0);
    // Update the state with the new count
    setTotalCompleted(completedCount);
  }, [handleCheckboxChange]);

  const handleBoardChipClick = async (newTag) => {
        try {
          const response = await fetch(`http://localhost:5000/api/card/updatetag/${card._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tag: newTag }),
          });
          if (!response.ok) {
            throw new Error('Failed to update card tag');
          }
          // If successful, refresh the page
          window.location.reload();
        } catch (error) {
          console.error('Error updating card tag:', error);
        }
    };
    
    // Array of board names
    
    const boardNames = ['Todo', 'In Progress', 'Done', 'Backlog'];

    const checklistSize = card.checklists.length;

    

    return (
    <div className="card">
      {/* Render priority */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div className="priority" style={{ backgroundColor: card.priorityColor }}></div>
        <p>{card.priorityText}</p>
      </div>

      {/* Render title */}
      <p className='cardTitle' style={{ fontSize: '23px', fontWeight: '800' }}>{card.title}</p>


      <p className='checkHeder'>Checklist ({totalCompleted}/{checklistSize})</p>

      {/* Toggle button for checklists */}
      <div className="toggle-checklists" onClick={toggleChecklist}>
        {isChecklistOpen ? (
          <span>&#9650;</span> 
        ) : (
          <span>&#9660;</span>
        )}
      </div>

      {/* Render checklists */}
      <ul className={isChecklistOpen ? "checklists visible" : "checklists"}>
        {checklistItems.map((item, index) => (
          <li key={index}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => handleCheckboxChange(index)}
            />
            <span style={{fontFamily: 'var(--font-dm-sans)'}}>{item.title}</span>
          </li>
        ))}
      </ul>

      {/* Render due date chip */}
      <div className="chip due-date">{card.dueDate}</div>

      {/* Render board chips */}
      <div className="board-chips">
        {boardNames.map((boardName) => (
            // Exclude current board chip
            card.tag !== boardName && (
              <div
                key={boardName}
                className="chip board-chip"
                onClick={() => handleBoardChipClick(boardName)}
              >
                {boardName}
              </div>
            )
        ))}
      </div>
    </div>
  );
};

export default Card;
