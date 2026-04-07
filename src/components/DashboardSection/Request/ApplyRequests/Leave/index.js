import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../../ComponentsCss/Request/Leave/Leave.css";
import { usePopup } from "../../../../../context/popup-context/Popup";
import { Popup } from "../../../../Utils/Popup/Popup";
import  SubmitButton  from "../../../../Utils/SubmitButton";

export default function LeaveTemplate({
  appliedData = {},
  onClose,
  refreshData,
  isReadOnly,
  itemCompleted,
}) {
  const [remark, setRemark] = useState("");
  const { showPopup, setShowPopup, setMessage } = usePopup();
  const [leaveBalance, setLeaveBalance] = useState([]);
  // keep track of which action (if any) is currently in-flight
  // so we can show a spinner on the matching button only.
  const [loadingAction, setLoadingAction] = useState(null); // 'approve' | 'reject' | null
  const requestType = appliedData?.request_type;
  const isLeaveConsumption = requestType === "Leave";
  const isCompOff = requestType === "CompOff" ;
    const isApplyCompOff = requestType === "apply_CompOff";

  const isRegularization = requestType === "Regularise Attendance";

  console.log("appliedData????????>>>>>>??", appliedData);
  useEffect(() => {
    // 🚀 UPDATE: Fetch balance for standard Leave AND CompOff requests
    if ((isLeaveConsumption || isCompOff) && appliedData?.requestor_id) {
      const fetchLeaveBalance = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/leaves-balance/get-leaves-balance?employeeId=${appliedData?.requestor_id}`
          );
          if (response.data) {
            setLeaveBalance(response.data.data);
            console.log("leaves balance of users ", response.data.data);
          }
        } catch (error) {
          console.error("Error fetching requested data:", error);
        }
      };
      fetchLeaveBalance();
    }
  }, [isLeaveConsumption, isCompOff, appliedData?.requestor_id]);

  // Helper to format date string
  const formatDate = (dateString) => {
    return dateString ? String(dateString).split("T")[0] : "N/A";
  };

  // Calculate number of days for CompOff (using dayValue if available, otherwise defaulting to existing dayType logic)
  const compOffDays =
    appliedData?.compOffData?.reduce((totalDays, compOff) => {
      // Prioritize the numeric dayValue (1 or 0.5) if available
      const dayValue =
        compOff.dayValue ||
        (compOff.dayType === "Full Day"
          ? 1
          : compOff.dayType === "Half Day"
          ? 0.5
          : 0);
      return totalDays + dayValue;
    }, 0) || 0;

  const handleAction = async (action) => {
    // prevent another action while one is pending
    if (loadingAction) return;
    setLoadingAction(action);

    try {
      if (isReadOnly) {
        console.warn("Attempted to perform action on a read-only template.");
        return;
      }
      if (!remark.trim()) {
        setShowPopup(true);
        setMessage("Please enter a remark before proceeding.");
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }

      const encrypt_id = appliedData?.encrypt_id;

      if (!encrypt_id) {
        setShowPopup(true);
        setMessage("Invalid request data.");
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/approve-or-reject/${encrypt_id}`,
        {
          action,
          remarks_message: remark,
        },
        {
          withCredentials: true,
        }
      );

      setShowPopup(true);
      setMessage(`Request ${action}d successfully!`);
      setTimeout(() => setShowPopup(false), 3000);
      onClose(); // Close the popup
      refreshData(); // Refresh the data in the parent component
    } catch (error) {
      setShowPopup(true);
      setMessage(
        `Failed to ${action} request: ${
          error.response?.data?.message || "Unknown error"
        }`
      );
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setLoadingAction(null);
    }
  };


  return (
    <div className="RequestCard-div">
      <h3 className="RequestCard-title">
        {appliedData?.leave_type || appliedData?.request_type}
      </h3>
      <div className="raised-by-box">
        <p className="user-name">
          {appliedData?.requestor_name || "N/A"} (
          {appliedData?.requestor_id || "N/A"})
        </p>
        <h2 className="approver_status">
          <span className=" approver_status_head">Status</span>{" "}
          <span className="approver_status_heading">
            {" "}
            {/* 🚀 Assuming isApproved is used now, falling back to completed_or_not */}
            {appliedData?.isApproved === true
              ? "Approved"
              : appliedData?.isApproved === false
              ? "Rejected"
              : "Pending"}
          </span>
        </h2>
      </div>

      {/* --- LEAVE BALANCE SECTION (Displayed for ALL consuming/credit requests) --- */}
      {(isLeaveConsumption || isCompOff) &&
        leaveBalance?.leaveDetails?.length > 0 && (
          <div className="leaves-box">
            <p className="box-title">Leave Balance</p>
            <div className="box leaves-container">
              {leaveBalance.leaveDetails.map((leave, index) => (
                <div className="leave-row" key={index}>
                  <p>
                    {leave?.leaveTypeId?.display_name || leave.leaveTypeName}:
                  </p>
                  {/* Displaying Closing Balance (Available to use) */}
                  <p className="small-text">{leave?.closingBalance ?? 0}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      {/* -------- REGULARIZATION SUMMARY (DISPLAY ONLY) -------- */}
      {isRegularization && appliedData?.regulariseData?.length > 0 && (
        <table>
          <thead className="applied_date_table_header">
            <tr>
              <th>Type</th>
              <th>Applied Date</th>
              <th>Submitted Date</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Working Hours</th>
            </tr>
          </thead>
          <tbody>
            {appliedData.regulariseData.map((item, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td >{appliedData.request_type}</td>
                  <td >{formatDate(appliedData.raised_on)}</td>
                  <td >{formatDate(item.date)}</td>
                  <td >{item.punch_in_time || "N/A"}</td>
                  <td >{item.punch_out_time || "N/A"}</td>
                  <td >{item.working_hours || "N/A"}</td>
                </tr>
                <tr>
                  <td colSpan="6" className="reason-col"><strong>Reason:</strong> {item.reason || "N/A"}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {/* 🚀 UPDATED COMP OFF DETAILS SECTION (Used for both Credit & Claim CompOff) */}
      {isCompOff && appliedData?.compOffData?.length > 0 && (
        <div className="comp-off-details-box">
          <p className="box-title">
            Comp-Off Details (Total Days: {compOffDays})
          </p>
          <div className="box comp-off-container">
            <table>
              <thead className="applied_date_table_header">
                <tr>
                  <th>Date</th>
                  <th>Credit Value</th>
                  {/* Show Claimed if available in the data */}
                  {appliedData.compOffData.some(
                    (d) => d.claimed_amount > 0
                  ) && <th>Claimed</th>}
                </tr>
              </thead>
              <tbody>
                {appliedData.compOffData.map((compOff, index) => (
                  <tr key={index}>
                    <td>{formatDate(compOff.date)}</td>
                    <td>{compOff.dayValue || compOff.dayType || "N/A"}</td>
                    {appliedData.compOffData.some(
                      (d) => d.claimed_amount > 0
                    ) && <td>{compOff.claimed_amount ?? 0}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isApplyCompOff && appliedData?.compOffData?.length > 0 && (
        <div className="comp-off-details-box">
          <p className="box-title">
            Comp-Off Details (Total Days: {compOffDays})
          </p>
          <div className="box comp-off-container">
            <table>
              <thead className="applied_date_table_header">
                <tr>
                  <th>Date</th>
                  <th>Credit Value</th>
                  {/* Show Claimed if available in the data */}
                  {appliedData.compOffData.some(
                    (d) => d.claimed_amount > 0
                  ) && <th>Claimed</th>}
                </tr>
              </thead>
              <tbody>
                {appliedData.compOffData.map((compOff, index) => (
                  <React.Fragment key={index}>
                  <tr key={index}>
                    <td>{formatDate(compOff.date)}</td>
                    <td>{compOff.dayValue || compOff.dayType || "N/A"}</td>
                    {appliedData.compOffData.some(
                      (d) => d.claimed_amount > 0
                    ) && <td>{compOff.claimed_amount ?? 0}</td>}
                  </tr>
                   <tr>
                  <td colSpan="6" className="reason-col"><strong>Reason:</strong> {compOff.reason || "N/A"}</td>
                  </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      {/* --- APPLIED DATES / GENERAL REQUEST TABLE --- */}
      {(!isRegularization && !isApplyCompOff) && (

      <div className="applied-dates-box">
        <p className="box-title">Request Summary</p>

        {/* Standard Leave Request Type */}
        {isLeaveConsumption &&
        appliedData?.start_date &&
        appliedData?.end_date ? (
          <table>
            <thead className="applied_date_table_header">
              <tr>
                <th>Applied Date</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Leave Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formatDate(appliedData?.raised_on)}</td>
                <td>{formatDate(appliedData?.start_date)}</td>
                <td>{formatDate(appliedData?.end_date)}</td>
                <td>{appliedData?.number_of_days || "N/A"}</td>
                <td>{appliedData?.leave_type || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          /* CompOff Claim/Credit or Other Request Types */
          <table>
            <thead className="applied_date_table_header">
              <tr>
                <th>Type</th>
                <th>Days Requested</th>
                <th>Date Submitted</th>
                <th>Start Date (If Leave)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{requestType || "N/A"}</td>
                <td>{appliedData?.number_of_days || compOffDays || "N/A"}</td>
                <td>{formatDate(appliedData?.raised_on)}</td>
                <td>
                  {appliedData?.start_date
                    ? formatDate(appliedData?.start_date)
                    : "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
      )}

      {/* Reasons Section */}
      {(!isRegularization && !isApplyCompOff) && (
        <div className="reasons-box">
          <p className="box-title reason_of_leave">Reason</p>
          <p className="box box-reason">{appliedData?.regulariseData?.[0]?.reason ||appliedData?.reason || "N/A"}</p>
        </div>
      )}
     {isReadOnly && (
  <div className="reasons-box">
    <p className="box-title reason_of_leave">Remark</p>
    <p className="box box-reason">
      {appliedData?.accepted_array?.[0]?.remarks ||
        appliedData?.rejected_array?.[0]?.remarks ||
        "N/A"}
    </p>
  </div>
)}

      {/* Remark Input */}
      { !isReadOnly && !itemCompleted && (
        <div className="reasons-box">
          <p className="box-title reason_of_leave">Remark</p>
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="remark-input"
            placeholder="Enter your remark"
          />
        </div>
      )}
      { !isReadOnly && itemCompleted && (
        <div className="reasons-box">
          <p className="box-title reason_of_leave">Remark</p>
         <p className="box box-reason">
      {appliedData?.accepted_array?.[0]?.remarks ||
        appliedData?.rejected_array?.[0]?.remarks ||
        "N/A"}
    </p>
        </div>
      )}


      {/* Action Buttons */}
      {(!isReadOnly && !itemCompleted) && (
        <div className="actions">
          <SubmitButton
            type="submit"
            loading={loadingAction === "approve"}
            className="approve"
            onClick={() => handleAction("approve")}
          >
            Approve
          </SubmitButton>
          <SubmitButton
            type="submit"
            loading={loadingAction === "reject"}
            className="reject"
            onClick={() => handleAction("reject")}
          >
            Reject
          </SubmitButton>
        </div>
      )}
      {showPopup && <Popup />}
    </div>
  );
}
