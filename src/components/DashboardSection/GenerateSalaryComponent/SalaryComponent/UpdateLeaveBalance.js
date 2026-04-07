// src/components/AdminPanel/LeaveBalance/UpdateLeaveBalance.js
import React, { useState } from 'react';
import axios from 'axios';
import '../../../ComponentsCss/GenerateSalaryComponent/UpdateLeaveBalance.css'; // Import the CSS file
import { FaUpload, FaDownload, FaFileExcel } from 'react-icons/fa'; // Icons

function UpdateLeaveBalance() {
  const [companyCode, setCompanyCode] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null); // { type: 'success' | 'error', text: '...' }
  const [downloadMessage, setDownloadMessage] = useState(null); // { type: 'success' | 'error', text: '...' }

  // Base URL for your backend API (replace with your actual backend URL)
  const API_BASE_URL = process.env.REACT_APP_API_URL ;
  

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadMessage(null); // Clear previous messages
  };

  const handleCompanyCodeChange = (event) => {
    setCompanyCode(event.target.value);
    setUploadMessage(null); // Clear previous messages
  };

  const handleUpload = async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (!companyCode) {
      setUploadMessage({ type: 'error', text: 'Please enter a Company Code.' });
      return;
    }
    if (!selectedFile) {
      setUploadMessage({ type: 'error', text: 'Please select an Excel file to upload.' });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('companyCode', companyCode);
    formData.append('excelFile', selectedFile); // 'excelFile' should match the name expected by your backend's multer setup

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/leaves-balance/upload-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });

      setUploadMessage({ type: 'success', text: response.data.message || 'Excel uploaded successfully!' });
      // Optionally clear the form after successful upload
      setCompanyCode('');
      setSelectedFile(null);
      document.getElementById('excelFileInput').value = ''; // Clear file input visually

    } catch (error) {
      console.error('Error uploading Excel:', error);
      setUploadMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload Excel. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = async () => {
    setDownloading(true);
    setDownloadMessage(null);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/leaves-balance/download-sample-excel`, {
        responseType: 'blob', // Important: tells axios to expect a binary response
      });

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Try to get filename from Content-Disposition header, otherwise use a default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'sample_leave_balance.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Clean up the URL

      setDownloadMessage({ type: 'success', text: 'Sample Excel downloaded successfully!' });

    } catch (error) {
      console.error('Error downloading sample Excel:', error);
      setDownloadMessage({
        type: 'error',
        text: 'Failed to download sample Excel. Please try again.'
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="update-leave-balance-container">
      <h2>Update Leave Balance via Excel</h2>

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
          accept=".xlsx, .xls" // Accept only Excel file extensions
          onChange={handleFileChange}
          required
        />
      </div>

      <div className="action-buttons">
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : <><FaUpload /> Upload Excel</>}
        </button>

        <button
          className="download-sample-button"
          onClick={handleDownloadSample}
          disabled={downloading}
        >
          {downloading ? 'Downloading...' : <><FaDownload /> Download Sample Excel</>}
        </button>
      </div>

      {uploadMessage && (
        <p className={`message ${uploadMessage.type}`}>
          {uploadMessage.text}
        </p>
      )}
      {downloadMessage && (
        <p className={`message ${downloadMessage.type}`}>
          {downloadMessage.text}
        </p>
      )}

      <div className="excel-info">
        <FaFileExcel className="excel-icon" />
        <p>
          Ensure your Excel file follows the sample format for successful upload.
          It should contain columns like Employee ID, Leave Type, OB, Earned, Availed, etc.
        </p>
      </div>
    </div>
  );
}

export default UpdateLeaveBalance;