// components/HolidayGroupForm.jsx

import React, { useState } from "react";
import Button from "../../../context/GlobalButton/globalButton";
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const HolidayGroupForm = ({
  mode, // "add", "edit", "view"
  formData,
  newGroupData,
  individualHolidays,
  handleChange,
  handleGroupChange,
  handleAddRuleToTable,
  onSubmit,
  readOnly = false,
  handleDeleteHoliday,
  setActiveSection,
}) => {
  const [showAddHolidayRows, setShowAddHolidayRows] = useState([]);
  const [newHolidays, setNewHolidays] = useState([]);
  console.log(" individualHolidays", individualHolidays);
  const navigate = useNavigate();

  const handleNewHolidayChange = (index, e) => {
    const { name, value } = e.target;
    console.log("New Holiday Change:", name, value);

    const updatedHolidays = [...newHolidays];
    updatedHolidays[index] = {
      ...updatedHolidays[index],
      [name]: value,
    };
    setNewHolidays(updatedHolidays);
  };

  const handleAddNewHoliday = (index) => {
    handleAddRuleToTable(newHolidays[index]);
    setNewHolidays(newHolidays.filter((_, i) => i !== index));
    setShowAddHolidayRows(showAddHolidayRows.filter((_, i) => i !== index));
  };

  const handleAddHolidayRow = () => {
    setShowAddHolidayRows([...showAddHolidayRows, true]);
    setNewHolidays([
      ...newHolidays,
      {
        holiday_date: "",
        holiday_name: "",
        isOptionalHoliday: "false",
      },
    ]);
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="select-day-section">
        <Button
          text="Back"
          type="button"
          onClick={() => {
            setActiveSection("general");
          }}
        ></Button>

        <div className="select-section">
          <div className="leave-year-section">
            <div className="input-button">
              <label>Leave Year*</label>
              <input
                name="startDate"
                type="text"
                placeholder="start date"
                value={formData.leaveYear?.startDate}
                onChange={handleChange}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
                readOnly={readOnly}
              />
              <input
                name="endDate"
                type="text"
                placeholder="end date"
                value={formData.leaveYear?.endDate}
                onChange={handleChange}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="groupName-section">
            <div className="groupName">
              <label>Group Name:</label>
              <input
                type="text"
                placeholder="Enter group name"
                value={newGroupData.groupName}
                onChange={handleGroupChange}
                name="groupName"
                mode={mode}
              />
            </div>
            <div className="groupDescription">
              <label>Group Description:</label>
              <input
                type="text"
                placeholder="Enter group description"
                value={newGroupData.description}
                onChange={handleGroupChange}
                name="description"
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>
        <div className="table_rew_rule">
          {!readOnly && (
            <Button
              text="Add Holiday"
              type="button"
              onClick={handleAddHolidayRow}
              // className="addGgroup-btn"
            ></Button>
          )}
        </div>
        <div className="add-holiday-container">
          <table className="table-weeek-days">
            <thead>
              <tr>
                <th>Date*</th>
                <th>Holiday Name*</th>
                <th>IsOptional holidays</th>
                {mode === "edit" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {individualHolidays.map((holiday, index) => (
                <tr key={index}>
                  <td>{holiday.holiday_date}</td>
                  <td>{holiday.holiday_name}</td>
                  <td>{holiday.isOptionalHoliday ? "True" : "False"}</td>{" "}
                  {mode === "edit" && (
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteHoliday(index)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {showAddHolidayRows.map((_, index) => (
                <tr key={`newHolidayRow-${index}`}>
                  <td>
                    <input
                      className="table_holiday_date"
                      type="date"
                      name="holiday_date"
                      onChange={(e) => handleNewHolidayChange(index, e)}
                      value={newHolidays[index]?.holiday_date || ""}
                    />
                  </td>
                  <td>
                    <textarea
                      onChange={(e) => handleNewHolidayChange(index, e)}
                      name="holiday_name"
                      value={newHolidays[index]?.holiday_name || ""}
                    ></textarea>
                  </td>
                  <td>
                    {/* <select
                      name="isOptionalHoliday"
                      value={newHolidays[index]?.isOptionalHoliday || "false"}
                      onChange={(e) => handleNewHolidayChange(index, e)}
                      className="select-option_table_option"
                    >
                      <option value="false">False</option>
                      <option value="true">True</option>
                    </select> */}
                    <input
                      name="isOptionalHoliday"
                      type="checkbox"
                      checked={newHolidays[index]?.isOptionalHoliday === "true"}
                      onChange={(e) =>
                        handleNewHolidayChange(index, {
                          target: {
                            name: "isOptionalHoliday",
                            value: e.target.checked ? "true" : "false",
                          },
                        })
                      }
                      className="select-option_table_option"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleAddNewHoliday(index)}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <div className="save-button">
            <Button
              text={`${mode === "edit" ? "Update" : "Save"}`}
              type="submit"
            ></Button>
          </div>
        )}
      </div>
    </form>
  );
};

export default HolidayGroupForm;
