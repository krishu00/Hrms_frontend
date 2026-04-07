import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../ComponentsCss/Global_request_template/Global_request_template.css";
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../../Utils/Popup/Popup";

function Global_request_template() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [remark, setRemark] = useState("");
  const [visibleBtn, setVisibleBtn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showPopup, setShowPopup, setMessage } = usePopup();

  const isPublic = id.includes("-");

  // ==============================
  // FETCH REQUEST DATA
  // ==============================
  const fetchRequestData = async () => {
    try {
      const url = isPublic
        ? `${process.env.REACT_APP_API_URL}/public/request/${id}`
        : `${process.env.REACT_APP_API_URL}/request/get_request_details/${id}`;

      const response = await axios.get(url);

      if (response.data?.data) {
        setData(response.data.data.request ?? response.data.data);
      }
    } catch (error) {
      console.error("Error fetching request data:", error);
      setShowPopup(true);
      setMessage("Failed to fetch request details. Please try again later");
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  useEffect(() => {
    fetchRequestData();
  }, [id]);

  // ==============================
  // HANDLE APPROVE / REJECT
  // ==============================
  const handleAction = async (action) => {
    try {
      if (!remark.trim()) {
        setShowPopup(true);
        setMessage("Please enter a remark before proceeding");
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }

      if (!data?.encrypt_id) {
        setShowPopup(true);
        setMessage("Invalid request data");
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }

      setIsSubmitting(true);

      const url = isPublic
        ? `${process.env.REACT_APP_API_URL}/public/request/${id}/action`
        : `${process.env.REACT_APP_API_URL}/approve-or-reject/${data.encrypt_id}`;

      const response = await axios.post(url, {
        action,
        remarks_message: remark,
      });

      if (response.status >= 200 && response.status < 300) {
        setVisibleBtn(false);

        // ✅ Native browser alert
        window.alert(`Request ${action}d successfully`);

        // ✅ Close tab/window (email approval UX)
        window.close();

        // 🔁 Fallback if browser blocks close
        setTimeout(() => {
          window.location.href = "/login";
        }, 300);
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      setShowPopup(true);
      setMessage(
        `Failed to ${action} request: ${
          error.response?.data?.message || "Unknown error"
        }`,
      );
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data) {
    return <div>Loading request data...</div>;
  }

  return (
    <div className="RequestCard-div request_global_div">
      <h3 className="RequestCard-title">
        {data.leave_type || "Request Details"}
      </h3>

      {/* Raised By */}
      <div className="raised-by-box">
        <p className="user-name">{data.requestor_id || "N/A"}</p>
        <h2 className="approver_status">
          <span className="approver_status_head">Status:</span>{" "}
          {data.completed_or_not ? "Approved" : "Pending"}
        </h2>
      </div>

      {/* Request Info */}
      <div className="applied-dates-box">
        <p className="box-title">Request Information</p>
        {data.start_date && data.end_date ? (
          <table>
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Leave Type</th>
                <th>No. Of Days</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.start_date.split("T")[0]}</td>
                <td>{data.end_date.split("T")[0]}</td>
                <td>{data.leave_type}</td>
                <td>{data.number_of_days}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Request Type</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{data.request_type}</td>
                <td>{data.reason}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Approvers */}
      <div className="approvers-box">
        <p className="box-title">Approvers</p>
        <table className="approvers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Level</th>
              <th>Applied Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.list_of_approvers?.map((approver, index) => (
              <tr key={index}>
                <td>{approver.name}</td>
                <td>{data.current_level}</td>
                <td>{new Date(data.raised_on).toLocaleDateString()}</td>
                <td>{data.completed_or_not ? "Approved" : "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Remark */}
      <div className="reasons-box">
        <p className="box-title">Remark</p>
        <input
          type="text"
          value={remark}
          disabled={!visibleBtn}
          onChange={(e) => setRemark(e.target.value)}
          className="remark-input"
          placeholder="Enter your remark"
        />
      </div>

      {/* Actions */}
      {visibleBtn && (
        <div className="actions">
          <button
            className="approve"
            disabled={isSubmitting}
            onClick={() => handleAction("approve")}
          >
            Approve
          </button>
          <button
            className="reject"
            disabled={isSubmitting}
            onClick={() => handleAction("reject")}
          >
            Reject
          </button>
        </div>
      )}

      {showPopup && <Popup />}
    </div>
  );
}

export default Global_request_template;
