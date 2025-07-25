import React, { useState } from 'react';
import styles from './Signup.module.css';
import { useNavigate } from "react-router";

// Icons
import { BiUser } from "react-icons/bi";
import { HiOutlineMail } from "react-icons/hi";
import { FiLock } from "react-icons/fi";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("https://pro-manage-one.vercel.app/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const responseData = await response.json();
      window.localStorage.setItem("user", responseData.user);
      window.localStorage.setItem("name", responseData.name);
      navigate("/");

    } catch (error) {
      alert("There was a problem with the request, please try again");
    }
  };

  const validateForm = (data) => {
    let errors = {};
    if (!data.name.trim()) errors.name = "Please enter your name";
    if (!data.email.trim()) errors.email = "Please enter your email";
    if (!data.password.trim()) errors.password = "Please enter your password";
    if (data.password !== data.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Register</h1>

      <div className={styles.inputWrapper}>
        <BiUser className={styles.iconStyle} />
        <input 
          className={styles.input} 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          type="text" 
          placeholder="Name"
        />
      </div>
      {errors.name && <p className={styles.error}>{errors.name}</p>}

      <div className={styles.inputWrapper}>
        <HiOutlineMail className={styles.iconStyle} />
        <input 
          className={styles.input}  
          name="email" 
          value={formData.email}  
          onChange={handleChange} 
          type="email" 
          placeholder="Email"
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
          placeholder="Password"
        />
      </div>
      {errors.password && <p className={styles.error}>{errors.password}</p>}

      <div className={styles.inputWrapper}>
        <FiLock className={styles.iconStyle} />
        <input 
          className={styles.input} 
          name="confirmPassword" 
          value={formData.confirmPassword} 
          onChange={handleChange} 
          type="password" 
          placeholder="Confirm Password"
        />
      </div>
      {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}

      <button onClick={handleSubmit}  className={styles.button}>Register</button>
      <p className={styles.footer}>Have an account ?</p>
      <button onClick={() => navigate("/")}  className={styles.regbutton}>Log In</button>
    </div>
  );
};