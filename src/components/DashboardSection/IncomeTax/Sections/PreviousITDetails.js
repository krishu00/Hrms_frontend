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
import "../../../ComponentsCss/IncomeTax/Sections/PreviousITDetails.css";
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";

const INITIAL_TOTALS = {
  totalEarnings: { planner: "", actual: "", approved: "" },
  taxAmount: { planner: "", actual: "", approved: "" },
  ptAmount: { planner: "", actual: "", approved: "" },
  standardDeductionAmount: { planner: "", actual: "", approved: "" },
};

export default function PreviousITDetails({ selectedEmployee: externalSelectedEmployee = null, onEmployeeSelect = null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [internalSelectedEmployee, setInternalSelectedEmployee] = useState(null);
  const selectedEmployee = externalSelectedEmployee ?? internalSelectedEmployee;
  const setSelectedEmployee = onEmployeeSelect ?? setInternalSelectedEmployee;
  const [totals, setTotals] = useState(INITIAL_TOTALS);
  const [attachedFile, setAttachedFile] = useState("");
  const [isAudited, setIsAudited] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);

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

  const handleTotalsChange = (key, field, value) => {
    setTotals((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const formRows = [
    { key: "totalEarnings", label: "Total Earnings" },
    { key: "taxAmount", label: "Tax Amount" },
    { key: "ptAmount", label: "PT Amount" },
    { key: "standardDeductionAmount", label: "Standard Deduction Amount" },
  ];

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
                &times;
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
            <h2>Previous IT Details</h2>
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
            Search and select an employee to display Previous IT details here.
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="previous-it-details-wrap">
          <div className="tax-deduction-table-container">
            <table className="tax-deduction-table previous-it-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Planner</th>
                  <th>Actual</th>
                  <th>Approved</th>
                </tr>
              </thead>
              <tbody>
                {formRows.map((row) => (
                  <tr key={row.key}>
                    <td className="tax-deduction-text-cell">{row.label}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="tax-deduction-input"
                        value={totals[row.key].planner}
                        onChange={(event) =>
                          handleTotalsChange(row.key, "planner", event.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="tax-deduction-input"
                        value={totals[row.key].actual}
                        onChange={(event) =>
                          handleTotalsChange(row.key, "actual", event.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="tax-deduction-input"
                        value={totals[row.key].approved}
                        onChange={(event) =>
                          handleTotalsChange(row.key, "approved", event.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="previous-it-form-grid">
            <div className="previous-it-field-row">
              <label className="previous-it-field-label">File</label>
              <input
                type="file"
                className="previous-it-file-input"
                onChange={(event) => setSelectedUploadFile(event.target.files?.[0] || null)}
              />
              <button type="button" className="previous-it-upload-btn">
                Upload
              </button>
            </div>

            <div className="previous-it-field-row">
              <label className="previous-it-field-label">Attached Files</label>
              <select
                className="tax-deduction-select previous-it-select"
                value={attachedFile}
                onChange={(event) => setAttachedFile(event.target.value)}
              >
                <option value="">Select attached file</option>
                {selectedUploadFile && (
                  <option value={selectedUploadFile.name}>{selectedUploadFile.name}</option>
                )}
                <option value="previous-it-proof.pdf">previous-it-proof.pdf</option>
                <option value="salary-archive.pdf">salary-archive.pdf</option>
              </select>
            </div>

            <div className="previous-it-field-row">
              <label className="previous-it-field-label">Is Audited</label>
              <input
                type="checkbox"
                className="tax-deduction-checkbox previous-it-checkbox"
                checked={isAudited}
                onChange={(event) => setIsAudited(event.target.checked)}
              />
            </div>

            <div className="previous-it-field-row previous-it-remarks-row">
              <label className="previous-it-field-label">Remarks</label>
              <textarea
                className="previous-it-remarks"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                rows="3"
              />
            </div>
          </div>

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
