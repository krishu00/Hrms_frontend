import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import "../../../ComponentsCss/IncomeTax/IncomeTax.css";
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";

const TAX_OPTION_CHOICES = [
  { value: "new_without_deduction", label: "New - without deduction" },
  { value: "new_with_deduction", label: "New - with deduction" },
  { value: "old_with_deduction", label: "Old - with deduction" },
];

export default function TaxOption({ selectedEmployee: externalSelectedEmployee = null, onEmployeeSelect = null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [internalSelectedEmployee, setInternalSelectedEmployee] = useState(null);
  const selectedEmployee = externalSelectedEmployee ?? internalSelectedEmployee;
  const setSelectedEmployee = onEmployeeSelect ?? setInternalSelectedEmployee;
  const [taxOption, setTaxOption] = useState("new_without_deduction");
  const [saveMessage, setSaveMessage] = useState("");

  const { globalData } = useContext(GlobalContext);
  const companyCode = globalData?.userInfo?.companyCode;
  const wrapperRef = useRef(null);

  const getCookieValue = (name) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

  const token = useMemo(() => getCookieValue("authToken"), []);

  const getFinancialYearString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    return `01/04/${startYear} - 31/03/${startYear + 1}`;
  };

  const fetchEmployees = useCallback(
    async (value) => {
      if (!companyCode || !value.trim()) {
        setEmployees([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/company/${companyCode}/employees`,
          {
            params: { search: value },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setEmployees(res.data.employees || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Employee Search Error:", err);
        setEmployees([]);
      }
    },
    [companyCode, token]
  );
 const handleSearchChange = (e) => setSearchTerm(e.target.value);
  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [fetchEmployees, searchTerm]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleEmployeeSelect = (employee) => {
    const employeeTaxOption =
      employee?.tax_option ||
      employee?.taxOption ||
      employee?.income_tax?.tax_option ||
      "new_without_deduction";

    setSelectedEmployee(employee);
    setTaxOption(employeeTaxOption);
    setShowSuggestions(false);
    setSearchTerm(employee?.employee_details?.name || employee?.employee_id || "");
    setSaveMessage("");
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setEmployees([]);
    setShowSuggestions(false);
    setSelectedEmployee(null);
    setTaxOption("new_without_deduction");
    setSaveMessage("");
  };

  const handleSaveTaxOption = () => {
    if (!selectedEmployee) {
      return;
    }

    setSelectedEmployee((prev) =>
      prev
        ? {
            ...prev,
            tax_option: taxOption,
          }
        : prev
    );
    setSaveMessage("Tax option updated successfully.");
  };

  const employeeName = selectedEmployee?.employee_details?.name || "--";
  const employeeCode = selectedEmployee?.employee_id || "--";
  const employeeStatus =
    selectedEmployee?.employee_details?.employee_status ||
    selectedEmployee?.official_details?.employee_status ||
    selectedEmployee?.official_details?.employment_status ||
    "Active";

  return (
    <div className="company_container">
      <div className="controls-pay-adjustment">
        <div className="search-wrapper" ref={wrapperRef}>
          <div className="controls-section">
            <input
              type="text"
              placeholder="Search Employee - Code / Name"
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => employees.length && setShowSuggestions(true)}
            />
            {searchTerm && (
              <span
                className="clear-search"
                onClick={() => {
                  setSearchTerm("");
                  setEmployees([]);
                  setShowSuggestions(false);
                }}
              >
                &times;
              </span>
            )}
          </div>

          {showSuggestions && (
            <div className="suggestion-box">
              {employees.length === 0 ? (
                <div className="no-suggestion">No Employees Found</div>
              ) : (
                employees.map((emp) => (
                  <div key={emp._id} className="suggestion-item" onClick={() => handleEmployeeSelect(emp)}>
                    <h5>{emp.employee_id}</h5>
                    <span>{emp.employee_details?.name}</span>
                  </div>
                ))
              )}
               
            </div>
          )}
        
        </div>
          <div className="tax-option-side-actions">
          <button type="button" className="tax-action-button">
            Import tax option selection
          </button>
          <button type="button" className="tax-action-button">
            Export tax option selection
          </button>
        </div>
         
      </div>

      <div className="tax-option-card">
        <div className="tax-option-card-header">
          <div>
            <h2>View/Edit Employee Tax Option</h2>
          </div>

          {selectedEmployee && (
            <span className="tax-status-pill">{employeeStatus}</span>
          )}
        </div>

        {selectedEmployee ? (
          <>
            <div className="tax-employee-grid">
              <div className="tax-info-block tax-info-block-wide">
                <span className="tax-info-label">Financial Year</span>
                <span className="tax-info-value">{getFinancialYearString()}</span>
              </div>

              <div className="tax-info-block">
                <span className="tax-info-label">Employee Name</span>
                <span className="tax-info-value">{employeeName}</span>
              </div>

              <div className="tax-info-block">
                <span className="tax-info-label">Employee Code</span>
                <span className="tax-info-value">{employeeCode}</span>
              </div>

              <div className="tax-info-block">
                <span className="tax-info-label">Employee Status</span>
                <span className="tax-info-value">{employeeStatus}</span>
              </div>
            </div>

            <div className="tax-option-form-row">
              <div className="tax-select-group">
                <label className="tax-option-label" htmlFor="employee-tax-option">
                  Tax Option
                </label>
                <select
                  id="employee-tax-option"
                  className="tax-option-select"
                  value={taxOption}
                  onChange={(event) => {
                    setTaxOption(event.target.value);
                    setSaveMessage("");
                  }}
                >
                  {TAX_OPTION_CHOICES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="tax-save-button"
                onClick={handleSaveTaxOption}
              >
                Save
              </button>
            </div>

            {saveMessage && <p className="tax-save-message">{saveMessage}</p>}
          </>
        ) : (
          <div className="tax-empty-state">
            Search and select an employee to display tax option details here.
          </div>
        )}
      
    </div>
   
     </div>
  );
}
