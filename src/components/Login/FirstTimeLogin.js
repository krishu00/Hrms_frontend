import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../ComponentsCss/Login/Login.css";

function FirstTimeLogin() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/first_time_password`, {
        password,
        confirmPassword,
      });

      navigate("/login");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to change password."
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="login-container reset-password-container">
      <h2 className="first-login-heading">Change Your Password</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            className="new-password-input"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            className="new-password-input"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="submit-button-container">
          <button
            className="apply-button reset-password-submit-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Changing..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FirstTimeLogin;
