import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../ComponentsCss/utils/RequestForm/RequestForm.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../Popup/Popup";

const RequestForm = (props) => {
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: null,
    company: "",
    email: "",
    designation: "",
    password: "",
    contactNumber: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const { formFields, isSignIn, onSubmit } = props;

  const handleInputChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrorMessage("Please enter your email first.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      // Replace with actual API call
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/forgot_password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setShowPopup(true);
        setMessage("Password reset link sent to your email.");
        setTimeout(() => setShowPopup(false), 3000);
        //alert("Password reset link sent to your email.");
      } else {
        setErrorMessage(data.message || "Failed to reset password.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field) => {
    if (field.type === "password") {
      return (
        <div className="password-input-container">
          <input
            type={passwordVisible ? "text" : "password"}
            value={formData[field.name]}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()} here`}
          />
          <span
            className={`password-toggle-icon ${
              passwordVisible ? "visible" : ""
            }`}
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? <FaEye /> : <FaEyeSlash />}
          </span>
          {/* Forgot Password Link */}
          {isSignIn && (
            <p className="forgot-password" onClick={handleForgotPassword}>
              Forgot Password?
            </p>
          )}
        </div>
      );
    }
    switch (field.type) {
      case "date":
        return (
          <DatePicker
            selected={formData.dateOfBirth}
            onChange={(date) => handleInputChange("dateOfBirth", date)}
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            placeholderText="Select date of birth"
            isClearable
            showMonthDropdown
            dropdownMode="select"
          />
        );
      case "select":
        return (
          <div className="select-wrapper">
            <select
              value={formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <option value="">Select a company</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span
              className={`dropdown-icon ${isDropdownOpen ? "open" : ""}`}
            ></span>
          </div>
        );
      case "text":
      case "email":
      case "tel":
        return (
          <input
            type={field.type}
            value={formData[field.name]}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()} here`}
          />
        );
      case "textarea":
        return (
          <textarea
            value={formData[field.name]}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={`Enter your ${field.label.toLowerCase()} here`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="request-form-container">
      <form
        className={`request-form ${isSignIn ? "sign-in-form" : ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData, setIsLoading, setErrorMessage);
        }}
      >
        {isSignIn ? (
          <h1 className="sign-in-header">{props.title}</h1>
        ) : (
          <h2 className="form-title">{props.title}</h2>
        )}

        {!isSignIn && (
          <div className="name-input">
            <h3>Name</h3>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter name here"
            />
          </div>
        )}

        {formFields.map((field) => (
          <div key={field.name} className={`${field.name}-input`}>
            <h3>
              {field.name === "dateRange"
                ? "Date of Birth"
                : field.name === "selectedDetail"
                ? "Company"
                : field.name === "email"
                ? "Email"
                : field.name === "reason"
                ? "Designation"
                : field.label}
            </h3>
            {renderField(field)}
          </div>
        ))}

        {!isSignIn && (
          <div className="contact-number-input">
            <h3>Contact Number</h3>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) =>
                handleInputChange("contactNumber", e.target.value)
              }
              placeholder="Enter contact number here"
            />
          </div>
        )}

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="form-buttons">
          {!isSignIn && props.cancelBtn && (
            <button
              type="button"
              className="edit-button"
              onClick={props.cancelBtn}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={`apply-button ${isSignIn ? "login-button" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : isSignIn ? "Login" : "Apply"}
          </button>
        </div>
      </form>
      { showPopup && <Popup /> }
    </div>
  );
};

export default RequestForm;
