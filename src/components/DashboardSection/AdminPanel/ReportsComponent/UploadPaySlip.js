import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../ComponentsCss/AdminPanel/UploadPaySlip/UploadPaySlip.css";
import { FaEye, FaDownload } from "react-icons/fa";
import Button from "../../../../context/GlobalButton/globalButton.js";
import { IoIosClose } from "react-icons/io";
import PayslipTemplate from "../../UserPayslip/PayslipTemplate.js";

// --- Month Data for Dropdown ---
const MONTHS = [
  { name: "Select Month", value: "" },
  { name: "January", value: "1" },
  { name: "February", value: "2" },
  { name: "March", value: "3" },
  { name: "April", value: "4" },
  { name: "May", value: "5" },
  { name: "June", value: "6" },
  { name: "July", value: "7" },
  { name: "August", value: "8" },
  { name: "September", value: "9" },
  { name: "October", value: "10" },
  { name: "November", value: "11" },
  { name: "December", value: "12" },
];

const MOCK_COMPANIES = [
  { code: "DKS100", name: "Daksh" },
  { code: "MIT200", name: "MIT Pvt Ltd" },
  { code: "DGL300", name: "Daksh Global Pvt Ltd" },
  { code: "MRP400", name: "Marche Ricche pri ltd" },
];

const getCompanyCodeAndEmployeeIdFromCookies = () => {
  const cookies = Object.fromEntries(
    document.cookie.split("; ").map((cookie) => cookie.trim().split("="))
  );
  const companyCode = cookies["companyCode"] || "DKE100";

  return { companyCode };
};

