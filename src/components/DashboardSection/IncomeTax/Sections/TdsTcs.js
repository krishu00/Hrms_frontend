import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import "../../../ComponentsCss/GenerateSalaryComponent/PayRole/PayAdjustment/PayAdjustment.css";
import "../../../ComponentsCss/IncomeTax/IncomeTax.css";
import "../../../ComponentsCss/IncomeTax/Sections/TdsTcs.css";
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";

export default function TdsTcs({ selectedEmployee: externalSelectedEmployee = null, onEmployeeSelect = null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [internalSelectedEmployee, setInternalSelectedEmployee] = useState(null);
  const selectedEmployee = externalSelectedEmployee ?? internalSelectedEmployee;
  const setSelectedEmployee = onEmployeeSelect ?? setInternalSelectedEmployee;
  const [declaredTotal, setDeclaredTotal] = useState("");
  const [approvedTotal, setApprovedTotal] = useState("");

  const { globalData } = useContext(GlobalContext);
  const companyCode = globalData?.userInfo?.companyCode;
  const wrapperRef = useRef(null);

  const employeeName = selectedEmployee?.employee_details?.name || "--";
  const employeeCode = selectedEmployee?.employee_id || "--";
  const employeeStatus =
    selectedEmployee?.employee_details?.employee_status ||
    selectedEmployee?.official_details?.employee_status ||
    selectedEmployee?.official_details?.employment_status ||
    "Active";

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
      }
    },
    [companyCode, token]
  );

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
    setSelectedEmployee(employee);
    setShowSuggestions(false);
    setSearchTerm("");
  };

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
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={() => employees.length > 0 && setShowSuggestions(true)}
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
                âœ•
              </span>
            )}
          </div>

          {showSuggestions && (
            <div className="suggestion-box">
              {employees.length === 0 ? (
                <div className="no-suggestion">No Employees Found</div>
              ) : (
                employees.map((employee) => (
                  <div
                    key={employee._id}
                    className="suggestion-item"
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <h5>{employee.employee_id}</h5>
                    <span>{employee.employee_details?.name}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="tax-option-card">
        <div className="tax-option-card-header">
          <div>
            <h2>Section 192(2B)</h2>
          </div>

          {selectedEmployee && (
            <span className="tax-status-pill">{employeeStatus}</span>
          )}
        </div>

        {selectedEmployee ? (
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
        ): (
          <div className="tax-empty-state">
            Search and select an employee to Edit/display TDS&TCS  details here.
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="tdstcs-wrap">
          <div className="tdstcs-empty-row">No Records</div>

          <div className="tdstcs-form-block">
            <div className="tdstcs-field-row">
              <label className="tdstcs-field-label">Declared Total(TCS + TDS)</label>
              <input
                type="number"
                min="0"
                className="tdstcs-input"
                value={declaredTotal}
                onChange={(event) => setDeclaredTotal(event.target.value)}
              />
            </div>

            <div className="tdstcs-field-row">
              <label className="tdstcs-field-label">Approved Total(TCS + TDS)</label>
              <input
                type="number"
                min="0"
                className="tdstcs-input"
                value={approvedTotal}
                onChange={(event) => setApprovedTotal(event.target.value)}
              />
            </div>

            <button type="button" className="tdstcs-add-btn">
              Add New
            </button>
          </div>

          <div className="tdstcs-save-wrap">
            <button type="button" className="tax-save-button">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
