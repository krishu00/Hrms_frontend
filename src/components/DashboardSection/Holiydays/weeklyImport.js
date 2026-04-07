import React, { useState, useEffect, useRef } from "react";
import "../../ComponentsCss/HolidaysComponent/GeneralImport.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../../Utils/Popup/Popup";
import Button from "../../../context/GlobalButton/globalButton";

function WeeklyImport({ onHolidaysImported }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const navigate = useNavigate();
  const { showPopup, setShowPopup, setMessage } = usePopup();

  // Function to retrieve company code and employee ID from cookies
  const getCompanyCodeAndEmployeeIdFromCookies = () => {
    const cookies = Object.fromEntries(
      document.cookie.split("; ").map((cookie) => cookie.split("="))
    );
    const companyCode = cookies["companyCode"] || null;

    return companyCode;
  };

  useEffect(() => {
    const companyCode = getCompanyCodeAndEmployeeIdFromCookies();
    setCompanyCode(companyCode);
  });
  console.log(companyCode, "companyCode----");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    if (event.target.files[0]) {
      document.querySelector(".file-name").textContent =
        event.target.files[0].name;
    } else {
      document.querySelector(".file-name").textContent = "No file chosen";
    }
  };
  const onClose = () => {
    navigate("/dashboard/Holidays");
  };
  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };
  // Download All Users by Company
  const handleSample = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/download-sample-weekly-holidays`,
        {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `WeekOff_Sample.xlsx`;
      link.click();

      console.log("Excel file downloaded successfully.");
    } catch (err) {
      console.error("Error downloading Excel:", err);
      setError("Failed to download the Excel file.");
    } finally {
      setLoading(false);
    }
  };
  const handleImportClick = async () => {
    console.log("import clicked");

    if (!selectedFile) {
      setUploadError("Please choose a file to import.");
      return;
    }
    console.log(companyCode, "companyCode");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("companyCode", companyCode); // Assuming you need to send companyCode

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload_bulk_weekOff/${companyCode}`, // Replace with your actual API endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // If your API requires cookies
        }
      );

      console.log("File upload successful:", response.data);
      setUploadError("");
      if (onHolidaysImported) {
        onHolidaysImported(); // Callback to refresh the holidays list
      }
      if (response.status === 200) {
        setShowPopup(true);
        setMessage("Bulk week off rules created successfully!");
        setTimeout(() => setShowPopup(false), 3000);
        //alert("Bulk week off rules created successfully");
        navigate("/dashboard/Holidays");
      }
      // Optionally, show a success message
    } catch (error) {
      console.error(
        "File upload error:",
        error.response?.data || error.message
      );
      setUploadError(
        `File upload failed: ${error.response?.data?.message || error.message}`
      );
    }
  };

  return (
    <div className="import-container">
      <div className="file-upload-header">
        <Button text="Back" onClick={onClose} />
        <h2>File Upload</h2>
      </div>

      <div className="checklist-section">
        <h3>CheckList Before Import</h3>
        <ul>
          <li>You can use this import sheet to import holidays</li>
        </ul>
        <h4>Please Note:</h4>
        <ul>
          <li>
            Don't change the names of any sheets or the order of the columns
          </li>
          <li>You should not add any sheets to this file.</li>
          <li>
            This file cannot contain a formula in any cell. Data will not get
            imported if a formula exists in any cell.
          </li>
          <li>Do a 'paste special' to remove any formula before importing</li>
          <li>
            After filling this file save it and import it into Paybooks under
            Configure/Master
          </li>
          <li>
            <a href="#download" onClick={handleSample}>
              Download template here
            </a>
          </li>
        </ul>
      </div>

      <div className="import-file-section">
        <label>Export File</label>
        <div className="file-input-wrapper">
          <button
            className="choose-file-button"
            onClick={handleChooseFileClick}
          >
            Choose File
          </button>
          <span className="file-name">No file chosen</span>
          <input
            type="file"
            className="file-input"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
        {uploadError && <p className="error-message">{uploadError}</p>}
      </div>

      <div className="import-button-section">
        <button className="import-button" onClick={handleImportClick}>
          Import
        </button>
      </div>
      {showPopup && <Popup />}
    </div>
  );
}

export default WeeklyImport;
