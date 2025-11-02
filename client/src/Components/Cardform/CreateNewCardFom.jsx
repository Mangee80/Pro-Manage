import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import DatePicker from 'react-datepicker';
import './CreateNewCardForm.css';
import del from '../../assets/icons/delete.png';
import 'react-datepicker/dist/react-datepicker.css';
import { getApiUrl } from '../../config/apiConfig';

function ChecklistItem({ item, index, handleToggleChecklistItem, handleDeleteChecklistItem, handleInputChange, error }) {
  const [isChecked, setIsChecked] = useState(item.completed);

  const handleChange = () => {
    setIsChecked(!isChecked);
    handleToggleChecklistItem(index);
  };

  return (
    <div className="checklist-item">
      <input type="checkbox" checked={isChecked} onChange={handleChange} />
      <input 
        type="text" 
        value={item.title} 
        onChange={(e) => handleInputChange(index, e.target.value)}
        className={error ? 'error' : ''}
      />
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
  const [errors, setErrors] = useState({});

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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handlePriorityClick = (color, text) => {
    setFormData({
      ...formData,
      priorityColor: color,
      priorityText: text,
    });
    // Clear error when priority is selected
    if (errors.priorityColor) {
      setErrors({
        ...errors,
        priorityColor: ''
      });
    }
  };

  const handleDueDateChange = (date) => {
    setFormData({
      ...formData,
      dueDate: date,
    });
    // Don't hide calendar, let user select or close manually
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
    // Clear error when user starts typing
    if (errors.checklists && errors.checklists[index]) {
      const updatedErrors = { ...errors };
      delete updatedErrors.checklists[index];
      setErrors(updatedErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.priorityColor || !formData.priorityText) {
      newErrors.priorityColor = 'Please select a priority';
    }
    
    // Check if any checklist items are empty
    const emptyChecklistItems = [];
    formData.checklists.forEach((item, index) => {
      if (!item.title || item.title.trim() === '') {
        emptyChecklistItems[index] = 'Checklist item cannot be empty';
      }
    });
    if (emptyChecklistItems.length > 0) {
      newErrors.checklists = emptyChecklistItems;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    try {
      const formattedDueDate = formData.dueDate ? formData.dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : null;

      const userID = localStorage.getItem('userID');
      const headers = {
        'Content-Type': 'application/json'
      };

      let response;
      if (cardData._id) {
        response = await fetch(getApiUrl(`api/card/editcards/${cardData._id}`), {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({
            ...formData,
            _id: cardData._id,  // Make sure to include the _id field for update
            dueDate: formattedDueDate
          })
        });
      } else {
        response = await fetch(getApiUrl('api/card/createcards'), {
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
      setErrors({});
      onCancel(); // Close the form
      window.location.reload(); // Reload the page
    } catch (error) {
      console.error('Error creating new card:', error);
      setErrors({ submit: 'Error creating new card. Please try again.' });
    }
  };

  const priorities = [
    { color: 'green', text: 'High Priority' },
    { color: 'SkyBlue', text: 'Medium Priority' },
    { color: 'yellow', text: 'Low Priority' }
  ];

  return (
    <>
      <div className="modal-backdrop" onClick={onCancel}></div>
      <form onSubmit={handleSubmit} className="form_Container" ref={formRef}>
        <div className="form-content-wrapper">
          <div style={{display:'flex', flexDirection:'column'}}>
            <label>Title:</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder='Enter Text Title' 
              className={errors.title ? 'error' : ''}
              required 
            />
            {errors.title && <div className="error" style={{marginTop: '5px', marginBottom: '10px'}}>{errors.title}</div>}
          </div>

          <div style={{display:'flex', flexDirection: 'column', marginBottom: '20px', marginTop: '20px'}}>
            <label style={{marginTop: '5px', marginBottom: '10px'}}>Priority:</label>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
              {priorities.map((priority, index) => (
                <div
                  key={index}
                  className={`priority-clickable-div ${formData.priorityColor === priority.color ? 'selected' : ''}`}
                  onClick={() => handlePriorityClick(priority.color, priority.text)}
                >
                  <span className="dot" style={{ backgroundColor: priority.color }}></span>
                  <span className="text">{priority.text}</span>
                </div>
              ))}
            </div>
            {errors.priorityColor && <div className="error" style={{marginTop: '10px', marginBottom: '0'}}>{errors.priorityColor}</div>}
          </div>

          <div style={{display:'flex', flexDirection: 'column', marginTop: '20px'}}>
            <label style={{ marginBottom: '10px'}}>Checklist:</label>
            <div>
              {formData.checklists.map((item, index) => (
                <div key={index}>
                  <ChecklistItem
                    item={item}
                    index={index}
                    handleToggleChecklistItem={handleToggleChecklistItem}
                    handleDeleteChecklistItem={handleDeleteChecklistItem}
                    handleInputChange={handleInputChange}
                    error={errors.checklists && errors.checklists[index]}
                  />
                  {errors.checklists && errors.checklists[index] && (
                    <div className="error" style={{marginTop: '-10px', marginBottom: '8px', fontSize: '12px'}}>
                      {errors.checklists[index]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className='addChecklist' onClick={handleAddChecklistItem}><span style={{fontSize: '23px'}}>+</span> Add New</div>
          </div>

          {errors.submit && <div className="error" style={{marginTop: '20px'}}>{errors.submit}</div>}
        </div>

        <div className="form-footer">
          <div className="due-date-chip" onClick={() => setShowCalendar(!showCalendar)}>
            <span style={{marginRight: '8px'}}>📅</span>
            {formData.dueDate ? formData.dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Due Date'}
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="cancelbtn" type="button" onClick={onCancel}>Cancel</button>
            <button className="createbtn" type="submit">{cardData._id ? 'Edit Card' : 'Create Card'}</button>
          </div>
        </div>
      
        {showCalendar && ReactDOM.createPortal(
          <div className="calendar-backdrop" onClick={() => setShowCalendar(false)}>
            <div className="calendar-portal-container" onClick={(e) => e.stopPropagation()}>
              <DatePicker
                selected={formData.dueDate}
                onChange={(date) => {
                  handleDueDateChange(date);
                  setShowCalendar(false);
                }}
                inline
              />
            </div>
          </div>,
          document.body
        )}
      </form>
    </>
  );
};