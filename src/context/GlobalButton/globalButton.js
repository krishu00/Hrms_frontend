import React from "react";
import "./Button.css"; // Optional for styles

const Button = ({
  text,
  onClick,
  disabled,
  type = "button",
  className = "",
}) => {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`global-btn ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;
