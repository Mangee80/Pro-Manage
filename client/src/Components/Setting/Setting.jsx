import React, { useState } from 'react';
import styles from './Styles.module.css';

const UpdatePassword = () => {
  const [name, setname] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      
      const response = await fetch(`https://pro-manage-one.vercel.app/api/auth/updatePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          oldPassword,
          newPassword
        }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('An error occurred while updating the password.');
    }
  };
  

  return (
    <div>
      <p className={styles.Settings}>Setting</p>
      <div className={styles['update-password-container']}>
        <h2 className={styles['update-password-title']}>Update Password</h2>
        <form onSubmit={handleSubmit} className={styles['update-password-form']}>
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Name:</label>
            <input type="text" value={name} onChange={(e) => setname(e.target.value)} className={styles['form-input']} />
          </div>
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>Old Password:</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={styles['form-input']} />
          </div>
          <div className={styles['form-group']}>
            <label className={styles['form-label']}>New Password:</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={styles['form-input']} />
          </div>
          <button type="submit" className={styles.btn}>Update Password</button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default UpdatePassword;
