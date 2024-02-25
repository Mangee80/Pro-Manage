import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'CreateNewCardForm.css';
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles

// PriorityClickableDiv Component
// const PriorityClickableDiv = ({ color, text, onClick }) => {
//   return (
//     <div className="priority-clickable-div" onClick={() => onClick(color, text)}>
//       <span className="dot" style={{ backgroundColor: color }}></span>
//       <span className="text">{text}</span>
//     </div>
//   );
// };

function ChecklistItem({ item, index, handleToggleChecklistItem, handleDeleteChecklistItem }) {
  const [isChecked, setIsChecked] = useState(item.completed);

  const handleChange = () => {
    setIsChecked(!isChecked);
    handleToggleChecklistItem(index);
  };

  return (
    <div className="checklist-item">
      <input type="checkbox" checked={isChecked} onChange={handleChange} />
      <input type="text" value={item.title} readOnly />
      <button onClick={() => handleDeleteChecklistItem(index)}>Delete</button>
    </div>
  );
}

function CreateCardForm() {
  const [formData, setFormData] = useState({
    title: '',
    priorityColor: '',
    priorityText: '',
    checklists: [],
    dueDate: null, // Initialize dueDate as null
    tag: 'Todo', // Default to 'Todo'
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
    if (newItemText.trim() !== '') {
      setFormData({
        ...formData,
        checklists: [...formData.checklists, { title: newItemText, completed: false }],
      });
      setNewItemText('');
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if all required fields are filled
      if (!formData.title || !formData.priorityColor || !formData.priorityText) {
        setError('Please fill in all required fields');
        return;
      }

      // Format due date as "DD MMM" (e.g., "18 Feb")
      const formattedDueDate = formData.dueDate ? formData.dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : null;

      // Send POST request to backend API to create a new card
      const response = await fetch.post('/api/cards', {
        ...formData,
        dueDate: formattedDueDate, // Send formatted due date to backend
      });
      console.log('New card created:', response.data);
      // Reset form data after successful submission
      setFormData({
        title: '',
        priorityColor: '',
        priorityText: '',
        checklists: [],
        dueDate: null,
        tag: 'Todo', // Reset tag to default
      });
      setError('');
    } catch (error) {
      console.error('Error creating new card:', error);
      setError('Error creating new card. Please try again.');
    }
  };

  // Priority options
  const priorities = [
    { color: 'red', text: 'High' },
    { color: 'yellow', text: 'Medium' },
    { color: 'green', text: 'Low' }
  ];

  return (
    <form onSubmit={handleSubmit}>
      <label>Title:</label>
      <input type="text" name="title" value={formData.title} onChange={handleChange} required />

      <label>Priority:</label>
      <div>
        {/* Render PriorityClickableDiv components dynamically */}
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

      <label>Due Date:</label>
      <DatePicker selected={formData.dueDate} onChange={handleDueDateChange} />

      <label>Checklist:</label>
      <div>
        {formData.checklists.map((item, index) => (
          <ChecklistItem
            key={index}
            item={item}
            index={index}
            handleToggleChecklistItem={handleToggleChecklistItem}
            handleDeleteChecklistItem={handleDeleteChecklistItem}
          />
        ))}
      </div>
      <div>
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add new item"
        />
        <button onClick={handleAddChecklistItem}>+</button>
      </div>

      {/* Display error message */}
      {error && <div className="error">{error}</div>}

      <button type="submit">Create Card</button>
    </form>
  );
}

export default CreateCardForm;
