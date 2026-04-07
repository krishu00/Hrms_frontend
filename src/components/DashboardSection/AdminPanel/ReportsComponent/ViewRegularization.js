import React, { useState, useEffect } from "react";
import "../../../ComponentsCss/AdminPanel/ReportsComponent/ViewCompOff.css";
import { FaTimes, FaSearch } from "react-icons/fa";
import { RiFileExcel2Fill } from "react-icons/ri";
import axios from "axios";
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";
import LeaveTemplate from "../../Request/ApplyRequests/Leave";

export default function ViewRegularization() {
  const [searchQuery, setSearchQuery] = useState({
    employeeIdentifier: "",
    startDate: "",
    endDate: "",
  });

  const [regularizationRequests, setRegularizationRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { showPopup, setShowPopup, setMessage } = usePopup();

  // ---------------- FETCH REGULARIZATION REQUESTS ----------------
  const fetchRegularizationRequests = async () => {
    setLoading(true);
    setRegularizationRequests([]);

    const API_URL = `${process.env.REACT_APP_API_URL}/request/get_All_regularization_request`;

    try {
      const params = {
        employeeIdentifier: searchQuery.employeeIdentifier.trim(),
        startDate: searchQuery.startDate,
        endDate: searchQuery.endDate,
      };

      const response = await axios.get(API_URL, { params });

      if (response.data?.data) {
        setRegularizationRequests(response.data.data);
      } else {
        setRegularizationRequests([]);
      }
    } catch (error) {
      console.error("Error fetching Regularization requests:", error);
      setMessage("Error fetching regularization data.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DOWNLOAD EXCEL ----------------
  const handleDownloadExcel = () => {
    setLoading(true);

    const API_URL = `${process.env.REACT_APP_API_URL}/request/download_All_regularization_request`;

    const params = {
      employeeIdentifier: searchQuery.employeeIdentifier.trim(),
      startDate: searchQuery.startDate,
      endDate: searchQuery.endDate,
    };

    axios
      .get(API_URL, {
        params,
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        const contentDisposition = response.headers["content-disposition"];
        let fileName = "Regularization_Requests_Report.xlsx";

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match && match[1]) fileName = match[1];
        }

        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setMessage("Regularization report downloaded successfully.");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      })
      .catch((error) => {
        console.error("Download Error:", error);
        setMessage("Failed to download regularization report.");
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      })
      .finally(() => setLoading(false));
  };

  // ---------------- HELPERS ----------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRegularizationRequests();
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
  };

  const closePopup = () => {
    setSelectedItem(null);
  };

  const getCurrentApproverName = (item) => {
    if (item.completed_or_not) {
      const lastAction = [...item.accepted_array, ...item.rejected_array].sort(
        (a, b) => new Date(b.action_date) - new Date(a.action_date)
      )[0];

      return lastAction ? lastAction.approver_name : "Finalized";
    }

    const approver = item.list_of_approvers.find(
      (app) => app.employee_id === item.current_approver_id
    );

    return approver ? approver.name : "Pending";
  };

  useEffect(() => {
    fetchRegularizationRequests();
  }, []);

  // ---------------- UI ----------------
  return (
    <div className="compoff-main-container">
      <h2 className="request_heading">View Attendance Regularization Requests</h2>

      {/* SEARCH FORM */}
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
            value={searchQuery.startDate}
            onChange={handleInputChange}
            className="date-input"
          />

          <input
            type="date"
            name="endDate"
            value={searchQuery.endDate}
            onChange={handleInputChange}
            className="date-input"
          />

          <button
            type="submit"
            className="apply-button search-icon-CompOff"
            title="Search"
            style={{ width: "40px", height: "40px" }}
          >
            <FaSearch />
          </button>

          <button
            onClick={handleDownloadExcel}
            type="button"
            className="apply-button ReportCompOff"
            title="Download Excel Report"
            disabled={loading || regularizationRequests.length === 0}
            style={{ width: "40px", height: "40px" }}
          >
            <RiFileExcel2Fill style={{ fontSize: "24px" }} />
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="compoff-table-wrapper" style={{ marginTop: "10px" }}>
        {loading ? (
          <p>Loading requests...</p>
        ) : regularizationRequests.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Employee</th>
                <th>Request Type</th>
                <th>Dates</th>
                <th>Approver</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {regularizationRequests
                .slice()
                .reverse()
                .map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>
                      {item.requestor_name} ({item.requestor_id})
                    </td>
                    <td
                      className="request_highlight_leave"
                      onClick={() => handleRowClick(item)}
                    >
                      {item.request_type}
                    </td>
                    <td>
                      {item.regulariseData?.length || 0}
                    </td>
                    <td>{getCurrentApproverName(item)}</td>
                    <td>
                      {item.raised_on
                        ? new Date(item.raised_on).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {item.completed_or_not
                        ? item.isApproved
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
            No Regularization requests found.
          </p>
        )}
      </div>

      {/* DETAILS POPUP */}
      {selectedItem && (
        <div className="alert-overlay">
          <div className="alert-box">
            <FaTimes className="close-icon" onClick={closePopup} />
            <LeaveTemplate
              appliedData={selectedItem}
              onClose={closePopup}
              refreshData={fetchRegularizationRequests}
              isReadOnly={true}
            />
          </div>
        </div>
      )}

      {showPopup && <Popup />}
    </div>
  );
}
