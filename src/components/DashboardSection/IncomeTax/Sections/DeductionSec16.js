import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
} from "react";
import axios from "axios";
import { FaPaperclip } from "react-icons/fa";
import "../../../ComponentsCss/GenerateSalaryComponent/PayRole/PayAdjustment/PayAdjustment.css";
import "../../../ComponentsCss/IncomeTax/IncomeTax.css";
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";

export default function Deduction({ selectedEmployee: externalSelectedEmployee = null, onEmployeeSelect = null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [internalSelectedEmployee, setInternalSelectedEmployee] = useState(null);
  const selectedEmployee = externalSelectedEmployee ?? internalSelectedEmployee;
  const setSelectedEmployee = onEmployeeSelect ?? setInternalSelectedEmployee;
  const [deductionRows, setDeductionRows] = useState([
    {
      id: 1,
      particular: "Standard Deduction",
      yearlyLimit: 50000,
      planner: "",
      actual: "",
      audited: false,
      fileName: "",
    },
    {
      id: 2,
      particular: "Professional Tax",
      yearlyLimit: 2500,
      planner: "",
      actual: "",
      audited: false,
      fileName: "",
    },
  ]);
  const employeeName = selectedEmployee?.employee_details?.name || "--";
    const employeeCode = selectedEmployee?.employee_id || "--";
    const employeeStatus =
      selectedEmployee?.employee_details?.employee_status ||
      selectedEmployee?.official_details?.employee_status ||
      selectedEmployee?.official_details?.employment_status ||
      "Active";
  // âœ… GRAB CONTEXT DATA
  const { globalData } = useContext(GlobalContext);
  const companyCode = globalData?.userInfo?.companyCode;
 
 const getFinancialYearString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    return `01/04/${startYear} - 31/03/${startYear + 1}`;
  };
  const wrapperRef = useRef();

  const getCookieValue = (name) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

  const token = useMemo(() => getCookieValue("authToken"), []);

  const handleActionChange = (e) => {
    setSelectedEmployee(null);
    setSearchTerm("");
  };


  const fetchEmployees = useCallback(
    async (value) => {
      if (!companyCode || !value.trim()) {
        setEmployees([]);
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
    [companyCode, token],
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchEmployees]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleDeductionChange = (id, field, value) => {
    setDeductionRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const handleEmployeeSelect = (emp) => {
    setSelectedEmployee(emp);
    setShowSuggestions(false);
    // setShowAdjustmentPopup(true);
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
      </div>
      <div className="tax-option-card">
        <div className="tax-option-card-header">
          <div>
            <h2>Employee Standard Deduction</h2>
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
        ) : (
          <div className="tax-empty-state">
            Search and select an employee to display Standard Tax Deduction details here.
          </div>
        )}
    </div>

      {selectedEmployee && (
        <div className="tax-deduction-table-container">
          <table className="tax-deduction-table">
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Particulars</th>
                <th>Yearly Limit</th>
                <th>Planner</th>
                <th>Actual</th>
                <th>Audited</th>
                <th>File Name</th>
                <th>Attachment</th>
              </tr>
            </thead>
            <tbody>
              {deductionRows.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td className="tax-deduction-text-cell">{row.particular}</td>
                  <td>{row.yearlyLimit.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      className="tax-deduction-input"
                      value={row.planner}
                      onChange={(event) =>
                        handleDeductionChange(row.id, "planner", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      className="tax-deduction-input"
                      value={row.actual}
                      onChange={(event) =>
                        handleDeductionChange(row.id, "actual", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      className="tax-deduction-checkbox"
                      checked={row.audited}
                      onChange={(event) =>
                        handleDeductionChange(row.id, "audited", event.target.checked)
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="tax-deduction-select"
                      value={row.fileName}
                      onChange={(event) =>
                        handleDeductionChange(row.id, "fileName", event.target.value)
                      }
                    >
                      <option value="">Select file</option>
                      <option value="investment-proof.pdf">investment-proof.pdf</option>
                      <option value="tax-document.pdf">tax-document.pdf</option>
                      <option value="ptax-receipt.pdf">ptax-receipt.pdf</option>
                    </select>
                  </td>
                  <td>
                    <button type="button" className="tax-deduction-attachment-btn">
                      <FaPaperclip />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="tax-deduction-save-wrap">
            <button type="button" className="tax-save-button">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
