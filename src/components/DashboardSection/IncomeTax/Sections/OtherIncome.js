import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { FaPaperclip } from "react-icons/fa";
import "../../../ComponentsCss/GenerateSalaryComponent/PayRole/PayAdjustment/PayAdjustment.css";
import "../../../ComponentsCss/IncomeTax/IncomeTax.css";
import "../../../ComponentsCss/IncomeTax/Sections/OtherIncome.css";
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";

const INITIAL_ROWS = [
  {
    id: 1,
    particular: "Income from other sources",
    yearlyLimit: "0.00",
    planned: "",
    actual: "",
    approved: "",
    hasproof: false,
    audited: false,
    fileName: "",
    rowRemark: "",
  },
  {
    id: 2,
    particular: "Income/loss from house property(Letout)",
    yearlyLimit: "0.00",
    planned: "",
    actual: "",
    approved: "",
    hasproof: false,
    audited: false,
    fileName: "",
    rowRemark: "",
  },
  {
    id: 3,
    particular: "Interest on home loan (Self occupied)",
    yearlyLimit: "0.00",
    planned: "",
    actual: "",
    approved: "",
    hasproof: false,
    audited: false,
    fileName: "",
    rowRemark: "",
  },
];

export default function OtherIncome({ selectedEmployee: externalSelectedEmployee = null, onEmployeeSelect = null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [internalSelectedEmployee, setInternalSelectedEmployee] = useState(null);
  const selectedEmployee = externalSelectedEmployee ?? internalSelectedEmployee;
  const setSelectedEmployee = onEmployeeSelect ?? setInternalSelectedEmployee;
  const [showAll, setShowAll] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [rows, setRows] = useState(INITIAL_ROWS);

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

  const handleRowChange = (id, field, value) => {
    setRows((prev) =>
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

  const visibleRows = showAll ? rows : rows.slice(0, 3);

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
            <h2>Employee Other IT Details
            </h2>
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
            Search and select an employee to display Other Income details here.
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="exemption-sec10-wrap">
          {/* <div className="exemption-sec10-toggle">
            <label className="exemption-sec10-toggle-label">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(event) => setShowAll(event.target.checked)}
              />
              <span>Show All</span>
            </label>
          </div> */}

          <div className="tax-deduction-table-container">
            <table className="tax-deduction-table exemption-sec10-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Max. Limit</th>
                  <th>Planner</th>
                  <th>Actual</th>
                  <th>Approved</th>
                  <th>Has Proof</th>
                  <th>Audited</th>
                  <th>Remarks</th>
                  <th>File Name</th>
                  <th>Attachment</th>
                  <th>Lender</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => (
                  <tr key={row.id}>
                    {/* <td>{index + 1}</td> */}
                    <td className="tax-deduction-text-cell">{row.particular}</td>
                    <td> <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        className="tax-deduction-input"
                        value={row.planned}
                        onChange={(event) =>
                          handleRowChange(row.id, "max-limit", event.target.value)
                        }
                      />
                      </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        className="tax-deduction-input"
                        value={row.planned}
                        onChange={(event) =>
                          handleRowChange(row.id, "planned", event.target.value)
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
                          handleRowChange(row.id, "actual", event.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        className="tax-deduction-input"
                        value={row.approved}
                        onChange={(event) =>
                          handleRowChange(row.id, "approved", event.target.value)
                        }
                      />
                    </td>
                     <td>
                      <input
                        type="checkbox"
                        className="tax-deduction-checkbox"
                        checked={row.hasproof}
                        onChange={(event) =>
                          handleRowChange(row.id, "has-proof", event.target.checked)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="tax-deduction-checkbox"
                        checked={row.audited}
                        onChange={(event) =>
                          handleRowChange(row.id, "audited", event.target.checked)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder=""
                        className="tax-deduction-input exemption-sec10-remark-input"
                        value={row.rowRemark}
                        onChange={(event) =>
                          handleRowChange(row.id, "rowRemark", event.target.value)
                        }
                      />
                    </td>
                     <td>
                      <select
                        className="tax-deduction-select"
                        value={row.fileName}
                        onChange={(event) =>
                          handleRowChange(row.id, "fileName", event.target.value)
                        }
                      >
                        <option value="">Select file</option>
                        <option value="petrol-bill.pdf">petrol-bill.pdf</option>
                        <option value="internet-proof.pdf">internet-proof.pdf</option>
                        <option value="journal-proof.pdf">journal-proof.pdf</option>
                      </select>
                    </td>
                    
                    <td>
                      <button type="button" className="tax-deduction-attachment-btn">
                        <FaPaperclip />
                      </button>
                    </td>
                    <td></td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="exemption-sec10-remarks-block">
            <label className="exemption-sec10-remarks-label">Remarks</label>
            <textarea
              className="exemption-sec10-remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              rows="3"
            />
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
