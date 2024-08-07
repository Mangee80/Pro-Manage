import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import './CreateNewCardForm.css';
import del from '../../assets/icons/delete.png';
import 'react-datepicker/dist/react-datepicker.css';

function ChecklistItem({ item, index, handleToggleChecklistItem, handleDeleteChecklistItem, handleInputChange }) {
  const [isChecked, setIsChecked] = useState(item.completed);

  const handleChange = () => {
    setIsChecked(!isChecked);
    handleToggleChecklistItem(index);
  };

  return (
    <div className="checklist-item">
      <input type="checkbox" checked={isChecked} onChange={handleChange} />
      <input type="text" value={item.title} onChange={(e) => handleInputChange(index, e.target.value)} />
      <div className="deleteDiv" onClick={() => handleDeleteChecklistItem(index)}>
        <img src={del} alt="delete" />
      </div>
    </div>
  );
}

export const CreateNewCardForm = ({ cardData, onCancel }) => {
  const [formData, setFormData] = useState({
    title: cardData.title || '',
    priorityColor: cardData.priorityColor || '',
    priorityText: cardData.priorityText || '',
    checklists: cardData.checklists || [],
    dueDate: cardData.dueDate ? new Date(cardData.dueDate) : null,
    tag: cardData.tag || 'Todo',
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [error, setError] = useState('');

  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePriorityClick = (color, text) => {
    setFormData({
      ...formData,
      priorityColor: color,
      priorityText: text,
    });
  };

  const handleDueDateChange = (date) => {
    setFormData({
      ...formData,
      dueDate: date,
    });
    setShowCalendar(false); // Hide the calendar after selecting a date
  };

  const handleAddChecklistItem = () => {
    setFormData({
      ...formData,
      checklists: [...formData.checklists, { title: '', completed: false }], // Add new item with empty title
    });
  };

  const handleToggleChecklistItem = (index) => {
    const updatedItems = [...formData.checklists];
    updatedItems[index].completed = !updatedItems[index].completed;
    setFormData({
      ...formData,
      checklists: updatedItems,
    });
  };

  const handleDeleteChecklistItem = (index) => {
    const updatedItems = [...formData.checklists];
    updatedItems.splice(index, 1);
    setFormData({
      ...formData,
      checklists: updatedItems,
    });
  };

  const handleInputChange = (index, newValue) => {
    const updatedChecklists = [...formData.checklists];
    updatedChecklists[index].title = newValue;
    setFormData({
      ...formData,
      checklists: updatedChecklists,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title || !formData.priorityColor || !formData.priorityText) {
        setError('Please fill in all required fields');
        return;
      }

      const formattedDueDate = formData.dueDate ? formData.dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : null;

      const userID = localStorage.getItem('userID');
      const headers = {
        'Content-Type': 'application/json'
      };

      let response;
      if (cardData._id) {
        response = await fetch(`http://localhost:5000/api/card/editcards/${cardData._id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({
            ...formData,
            _id: cardData._id,  // Make sure to include the _id field for update
            dueDate: formattedDueDate
          })
        });
      } else {
        response = await fetch('https://pro-manage-one.vercel.app/api/card/createcards', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            ...formData,
            dueDate: formattedDueDate,
            createdBy: userID
          })
        });
      }

      if (!response.ok) {
        throw new Error('Error creating new card');
      }

      const responseData = await response.json();
      console.log('New card created:', responseData);
      setFormData({
        title: '',
        priorityColor: '',
        priorityText: '',
        checklists: [],
        dueDate: null,
        tag: 'Todo',
      });
      setError('');
      onCancel(); // Close the form
      window.location.reload(); // Reload the page
    } catch (error) {
      console.error('Error creating new card:', error);
      setError('Error creating new card. Please try again.');
    }
  };

  const priorities = [
    { color: 'green', text: 'High Priority' },
    { color: 'SkyBlue', text: 'Medium Priority' },
    { color: 'yellow', text: 'Low Priority' }
  ];

  return (
    <form onSubmit={handleSubmit} className="form_Container" ref={formRef}>
      <div style={{display:'flex', flexDirection:'column'}}>
        <label>Title:</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder='Enter Text Title' required />
      </div>

      <div style={{display:'flex'}}>
        <label style={{marginTop: '5px', marginRight: '8px'}}>Priority:</label>
        <div>
          {priorities.map((priority, index) => (
            <div
              key={index}
              className="priority-clickable-div"
              onClick={() => handlePriorityClick(priority.color, priority.text)}
            >
              <span className="dot" style={{ backgroundColor: priority.color }}></span>
              <span className="text">{priority.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex', flexDirection: 'column', marginTop: '18px', maxHeight: '170px', overflowY:'auto', overflowX: 'hidden'}}>
        <label style={{ marginBottom: '10px'}}>Checklist:</label>
        <div>
          {formData.checklists.map((item, index) => (
            <ChecklistItem
              key={index}
              item={item}
              index={index}
              handleToggleChecklistItem={handleToggleChecklistItem}
              handleDeleteChecklistItem={handleDeleteChecklistItem}
              handleInputChange={handleInputChange}
            />
          ))}
        </div>
      </div>
      <div>
        <div className='addChecklist' onClick={handleAddChecklistItem}><span style={{fontSize: '23px'}}>+</span> Add New</div>
      </div>

      <div style={{ position: 'relative' }}>
        <div className="custom-input" onClick={() => setShowCalendar(!showCalendar)}>
          {formData.dueDate ? formData.dueDate.toDateString() : 'Select Due Date'}
        </div>
        {showCalendar && (
          <div className="calendar-container">
            <DatePicker
              selected={formData.dueDate}
              onChange={handleDueDateChange}
              inline
            />
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <button className="cancelbtn" type="button" onClick={onCancel}>Cancel</button>
      <button className="createbtn" type="submit">{cardData._id ? 'Edit Card' : 'Create Card'}</button>
    </form>
  );
};