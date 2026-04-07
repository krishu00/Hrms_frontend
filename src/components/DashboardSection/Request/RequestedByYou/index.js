import React, { useState, useEffect } from "react";
import "../../../ComponentsCss/Request/Request.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Popup } from "../../../Utils/Popup/Popup";
import LeaveTemplate from "../ApplyRequests/Leave/index";
import { FaTimes, FaUndo } from "react-icons/fa";
import { usePopup } from "../../../../context/popup-context/Popup";

export default function RequestedByYou() {
  const [requestedData, setRequestedData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const { showPopup, setShowPopup, setMessage } = usePopup();
  const itemCompleted = selectedItem?.completed_or_not;
  const location = useLocation();
   const fetchRequestedData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/request/get_all_requested_by_me`,
          { withCredentials: true }
        );
        if (response.data && response.data.data) {
          setRequestedData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching requested data:", error);
      }
    };
  useEffect(() => {
   

    fetchRequestedData();
    
    // Optionally clear the refresh flag after fetching
    if (location.state && location.state.refresh) {
      window.history.replaceState(
        { ...window.history.state, usr: { ...location.state, refresh: false } },
        ""
      );
    }
  }, [location.state?.refresh]); // refetch when refresh flag changes
 const handleRowClick = (item) => {
    setSelectedItem(item);
  };

  const closePopup = () => {
    setSelectedItem(null);
  };

  return (
    <div className="applied_main_container">
      <h2 className="request_heading">Requested By You</h2>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th className="table_S.no">S.No</th>
              <th className="name-column">Request To</th>
              <th>Request Type</th>

              <th className="reason-column">Reason</th>
              <th>Applied On</th>

              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requestedData
              .slice()
              .reverse()
              .map((item, index) => (
                <tr key={item._id}>
                  <td className="tableD_S.no" data-label="S.No">
                    {index + 1}
                  </td>
                  <td className="name-column" data-label="Requestor To">
                    {item.list_of_approvers[0].name}
                  </td>

                  <td data-label="Request Type"
                  className="request_highlight_leave" onClick={()=>handleRowClick(item)}>{item.request_type}</td>
                  <td className="reason-column" data-label="Reason">
                  {item.request_type === "Regularise Attendance" &&
                  (item.regulariseData[0].reason)
                  }
                  {item.request_type === "apply_CompOff" &&
                   (item.compOffData[0].reason)
                  }
                  {item.request_type !== ("apply_CompOff" && "Regularise Attendance")&&
                    (item.reason)
                  }
                  </td>
                  <td>
                    {item.raised_on
                      ? new Date(item.raised_on).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td data-label="Status">
                    {item.completed_or_not
                      ? item.isApproved === true
                        ? "Approved"
                        : "Rejected"
                      : "Pending"}
                  </td>
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
                    refreshData={fetchRequestedData}
                    isReadOnly={true}
                    itemCompleted={itemCompleted}
                  />
                </div>
              </div>
            )}
            {showPopup && <Popup />}
    </div>
  );
}
