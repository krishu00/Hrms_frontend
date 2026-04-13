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
import "../../../ComponentsCss/IncomeTax/Sections/HouseRent.css";
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";

const INITIAL_ROWS = [
  {
    id: 1,
    from: "01-Apr-2025",
    to: "30-Apr-2025",
    isCustomDate: false,
    planner: "",
    actual: "",
    approved: "",
    fileName: "",
    metro: false,
    audited: false,
    remarks: "",
  },
  {
    id: 2,
    from: "01-May-2025",
    to: "31-May-2025",
    isCustomDate: false,
    planner: "",
    actual: "",
    approved: "",
    fileName: "",
    metro: false,
    audited: false,
    remarks: "",
  },
  {
    id: 3,
    from: "01-Jun-2025",
    to: "30-Jun-2025",
    isCustomDate: false,
    planner: "",
    actual: "",
    approved: "",
    fileName: "",
    metro: false,
    audited: false,
    remarks: "",
  },
  {
    id: 4,
    from: "01-Jul-2025",
    to: "31-Jul-2025",
    isCustomDate: false,
    planner: "",
    actual: "",
    approved: "",
    fileName: "",
    metro: false,
    audited: false,
    remarks: "",
  },
  {
    id: 5,
    from: "01-Aug-2025",
    to: "31-Aug-2025",
    isCustomDate: false,
    planner: "",
    actual: "",
    approved: "",
    fileName: "",
    metro: false,
    audited: false,
    remarks: "",
  },
];

export default function HouseRent({ selectedEmployee: externalSelectedEmployee = null, onEmployeeSelect = null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [internalSelectedEmployee, setInternalSelectedEmployee] = useState(null);
  const selectedEmployee = externalSelectedEmployee ?? internalSelectedEmployee;
  const setSelectedEmployee = onEmployeeSelect ?? setInternalSelectedEmployee;
  const [ownerPanDetails, setOwnerPanDetails] = useState("");
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

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "",
        to: "",
        isCustomDate: true,
        planner: "",
        actual: "",
        approved: "",
        fileName: "",
        metro: false,
        audited: false,
        remarks: "",
      },
    ]);
  };

  const handleDeleteRow = () => {
    setRows((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
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
            <h2>Rent Details</h2>
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

            <div className="house-rent-pan-row">
              <label className="house-rent-pan-label">Owner&apos;s PAN Details</label>
              <input
                type="text"
                className="house-rent-pan-input"
                value={ownerPanDetails}
                onChange={(event) => setOwnerPanDetails(event.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="tax-empty-state">
            Search and select an employee to display Rent details here.
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="house-rent-wrap">
          <div className="house-rent-actions">
            <button type="button" className="house-rent-action-btn" onClick={handleAddRow}>
              Add Row
            </button>
            <button type="button" className="house-rent-action-btn" onClick={handleDeleteRow}>
              Delete Row
            </button>
          </div>

          <div className="tax-deduction-table-container">
            <table className="tax-deduction-table house-rent-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Planner</th>
                  <th>Actual</th>
                  <th>Approved</th>
                  <th>File Name</th>
                  <th>File</th>
                  <th>Metro</th>
                  <th>Audited</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {row.isCustomDate ? (
                        <input
                          type="date"
                          className="tax-deduction-input house-rent-date-input"
                          value={row.from}
                          onChange={(event) =>
                            handleRowChange(row.id, "from", event.target.value)
                          }
                        />
                      ) : (
                        row.from || "--"
                      )}
                    </td>
                    <td>
                      {row.isCustomDate ? (
                        <input
                          type="date"
                          className="tax-deduction-input house-rent-date-input"
                          value={row.to}
                          onChange={(event) =>
                            handleRowChange(row.id, "to", event.target.value)
                          }
                        />
                      ) : (
                        row.to || "--"
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        className="tax-deduction-input"
                        value={row.planner}
                        onChange={(event) =>
                          handleRowChange(row.id, "planner", event.target.value)
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
                      <select
                        className="tax-deduction-select"
                        value={row.fileName}
                        onChange={(event) =>
                          handleRowChange(row.id, "fileName", event.target.value)
                        }
                      >
                        <option value="">Select file</option>
                        <option value="rent-slip.pdf">rent-slip.pdf</option>
                        <option value="agreement.pdf">agreement.pdf</option>
                        <option value="owner-proof.pdf">owner-proof.pdf</option>
                      </select>
                    </td>
                    <td>
                      <button type="button" className="tax-deduction-attachment-btn">
                        <FaPaperclip />
                      </button>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        className="tax-deduction-checkbox"
                        checked={row.metro}
                        onChange={(event) =>
                          handleRowChange(row.id, "metro", event.target.checked)
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
                        className="tax-deduction-input house-rent-remark-input"
                        value={row.remarks}
                        onChange={(event) =>
                          handleRowChange(row.id, "remarks", event.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