function UploadPaySlip() {
  const { companyCode } = getCompanyCodeAndEmployeeIdFromCookies();

  // ------------------------------
  // TABLE + FILTER STATES
  // ------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [payslipUsers, setPayslipUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🚨 STATE FOR MODAL VIEW
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [payslipDataForView, setPayslipDataForView] = useState(null);
  const [viewPeriod, setViewPeriod] = useState({ month: "", year: "" });

  const [filterFinancialYear, setFilterFinancialYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  // ------------------------------
  // UPLOAD POPUP STATES
  // ------------------------------
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [financialYear, setFinancialYear] = useState("");
  const [selectedMonthNumber, setSelectedMonthNumber] = useState("");
  // ------------------------------
  // FETCH USERS FROM API
  // ------------------------------
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     setLoading(true);
  //     try {
  //       const API_URL = `${process.env.REACT_APP_API_URL}/payslip/users_payslips/${companyCode}`;
  //       const response = await axios.get(API_URL);
  //       console.log("response ????", response);

  //       setPayslipUsers(response.data.data || []);
  //     } catch (err) {
  //       console.error("Fetch error", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUsers();
  // }, [companyCode]);

  const getMonthName = (monthNumber) =>
    MONTHS.find((m) => m.value === String(monthNumber))?.name || "N/A";

  const handleViewClick = (payslipRecord) => {
    setPayslipDataForView(payslipRecord);
    setViewPeriod({
      month: getMonthName(payslipRecord.payPeriod),
      year: payslipRecord.financialYear,
    });
    setIsViewModalOpen(true);
  };

  const handleDownloadClick = (payslipRecord) => {
    // Implement the axios download call here (GET /download-pdf)
    alert(`Download requested for: ${payslipRecord.employeeId}`);
  };
  // ------------------------------
  // FILTER LOGIC
  // ------------------------------
  const sortedUsers = payslipUsers
    .map((user) => ({
      ...user,
      payPeriod: Number(user.payPeriod), // Convert payPeriod to number
    }))
    .sort((a, b) => a.payPeriod - b.payPeriod); // Sort by payPeriod

  // const filteredUsers = sortedUsers.filter((user) =>
  //   user?.employeeInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  // );
  const filteredUsers = sortedUsers.filter((user) => {
    const nameMatches = user?.employeeInfo?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const idMatches = user.employeeId
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return nameMatches || idMatches; // Check both name and employee ID
  });
  // ------------------------------
  // FILE UPLOAD HANDLERS
  // ------------------------------
  const handleUploadClick = () => {
    setIsPopupOpen(true);
    setUploadStatus(null);
    setFile(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!companyCode || !file || !financialYear || !selectedMonthNumber) {
      setUploadStatus({
        status: "error",
        message: "Please select File, Financial Year, and Pay Period Month.",
      });
      return;
    }

    setUploadStatus({ status: "loading", message: "Uploading..." });

    const formData = new FormData();
    formData.append("payslipFile", file);
    formData.append("financialYear", financialYear);
    formData.append("payPeriod", selectedMonthNumber);

    const API_URL = `${process.env.REACT_APP_API_URL}/payslip/bulk-upload/${companyCode}`;

    try {
      await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadStatus({
        status: "success",
        message: `Payslips uploaded successfully!`,
      });

      // Reset
      setFile(null);
      setFinancialYear("");
      setSelectedMonthNumber("");
    } catch (error) {
      setUploadStatus({
        status: "error",
        message:
          error.response?.data?.message || `Upload failed: ${error.message}`,
      });
    }
  };
  const fetchPayslipData = async () => {
    // if (!filterFinancialYear || !filterMonth) {
    //   alert("Please select Financial Year and Month.");
    //   return;
    // }

    setLoading(true);

    try {
      const API_URL = `${process.env.REACT_APP_API_URL}/payslip/users_payslips/${companyCode}?financialYear=${filterFinancialYear}&month=${filterMonth}&search=${searchTerm}`;

      const response = await axios.get(API_URL);

      setPayslipUsers(response.data.data || []);
    } catch (err) {
      console.error("Fetch error", err);
      setPayslipUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPayslipData();
  };
  const handleDownloadSample = async () => {
    const API_URL = `${process.env.REACT_APP_API_URL}/payslip/download-sample`;
    try {
      const response = await axios.get(API_URL, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "payslip_upload_sample.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Sample Download Error:", error);
      alert("Failed to download the sample file.");
    }
  };

  return (
    <div className="company_container">
      {/* ---------------- HEADER ---------------- */}
      <div className="header">
        <div className="company_title">
          <h1 className="title">Users Payslip</h1>
        </div>

        <div className="add-policy-button-container">
          <Button text=" Upload" onClick={handleUploadClick} />
        </div>
      </div>
      {/* ---------------- FILTER SECTION ---------------- */}
      <div className="filter-section">
        <label htmlFor="financialYear" className="filter-label">
          Filter by F/Y:
        </label>
        <input
          id="financialYear"
          type="text"
          placeholder="YYYY-YYYY"
          className="filter-input"
          value={filterFinancialYear}
          onChange={(e) => setFilterFinancialYear(e.target.value)}
        />

        <label htmlFor="month" className="filter-label">
          Filter by Month:
        </label>
        <select
          id="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="filter-input"
        >
          {MONTHS.map((month) => (
            <option key={month.value} value={month.value}>
              {month.name}
            </option>
          ))}
        </select>
        <label htmlFor="search" className="filter-label">
          Filter by Name:
        </label>
        <input
          id="search"
          type="text"
          placeholder="Enter name..."
          className="filter-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Add Search Button */}
        <button
          className="global-btn"
          onClick={handleSearch} // Define this function to call the API
        >
          Search
        </button>
      </div>

      {/* ---------------- USERS TABLE ---------------- */}
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name (Emp ID)</th>
              <th>Designation</th>
              <th>Month</th>

              <th>Total Working Days</th>
              <th>Net Pay</th>

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.employeeId}>
                  <td>
                    {user?.employeeInfo?.name || "N/A"} ({user.employeeId})
                  </td>
                  <td>{user?.employeeInfo?.designation || "N/A"}</td>
                  <td>{getMonthName(user.payPeriod) || "N/A"}</td>

                  <td>{user?.payrollSummary?.workedDays || 0}</td>
                  <td>{user?.netPay || "N/A"}</td>

                  <td className="action">
                    <FaEye
                      className="icon view"
                      title="View"
                      onClick={() => handleViewClick(user)}
                    />
                    <FaDownload
                      className="icon download"
                      title="Download"
                      onClick={() => handleDownloadClick(user)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- UPLOAD POPUP ---------------- */}
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popap">
            <button
              className="closBtnBulk"
              onClick={() => setIsPopupOpen(false)}
            >
              <IoIosClose />
            </button>

            <h2 className="bulk_heading">Upload Payslip</h2>

            <div className="popup-actions">
              <label className="enterCompanyCode">Financial Year:</label>
              <input
                type="text"
                placeholder="2024-2025"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="companyCodeInput"
              />

              <label className="enterCompanyCode">Pay Period Month:</label>
              <select
                value={selectedMonthNumber}
                onChange={(e) => setSelectedMonthNumber(e.target.value)}
                className="companyCodeInput"
                style={{ height: "40px" }}
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.name}
                  </option>
                ))}
              </select>

              <div className="file-upload-bulk">
                <input type="file" onChange={handleFileChange} />
                {file && (
                  <p style={{ fontSize: "12px", color: "green" }}>
                    File selected: {file.name}
                  </p>
                )}
              </div>

              {uploadStatus && (
                <p
                  style={{
                    fontSize: "13px",
                    color:
                      uploadStatus.status === "error"
                        ? "red"
                        : uploadStatus.status === "success"
                        ? "green"
                        : "blue",
                  }}
                >
                  {uploadStatus.message}
                </p>
              )}

              <div className="submitBtnmutli">
                <button
                  className="uploadBulkBtn"
                  onClick={handleSubmit}
                  disabled={uploadStatus?.status === "loading"}
                >
                  {uploadStatus?.status === "loading"
                    ? "Processing..."
                    : "Submit"}
                </button>

                <button
                  className="SampleDownBtn"
                  onClick={handleDownloadSample}
                >
                  Download Sample
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isViewModalOpen && payslipDataForView && (
        <div className="overlay">
          <PayslipTemplate
            payslipData={payslipDataForView}
            period={viewPeriod}
            onClose={() => setIsViewModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default UploadPaySlip;
