// src/components/AdminPanel/LinkUserBiometric/LinkUserBiometric.js
import React, { useState } from "react";
import axios from "axios";
import "../../../ComponentsCss/GenerateSalaryComponent/UpdateLeaveBalance.css";
import { FaUpload, FaDownload, FaFileExcel } from "react-icons/fa";
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";

function LinkUserBiometric() {
  const [companyCode, setCompanyCode] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [downloadMessage, setDownloadMessage] = useState(null);
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadMessage(null);
  };

  const handleCompanyCodeChange = (event) => {
    setCompanyCode(event.target.value);
    setUploadMessage(null);
  };

const handleUpload = async (event) => {
  event.preventDefault();

  if (!companyCode) {
    setUploadMessage({ type: "error", text: "Please enter a Company Code." });
    return;
  }
  if (!selectedFile) {
    setUploadMessage({
      type: "error",
      text: "Please select an Excel file to upload.",
    });
    return;
  }

  setUploading(true);
  setUploadMessage(null);

  const formData = new FormData();
  formData.append("companyCode", companyCode);
  formData.append("excelFile", selectedFile);

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/link-biometric/upload-excel`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    // ✅ Success
    if (response.status === 200) {
      const { insertedCount, failedCount, failedMappings = [] } = response.data;

      if (failedCount > 0) {
        const failedList = failedMappings
          .map(
            (item) =>
              `• ${item.employeeId}: ${item.reason || "Unknown reason"}`
          )
          .join("\n");

        setShowPopup(true);
        setMessage(
          `✔️ Inserted: ${insertedCount}\n❌ Failed: ${failedCount}\n\n${failedList}`
        );
      } else {
        setShowPopup(true);
        setMessage(response.data.message || "Excel uploaded successfully!");
      }

      setTimeout(() => setShowPopup(false), 4000);
      setCompanyCode("");
      setSelectedFile(null);
      document.getElementById("excelFileInput").value = "";
    }
  } catch (error) {
    console.error("Error uploading Excel:", error);

    const { message, failedMappings = [] } = error.response?.data || {};

    let detailedError = message || "Failed to upload Excel. Please try again.";

    if (failedMappings.length > 0) {
      const failedList = failedMappings
        .map(
          (item) => `• ${item.employeeId}: ${item.reason || "Unknown reason"}`
        )
        .join("\n");

      detailedError += `\n\n${failedList}`;
    }

    setShowPopup(true);
    setMessage(detailedError);
    setTimeout(() => setShowPopup(false), 5000);
  } finally {
    setUploading(false);
  }
};
  const handleDownloadLinkedUsers = async () => {
    setDownloading(true);
    setDownloadMessage(null);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/link-biometric/download-company-employees`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let filename = "Biometric_link.xlsx";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setShowPopup(true);
      setMessage("Excel downloaded successfully!");
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      console.error("Error downloading  Excel:", error);
      setShowPopup(true);
      setMessage("Failed to download Excel. Please try again.");
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSample = async () => {
    setDownloading(true);
    setDownloadMessage(null);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/link-biometric/download-sample-excel`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let filename = "sample_biometric_link.xlsx";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setShowPopup(true);
      setMessage("Sample Excel downloaded successfully!");
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      console.error("Error downloading sample Excel:", error);
      setShowPopup(true);
      setMessage("Failed to download sample Excel. Please try again.");
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setDownloading(false);
    }
  };

  return (
     <>
    <div className="update-leave-balance-container">
      <h2>Link Users with Smart Office Biometric ID</h2>

      <div className="form-section">
        <label htmlFor="companyCode">Company Code:</label>
        <input
          type="text"
          id="companyCode"
          name="companyCode"
          value={companyCode}
          onChange={handleCompanyCodeChange}
          placeholder="Enter company code"
          required
        />
      </div>

      <div className="form-section">
        <label htmlFor="excelFileInput">Upload Excel File:</label>
        <input
          type="file"
          id="excelFileInput"
          name="excelFile"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          required
        />
      </div>

      <div className="action-buttons">
        <button
          className="download-sample-button"
          onClick={handleDownloadLinkedUsers}
          disabled={uploading}
        >
          {uploading ? (
            "Uploading..."
          ) : (
            <>
              <FaDownload /> Down. Linked Users 
            
            </>
          )}
        </button>

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            "Uploading..."
          ) : (
            <>
              <FaUpload /> Upload Excel
            </>
          )}
        </button>

        <button
          className="download-sample-button"
          onClick={handleDownloadSample}
          disabled={downloading}
        >
          {downloading ? (
            "Downloading..."
          ) : (
            <>
              <FaDownload /> Download Sample Excel
            </>
          )}
        </button>
      </div>

      {uploadMessage && (
        <p className={`message ${uploadMessage.type}`}>{uploadMessage.text}</p>
      )}
      {downloadMessage && (
        <p className={`message ${downloadMessage.type}`}>
          {downloadMessage.text}
        </p>
      )}

      <div className="excel-info">
        <FaFileExcel className="excel-icon" />
        <p>
          Ensure your Excel file contains columns like Employee ID and Biometric
          ID (Smart Office ID) to link correctly.
        </p>
      </div>
   
    </div>
        {showPopup && <Popup />}

  </>
  );
}

export default LinkUserBiometric;
