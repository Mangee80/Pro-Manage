import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams hook
import './cardDetails.css';
import codesandboxes from '../assets/icons/codesandbox.png';

export const CardDetails = () => {
  const { id } = useParams(); // Get the id parameter from the URL
  const [cardDetails, setCardDetails] = useState(null);

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const response = await fetch(`https://pro-manage-one.vercel.app/api/card/publiccard/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch card details');
        }
        const data = await response.json();
        setCardDetails(data);
      } catch (error) {
        console.error('Error fetching card details:', error);
      }
    };

    fetchCardDetails();
  }, [id]);

  // Check if cardDetails is null before accessing its properties
  if (!cardDetails) {
    return null; // Render nothing if cardDetails is null
  }

  // Calculate the total number of completed checklist items
  const completedCount = cardDetails.checklists.reduce((acc, checklist) => {
    return acc + (checklist.completed ? 1 : 0);
  }, 0);

  const checklistSize = cardDetails.checklists.length;

  return (
    <>
      <div className='Headings'>
        <div className='img_container'>
          <img src={codesandboxes} alt="Pro Manage Logo"/>
        </div>
        <p style={{ marginTop: '4px', fontFamily: 'Poppins, sans-serif', fontWeight: '750', fontSize: '18.8px'}}>Pro Manage</p>
      </div>
      <div className="card-details">
        <div>
          <div style={{ display: 'flex', gap: '7px' }}>
            <div className="priority" style={{ backgroundColor: cardDetails.priorityColor }}></div>
            <p style={{ fontSize: '14.7px'}}>{cardDetails.priorityText}</p>
          </div>
          <p className='cardTitle' style={{ fontSize: '23px', fontWeight: '800' }}>{cardDetails.title}</p>

          <p className='checkHeder'>Checklist ({completedCount}/{checklistSize})</p>

          <ul className="checklistins">
            {/* Map over checklist items */}
            {cardDetails.checklists.map((item, index) => (
              <li key={index}>
                <input type="checkbox" checked={item.completed} readOnly />
                <span style={{fontFamily: 'var(--font-dm-sans)'}}>{item.title}</span>
              </li>
            ))}
          </ul>
          <div className="due-date">Due Date: {cardDetails.dueDate}</div>
        </div>
      </div>
    </>
  );
};
