import {React, useState, useEffect} from 'react';
import './card.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CreateNewCardForm } from '../Cardform/CreateNewCardFom'

const Card = ({ card, isChecklistOpen, toggleChecklist }) => {
  const [checklistItems, setChecklistItems] = useState(card.checklists);
  const [showDropdown, setShowDropdown] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  const handleEdit = () => {
    // Set isEditing to true when Edit is clicked
    setIsEditing(true);
  };
  const handleShare = () => {
    // Generate unique link for the card (replace 'cardId' with actual unique identifier for the card)
    const shareLink = `http://localhost:3000/card/${card._id}`;

    // Copy link to clipboard
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        // Show toast message indicating link has been copied
        toast.success('Link copied to clipboard');
      })
      .catch((error) => {
        console.error('Error copying link to clipboard:', error);
        // Show toast message for error, if needed
      });
  };

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

      {/* Dropdown menu */}
      <div className="dropdown-container" onClick={toggleDropdown}>
        &#8942; {/* Three dots icon representing dropdown */}
        {showDropdown && (
          <div className="dropdown-content">
            <div className="dropdown-option" onClick={handleShare}>
              Share
            </div>
            <div className="dropdown-option" onClick={handleEdit}>
              Edit
            </div>
            {/* Other dropdown options: Delete, etc. */}
          </div>
        )}
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

      <div style={{display: 'flex',gap: '5px', marginTop: '30px'}}>
        
          {/* Render due date chip */}
          <div className="dueDateChip">{card.dueDate}</div>

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

      {isEditing && (
        <CreateNewCardForm cardData={card} onCancel={() => setIsEditing(false)} /> // Show CreateNewCardForm when editing
      )}
    </div>
  );
};

export default Card;
