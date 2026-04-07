import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";
import "../../../ComponentsCss/GenerateSalaryComponent/SalaryStructure/BulkCTCUpload.css";

export default function BulkCTCUpload() {
  const { globalData } = useContext(GlobalContext);
  const companyCode = globalData?.userInfo?.companyCode;

  const { showPopup, setShowPopup, setMessage } = usePopup();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Controls UI flow (Step 1: Upload, Step 2: Preview & Save)
  const [step, setStep] = useState(1);
  const [previewData, setPreviewData] = useState([]);
  const [failedRows, setFailedRows] = useState([]);

  const getCookieValue = (name) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

  const token = useMemo(() => getCookieValue("authToken"), []);
console.log("templates" ,templates)
  // Fetch Templates on Load
  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/salary-template/get_all_salaryTemplates`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .then((res) => setTemplates(res.data.data || []))
      .catch((err) => console.error("Failed to fetch templates", err));
  }, [token]);

  // Handle Download Sample
  const handleDownloadSample = async () => {
    if (!selectedTemplate) {
      setShowPopup(true);
      setMessage("Please select a Salary Template first!");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    try {
      setIsDownloading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/ctc-structure/download_bulk_ctc_template`,
        {
          params: { companyCode, salaryTemplateId: selectedTemplate },
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bulk_CTC_Template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      setShowPopup(true);
      setMessage("❌ Failed to download template.");
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Preview Generation
  const handlePreviewUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedTemplate) {
      setShowPopup(true);
      setMessage("Please select a template and upload a file.");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyCode", companyCode);
    formData.append("salaryTemplateId", selectedTemplate);

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/ctc-structure/preview_bulk_ctc`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        setPreviewData(res.data.previewData);
        setFailedRows(res.data.failedRows || []);
        setStep(2); // Move to Preview Table
      }
    } catch (err) {
      console.error("Preview failed", err);
      setShowPopup(true);
      setMessage(
        `❌ Preview generation failed. ${err.response?.data?.message || ""}`,
      );
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Final Save to Database
  const handleConfirmSave = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/ctc-structure/confirm_bulk_ctc`,
        {
          verifiedData: previewData,
          salaryTemplateId: selectedTemplate,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setShowPopup(true);
        setMessage(`✅ ${res.data.message}`);
        setTimeout(() => setShowPopup(false), 3000);

        // Reset process
        setStep(1);
        setFile(null);
        setPreviewData([]);
      }
    } catch (err) {
      console.error("Save failed", err);
      setShowPopup(true);
      setMessage(`❌ Failed to save CTCs.`);
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bulk-ctc-wrapper">
        <h2>Bulk Upload CTC Structures</h2>

        {/* STEP 1: SELECT & UPLOAD */}
        {step === 1 && (
          <div className="bulk-ctc-step-container">
            <div className="bulk-ctc-flex-row">
              <div className="bulk-ctc-input-group">
                <label className="bulk-ctc-label">
                  Step 1: Select Salary Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="bulk-ctc-select"
                >
                  <option value="">-- Select Template --</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDownloadSample}
                disabled={isDownloading}
                className=" global-btn"
              >
                {isDownloading
                  ? "Downloading..."
                  : "⬇ Download Sample Template"}
              </button>
            </div>

            <div className="bulk-upload-zone">
              <label className="bulk-ctc-label">
                Step 2: Upload Filled Excel File
              </label>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setFile(e.target.files[0])}
                className="bulk-file-input"
              />
              <button
                onClick={handlePreviewUpload}
                disabled={loading || !file}
                className="global-btn"
              >
                {loading ? "Processing..." : "Upload & Preview"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & SAVE */}
        {step === 2 && (
          <div className="bulk-ctc-step-container">
            <div className="preview-header-row">
              <h3>Preview Calculated Salaries</h3>
              <div>
                <button onClick={() => setStep(1)} className="btn-bulk-cancel">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={loading || previewData.length === 0}
                  className="global-btn"
                >
                  {loading ? "Saving..." : "Confirm & Save to Database"}
                </button>
              </div>
            </div>

            {failedRows.length > 0 && (
              <div className="error-banner">
                <strong>
                  ⚠️ {failedRows.length} rows had errors and were skipped (e.g.,
                  missing CTC).
                </strong>
              </div>
            )}

            <div className="bulk-table-wrapper">
              <table className="bulk-preview-table">
                <thead>
                  <tr>
                    <th>Emp Code</th>
                    <th>Name</th>
                    <th>Annual CTC</th>

                    {/* Dynamically render component headers from the first employee's structure */}
                    {previewData[0]?.componentBreakup.map((comp, idx) => (
                      <th key={idx}>
                        {comp.component|| comp.abbreviation } 
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.employee_id}</td>
                      <td>{row.employee_name}</td>
                      <td className="ctc-highlight">
                        ₹{row.ctc.toLocaleString()}
                      </td>

                      {/* Render monthly amounts */}
                      {row.componentBreakup.map((comp, idx) => (
                        <td key={idx}>₹{comp.amount.toLocaleString()}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length === 0 && (
                <div className="no-data-text">
                  No valid records found to preview.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showPopup && <Popup />}
    </>
  );
}
