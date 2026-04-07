import React, { useState } from "react";
import axios from "axios";
import "../../../ComponentsCss/AdminPanel/ReportsComponent/LeaveBalance.css"; // Import the CSS file
import SummaryReport from "../../SummaryReport/SummaryReport";
import { RiFileExcel2Fill } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";
import Button from "../../../../context/GlobalButton/globalButton";
import Cookies from "js-cookie";

function LeaveBalance() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [reportData, setReportData] = useState([]);
  const [reportHeaders, setReportHeaders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState([]);

  const leaveTypes = [
    { name: "Annual Leave", value: "anual leave" },
    { name: "Casual Leave", value: "Casual Leave" },
    { name: "Sick Leave", value: "sick leave" },
  ];

  const months = [
    { name: "-- Select --", value: "" },
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

  const handleLeaveTypeChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedLeaveTypes((prevSelected) => [...prevSelected, value]);
    } else {
      setSelectedLeaveTypes((prevSelected) =>
        prevSelected.filter((type) => type !== value)
      );
    }
  };

  const handleViewReport = async () => {
  setErrorMessage("");
  setReportData([]);
  setReportHeaders([]);
  setShowTable(false);

  const apiUrl = `${process.env.REACT_APP_API_URL}/leaves-balance/get-allUsers-leave-balance`;
try {
    const companyCode = Cookies.get("companyCode");
  
  const response = await axios.post(apiUrl,{companyCode});
  // console.log("API Response:??????", response.data);

  const fetchedData = response.data.data;
  console.log("fetchedData", fetchedData);

  const flattenedData = [];
  const allLeaveTypesSet = new Set(); // ✅ FIX ADDED HERE

  fetchedData.forEach((employee) => {
    const row = {
      employeeId: employee.employeeId,
      employeeName: employee.employeeName || "", // fallback
    };

    Object.keys(employee).forEach((key) => {
      if (
        key.startsWith("balance_including_pending_leaves_") ||
        key.startsWith("balance_excluding_pending_leaves_")
      ) {
        row[key] = employee[key];
      }
    });

    if (Array.isArray(employee.leaveDetails)) {
      employee.leaveDetails.forEach((leave) => {
        const type = leave.leaveTypeName;
        if (!type) return;

        if (selectedLeaveTypes.length === 0) {
          allLeaveTypesSet.add(type); // Collect unique types
        } else if (!selectedLeaveTypes.includes(type)) {
          return;
        }

        row[`OB ${type}`] = leave.openingBalance ?? 0;
        row[`AV ${type}`] = leave.availedBalance ?? 0;
        row[`Earned ${type}`] = leave.earnedBalance ?? 0;
        row[`Encash ${type}`] = leave.encashedBalance ?? 0;
        row[`CB ${type}`] = leave.closingBalance ?? 0;
      });
    }

    flattenedData.push(row);
  });

  const headers = [
    { name: "Employee ID", key: "employeeId" },
    { name: "Name", key: "employeeName" },
  ];

 

  const leaveTypesToUse =
    selectedLeaveTypes.length > 0
      ? selectedLeaveTypes
      : Array.from(allLeaveTypesSet); // ← Now this won't throw error

  leaveTypesToUse.forEach((type) => {
    headers.push({ name: `OB ${type}`, key: `OB ${type}` });
    headers.push({ name: `AV ${type}`, key: `AV ${type}` });
    headers.push({ name: `Earned ${type}`, key: `Earned ${type}` });
    headers.push({ name: `Encash ${type}`, key: `Encash ${type}` });
    headers.push({ name: `CB ${type}`, key: `CB ${type}` });
  });
 if (fetchedData.length > 0) {
    const exampleEmployee = fetchedData[0];
    Object.keys(exampleEmployee).forEach((key) => {
      if (
        key.startsWith("balance_including_pending_leaves_") ||
        key.startsWith("balance_excluding_pending_leaves_")
      ) {
        headers.push({ name: key.replaceAll("_", " "), key });
      }
    });
  }
  setReportHeaders(headers);
  setReportData(flattenedData);
  setShowTable(true);
} catch (error) {
  console.error("Error fetching leave report:", error);
  setErrorMessage(
    "Error fetching report: " +
      (error.response?.data?.message || error.message)
  );
}



};


  const handleGoBack = () => {
    setShowTable(false);
    setReportData([]);
    setReportHeaders([]);
    setErrorMessage("");
  };

  // --- NEW: Function to handle Excel download ---
  const handleDownloadExcel = async () => {
    setErrorMessage(""); // Clear previous errors

    // You might want to include the selected filters (month, year, leaveTypes)
    // in the download request as well, so the downloaded Excel reflects the current filters.
    // Ensure your backend endpoint can handle these parameters for the download.
    const downloadParams = {
      month: selectedMonth,
      year: selectedYear,
      // Only include leaveTypes if they are selected
      ...(selectedLeaveTypes.length > 0 && {
        leaveTypes: selectedLeaveTypes.join(","),
      }),
    };

    try {
      const downloadUrl = `${process.env.REACT_APP_API_URL}/leaves-balance/download-allUsers-leave-balance`;
    const companyCode = Cookies.get("companyCode");

      // Important: Set responseType to 'blob' to handle binary file data
      const response = await axios.post(downloadUrl,{companyCode}, {
        params: downloadParams, // Pass current filters to the download API
        responseType: "blob",
      });

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Get filename from Content-Disposition header if available, otherwise default
      const contentDisposition = response.headers["content-disposition"];
      let filename = "leave_report.xlsx"; // Default filename
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
      window.URL.revokeObjectURL(url); // Clean up the URL
    } catch (error) {
      console.error("Error downloading Excel report:", error);
      // Check for specific error messages from the backend if any (e.g., if no data)
      if (error.response && error.response.data instanceof Blob) {
        // If the error response is also a blob (e.g., JSON error sent as blob)
        const reader = new FileReader();
        reader.onload = function () {
          try {
            const errorData = JSON.parse(reader.result);
            setErrorMessage(
              `Error downloading report: ${
                errorData.message || "Unknown error."
              }`
            );
          } catch (e) {
            setErrorMessage(
              "Error downloading report: Could not parse error response."
            );
          }
        };
        reader.readAsText(error.response.data);
      } else {
        setErrorMessage(
          "Error downloading report: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };
  // --- END NEW Function ---

  return (
    <div className="leave-report-containers">
      {!showTable ? (
        <>
          <h2 className="leave-report-title">Leave Balance Report</h2>

          <p className="info-text">
            💡 You can generate the leave report containing the opening balance,
            leave accrued, leave availed and closing balance here. <br />
            💡 Select the leave name and the employee(s) for whom you want the
            leave report.
          </p>

          <div className="leave-report-form">
            <div className="form_section">
              <label>
                <span className="required">*</span> Calendar Year:
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  
                </select>
              </label>

              <label>
                <span className="required">*</span> Month:
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="required"></span> Branch:
                <select>
                  <option>All</option>
                </select>
              </label>

              <label>
                Employee Type:
                <select>
                  <option>Working</option>
                </select>
              </label>
              <div className="leave_checkbox_section">
                <input type="checkbox" className="all_employe_check" />
                <label>All Employees</label>
              </div>
            </div>

            <div className="leave-types">
              <table>
                <thead>
                  <tr>
                    <th>SELECT</th>
                    <th>LEAVE NAME</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveTypes.map((leave) => (
                    <tr key={leave.value}>
                      <td>
                        <input
                          className="input_leave_balence"
                          type="checkbox"
                          value={leave.value}
                          checked={selectedLeaveTypes.includes(leave.value)}
                          onChange={handleLeaveTypeChange}
                        />
                      </td>
                      <td>{leave.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Button
            text="View Report"
            className="view_button_of_balence"
            onClick={handleViewReport}
          ></Button>
        </>
      ) : (
        <>
          <div className="report-header">
            <button className="back-button" onClick={handleGoBack}>
              <IoMdArrowBack style={{ fontSize: "20px", marginRight: "5px" }} />{" "}
              Go Back to Form
            </button>
            <button
              className="Download-button"
              title="Download the Excel Report" // Updated tooltip text
              onClick={handleDownloadExcel} // Attach the new function here
            >
              <RiFileExcel2Fill style={{ fontSize: "24px" }} />
            </button>
          </div>
          {reportData.length > 0 && reportHeaders.length > 0 && (
            <SummaryReport data={reportData} headers={reportHeaders} />
          )}
        </>
      )}

      {/* {errorMessage && <p className="error-message">{errorMessage}</p>} */}
    </div>
  );
}

export default LeaveBalance;
