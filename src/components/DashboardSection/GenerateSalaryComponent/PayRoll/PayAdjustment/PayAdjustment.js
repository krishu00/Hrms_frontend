import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
} from "react";
import axios from "axios";
import "../../../../ComponentsCss/GenerateSalaryComponent/PayRole/PayAdjustment/PayAdjustment.css";
import { usePopup } from "../../../../../context/popup-context/Popup";
import { Popup } from "../../../../Utils/Popup/Popup";
import { GlobalContext } from "../../../../../context/GlobalContext/GlobalContext";

export default function PayAdjustment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAdjustmentPopup, setShowAdjustmentPopup] = useState(false);

  const [showImportPopup, setShowImportPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [variableComponents, setVariableComponents] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [adjustmentRows, setAdjustmentRows] = useState([]);

  const { showPopup, setShowPopup, setMessage } = usePopup();

  const { globalData } = useContext(GlobalContext);
  const companyCode = globalData?.userInfo?.companyCode;
  const month = globalData?.month;
  const year = globalData?.year;
  const { startDate, endDate, periodKey } = globalData?.payCycle || {};

  const wrapperRef = useRef();

  const getCookieValue = (name) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

  const token = useMemo(() => getCookieValue("authToken"), []);

  const downloadBlob = (data, fileName) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const fetchVariableComponents = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/pay_adjustment/get_variable_components`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setVariableComponents(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching components", error);
    }
  }, [token]);

  // ✅ UPDATED: FETCH ALL CTC VARIABLES WITH DEDUPLICATION
  const fetchAllVariableSalaries = useCallback(async () => {
    if (!companyCode) return;
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/ctc-structure/get_all_employee_variable_salaries`,
        {
          params: { companyCode },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        const salaryRows = res.data.data.flatMap((emp) =>
          emp.variableComponents.map((v) => ({
            code: emp.employee_id,
            name: emp.employee_name || emp.employee_id,
            componentId: v.component_id,
            componentName: v.component,
            amount: v.currentAmount,
            type: v.pay_type,
            isFromCTC: true,
          }))
        );

        setAdjustmentRows((prev) => {
          // Keep manual/saved rows
          const savedOrManual = prev.filter((p) => !p.isFromCTC);
          
          // Only add CTC rows if that employee + component combo doesn't exist in saved/manual
          const filteredSalaryRows = salaryRows.filter(
            (sRow) => !savedOrManual.some(prevRow => prevRow.code === sRow.code && prevRow.componentName === sRow.componentName)
          );

          return [...filteredSalaryRows, ...savedOrManual];
        });
      }
    } catch (error) {
      console.error("Error fetching all salaries", error);
    }
  }, [companyCode, token]);

  // ✅ UPDATED: FETCH SAVED ADJUSTMENTS WITH OVERRIDE LOGIC
  const fetchExistingAdjustments = useCallback(async () => {
    if (!companyCode || !periodKey) return;
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/pay_adjustment/get_adjustments`,
        {
          params: { companyCode, periodKey },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        const loadedRows = [];
        res.data.data.forEach((doc) => {
          doc.adjustments.forEach((adj) => {
            loadedRows.push({
              code: doc.employee_id,
              name: doc.employee_name,
              componentId: adj.component_id,
              componentName: adj.component_name,
              amount: adj.amount,
              type: adj.type,
              isSaved: true,
              isFromCTC: false, // Mark these as non-CTC so they aren't removed
            });
          });
        });

        setAdjustmentRows((prev) => {
          // 1. Get all current CTC rows
          const ctcRows = prev.filter((p) => p.isFromCTC);
          
          // 2. Filter CTC rows: Remove if a saved adjustment exists for the same employee + component
          const filteredCTC = ctcRows.filter(
            (ctc) => !loadedRows.some(saved => saved.code === ctc.code && saved.componentName === ctc.componentName)
          );

          // 3. Return filtered CTC rows + the newly loaded saved rows
          return [...filteredCTC, ...loadedRows];
        });
      }
    } catch (error) {
      console.log("Error fetching existing adjustments", error);
    }
  }, [companyCode, periodKey, token]);

  useEffect(() => {
    fetchVariableComponents();
    fetchAllVariableSalaries();
  }, [fetchVariableComponents, fetchAllVariableSalaries]);

  useEffect(() => {
    fetchExistingAdjustments();
  }, [fetchExistingAdjustments]);

  const handleAmountChange = (index, newAmount) => {
    const updatedRows = [...adjustmentRows];
    updatedRows[index].amount = parseFloat(newAmount) || 0;
    setAdjustmentRows(updatedRows);
  };

  const handleSaveManualAdjustment = () => {
    if (!selectedEmployee) return;

    const draftRows = variableComponents
      .map((comp) => ({
        code: selectedEmployee.employee_id,
        name: selectedEmployee.employee_details?.name,
        componentId: comp._id,
        componentName: comp.name,
        amount: parseFloat(inputValues[comp._id]) || 0,
        type: comp.pay_type,
        isFromCTC: false,
      }))
      .filter((row) => row.amount !== 0);

    if (!draftRows.length) {
      setShowPopup(true);
      setMessage("Please enter at least one amount");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setAdjustmentRows((prev) => {
      const otherRows = prev.filter(
        (p) =>
          !(
            p.code === selectedEmployee.employee_id &&
            draftRows.some((d) => d.componentName === p.componentName)
          )
      );
      return [...otherRows, ...draftRows];
    });

    setShowAdjustmentPopup(false);
    setInputValues({});
    setSelectedEmployee(null);
    setSearchTerm("");
  };

  const handleFinalSave = async () => {
    if (!adjustmentRows.length) {
      setShowPopup(true);
      setMessage("No adjustments to save");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    try {
      const groupedByEmployee = {};
      adjustmentRows.forEach((row) => {
        if (!groupedByEmployee[row.code]) {
          groupedByEmployee[row.code] = { employeeName: row.name, adjustments: [] };
        }
        groupedByEmployee[row.code].adjustments.push({
          component_id: row.componentId,
          component_name: row.componentName,
          amount: row.amount,
          type: row.type,
        });
      });

      for (const employeeId of Object.keys(groupedByEmployee)) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/pay_adjustment/save_employee_adjustment`,
          {
            companyCode,
            employeeId,
            employeeName: groupedByEmployee[employeeId].employeeName,
            periodKey,
            startDate,
            endDate,
            adjustments: groupedByEmployee[employeeId].adjustments,
            uploadedBy: "HR Final Save",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowPopup(true);
      setMessage("All adjustments saved successfully ✅");
      setTimeout(() => setShowPopup(false), 3000);
      fetchExistingAdjustments(); 
    } catch (err) {
      console.error(err);
      setShowPopup(true);
      setMessage("Final save failed");
      setTimeout(() => setShowPopup(false), 3000);
    }
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
    [companyCode, token]
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

  const handleEmployeeSelect = (emp) => {
    setSelectedEmployee(emp);
    setShowSuggestions(false);
    setShowAdjustmentPopup(true);
    setSearchTerm("");
  };

  const handleActionChange = (e) => {
    if (e.target.value === "import_pay_adjustment") {
      setShowImportPopup(true);
      e.target.value = "";
    }
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUploadFile = async () => {
    if (!selectedFile) {
      setShowPopup(true);
      setMessage("Please select file");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("companyCode", companyCode);
    formData.append("periodKey", periodKey);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);

    try {
      setIsUploading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/pay_adjustment/upload_payAdjustment`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { errorReport, stats, message } = res.data;

      if (errorReport) {
        setShowPopup(true);
        setMessage(`Upload completed with errors (${stats.failedRows})`);
        setTimeout(() => setShowPopup(false), 3000);
        const byteArray = Uint8Array.from(atob(errorReport), (c) => c.charCodeAt(0));
        downloadBlob(byteArray, "Upload_Errors.xlsx");
      } else {
        setShowPopup(true);
        setMessage(message || "Upload Success");
        setTimeout(() => setShowPopup(false), 3000);
        fetchExistingAdjustments(); 
      }

      setShowImportPopup(false);
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload Error:", err);
      setShowPopup(true);
      setMessage(err.response?.data?.message || "Upload Failed");
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  // const handleDeleteRow = (employeeId, componentName) => {
  //   setAdjustmentRows((prev) =>
  //     prev.filter((r) => !(r.code === employeeId && r.componentName === componentName))
  //   );
  // };
const handleDeleteRow = async (employeeId, componentName) => {
  // if (!window.confirm(`Are you sure you want to delete ${componentName} for ${employeeId}?`)) return;

  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/pay_adjustment/delete_adjustment_row`,
      {
        companyCode,
        employeeId,
        componentName,
        periodKey
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      setAdjustmentRows((prev) =>
        prev.filter((r) => !(r.code === employeeId && r.componentName === componentName))
      );
      setShowPopup(true);
      setMessage("Deleted successfully ✅");
      setTimeout(() => setShowPopup(false), 2000);
    }
  } catch (err) {
    console.error("Delete Error:", err);
    setShowPopup(true);
    setMessage("Failed to delete from server");
    setTimeout(() => setShowPopup(false), 3000);
  }
};
  const handleDownloadTemplate = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/pay_adjustment/download_salaryAdjustment`,
        {
          params: { companyCode, month, year, periodKey },
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      downloadBlob(res.data, `Salary_Adjustment_${month}_${year}.xlsx`);
    } catch (err) {
      console.error("Template Download Error:", err);
      setShowPopup(true);
      setMessage("Download Failed");
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <div className="pay-adjustment-container">
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
                ✕
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

        <select className="filter-select" onChange={handleActionChange} defaultValue="">
          <option value="" disabled>Select Action</option>
          <option value="employee_wise">Employee Wise</option>
          <option value="component_wise">Component Wise</option>
          <option value="import_pay_adjustment">Import Pay Adjustment</option>
        </select>
      </div>

      <div className="table-container__pay_adjustment">
        <table className="attendance-table__pay_adjustment">
          <thead>
            <tr>
              <th>SL.NO</th>
              <th>CODE</th>
              <th>NAME</th>
              <th>SALARY COMPONENT</th>
              <th>AMOUNT</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {adjustmentRows.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data-cell">No Adjustments Found</td>
              </tr>
            ) : (
              adjustmentRows.map((row, index) => (
                <tr key={`${row.code}-${row.componentName}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.componentName}</td>
                  <td>
                    <input 
                      type="number" 
                      className="inline-edit-input"
                      style={{ 
                        width: '100px', 
                        padding: '4px', 
                        border: '1px solid #ccc', 
                        borderRadius: '4px',
                        textAlign: 'right'
                      }}
                      value={row.amount} 
                      onChange={(e) => handleAmountChange(index, e.target.value)} 
                    />
                  </td>
                  <td>
                    <button 
                      className="delete-btn-adjustment"
                      onClick={() => handleDeleteRow(row.code, row.componentName)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="final-save-container">
          <button className="primary-btn_adjustment final-save-btn" onClick={handleFinalSave}>
            Save All Adjustments
          </button>
        </div>
      </div>

      {showAdjustmentPopup && selectedEmployee && (
        <div className="popup-overlay">
          <div className="popup-content large-popup" style={{ width: "650px" }}>
            <div className="popup-header">
              <h3>
                Add Employee Adjustment
                <br />
                <span style={{ fontSize: "13px", color: "#666", fontWeight: "normal" }}>
                  {selectedEmployee.employee_details?.name} ({selectedEmployee.employee_id})
                </span>
              </h3>
              <button className="close-popup-btn" onClick={() => setShowAdjustmentPopup(false)}>&times;</button>
            </div>

            <div className="popup-body-scrollable">
              <div style={{ marginBottom: "15px", padding: "10px", background: "#f8f9fa", borderRadius: "5px", fontSize: "13px" }}>
                <strong>Note:</strong> Adjustments made here will be added to the list below.
              </div>
              <table className="attendance-table__pay_adjustment" style={{ marginTop: "0" }}>
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Component Name</th>
                    <th style={{ width: "30%" }}>Pay Type</th>
                    <th style={{ width: "30%" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {variableComponents.length > 0 ? (
                    variableComponents.map((comp) => (
                      <tr key={comp._id}>
                        <td style={{ textAlign: "left", fontWeight: "500" }}>{comp.name}</td>
                        <td>
                          <span style={{
                            padding: "2px 8px", borderRadius: "10px", fontSize: "11px",
                            backgroundColor: comp.pay_type === "Deduction" ? "#ffebee" : "#e8f5e9",
                            color: comp.pay_type === "Deduction" ? "#c62828" : "#2e7d32",
                            border: `1px solid ${comp.pay_type === "Deduction" ? "#ffcdd2" : "#c8e6c9"}`
                          }}>
                            {comp.pay_type}
                          </span>
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="0"
                            className="search-input"
                            style={{ width: "100%", height: "30px", textAlign: "right" }}
                            value={inputValues[comp._id] || ""}
                            onChange={(e) => setInputValues((prev) => ({ ...prev, [comp._id]: e.target.value }))}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data-cell">No variable components found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="popup-footer">
              <button className="primary-btn_adjustment" onClick={handleSaveManualAdjustment}>
                Add to List
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportPopup && (
        <div className="popup-overlay">
          <div className="popup-content large-popup">
            <div className="popup-header">
              <h3>Import Pay Adjustment</h3>
              <button onClick={() => setShowImportPopup(false)}>&times;</button>
            </div>
            <div className="popup-body-scrollable">
              <div className="instruction-section">
                <h4>Instructions for using this import template</h4>
                <p>You can use this template to import bulk input in variable pay components.</p>
                <div className="upload-section">
                  <label>Upload Filled File:</label>
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                </div>
              </div>
              <div className="popup-footer">
                <button onClick={handleDownloadTemplate}>⬇ Download Template</button>
                <button onClick={handleUploadFile} disabled={isUploading} className="primary-btn_adjustment">
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPopup && <Popup />}
    </div>
  );
}