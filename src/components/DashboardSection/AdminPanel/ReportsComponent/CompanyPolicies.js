import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../ComponentsCss/AdminPanel/CompanyPolicies/CompanyPolicies.css";
import Button from "../../../../context/GlobalButton/globalButton.js";
import { IoArrowBackOutline } from "react-icons/io5";

export default function CompanyPolicies() {
  const [showAddPolicyForm, setShowAddPolicyForm] = useState(false);
  const [showAddPolicyTable, setShowAddPolicyTable] = useState(true);
  const [formMode, setFormMode] = useState(null); // "view" | "edit" | "add"
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [GeneralHoliday, setGeneralHoliday] = useState([]);

  // Fetch all policies and holiday groups
  useEffect(() => {
    fetchPolicies();
    fetchGeneralHolidays();
  }, []);

  async function fetchPolicies() {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/get-all-policies`,
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      // setPolicies(res.data);
      setPolicies(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching policies:", err);
    }
  }

  async function fetchGeneralHolidays() {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/general-holidays/get-holiday-groups`,
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      setGeneralHoliday(res.data);
    } catch (error) {
      console.error("Error General Holidays:", error);
    }
  }

  // Add New Policy
  function toggleAddPolicyForm() {
    setFormMode("add");
    setSelectedPolicy({
      company_code: "",
      working_hours: "",
      start_punch_in_time: "",
      end_punch_in_time: "",
      on_time_hours: "",
      holiday_template: "",
      payroll_cycle: {
        start_day: "",
        end_day: "",
      },
    });
    setShowAddPolicyForm(true);
    setShowAddPolicyTable(false);
  }

  // View Policy
  function handleView(policy) {
    setFormMode("view");
    setSelectedPolicy(policy);
    setShowAddPolicyForm(true);
    setShowAddPolicyTable(false);
  }

  // Edit Policy
  function handleEdit(policy) {
    setFormMode("edit");
    setSelectedPolicy(policy);
    setShowAddPolicyForm(true);
    setShowAddPolicyTable(false);
  }

  // Save Policy (Add / Edit)
  async function handleSave() {
    try {
      if (formMode === "add") {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/create-policy`,
          selectedPolicy,
          { headers: { Authorization: localStorage.getItem("token") } }
        );
        setPolicies([...policies, res.data.data]);
      } else if (formMode === "edit") {
        const res = await axios.put(
          `${process.env.REACT_APP_API_URL}/update-policy/${selectedPolicy.company_code}`,
          selectedPolicy,
          { headers: { Authorization: localStorage.getItem("token") } }
        );
        setPolicies(
          policies.map((p) =>
            p.company_code === selectedPolicy.company_code ? res.data.data : p
          )
        );
      }

      // reset UI
      setShowAddPolicyForm(false);
      setShowAddPolicyTable(true);
      setFormMode(null);
      setSelectedPolicy(null);
    } catch (err) {
      console.error("Error saving policy:", err.response?.data || err.message);
    }
  }

  // Helper: find holiday group name by ID
  function getHolidayGroupNameById(id) {
    const group = GeneralHoliday.find((g) => g._id === id);
    return group ? group.groupName : "N/A";
  }

  // Convert IST (HH:mm) to UTC ISO
  function istToUtcISO(timeStr) {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);

    // take today's date, set IST time
    const istDate = new Date();
    istDate.setHours(h, m, 0, 0);

    // shift back 5h30m to convert IST → UTC
    const utcDate = new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000);
    return utcDate.toISOString();
  }
//   function istToUtcISO(timeStr) {
//   if (!timeStr) return "";

//   const [h, m] = timeStr.split(":").map(Number);

//   const now = new Date();
  
//   // Create date as if it's in IST using locale trick
//   const istDate = new Date(
//     now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//   );

//   istDate.setHours(h, m, 0, 0);

//   return new Date(istDate).toISOString();
// }


  // Convert UTC ISO to IST (HH:mm) string
  // function utcISOToIstTime(isoStr) {
  //   if (!isoStr) return "";
  //   return new Date(isoStr).toLocaleTimeString("en-GB", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     timeZone: "Asia/Kolkata",
  //   });
  // }
  function utcISOToIstTime(isoStr) {
  if (!isoStr) return "";

  const utcDate = new Date(isoStr);

  // Add 5 hours 30 minutes in milliseconds
  const istTime = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));

  const hours = String(istTime.getHours()).padStart(2, "0");
  const minutes = String(istTime.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

  return (
    <div className="company-policies-container">
      {showAddPolicyTable && (
        <div className="outer-table-policy-cotainer">
          <div className="Uper-heading-company-policy">
            <h2>Company Policies</h2>
          </div>

          {/* Add New Policy Button */}
          <div className="add-policy-button-container">
            <Button text="Add New Policy" onClick={toggleAddPolicyForm} />
          </div>

          {/* Policies Table */}
          <div className="policy-table-container">
            <table className="company-policy-table">
              <thead>
                <tr>
                  <th>Company Code</th>
                  <th>Working Hours</th>
                  <th>Start Punch In</th>
                  <th>End Punch In</th>
                  <th>On Time Hours</th>
                  <th>Holiday Group</th>
                  <th>Payroll Cycle</th>

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(policies) &&
                  policies.map((policy) => (
                    <tr key={policy._id}>
                      <td>{policy.company_code}</td>
                      <td>{policy.working_hours}</td>
                      <td>{utcISOToIstTime(policy.start_punch_in_time)}</td>
                      <td>{utcISOToIstTime(policy.end_punch_in_time)}</td>
                      <td>{policy.on_time_hours}</td>
                      <td>
                        {getHolidayGroupNameById(policy.holiday_template)}
                      </td>
                      <td>
                        {policy.payroll_cycle
                          ? `${policy.payroll_cycle.start_day} → ${policy.payroll_cycle.end_day}`
                          : "N/A"}
                      </td>
                      <td>
                        <button
                          className="company-policy-button"
                          onClick={() => handleView(policy)}
                        >
                          View /
                        </button>
                        <button
                          className="company-policy-button"
                          onClick={() => handleEdit(policy)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / View / Edit Policy Form */}
      {showAddPolicyForm && selectedPolicy && (
        <div className="company-container-2">
          <div className="heading-company-policy">
            <button
              className="company-policy-back-button"
              onClick={() => {
                setShowAddPolicyForm(false);
                setShowAddPolicyTable(true);
                setFormMode(null);
                setSelectedPolicy(null);
              }}
            >
              <IoArrowBackOutline />
            </button>
            <h3 className="company-policy-title">
              {formMode === "add"
                ? "Add New Policy"
                : formMode === "edit"
                ? "Edit Policy"
                : "View Policy"}
            </h3>
          </div>

          {/* Form Fields */}
          <div className="company-policy-sub-container">
            <div className="company-policy-header">
              <label className="company-policy-title">Company Code</label>
              <input
                type="number"
                className="company-policy-input"
                value={selectedPolicy.company_code}
                disabled={formMode === "view"}
                onChange={(e) =>
                  setSelectedPolicy({
                    ...selectedPolicy,
                    company_code: e.target.value,
                  })
                }
              />
            </div>
            <div className="company-policy-header">
              <label className="company-policy-title">Working Hours</label>
              <input
                type="number"
                className="company-policy-input"
                value={selectedPolicy.working_hours}
                disabled={formMode === "view"}
                onChange={(e) =>
                  setSelectedPolicy({
                    ...selectedPolicy,
                    working_hours: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="company-policy-sub-container">
            <div className="company-policy-header">
              <label className="company-policy-title">Start Punch In</label>
              <input
                type="time"
                className="company-policy-input"
                value={utcISOToIstTime(selectedPolicy.start_punch_in_time)}
                disabled={formMode === "view"}
                onChange={(e) =>
                  setSelectedPolicy({
                    ...selectedPolicy,
                    start_punch_in_time: istToUtcISO(e.target.value),
                  })
                }
              />
            </div>
            <div className="company-policy-header">
              <label className="company-policy-title">End Punch In</label>
              <input
                type="time"
                className="company-policy-input"
                value={utcISOToIstTime(selectedPolicy.end_punch_in_time)}
                disabled={formMode === "view"}
                onChange={(e) =>
                  setSelectedPolicy({
                    ...selectedPolicy,
                    end_punch_in_time: istToUtcISO(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="company-policy-sub-container">
            <div className="company-policy-header">
              <label className="company-policy-title">On Time Hours</label>
              <input
                type="number"
                className="company-policy-input"
                value={selectedPolicy.on_time_hours}
                disabled={formMode === "view"}
                onChange={(e) =>
                  setSelectedPolicy({
                    ...selectedPolicy,
                    on_time_hours: e.target.value,
                  })
                }
              />
            </div>
            <div className="company-policy-header">
              <label className="company-policy-title">Holiday Template</label>
              {formMode === "view" ? (
                <input
                  type="text"
                  className="company-policy-input"
                  value={getHolidayGroupNameById(
                    selectedPolicy.holiday_template
                  )}
                  disabled
                />
              ) : (
                <select
                  className="company-policy-input"
                  value={selectedPolicy.holiday_template || ""}
                  onChange={(e) =>
                    setSelectedPolicy({
                      ...selectedPolicy,
                      holiday_template: e.target.value,
                    })
                  }
                >
                  <option value="">-- Select Holiday Group --</option>
                  {GeneralHoliday.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="company-policy-sub-container">
            <div className="company-policy-header">
              <label className="company-policy-title">
                Payroll Cycle Start Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                className="company-policy-input"
                value={selectedPolicy.payroll_cycle?.start_day || ""}
                disabled={formMode === "view"}
                onChange={(e) =>
                  setSelectedPolicy({
                    ...selectedPolicy,
                    payroll_cycle: {
                      ...selectedPolicy.payroll_cycle,
                      start_day: Number(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div className="company-policy-header">
              <label className="company-policy-title">
                Payroll Cycle End Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                className="company-policy-input"
                value={selectedPolicy.payroll_cycle?.end_day || ""}
                disabled={formMode === "view"}
                onChange={(e) =>
                  setSelectedPolicy({
                    ...selectedPolicy,
                    payroll_cycle: {
                      ...selectedPolicy.payroll_cycle,
                      end_day: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Save button */}
          {formMode !== "view" && (
            <div className="policy-botton-container">
              <Button
                text="Save"
                className="policy-button"
                onClick={handleSave}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
