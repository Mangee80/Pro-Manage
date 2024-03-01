import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams hook
import './cardDetails.css';

export const CardDetails = () => {
  const { id } = useParams(); // Get the id parameter from the URL
  const [cardDetails, setCardDetails] = useState(null);

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/card/publiccard/${id}`);
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

  return (
    <div className="card-details">
      {cardDetails && (
        <div>
          <h2>{cardDetails.title}</h2>
          <ul className="checklist">
            {/* Map over checklist items */}
            {cardDetails.checklists && cardDetails.checklists.map((item, index) => (
              <li key={index}>
                <input type="checkbox" checked={item.completed} readOnly />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
          <div className="due-date">Due Date: {cardDetails.dueDate}</div>
        </div>
      )}
    </div>
  );
};
