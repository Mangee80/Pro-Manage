import React, { useState } from 'react';
import styles from './Login.module.css';
import { useNavigate } from "react-router";
import { setTokens } from '../../utils/authUtils';
import { getApiUrl } from '../../config/apiConfig';

// Icons
import { HiOutlineMail } from "react-icons/hi";
import { FiLock } from "react-icons/fi";

export const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      // Clear login error when user types
      if (loginError) setLoginError("");
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
  
      setIsLoading(true);
      setLoginError("");
      
      try {
        const response = await fetch(getApiUrl('api/auth/login'), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        const responseData = await response.json();
  
        if (!response.ok) {
          throw new Error(responseData.message || responseData.error || "Login failed");
        }
  
        if (responseData.status === 'SUCCESS') {
          // Store JWT tokens and user info
          setTokens(
            responseData.accessToken, 
            responseData.refreshToken, 
            responseData.user
          );
          
          // Also store userID for backward compatibility
          window.localStorage.setItem("userID", responseData.user.id);
          
          navigate("/Home");
        } else {
          setLoginError(responseData.message || "Login failed");
        }
  
      } catch (error) {
        setLoginError(error.message || "There was a problem with the request, please try again");
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

        {loginError && (
          <div className={styles.loginError}>
            {loginError}
          </div>
        )}

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