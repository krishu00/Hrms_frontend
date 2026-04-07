import React, { useState, useEffect } from "react";
import "../../../ComponentsCss/Request/Request.css";
import LeaveTemplate from "../ApplyRequests/Leave/index";
import { FaTimes, FaUndo } from "react-icons/fa";
import axios from "axios";
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";

export default function AppliedByYou() {
  const [appliedData, setAppliedData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const { showPopup, setShowPopup, setMessage } = usePopup();
   const itemCompleted = selectedItem?.completed_or_not;

  const getCompanyCodeAndTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");

    const employee_idCookie = cookies.find((cookie) =>
      cookie.startsWith("employee_id=")
    );
    const employee_id = employee_idCookie
      ? employee_idCookie.split("=")[1]
      : null;

    return { employee_id };
  };

  const fetchAppliedData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/request/get_requested_to_me`
      );
      if (response.data?.data) {
        setAppliedData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching applied data:", error);
    }
  };

  const handleRevoke = async (encryptId) => {
    const { employee_id } = getCompanyCodeAndTokenFromCookies();

    if (!employee_id) {
      console.error("Employee ID not found in cookies!");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/revoke/${encryptId}`,
        { employee_id },
        { withCredentials: true }
      );

      if (response.data?.data) {
        fetchAppliedData();
      }

      setShowPopup(true);
      setMessage("Request revoked successfully!");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Request revoked successfully!");
    } catch (error) {
      console.error("Error revoking request:", error);
      setShowPopup(true);
      setMessage("Failed to revoke the request. Please try again.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Failed to revoke the request. Please try again.");
    }
  };

  useEffect(() => {
    fetchAppliedData();
    getCompanyCodeAndTokenFromCookies();
  }, []);

  const handleRowClick = (item) => {
    setSelectedItem(item);
  };

  const closePopup = () => {
    setSelectedItem(null);
  };

  return (
    <div className="applied_main_container">
      <h2 className="request_heading">Requests Assigned to You</h2>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th className="table_S.no">S.No</th>
              <th className="name-column">Requestor Name</th>
              <th>Request Type</th>
              <th className="reason-column">Reason</th>
              <th>Applied On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appliedData
              .slice()
              .reverse()
              .map((item, index) => (
                <tr key={item._id}>
                  <td className="tableD_S.no">{index + 1}</td>
                  <td className="name-column">{item.requestor_name}</td>
                  <td
                    onClick={() => handleRowClick(item)}
                    className="request_highlight_leave"
                  >
                    {item.request_type}
                  </td>

                  <td className="reason-column"> {item.request_type === "Regularise Attendance" &&
                  (item.regulariseData[0].reason)
                  }
                  {item.request_type === "apply_CompOff" &&
                   (item.compOffData[0].reason)
                  }
                  {item.request_type !== ("apply_CompOff" && "Regularise Attendance")&&
                    (item.reason)
                  }</td>
                  <td>
                    {item.raised_on
                      ? new Date(item.raised_on).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    {" "}
                    {item.completed_or_not
                      ? item.isApproved === true
                        ? "Approved"
                        : "Rejected"
                      : "Pending"}
                  </td>

                  {/* <td
                  className="revoke_icon"
                  onClick={() => handleRevoke(item.encrypt_id)}
                >
                  <FaUndo />
                </td> */}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <div className="alert-overlay">
          <div className="alert-box">
            <FaTimes className="close-icon" onClick={closePopup} />
            <LeaveTemplate
              appliedData={selectedItem}
              onClose={closePopup}
              refreshData={fetchAppliedData}
              isReadOnly={false}
              itemCompleted={itemCompleted}
            />
          </div>
        </div>
      )}
      {showPopup && <Popup />}
    </div>
  );
}
