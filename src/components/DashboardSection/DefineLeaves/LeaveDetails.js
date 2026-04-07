import React, { useState } from "react";
import "../../ComponentsCss/DefineLeave/defineLeaves.css";
import { FaArrowLeft, FaEye, FaPen } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import Button from "../../../context/GlobalButton/globalButton";

export default function LeaveDetails({
  leaveData,
  mode,
  onSave,
  onCancel,
  getInputData,
  handleSelectChange,
  showNewJoinee,
  showTable,
  inputRows,
  handleAddRow,
  handleDeleteRow,
  editLeave,
  setInputRows,
  allowed_gender
}) {
  const [activeTab, setActiveTab] = useState("Credit");

  return (
    <div className="form-section-add-leave">
      <div className="heading-add">
        <button onClick={onCancel}>
          <FaArrowLeft className="back-icon" />
          back
        </button>
        <h4>
          {mode === "edit"
            ? "Edit Leave"
            : mode === "view"
            ? "View Leave"
            : mode === "add"
            ? "Add Leave"
            : ""}
        </h4>
      </div>

      <div className="input-container-form">
        <div className="container-name-section">
          <div className="name-section">
            <label>Name*</label>
            <input
              name="leave_name"
              type="text"
              placeholder="enter name"
              value={leaveData.leave_name}
              onChange={getInputData}
              disabled={mode === "view" || mode === "readonly"}
            />
          </div>
          <div className="name-section">
            <label>Abbreviation*</label>
            <input
              name="abbreviation"
              type="text"
              placeholder="enter abbreviation"
              value={leaveData.abbreviation}
              onChange={getInputData}
              disabled={mode === "view" || mode === "readonly"}
            />
          </div>
          <div className="name-section">
            <label>Display Name*</label>
            <input
              name="display_name"
              type="text"
              placeholder="display name"
              value={leaveData.display_name}
              onChange={getInputData}
              disabled={mode === "view" || mode === "readonly"}
            />
          </div>
        </div>
        <div className="lable-add-section">
          {/* Credit, Encashment, Applicability tabs */}
          <label
            className={activeTab === "Credit" ? "activeclass" : "non-active"}
            onClick={() => {
              if (mode === "edit" || "add") setActiveTab("Credit");
            }}
          >
            Credit
          </label>
          <label
            className={
              activeTab === "Encashment" ? "activeclass" : "non-active"
            }
            onClick={() => {
              if (mode === "edit" || "add") setActiveTab("Encashment");
            }}
          >
            Encashment
          </label>
        </div>

        {activeTab === "Credit" && (
          <div className="credit-button-section">
            <div className="credit-button-container">
              <div className="criteria-input-section">
                <label>Leave Credit Frequency*</label>
                <select
                  name="leave_credit_frequency"
                  value={leaveData.leave_credit_frequency}
                  onChange={(e) => {
                    handleSelectChange(e.target.value);
                    getInputData(e);
                  }}
                  disabled={mode === "view" || mode === "readonly"}
                >
                  <option value="">Select option</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Manual">Manual</option>

                </select>
              </div>
              <div className="criteria-input-section">
                <label>Allowed Gender</label>
                <select
                  name="leave_credit_frequency"
                  value={leaveData.allowed_gender}
                  onChange={(e) => {
                    handleSelectChange(e.target.value);
                    getInputData(e);
                  }}
                  disabled={mode === "view" || mode === "readonly"}
                >
                  <option value="">Select option</option>
                  <option value="All">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
  
                </select>
              </div>
              <div className="criteria-input-section">
                <label>Leave Credit On*</label>
                <select
                  name="leave_credit_on"
                  value={leaveData.leave_credit_on}
                  onChange={getInputData}
                  disabled={mode === "view" || mode === "readonly"}
                >
                  <option value="">Select option</option>
                  <option value="First Day">First Day</option>
                  <option value="Last Day">Last Day</option>
                  <option value="N/A">N/A</option>

                </select>
              </div>
            </div>
            <div className="main-container-leve-no-days">
              <div className="container-leave">
                <div className="leave-credit-on">
                  <input
                    name="leave_credit_is_attendance_department"
                    type="checkbox"
                    className="leave-credit-input"
                    id="data4"
                    checked={leaveData.leave_credit_is_attendance_department}
                    onChange={getInputData}
                    disabled={mode === "view" || mode === "readonly"}
                  />
                  <label
                    htmlFor="data4"
                    className="credit_details.leave-credit-input"
                  >
                    Credit is Attendance Dependent
                  </label>
                </div>

                {leaveData.leave_credit_is_attendance_department && (
                  <div className="name-section attendance-percentage-section">
                    <label>Attendance Dependent (%)</label>
                    <input
                      name="attendance_dependent_percentage"
                      type="number"
                      placeholder="Enter percentage"
                      value={leaveData.attendance_dependent_percentage}
                      onChange={getInputData}
                      disabled={mode === "view" || mode === "readonly"}
                      min="0"
                      max="100"
                    />
                  </div>
                )}

                <div className="leave-credit-on">
                  <input
                    name="probation_applicable_for_new_joinees"
                    type="checkbox"
                    className="leave-credit-input"
                    id="data5"
                    checked={leaveData.probation_applicable_for_new_joinees}
                    onChange={getInputData}
                    disabled={mode === "view" || mode === "readonly"}
                  />
                  <label htmlFor="data5" className="tooltip-label">
                    Proration Applicable For New Joinees
                    <span className="tooltip-text">
                      If you choose 'Yes', leave credit will be prorated based
                      on date of joining.
                    </span>
                  </label>
                </div>
              </div>

              <div className="no-of-days">
                <label>No.Of Days*</label>
                <input
                  name="leave_credit_no_of_days"
                  className="no_of_days"
                  type="text"
                  value={leaveData.leave_credit_no_of_days}
                  onChange={getInputData}
                  placeholder="enter days"
                  disabled={mode === "view" || mode === "readonly"}
                />
              </div>
            </div>
            {showNewJoinee && (
              <div className="container-new-joinee">
                <input
                  name="new_joinee_cut_off_rules"
                  // onClick={() => {
                  //   if (mode === "edit")
                  //     leaveData.setShowTable((prev) => !prev);
                  // }}
                  type="checkbox"
                  id="new-joinee"
                  checked={leaveData.new_joinee_cut_off_rules}
                  onChange={getInputData}
                  disabled={mode === "view" || mode === "readonly"}
                />
                <label htmlFor="new-joinee">New Joinee Cut Off Rule *</label>
              </div>
            )}
            {leaveData.new_joinee_cut_off_rules &&
              leaveData.leave_credit_frequency === "Monthly" && (
                <div className="new-joinee-table-section">
                  <div className="table-header-sections">
                    <div>From Day</div>
                    <div>To Day</div>
                    <div>No. Of Leaves</div>
                  </div>
                  {inputRows.map((row, index) => (
                    <div className="inputs-after-check-main" key={index}>
                      <div className="input-tables">
                        <input
                          type="number"
                          placeholder="enter value"
                          value={row.from_day}
                          onChange={(e) => {
                            const newRows = [...inputRows];
                            newRows[index].from_day = e.target.value;
                            setInputRows(newRows);
                          }}
                          disabled={mode === "view" || mode === "readonly"}
                        />
                      </div>
                      <div className="input-tables">
                        <input
                          type="number"
                          placeholder="enter value"
                          value={row.to_day}
                          onChange={(e) => {
                            const newRows = [...inputRows];
                            newRows[index].to_day = e.target.value;
                            setInputRows(newRows);
                          }}
                          disabled={mode === "view" || mode === "readonly"}
                        />
                      </div>
                      <div className="input-tables">
                        <input
                          type="number"
                          placeholder="enter value"
                          value={row.no_of_leaves}
                          onChange={(e) => {
                            const newRows = [...inputRows];
                            newRows[index].no_of_leaves = e.target.value;
                            setInputRows(newRows);
                          }}
                          disabled={mode === "view" || mode === "readonly"}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="input-tables bottom-line">
                    {(mode === "edit" || "add") && (
                      <div className="button-add-row">
                        <Button text="Add Row" onClick={handleAddRow}></Button>
                        <Button text="Delete Row" onClick={handleDeleteRow}>
                          Delete Row
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
        {activeTab === "Encashment" && (
          <div className="encashment-button-section">
            <div className="checked-section">
              <div className="leave-credit-on">
                <input
                  name="leave_carry_forward"
                  type="checkbox"
                  className="leave-credit-input"
                  id="data1"
                  checked={leaveData.leave_carry_forward}
                  onChange={getInputData}
                  disabled={mode === "view" || mode === "readonly"}
                />
                <label htmlFor="data1">Can Carry Forward?</label>
              </div>
              <div className="leave-credit-on">
                <input
                  name="is_encashable"
                  type="checkbox"
                  className="leave-credit-input"
                  id="data2"
                  checked={leaveData.is_encashable}
                  onChange={getInputData}
                  disabled={mode === "view" || mode === "readonly"}
                />
                <label htmlFor="data2">Is Encashable?</label>
              </div>
            </div>
            <div className="encash-input-section">
              <div className="name-section">
                <label>Max carry Forward at Year End</label>
                <input
                  name="max_leave_carry_forward_days_in_year"
                  type="number"
                  placeholder="Max carry Forward at Year End"
                  value={leaveData.max_leave_carry_forward_days_in_year}
                  onChange={getInputData}
                  disabled={mode === "view" || mode === "readonly"}
                />
              </div>
              <div className="name-section">
                <label>Max Days Encashable</label>
                <input
                  name="max_leave_days_encashable"
                  type="number"
                  placeholder="Max Days Encashable"
                  value={leaveData.max_leave_days_encashable}
                  onChange={getInputData}
                  disabled={mode === "view" || mode === "readonly"}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {mode !== "view" && mode !== "readonly" && (
        <div className="save-button-div">
          {mode === "edit" ? (
            <Button text="Update & Save" onClick={editLeave}></Button>
          ) : (
            <Button text="Save" onClick={onSave}></Button>
          )}
        </div>
      )}
    </div>
  );
}
