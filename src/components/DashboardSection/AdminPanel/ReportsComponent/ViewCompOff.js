import React, { useState, useEffect } from "react";
// Make sure this path is correct for your dedicated CSS file
import "../../../ComponentsCss/AdminPanel/ReportsComponent/ViewCompOff.css";
import { FaTimes, FaSearch, FaFileExcel } from "react-icons/fa";
import axios from "axios";
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";
import LeaveTemplate from "../../Request/ApplyRequests/Leave";
import { RiFileExcel2Fill } from "react-icons/ri";

export default function ViewCompOff() {
  const [searchQuery, setSearchQuery] = useState({
    employeeIdentifier: "", // Name or Employee ID
    startDate: "",
    endDate: "",
  });
  const [compOffRequests, setCompOffRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const fetchCompOffRequests = async () => {
    setLoading(true);
    setCompOffRequests([]);

    const API_URL = `${process.env.REACT_APP_API_URL}/request/get_applied_compoff`;

    try {
      const params = {
        employeeIdentifier: searchQuery.employeeIdentifier.trim(),
        startDate: searchQuery.startDate,
        endDate: searchQuery.endDate,
      };

      const response = await axios.get(API_URL, { params });

      if (response.data?.data) {
        setCompOffRequests(response.data.data);
      } else {
        setCompOffRequests([]);
      }
    } catch (error) {
      console.error("Error fetching CompOff requests:", error);
      setMessage("Error fetching data. Please try again.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  // --- New Download Handler ---
  const handleDownloadExcel = () => {
    setLoading(true);
    const API_URL = `${process.env.REACT_APP_API_URL}/request/download_compoff_requests_excel`;

    // Pass current search filters as query parameters
    const params = {
      employeeIdentifier: searchQuery.employeeIdentifier.trim(),
      startDate: searchQuery.startDate,
      endDate: searchQuery.endDate,
      // status: 'Pending', // Add status filter if you integrate it into the search bar
    };

    axios
      .get(API_URL, {
        params,
        responseType: "blob", // CRITICAL: Receive the file as a Blob
      })
      .then((response) => {
        // Create a temporary URL for the Blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        // Use the filename from the Content-Disposition header if available, otherwise use a default
        const contentDisposition = response.headers["content-disposition"];
        let fileName = "CompOff_Requests_Report.xlsx";
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch.length === 2) {
            fileName = filenameMatch[1];
          }
        }

        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url); // Clean up

        setMessage("CompOff report downloaded successfully.");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      })
      .catch((error) => {
        console.error("Download Error:", error);
        setMessage("Failed to download report. Please check the network.");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompOffRequests();
  };
  // Helper function to find the current approver's name
  const getCurrentApproverName = (item) => {
    // 1. Check if the request is completed (Approved/Rejected)
    if (item.completed_or_not) {
      // Find the last person who took action (either accepted or rejected)
      const lastAction = [...item.accepted_array, ...item.rejected_array].sort(
        (a, b) => new Date(b.action_date) - new Date(a.action_date)
      )[0];

      return lastAction ? lastAction.approver_name : "Finalized";
    }

    // 2. If pending, use current_approver_id to find the name in the list
    const currentApproverId = item.current_approver_id;

    const approver = item.list_of_approvers.find(
      (app) => app.employee_id === currentApproverId
    );

    return approver ? approver.name : "Pending Assignment";
  };
  const handleRowClick = (item) => {
    setSelectedItem(item);
  };

  const closePopup = () => {
    setSelectedItem(null);
  };

  useEffect(() => {
    fetchCompOffRequests();
  }, []);

  return (
    // UPDATED CLASS HERE
    <div className="compoff-main-container">
      <h2 className="request_heading">View Compensatory Off Requests</h2>

      {/* --- Revised Search and Filter UI --- */}
      <form onSubmit={handleSearch} className="request-search-form">
        <div className="search-controls-inline">
          <input
            type="text"
            name="employeeIdentifier"
            placeholder="Employee Name or ID"
            value={searchQuery.employeeIdentifier}
            onChange={handleInputChange}
            className="search-input"
            style={{ minWidth: "200px" }}
          />
          <input
            type="date"
            name="startDate"
            placeholder="Start Date"
            value={searchQuery.startDate}
            onChange={handleInputChange}
            className="date-input"
          />
          <input
            type="date"
            name="endDate"
            placeholder="End Date"
            value={searchQuery.endDate}
            onChange={handleInputChange}
            className="date-input"
          />
          <button
            type="submit"
            className="apply-button search-icon-CompOff "
            title="Search"
            style={{
              width: "40px",
              height: "40px",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaSearch />
          </button>
           <button
          onClick={handleDownloadExcel}
          className="apply-button ReportCompOff"
          title="Download Excel Report"
          disabled={loading || compOffRequests.length === 0} // Disable if loading or no data
          style={{
            width: "40px",
            height: "40px",
            padding: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
                            <RiFileExcel2Fill style={{ fontSize: "24px"  }} />
        </button>
        </div>
      </form>

      {/* 💡 NEW EXCEL DOWNLOAD ICON CONTAINER */}
      {/* <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={handleDownloadExcel}
          className="apply-button"
          title="Download Excel Report"
          disabled={loading || compOffRequests.length === 0} // Disable if loading or no data
          style={{
            width: "40px",
            height: "40px",
            padding: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
                            <RiFileExcel2Fill style={{ fontSize: "24px"  }} />
        </button>
      </div> */}
      {/* --- Results Table UI --- */}
      {/* UPDATED CLASS HERE */}
      <div className="compoff-table-wrapper" style={{ marginTop: "10px" }}>
        {loading ? (
          <p>Loading requests...</p>
        ) : compOffRequests.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Requestor Name&ID</th>
                <th>Leave Type</th>
                <th>Days</th>
                <th>Approver Name</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {compOffRequests
                .slice()
                .reverse()
                .map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>
                      {" "}
                      {item?.requestor_name} ({item?.requestor_id})
                    </td>
                    <td
                      onClick={() => handleRowClick(item)}
                      className="request_highlight_leave"
                    >
                      {item?.request_type}{" "}
                    </td>
                    {/* <td>{item?.request_type}</td> */}
                    <td>{item?.number_of_days}</td>
                    <td>{getCurrentApproverName(item)} </td>
                    <td>
                      {item.raised_on
                        ? new Date(item?.raised_on).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {item?.completed_or_not
                        ? item?.isApproved === true
                          ? "Approved"
                          : "Rejected"
                        : "Pending"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className="apply_compOff_noReq">
            No Comp Off requests found for the specified criteria.
          </p>
        )}
      </div>

      {/* --- Popup/Detailed View --- */}
      {selectedItem && (
        <div className="alert-overlay">
          <div className="alert-box">
            <FaTimes className="close-icon" onClick={closePopup} />

            {/* 💡 CHANGE HERE: Pass isReadOnly={true} */}
            <LeaveTemplate
              appliedData={selectedItem}
              onClose={closePopup}
              refreshData={fetchCompOffRequests}
              isReadOnly={true} // <-- NEW PROP: tells the template to hide actions
            />
          </div>
        </div>
      )}

      {showPopup && <Popup />}
    </div>
  );
}
