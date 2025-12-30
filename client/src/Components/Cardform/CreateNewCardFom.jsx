import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import './CreateNewCardForm.css';
import del from '../../assets/icons/delete.png';
import 'react-datepicker/dist/react-datepicker.css';
import { getApiUrl } from '../../config/apiConfig';
import { getAccessToken, getUserInfo } from '../../utils/authUtils';

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

export const CreateNewCardForm = ({ cardData = {}, onCancel, onSuccess }) => {
  // Helper function to parse due date string (format: "DD MMM" or "DD MMM YYYY")
  const parseDueDate = (dueDateString) => {
    if (!dueDateString) return null;
    
    try {
      // If it's already a Date object or ISO string
      if (dueDateString instanceof Date) {
        return dueDateString;
      }
      
      // Parse string format like "15 Jan" or "15 Jan 2024"
      const parts = dueDateString.trim().split(' ');
      if (parts.length < 2) return null;
      
      const day = parseInt(parts[0]);
      if (isNaN(day)) return null;
      
      const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const month = monthMap[parts[1]];
      if (month === undefined) return null;
      
      const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
      const parsedDate = new Date(year, month, day);
      
      // Validate the date
      if (isNaN(parsedDate.getTime())) return null;
      
      return parsedDate;
    } catch (error) {
      console.error('Error parsing due date:', error);
      return null;
    }
  };

  // Initialize form data properly - handle null/undefined cardData
  const initialFormData = {
    title: cardData?.title || '',
    priorityColor: cardData?.priorityColor || '',
    priorityText: cardData?.priorityText || '',
    checklists: cardData?.checklists || [],
    dueDate: parseDueDate(cardData?.dueDate),
    tag: cardData?.tag || 'Todo',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef(null);

  // Memoize onCancel to prevent unnecessary re-renders
  const handleCancel = useCallback(() => {
    if (onCancel) onCancel();
  }, [onCancel]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore clicks inside the form
      if (formRef.current && formRef.current.contains(event.target)) {
        return;
      }

      // Ignore clicks inside the calendar portal so that picking a date
      // does NOT close the whole form
      const isInsideCalendar = event.target.closest('.calendar-portal-container');
      if (isInsideCalendar) {
        return;
      }

      handleCancel();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleCancel]);


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
    
    if (isSubmitting) return; // Prevent double submission
    
    // Validation
    const newErrors = {};
    
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.priorityColor || !formData.priorityText) {
      newErrors.priorityColor = 'Please select a priority';
    }
    
    // Filter out empty checklist items and validate remaining ones
    const validChecklists = formData.checklists.filter(item => item.title && item.title.trim() !== '');
    const emptyChecklistItems = [];
    
    // Only validate if there are checklist items
    if (formData.checklists.length > 0) {
      formData.checklists.forEach((item, index) => {
        if (!item.title || item.title.trim() === '') {
          emptyChecklistItems[index] = 'Checklist item cannot be empty';
        }
      });
      if (emptyChecklistItems.length > 0) {
        newErrors.checklists = emptyChecklistItems;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    
    try {
      // Format due date properly
      const formattedDueDate = formData.dueDate 
        ? formData.dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) 
        : null;

      // Get authentication token
      const token = getAccessToken();
      const userInfo = getUserInfo();
      const userID = userInfo?.userId || userInfo?.id || localStorage.getItem('userID');

      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Prepare request body with filtered checklists
      const requestBody = {
        ...formData,
        checklists: validChecklists, // Use filtered checklists
        dueDate: formattedDueDate
      };

      let response;
      const isEditMode = cardData?._id;

      if (isEditMode) {
        requestBody._id = cardData._id;
        response = await fetch(getApiUrl(`api/card/editcards/${cardData._id}`), {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(requestBody)
        });
      } else {
        requestBody.createdBy = userID;
        response = await fetch(getApiUrl('api/card/createcards'), {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody)
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${isEditMode ? 'updating' : 'creating'} card`);
      }

      const responseData = await response.json();
      console.log(`Card ${isEditMode ? 'updated' : 'created'}:`, responseData);
      
      // Reset form only if creating new card
      if (!isEditMode) {
        setFormData({
          title: '',
          priorityColor: '',
          priorityText: '',
          checklists: [],
          dueDate: null,
          tag: 'Todo',
        });
      }
      
      setErrors({});
      
      // Call success callback if provided, otherwise just close
      if (onSuccess) {
        onSuccess(responseData);
      }
      
      handleCancel(); // Close the form
      
      // Only reload if no callback provided (for backward compatibility)
      if (!onSuccess) {
        window.location.reload();
      }
    } catch (error) {
      console.error(`Error ${cardData?._id ? 'updating' : 'creating'} card:`, error);
      setErrors({ 
        submit: error.message || `Error ${cardData?._id ? 'updating' : 'creating'} card. Please try again.` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorities = [
    { color: 'green', text: 'High Priority' },
    { color: 'SkyBlue', text: 'Medium Priority' },
    { color: 'yellow', text: 'Low Priority' }
  ];

  return (
    <>
      <div className="modal-backdrop" onClick={handleCancel}></div>
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
            <div className='addChecklist' onClick={handleAddChecklistItem}>
              <span style={{fontSize: '23px'}}>+</span> Add New
            </div>
          </div>

          {errors.submit && <div className="error" style={{marginTop: '20px'}}>{errors.submit}</div>}
        </div>

        <div className="form-footer">
          <div className="due-date-chip" onClick={() => setShowCalendar(!showCalendar)}>
            <span style={{marginRight: '8px'}}>📅</span>
            {formData.dueDate ? formData.dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Due Date'}
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              className="cancelbtn" 
              type="button" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              className="createbtn" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (cardData?._id ? 'Updating...' : 'Creating...') 
                : (cardData?._id ? 'Update Card' : 'Create Card')
              }
            </button>
          </div>
        </div>
      
        {showCalendar && createPortal(
          <div className="calendar-backdrop" onClick={() => setShowCalendar(false)}>
            <div className="calendar-portal-container" onClick={(e) => e.stopPropagation()}>
              <DatePicker
                selected={formData.dueDate}
                onChange={(date) => {
                  handleDueDateChange(date);
                  setShowCalendar(false);
                }}
                inline
                // Allow past dates in edit mode, but prevent for new cards
                minDate={cardData?._id ? null : new Date()}
                dateFormat="dd MMM yyyy"
              />
            </div>
          </div>,
          document.body
        )}
      </form>
    </>
  );
};