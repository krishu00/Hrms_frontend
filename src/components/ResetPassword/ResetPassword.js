import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../ComponentsCss/Login/Login.css";
import { usePopup } from "../../context/popup-context/Popup";
import { Popup } from "../Utils/Popup/Popup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      console.log("Token being sent:", token);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/reset_password`,
        { token, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setShowPopup(true);
      setMessage("Password reset successful!");
      setTimeout(() => {
        setShowPopup(false);
        navigate("/login");
      }, 3000);
      //alert("Password reset successful");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Password reset failed");
    }
    setIsLoading(false);
  };

  return (
    <div className="login-container reset-password-container">
      <h2 className="login-heading">Reset Your Password</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group password-field">
          <label>New Password</label>

          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="new-password-input"
              placeholder="Enter new password"
              value={password}
              autoComplete="new-password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div className="form-group password-field">
          <label>Confirm Password</label>

          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="new-password-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              autoComplete="new-password"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <span
              className="eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button
          className="apply-button reset-password-submit-button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {showPopup && <Popup />}
    </div>
  );
}

export default ResetPassword;
