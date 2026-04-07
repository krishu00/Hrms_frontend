import React, { useEffect, useState } from "react";
import "../../ComponentsCss/ProfileComponent/DisplayDetailsOfUser.css";

function DisplayDetailsOfUser({
  checkedSections = [],
  setCheckedSections,
  sectionIndex,
  setCurrentSection,
  handleNext,
  handlePrevious,
  header,
  mode,
  onChange,
  onUpdate,
  updateSectionValidity,
  sectionValidity,
  ...rest
}) {
  const [formData, setFormData] = useState(
    Object.entries(rest).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {})
  );
  

  const handleCheckboxChange = (id) => {
    setCheckedSections((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
    setCurrentSection(id);
  };

  useEffect(() => {
    const isValid = Object.values(formData).every((value) => {
      return (
        value !== null && value !== undefined && value.toString().trim() !== ""
      );
    });

    updateSectionValidity(sectionIndex, isValid); // Update validity in parent
  }, [formData, sectionIndex]);

  const handleChange = (key, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleBlur = (key) => {
    if (onChange) {
      onChange(key, formData[key]);
    }
    if (onUpdate) {
      onUpdate(key, formData[key]);
    }
  };

  const sections = [
    { id: 0, label: "Employee Details" },
    { id: 1, label: "Official Details" },
    { id: 2, label: "Personal Details" },
    { id: 3, label: "Other Details" },
    { id: 4, label: "Bank Details" },
    { id: 5, label: "Insurance Details" },
    { id: 6, label: "PF Details" },
    { id: 7, label: "Current Address" },
    { id: 8, label: "Permanent Address" },
  ];

  return (
    <div className="outer-container-dispaly">
      <div className="tracker-details-container">
        <div className="tracker-details">
          <div className="tracker-data">
            <ul>
              {sections.map((section) => (
                <li key={section.id}>
                  <input
                    checked={checkedSections.includes(section.id)}
                    onChange={() => handleCheckboxChange(section.id)}
                    type="radio"
                    className={`input-radio ${
                      sectionValidity[section.id] === false
                        ? "border-red-500"
                        : sectionValidity[section.id] === true
                        ? "border-green-500"
                        : ""
                    }`}
                    id={`option${section.id + 1}`}
                  />
                  <label
                    className="lable-details"
                    htmlFor={`option${section.id + 1}`}
                    onClick={() => handleCheckboxChange(section.id)}
                  >
                    {section.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="display-details-container">
          <div className="details-header">
            <h3>{header}</h3>
          </div>
          <div className="details-form">
            {Object.entries(formData).map(([key, value], index) => {
              const isStartOfRow = index % 2 === 0;
              return (
                <React.Fragment key={key}>
                  {isStartOfRow && <div className="details-form-row"></div>}
                  <div className="details-input-group">
                    <label className="user_lable">
                      {key.replace("_", " ").toUpperCase()}
                    </label>
                    {mode === "edit" || mode === "create" ? (
                      <input
                        type="text"
                        value={value}
                        className="user_value"
                        onChange={(e) => handleChange(key, e.target.value)}
                        onBlur={() => handleBlur(key)}
                      />
                    ) : (
                      <input type="text" value={value} readOnly />
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
      <div className="navigation-btn">
        <button onClick={handlePrevious} className="previous-button">
          Previous
        </button>
        <button onClick={handleNext} className="next-button">
          Next
        </button>
      </div>
    </div>
  );
}

export default DisplayDetailsOfUser;
