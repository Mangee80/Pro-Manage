import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './board.css';
import Card from '../Card/card';
import { CreateNewCardForm } from '../Cardform/CreateNewCardFom'; // Import CreateNewCardForm
import collapse_all from '../../assets/icons/collapse_all.svg';

function Board({ title, cards }) {
  const isTodoBoard = title === 'Todo'; // Check if it's a todo board
  const [isFormOpen, setIsFormOpen] = useState(false);
  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };
  const [isOpenChecklists, setIsOpenChecklists] = useState(Array(cards.length).fill(false)); // State to track checklist visibility for each card

  const toggleChecklist = (index) => {
    const updatedIsOpenChecklists = [...isOpenChecklists];
    updatedIsOpenChecklists[index] = !updatedIsOpenChecklists[index];
    setIsOpenChecklists(updatedIsOpenChecklists);
  };

  const collapseAllChecklists = () => {
    setIsOpenChecklists(Array(cards.length).fill(false));
  };

  return (
    <>
      <div className="board" data-board={title}>
        
        <div className='board_header'>
          <p className='board_header_title'>{title}</p>
          
          {/* Render CreateNewCardForm only for todo board */}
          {isTodoBoard && (
            <div className="create-new-card">
              {!isFormOpen && (
                <div className="add-card-button" onClick={toggleForm}>
                  + 
                </div>
              )}
            </div>
          )}
          
          {/* Button to collapse all checklists */}
          <div className='img_container' onClick={collapseAllChecklists}>
            <img src={collapse_all} alt="Collapse all checklists" />
          </div>
        </div>

        
        <div className="cards">
          {cards.map((card, index) => (
            <Card key={index} card={card} isChecklistOpen={isOpenChecklists[index]} toggleChecklist={() => toggleChecklist(index)} />
          ))}
        </div>

      </div>
      
      {/* Render form using Portal outside the board */}
      {isTodoBoard && isFormOpen && createPortal(
        <CreateNewCardForm 
          cardData={null} 
          onCancel={() => setIsFormOpen(false)} 
          onSuccess={() => {
            setIsFormOpen(false);
            // Optionally refresh the board data here instead of reloading page
            window.location.reload();
          }}
        />,
        document.body
      )}
    </>
  );
}

export default Board;




