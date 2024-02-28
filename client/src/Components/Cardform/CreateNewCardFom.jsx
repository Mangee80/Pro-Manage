import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import './CreateNewCardForm.css';
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
      <button onClick={() => handleDeleteChecklistItem(index)}>Delete</button>
    </div>
  );
}

export const CreateNewCardForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    priorityColor: '',
    priorityText: '',
    checklists: [],
    dueDate: null,
    tag: 'Todo',
  });
  const [error, setError] = useState('');
  const [newItemText, setNewItemText] = useState('');

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

      const token = localStorage.getItem('token');
      const userID = localStorage.getItem('userID');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      };

      const response = await fetch('http://localhost:5000/api/card/createcards', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          ...formData,
          dueDate: formattedDueDate,
          createdBy: userID
        })
      });

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
    <form onSubmit={handleSubmit} className="form_Container">
      <div style={{display:'flex', flexDirection:'column'}}>
        <label>Title:</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder='Enter Text Title' required />
      </div>

      <div style={{display:'flex', flexDirection:''}}>
        <label style={{marginTop: '7px', marginRight: '10px'}}>Priority:</label>
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

      <div style={{display:'flex', flexDirection: 'column', marginTop: '18px'}}>
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

      <label>Due Date:</label>
      <DatePicker selected={formData.dueDate} onChange={handleDueDateChange} />

      {error && <div className="error">{error}</div>}

      <button type="submit">Create Card</button>
    </form>
  );
};
