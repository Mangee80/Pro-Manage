import React, { useState } from 'react';
import styles from './Login.module.css';
import { useNavigate } from "react-router";

// Icons
import { HiOutlineMail } from "react-icons/hi";
import { FiLock } from "react-icons/fi";

export const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
  
      setIsLoading(true);
      try {
        const response = await fetch("https://pro-manage-one.vercel.app/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        const responseData = await response.json();
        window.localStorage.setItem("user", responseData.user);
        window.localStorage.setItem("userID", responseData.userId);
        navigate("/Home");
  
      } catch (error) {
        alert("There was a problem with the request, please try again");
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
  
    const validateForm = (data) => {
      let errors = {};
      if (!data.email.trim()) {
        errors.email = "Please enter your email";
      }
      if (!data.password.trim()) {
        errors.password = "Please enter your password";
      }
      return errors;
    };
  
    return (
      <div className={styles.container}>
        <h1 className={styles.h1}>Login</h1>

        <div className={styles.inputWrapper}>
          <HiOutlineMail className={styles.iconStyle} />
          <input 
            className={styles.input}  
            name="email" 
            value={formData.email}  
            onChange={handleChange} 
            type="email" 
            placeholder="Email : jhon@123mail.com"
          />
        </div>
        {errors.email && <p className={styles.error}>{errors.email}</p>}

        <div className={styles.inputWrapper}>
          <FiLock className={styles.iconStyle} />
          <input 
            className={styles.input} 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            type="password" 
            placeholder="Password : jhon123"
          />
        </div>
        {errors.password && <p className={styles.error}>{errors.password}</p>}

        <button 
          onClick={handleSubmit} 
          className={styles.button}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <span>Logging in...</span>
            </div>
          ) : (
            "Log in"
          )}
        </button>
        <p className={styles.footer}>Have no account yet?</p>
        <button onClick={() => navigate("/register")} className={styles.regbutton}>Register</button>
      </div>
    );
};