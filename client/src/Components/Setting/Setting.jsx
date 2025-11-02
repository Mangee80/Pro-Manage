import React, { useState, useEffect } from 'react';
import styles from './Styles.module.css';
import { GoEye, GoEyeClosed, GoPerson, GoLock } from "react-icons/go";
import { getApiUrl } from '../../config/apiConfig';

const Settings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    oldPassword: '',
    newPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user data when component mounts
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userID = localStorage.getItem('userID');
      if (userID) {
        // You can fetch user data here if needed
        // For now, we'll use placeholder data
        setFormData(prev => ({
          ...prev,
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || ''
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const userID = localStorage.getItem('userID');
      if (!userID) {
        setMessage('User not authenticated. Please login again.');
        return;
      }

      // Check if at least one field is filled
      const hasChanges = formData.name || formData.email || formData.oldPassword || formData.newPassword;
      if (!hasChanges) {
        setMessage('Please fill at least one field to update.');
        return;
      }

      // If password is being updated, both old and new password are required
      if (formData.oldPassword || formData.newPassword) {
        if (!formData.oldPassword || !formData.newPassword) {
          setMessage('Both old and new password are required for password update.');
          return;
        }
      }

      const response = await fetch(getApiUrl('api/auth/updateSettings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID,
          ...formData
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Settings updated successfully!');
        // Update local storage if name or email was changed
        if (formData.name) {
          localStorage.setItem('userName', formData.name);
        }
        if (formData.email) {
          localStorage.setItem('userEmail', formData.email);
        }
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          oldPassword: '',
          newPassword: ''
        }));
      } else {
        setMessage(data.message || 'Failed to update settings.');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('An error occurred while updating settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.settingsTitle}>Settings</h1>
      
      <form onSubmit={handleSubmit} className={styles.settingsForm}>
        {/* First Name Field */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <GoPerson className={styles.inputIcon} />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
              className={styles.formInput}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <GoLock className={styles.inputIcon} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Update Email"
              className={styles.formInput}
            />
          </div>
        </div>

        {/* Second Name Field (Duplicate as per screenshot) */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <GoPerson className={styles.inputIcon} />
            <input
              type="text"
              name="name2"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
              className={styles.formInput}
            />
          </div>
        </div>

        {/* Old Password Field */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <GoLock className={styles.inputIcon} />
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
              placeholder="Old Password"
              className={styles.formInput}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? <GoEyeClosed /> : <GoEye />}
            </button>
          </div>
        </div>

        {/* New Password Field */}
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <GoLock className={styles.inputIcon} />
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="New Password"
              className={styles.formInput}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <GoEyeClosed /> : <GoEye />}
            </button>
          </div>
        </div>

        {/* Update Button */}
        <button 
          type="submit" 
          className={styles.updateButton}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>

      {/* Message Display */}
      {message && (
        <div className={`${styles.message} ${message.includes('successfully') ? styles.successMessage : styles.errorMessage}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Settings;
