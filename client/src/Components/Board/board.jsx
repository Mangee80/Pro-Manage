import React from 'react';
import './board.css';
import CollapseAll from '../../assets/icons/collapse_all.svg';

export const Boards = () => {
  return (
    <div className={styles.board}>
        <div className={styles.board_header}>
            <p className={styles.board_header_title}>
            {/* {props.board?.title} */} Todo
            </p>
            <div className={styles.img_container}>
                <img src={CollapseAll} alt="SVG Image" />
            </div>          
        </div>
      <div className="board_cards custom-scroll">
        {/* {props.board?.cards?.map((item) => (
          <Card
            key={item.id}
            card={item}
            boardId={props.board.id}
          />
        ))} */}
      </div>
    </div>
  )
}



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
