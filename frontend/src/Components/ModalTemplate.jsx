import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; 
import styles from './ModalTemplate.module.css'; 
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../actions";
import Loader from "./Loader";
import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";

const ModalTemplate = ({ isOpen, onClose, formType, setModalType }) => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const isLoading = useSelector((state) => state.isLoading);
  
  
  const validate = () => {
    const newErrors = {};
    if (!username) {
      newErrors.username = "Username is required";
    }

    if (!password) {
      newErrors.password = "Weak password";
      toast.error("Weak password", { position: "top-right" });
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validate();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      const toastId = toast.loading("Processing..."); 
      dispatch(setLoading(true));
      
      try {
        let response;
        if (formType === 'signup') {
          response = await axios.post('http://localhost:3000/api/v1/signup', {
            username,
            password,
          });

          if (response.data.success) {
            toast.success("Account created successfully!", {
              position: "top-right",
            });
            setUsername('');
            setPassword('');
            setModalType('login'); 
          } else {
            toast.error(
              response.data.message || "An error occurred. Please try again.",
              { position: "top-right" }
            );
          }
        } else{
          response = await axios.post('http://localhost:3000/api/v1/login', {
            username,
            password,
          });
          const token = response?.headers?.authorization?.split(" ")[1] || response?.data?.token;

          if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(response.data?.user));
            toast.success("Login successful!", { position: "top-right" });
            onClose(); 
          } else {
            toast.error("Please create an account.", { position: "top-right" });
            setModalType('signup'); 
          }

          setUsername('');
          setPassword('');
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          toast.error("User already exists. Please log in to continue.", {
            position: "top-right",
          });
        } else {
          toast.error("User not found", {
            position: "top-right",
          });
        }
      } finally {
        toast.dismiss(toastId);
        dispatch(setLoading(false));
      }
    }
  };

  if (!isOpen) return null;
  if (isLoading) return <Loader />;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose}>X</button>
        <h2>{formType === 'signup' ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
              
               {showPassword ? <GoEye /> : <GoEyeClosed />}
              
           
              </button>
            </div>
          </div>
          <button className={styles.submitBtn} type="submit">
            {formType === 'signup' ? 'Register' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalTemplate;
