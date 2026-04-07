import React, { useState, useEffect } from "react";
import "../../ComponentsCss/DefineLeave/defineLeaves.css";
import { FaArrowLeft, FaEye, FaPen } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import LeaveDetails from "./LeaveDetails";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../../../context/GlobalButton/globalButton";
import { usePopup } from "../../../context/popup-context/Popup"; // Make sure the path is correct
import { Popup } from "../../Utils/Popup/Popup";

export default function DefineLeaves() {
  const [show, setShow] = useState(false);
  const [showNewJoinee, setShowNewJoinee] = useState(false);
  const [inputRows, setInputRows] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [mode, setMode] = useState(null);
  const [editID, setEditID] = useState(null);
  const navigate = useNavigate();

  const { showPopup, setShowPopup, setMessage } = usePopup();

  const [leaveData, setLeaveData] = useState({
    leave_name: "",
    abbreviation: "",
    display_name: "",
    leave_credit_frequency: "",
    leave_credit_on: "",
    leave_credit_is_attendance_department: false,
    attendance_dependent_percentage: "",
    probation_applicable_for_new_joinees: false,
    leave_credit_type: "",
    leave_credit_no_of_days: "",
    new_joinee_cut_off_rules: false,
    leave_carry_forward: false,
    is_encashable: false,
    max_leave_carry_forward_days_in_year: "",
    max_leave_days_encashable: "",
    showTable: [],
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/leaves/get-leaves`
      );
      if (response.data?.success) {
        setLeaves(response.data.leaves);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  const getInputData = (e) => {
    const { name, type, checked, value } = e.target;
    setLeaveData({
      ...leaveData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const formSubmit = async (e) => {
    e.preventDefault();

    const showTableFormatted =
      leaveData.leave_credit_frequency === "Monthly"
        ? inputRows.map((row) => ({
            from_day: Number(row.from_day),
            to_day: Number(row.to_day),
            no_of_leaves: Number(row.no_of_leaves),
          }))
        : [];

    const finalLeaveData = {
      ...leaveData,
      showTable: showTableFormatted,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/leaves/add-leave`,
        finalLeaveData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.data?.success) {
        setMessage("Leave added successfully!");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
        fetchLeaves();
        setShow(false);
        setMode(null);
      }
    } catch (error) {
      console.error("Error adding leave:", error);
      setMessage(
        error?.response?.data?.message || "Failed to add leave. Try again."
      );
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const deleteLeaveFunc = async (id) => {
    try {
      const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/leaves/delete-leave/${id}`
      );
      if (res.data?.success) {
        setMessage("Leave deleted successfully!");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
        fetchLeaves();
      }
    } catch (err) {
      console.error("Error deleting leave:", err);
      setMessage("Failed to delete leave.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const editLeaveFunc = async () => {
    const updatedShowTable =
      leaveData.leave_credit_frequency === "Monthly"
        ? inputRows.map((row) => ({
            from_day: Number(row.from_day),
            to_day: Number(row.to_day),
            no_of_leaves: Number(row.no_of_leaves),
          }))
        : [];

    const finalLeaveData = {
      ...leaveData,
      showTable: updatedShowTable,
    };

    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/leaves/edit-leave/${editID}`,
        finalLeaveData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data?.success) {
        setMessage("Leave updated successfully!");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
        fetchLeaves();
        setShow(false);
        setMode(null);
      }
    } catch (err) {
      console.error("Error editing leave:", err);
      setMessage("Failed to update leave.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const handleSelectChange = (value) => {
    setShowNewJoinee(value === "Monthly");
  };

  const handleAddRow = (e) => {
    e.preventDefault();
    setInputRows([...inputRows, { from_day: "", to_day: "", no_of_leaves: "" }]);
  };

  const handleDeleteRow = (e) => {
    e.preventDefault();
    if (inputRows.length > 1) {
      setInputRows(inputRows.slice(0, -1));
    }
  };

  return (
    <div className="define-leave-main">
      {showPopup && <Popup />}
      {!show && (
        <div className="outer-container-addLeave">
          <div className="add_leave_header">
            <Button text="View Template" onClick={() => navigate("template")} />
            <Button
              text="Add Leave"
              onClick={() => {
                setShow(true);
                setMode("add");
                setLeaveData({
                  leave_name: "",
                  abbreviation: "",
                  display_name: "",
                  leave_credit_frequency: "",
                  leave_credit_on: "",
                  leave_credit_is_attendance_department: false,
                  attendance_dependent_percentage: "",
                  probation_applicable_for_new_joinees: false,
                  leave_credit_type: "",
                  leave_credit_no_of_days: "",
                  new_joinee_cut_off_rules: false,
                  leave_carry_forward: false,
                  is_encashable: false,
                  max_leave_carry_forward_days_in_year: "",
                  max_leave_days_encashable: "",
                  showTable: [],
                });
                setInputRows([]);
              }}
            />
          </div>

          <div className="add-leave-table">
            <div className="table-wrapper">
              <div className="table-row table-header-leaves">
                <div>Leave Name</div>
                <div>Abbreviation</div>
                <div>Credit Frequency</div>
                <div>Credit Days</div>
                <div>Carry Forward</div>
                <div>Encashable</div>
                <div>Actions</div>
              </div>
              {leaves.map((item) => (
                <div className="table-row" key={item._id}>
                  <div>{item.leave_name}</div>
                  <div>{item.abbreviation}</div>
                  <div>{item.leave_credit_frequency}</div>
                  <div>{item.leave_credit_no_of_days}</div>
                  <div>{item.leave_carry_forward ? "YES" : "NO"}</div>
                  <div>{item.is_encashable ? "YES" : "NO"}</div>
                  <div className="leaves-action-buttons">
                    <button
                      className="leave-view-edit-delete"
                      onClick={() => {
                        setShow(true);
                        setMode("view");
                        setLeaveData(item);
                        setInputRows(
                          item.showTable?.map((rule) => ({
                            from_day: rule.from_day,
                            to_day: rule.to_day,
                            no_of_leaves: rule.no_of_leaves,
                          })) || []
                        );
                      }}
                    >
                      <FaEye className="view-icon" />
                    </button>
                    {" | "}
                    <button
                      className="leave-view-edit-delete"
                      onClick={() => {
                        setShow(true);
                        setMode("edit");
                        setEditID(item._id);
                        setLeaveData(item);
                        setInputRows(
                          item.showTable?.map((rule) => ({
                            from_day: rule.from_day,
                            to_day: rule.to_day,
                            no_of_leaves: rule.no_of_leaves,
                          })) || []
                        );
                      }}
                    >
                      <FaPen className="view-icon" />
                    </button>
                    {" | "}
                    <button
                      onClick={() => deleteLeaveFunc(item._id)}
                      className="leave-view-edit-delete"
                    >
                      <MdDeleteForever className="delete-icon" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {show && (
        <LeaveDetails
          leaveData={leaveData}
          mode={mode}
          onSave={formSubmit}
          editLeave={editLeaveFunc}
          onCancel={() => {
            setShow(false);
            setMode(null);
          }}
          getInputData={getInputData}
          handleSelectChange={handleSelectChange}
          showNewJoinee={showNewJoinee}
          showTable={leaveData.showTable}
          inputRows={inputRows}
          handleAddRow={handleAddRow}
          handleDeleteRow={handleDeleteRow}
          setInputRows={setInputRows}
        />
      )}
    </div>
  );
}
