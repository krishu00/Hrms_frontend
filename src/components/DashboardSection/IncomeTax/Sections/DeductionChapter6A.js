import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { FaPaperclip, FaSearch } from "react-icons/fa";
import "../../../ComponentsCss/GenerateSalaryComponent/PayRole/PayAdjustment/PayAdjustment.css";
import "../../../ComponentsCss/IncomeTax/IncomeTax.css";
import "../../../ComponentsCss/IncomeTax/Sections/DeductionChapter6A.css";
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";

// const MAIN_ROWS = [
//   {
//     id: 1,
//     group: "80C",
//     description: "5 Years Fixed Deposits",
//     maxLimit: "150000.00",
//     planner: "",
//     actual: "",
//     approved: "",
//     audited: false,
//     fileName: "",
//     note: "",
//   },
//   {
//     id: 2,
//     group: "80C",
//     description: "ELSS",
//     maxLimit: "150000.00",
//     planner: "",
//     actual: "",
//     approved: "",
//     audited: false,
//     fileName: "",
//     note: "",
//   },
//   {
//     id: 3,
//     group: "80CCD-1B",
//     description: "Additional contribution to NPS",
//     maxLimit: "50000.00",
//     planner: "",
//     actual: "",
//     approved: "",
//     audited: false,
//     fileName: "",
//     note: "",
//   },
//   {
//     id: 4,
//     group: "80D",
//     description: "Medical Insurance - Self and Family",
//     maxLimit: "25000.00",
//     planner: "",
//     actual: "",
//     approved: "",
//     audited: false,
//     fileName: "",
//     note: "",
//   },
//   {
//     id: 5,
//     group: "80E",
//     description: "Interest on Education Loan",
//     maxLimit: "0.00",
//     planner: "",
//     actual: "",
//     approved: "",
//     audited: false,
//     fileName: "",
//     note: "",
//   },
// ];
const MAIN_ROWS = [
  {
    id: 1,
    group: "80C",
    description: "5 Years Fixed Deposits",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 2,
    group: "80C",
    description: "ELSS",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 3,
    group: "80C",
    description: "Infrastructure Bond",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 4,
    group: "80C",
    description: "LIC",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 5,
    group: "80C",
    description: "LIC Deduction Through Salary",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 6,
    group: "80C",
    description: "Mutual Funds",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 7,
    group: "80C",
    description: "NPS",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 8,
    group: "80C",
    description: "NSC",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 9,
    group: "80C",
    description: "NSS",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 10,
    group: "80C",
    description: "Pension Linked Insurance",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 11,
    group: "80C",
    description: "PF",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 12,
    group: "80C",
    description: "Post Office Fixed Deposit Schemes",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 13,
    group: "80C",
    description: "Previous Employer 80C",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 14,
    group: "80C",
    description: "Principal Repayment of Home Loan",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 15,
    group: "80C",
    description: "Public Provident Fund",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 16,
    group: "80C",
    description: "SIP - More than 3 Years Lock-in Period",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 17,
    group: "80C",
    description: "Stamp Duty on House Property",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 18,
    group: "80C",
    description: "Sukanya Samriddhi Yojana",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 19,
    group: "80C",
    description: "Tuition Fee",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 20,
    group: "80C",
    description: "Unit Linked Insurance Plan",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 21,
    group: "80C",
    description: "VPF",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },

  {
    id: 22,
    group: "80CCD(2)",
    description: "Employer NPS Contribution",
    maxLimit: "0.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 23,
    group: "80CCD-1B",
    description: "Additional Contribution to NPS",
    maxLimit: "50000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },

  {
    id: 24,
    group: "80E",
    description: "Interest on Education Loan",
    maxLimit: "0.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },

  {
    id: 25,
    group: "80EE",
    description: "Interest on Home Loan (2016-17)",
    maxLimit: "50000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 26,
    group: "80EEA",
    description: "Interest on Home Loan (2019-22)",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 27,
    group: "80EEB",
    description: "Interest on Electric Vehicle Loan",
    maxLimit: "150000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },

  {
    id: 28,
    group: "80G",
    description: "Donation",
    maxLimit: "0.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 29,
    group: "80G",
    description: "Donation Through Salary",
    maxLimit: "0.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 30,
    group: "80GGA",
    description: "Donations for Scientific Research or Rural Development",
    maxLimit: "10000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 31,
    group: "80GGC",
    description: "Donations to Political Parties",
    maxLimit: "0.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },

  {
    id: 32,
    group: "80TTA",
    description: "Interest on Saving Account",
    maxLimit: "10000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 33,
    group: "80TTB",
    description: "Interest on Deposits Account Sr Citizen",
    maxLimit: "50000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },

  {
    id: 34,
    group: "80U",
    description: "Person With Normal Disability",
    maxLimit: "75000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 35,
    group: "80U",
    description: "Person With Severe Disability",
    maxLimit: "125000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },

  {
    id: 36,
    group: "80DD",
    description: "Maintenance & Medical Treatment for Physical Disability",
    maxLimit: "75000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 37,
    group: "80DD",
    description: "Medical Treatment for Severe Disability",
    maxLimit: "125000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 38,
    group: "80DDB",
    description: "Medical Treatment Expenses for Special Diseases",
    maxLimit: "40000.00",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
];

// const MEDICLAIM_ROWS = [
//   {
//     id: 101,
//     group: "80D",
//     description: "Medical Expenditure - Senior Citizen Parents",
//     planner: "",
//     actual: "",
//     approved: "",
//     audited: false,
//     fileName: "",
//     note: "",
//   },
//   {
//     id: 102,
//     group: "80D",
//     description: "Medical Insurance - Parents",
//     planner: "",
//     actual: "",
//     approved: "",
//     audited: false,
//     fileName: "",
//     note: "",
//   },
//   {
//     id: 103,
//     group: "80D",
//     description: "Preventive Health Checkup - Self and Family",
//     planner: "",
//     actual: "",
//     approved: "",
//     audited: false,
//     fileName: "",
//     note: "",
//   },
// ];
const MEDICLAIM_ROWS = [
  {
    id: 101,
    group: "80D",
    description: "Medical Expenditure - Senior Citizen Parents",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 102,
    group: "80D",
    description: "Medical Expenditure - Senior Citizen Self and Family",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 103,
    group: "80D",
    description: "Medical Insurance - Parents",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 104,
    group: "80D",
    description: "Medical Insurance - Self and Family",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 105,
    group: "80D",
    description: "Medical Insurance Paid Through Salary - Parents",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 106,
    group: "80D",
    description: "Medical Insurance Paid Through Salary - Self and Family",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 107,
    group: "80D",
    description: "Preventive Health Checkup - Parents",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
  {
    id: 108,
    group: "80D",
    description: "Preventive Health Checkup - Self and Family",
    planner: "",
    actual: "",
    approved: "",
    audited: false,
    fileName: "",
    note: "",
  },
];

export default function DeductionChapter6A({ selectedEmployee: externalSelectedEmployee = null, onEmployeeSelect = null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [internalSelectedEmployee, setInternalSelectedEmployee] = useState(null);
  const selectedEmployee = externalSelectedEmployee ?? internalSelectedEmployee;
  const setSelectedEmployee = onEmployeeSelect ?? setInternalSelectedEmployee;
  const [mainRows, setMainRows] = useState(MAIN_ROWS);
  const [mediclaimRows, setMediclaimRows] = useState(MEDICLAIM_ROWS);
  const [auditRemarks, setAuditRemarks] = useState("");
  const [seniorCitizenClaim, setSeniorCitizenClaim] = useState(false);

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
          },
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

  const updateRow = (setter, id, field, value) => {
    setter((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const renderTable = (rows, setter, showLimit = true) => (
    <div className="tax-deduction-table-container">
      <table className="tax-deduction-table deduction-6a-table">
        <thead>
          <tr>
            <th>Group</th>
            <th>Description</th>
            {showLimit && <th>Maximum Limit</th>}
            <th>Planner</th>
            <th>Actual</th>
            <th>Approved</th>
            <th>Audited</th>
            <th>File Name</th>
            <th>File</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.group}</td>
              <td className="tax-deduction-text-cell">{row.description}</td>
              {showLimit && <td>{row.maxLimit}</td>}
              <td>
                <input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  className="tax-deduction-input"
                  value={row.planner}
                  onChange={(event) =>
                    updateRow(setter, row.id, "planner", event.target.value)
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
                    updateRow(setter, row.id, "actual", event.target.value)
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
                    updateRow(setter, row.id, "approved", event.target.value)
                  }
                />
              </td>
              <td>
                <div className="deduction-6a-audit-cell">
                  <input
                    type="checkbox"
                    className="tax-deduction-checkbox"
                    checked={row.audited}
                    onChange={(event) =>
                      updateRow(setter, row.id, "audited", event.target.checked)
                    }
                  />
                  <FaSearch className="deduction-6a-search-icon" />
                </div>
              </td>
              <td>
                <select
                  className="tax-deduction-select"
                  value={row.fileName}
                  onChange={(event) =>
                    updateRow(setter, row.id, "fileName", event.target.value)
                  }
                >
                  <option value="">Select file</option>
                  <option value="investment-proof.pdf">
                    investment-proof.pdf
                  </option>
                  <option value="deduction-proof.pdf">
                    deduction-proof.pdf
                  </option>
                  <option value="medical-proof.pdf">medical-proof.pdf</option>
                </select>
              </td>
              <td>
                <button type="button" className="tax-deduction-attachment-btn">
                  <FaPaperclip />
                </button>
              </td>
              <td>
                <input
                  type="text"
                  className="tax-deduction-input deduction-6a-note-input"
                  value={row.note}
                  onChange={(event) =>
                    updateRow(setter, row.id, "note", event.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
            <h2>Chapter VI A</h2>
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
            Search and select an employee to display tax option details here.
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="deduction-6a-wrap">
          {renderTable(mainRows, setMainRows, true)}

          <div className="deduction-6a-note-section">
            <p className="deduction-6a-note-title">
              As per prevailing Income Tax Act, below are the maximum deduction
              under Section 80D - Mediclaim Insurance Premium
            </p>
            <ul className="deduction-6a-note-list">
              <li>
                INR 25,000/- for Self & Immediate Family including Preventive
                Health Check-up.
              </li>
              <li>
                INR 50,000/- for Self & Immediate Family if any member is a
                Senior Citizen.
              </li>
              <li>INR 25,000/- for Dependent Parents only.</li>
              <li>
                INR 50,000/- for Dependent Parents if one parent is a Senior
                Citizen.
              </li>
              <li>
                Preventive Health Check-up is allowed within the overall
                applicable limit.
              </li>
            </ul>
          </div>

          <label className="deduction-6a-claim-label">
            <input
              type="checkbox"
              checked={seniorCitizenClaim}
              onChange={(event) => setSeniorCitizenClaim(event.target.checked)}
            />
            <span>
              Claiming for Mediclaim Insurance Premium for your Dependent
              Parents who are Senior Citizens
            </span>
          </label>

          {renderTable(mediclaimRows, setMediclaimRows, false)}

          <div className="deduction-6a-audit-remarks">
            <label className="deduction-6a-remarks-label">Audit Remarks</label>
            <textarea
              className="deduction-6a-remarks"
              value={auditRemarks}
              onChange={(event) => setAuditRemarks(event.target.value)}
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
