import React from 'react';
import '../../ComponentsCss/utils/PrimaryButton/PrimaryButton.css';

const PrimaryButton = ({ onClick, children, className }) => {
  return (
    <button 
      className={`primary-button ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;