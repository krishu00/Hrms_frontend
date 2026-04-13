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
import "../../../ComponentsCss/IncomeTax/Sections/ProofVerification.css";
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";

const INITIAL_PREVIOUS_IT = {
  totalEarnings: { actual: "", approved: "" },
  taxAmount: { actual: "", approved: "" },
  ptAmount: { actual: "", approved: "" },
  standardDeductionAmount: { actual: "", approved: "" },
};

export default function ProofVerification({ selectedEmployee: externalSelectedEmployee = null, onEmployeeSelect = null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [internalSelectedEmployee, setInternalSelectedEmployee] = useState(null);
  const selectedEmployee = externalSelectedEmployee ?? internalSelectedEmployee;
  const setSelectedEmployee = onEmployeeSelect ?? setInternalSelectedEmployee;
  const [previousIT, setPreviousIT] = useState(INITIAL_PREVIOUS_IT);
  const [attachedFile, setAttachedFile] = useState("");
  const [isAudited, setIsAudited] = useState(false);
  const [previousRemarks, setPreviousRemarks] = useState("");
  const [rentAuditRemarks, setRentAuditRemarks] = useState("");
  const [chapterAuditRemarks, setChapterAuditRemarks] = useState("");
  const [seniorCitizenClaim, setSeniorCitizenClaim] = useState(false);
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
  const regimeType =
    selectedEmployee?.tax_option ||
    selectedEmployee?.taxOption ||
    selectedEmployee?.income_tax?.tax_option ||
    "Old - with deduction";

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

  const handlePreviousITChange = (key, field, value) => {
    setPreviousIT((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const previousRows = [
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
            <h2>Proof Verification</h2>
          </div>

          {selectedEmployee && (
            <span className="tax-status-pill">{employeeStatus}</span>
          )}
        </div>

        {selectedEmployee ? (
          <>
            <div className="tax-employee-grid other-income-top-grid">
              <div className="tax-info-block">
                <span className="tax-info-label">Financial Year</span>
                <span className="tax-info-value">{getFinancialYearString()}</span>
              </div>

              <div className="tax-info-block">
                <span className="tax-info-label">Employee Code</span>
                <span className="tax-info-value">{employeeCode}</span>
              </div>

              <div className="tax-info-block">
                <span className="tax-info-label">Employee Name</span>
                <span className="tax-info-value">{employeeName}</span>
              </div>

              <div className="tax-info-block">
                <span className="tax-info-label">Regime Type</span>
                <span className="tax-info-value other-income-regime">{regimeType}</span>
              </div>

              <div className="tax-info-block">
                <span className="tax-info-label">Employee Status</span>
                <span className="tax-info-value">{employeeStatus}</span>
              </div>
            </div>

            <button type="button" className="other-income-download-btn">
              Total number of attachment uploaded click here to download
            </button>
          </>
        ) : (
          <div className="tax-empty-state">
            Search and select an employee to display Proof Verification details here.
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="other-income-wrap">
          <section className="other-income-section">
            <h3 className="other-income-section-title">Previous IT Details</h3>

            <div className="other-income-previous-grid">
              <div className="other-income-table-spacer" />
              <div className="other-income-column-title">Actual</div>
              <div className="other-income-column-title">Approved</div>

              {previousRows.map((row) => (
                <React.Fragment key={row.key}>
                  <label className="other-income-row-label">{row.label}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    className="tax-deduction-input"
                    value={previousIT[row.key].actual}
                    onChange={(event) =>
                      handlePreviousITChange(row.key, "actual", event.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    className="tax-deduction-input"
                    value={previousIT[row.key].approved}
                    onChange={(event) =>
                      handlePreviousITChange(row.key, "approved", event.target.value)
                    }
                  />
                </React.Fragment>
              ))}
            </div>

            <div className="other-income-inline-form">
              <label className="other-income-row-label">File</label>
              <input
                type="file"
                className="other-income-file-input"
                onChange={(event) => setSelectedUploadFile(event.target.files?.[0] || null)}
              />
              <button type="button" className="other-income-upload-btn">
                Upload
              </button>
            </div>

            <div className="other-income-inline-form">
              <label className="other-income-row-label">Attached Files</label>
              <select
                className="tax-deduction-select other-income-select"
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

            <div className="other-income-inline-form other-income-audit-line">
              <label className="other-income-row-label">Is Audited</label>
              <input
                type="checkbox"
                className="tax-deduction-checkbox"
                checked={isAudited}
                onChange={(event) => setIsAudited(event.target.checked)}
              />
            </div>

            <div className="other-income-remarks-block">
              <label className="other-income-row-label">Remarks</label>
              <textarea
                className="other-income-remarks"
                value={previousRemarks}
                onChange={(event) => setPreviousRemarks(event.target.value)}
                rows="3"
              />
            </div>
          </section>

          <section className="other-income-section">
            <h3 className="other-income-section-title">Exemption Under Section 10</h3>
            <div className="other-income-empty-row">No Records</div>
          </section>

          <section className="other-income-section">
            <h3 className="other-income-section-title">Rent Details</h3>
            <div className="other-income-mini-label">Owner&apos;s PAN Details</div>
            <div className="other-income-empty-row">No Records</div>
            <div className="other-income-rent-actions">
              <button type="button" className="other-income-muted-btn">
                Add Row
              </button>
              <button type="button" className="other-income-muted-btn">
                Delete Row
              </button>
            </div>
            <div className="other-income-empty-row">No Records</div>
            <div className="other-income-remarks-block">
              <label className="other-income-row-label">Audit Remarks</label>
              <textarea
                className="other-income-remarks"
                value={rentAuditRemarks}
                onChange={(event) => setRentAuditRemarks(event.target.value)}
                rows="3"
              />
            </div>
          </section>

          <section className="other-income-section">
            <h3 className="other-income-section-title">Chapter VI A</h3>
            <div className="other-income-empty-row">No Records</div>
            <label className="other-income-checkbox-line">
              <input
                type="checkbox"
                checked={seniorCitizenClaim}
                onChange={(event) => setSeniorCitizenClaim(event.target.checked)}
              />
              <span>
                Claiming for Mediclaim Insurance Premium for your Dependent Parents who are Senior Citizens
              </span>
            </label>
            <div className="other-income-remarks-block">
              <label className="other-income-row-label">Audit Remarks</label>
              <textarea
                className="other-income-remarks"
                value={chapterAuditRemarks}
                onChange={(event) => setChapterAuditRemarks(event.target.value)}
                rows="3"
              />
            </div>
          </section>

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
