import React, { useState } from 'react';
import styles from './Styles.module.css';

const UpdatePassword = () => {
  const [email, setemail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      
      const response = await fetch(`https://5931-2409-408c-8516-f0ca-e423-274-1fbe-bf30.ngrok-free.app/api/auth/updatePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
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
    <div className={styles['update-password-container']}>
      <h2 className={styles['update-password-title']}>Update Password</h2>
      <form onSubmit={handleSubmit} className={styles['update-password-form']}>
        <div className={styles['form-group']}>
          <label className={styles['form-label']}>Email:</label>
          <input type="email" value={email} onChange={(e) => setemail(e.target.value)} className={styles['form-input']} />
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
  );
};

export default UpdatePassword;
