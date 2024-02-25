// Board.js
import React, { useState } from 'react';
import './board.css';
import CreateNewCardForm from '../Cardform/CreateNewCardForm';

function Board({ title, cards, renderCreateNewCard }) {
  const [newCardTitle, setNewCardTitle] = useState(""); // State to track new card title
  const [isFormOpen, setIsFormOpen] = useState(false); // State to track form visibility

  // Function to handle form submission and create new card
  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    // Add the new card to the cards array
    cards.push({ title: newCardTitle });
    setNewCardTitle(""); // Clear the input field after submission
    setIsFormOpen(false); // Close the form after submission
  };

  return (
    <div className="board">
      <h2>{title}</h2>
      {/* Display existing cards */}
      <div className="cards">
        {cards.map((card, index) => (
          <div key={index} className="card">
            <h3>{card.title}</h3>
            {/* Additional card content goes here */}
          </div>
        ))}
      </div>
      {/* Render create new card form only if renderCreateNewCard prop is true */}
      {renderCreateNewCard && (
        <div className="create-new-card">
          {isFormOpen ? (
            <CreateNewCardForm onCreate={(title) => {
              cards.push({ title });
              setIsFormOpen(false);
            }} />
          ) : (
            <div onClick={() => setIsFormOpen(true)}>Create New Card</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Board;





// import CollapseAll from '../../assets/icons/collapse_all.svg';

// <div className={styles.board_header}>
//             <p className={styles.board_header_title}>
//             {/* {props.board?.title} */} Todo
//             </p>
//             <div className={styles.img_container}>
//                 <img src={CollapseAll} alt="SVG Image" />
//             </div>          
//         </div>
//       <div className="board_cards custom-scroll">
//         {/* {props.board?.cards?.map((item) => (
//           <Card
//             key={item.id}
//             card={item}
//             boardId={props.board.id}
//           />
//         ))} */}
//       </div>

{/* <div
                    className="board_header_title_more"
                    onClick={() => setShowDropdown(true)}
                    >
                    <MoreHorizontal />
                    {showDropdown && (
                        <Dropdown
                        class="board_dropdown"
                        onClose={() => setShowDropdown(false)}
                        >
                        <p onClick={() => props.removeBoard()}>Delete Board</p>
                        </Dropdown>
                    )}
                    </div> */}
