import React, { useState, useMemo } from "react";
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";

export default function LeaveAdjustmentTable({
  attendanceCounts,
  leaveBalance,
  userRequests,
  onSaveUpdates,
  handleClose,
  updatedLOPCount,
}) {
  const { employeeId, isFreeze, lop = 0 } = attendanceCounts || {};

  const [manualAdjustments, setManualAdjustments] = useState({});
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const normalizeRequests = (requests = []) => {
    if (!Array.isArray(requests)) return [];
    return requests.map((req) => {
      if (req.request_type === "CompOff") {
        return {
          type: "COMPOFF",
          days: Number(req.dayValue || req.number_of_days || 0),
        };
      }
      if (req.leave_type) {
        return {
          type: "LEAVE",
          leaveType: req.leave_type,
          days: Number(req.dayValue || req.number_of_days || 0),
        };
      }
      return { type: "OTHER", days: 0 };
    });
  };

  const tableData = useMemo(() => {
    const leaveDetails = leaveBalance?.leaveDetails || [];
    const requestArray = userRequests?.data?.data || [];
    const normalizedRequests = normalizeRequests(requestArray);

    return leaveDetails.map((leave) => {
      const leaveType = leave.leaveTypeName || "Unknown";

      const uniqueId = leave.leaveTypeId?._id || leave.leaveTypeId;

      const appliedLeaves = normalizedRequests
        .filter((r) => r.type === "LEAVE" && r.leaveType === leaveType)
        .reduce((sum, r) => sum + r.days, 0);

      const manualUploadVal = Number(manualAdjustments[uniqueId]) || 0;

      const manualDeducted = manualUploadVal;
      const total = appliedLeaves + manualDeducted;

      return {
        leaveTypeId: uniqueId,
        leaveType,
        balance: Number(leave.closingBalance || 0),
        applied: appliedLeaves,
        manualUpload: manualUploadVal,
        manualDeducted: manualDeducted,
        total: total,
      };
    });
  }, [leaveBalance, userRequests, manualAdjustments]);

  const totalManualDeductions = Object.values(manualAdjustments).reduce(
    (a, b) => a + (Number(b) || 0),
    0,
  );
  const currentLOP = Math.max(0, (Number(lop) || 0) - totalManualDeductions);

  const handleManualChange = (id, value) => {
    if (isFreeze) return;

    const val = value === "" ? 0 : parseFloat(value);
    const safeVal = isNaN(val) ? 0 : val;

    const leave = leaveBalance.leaveDetails?.find(
      (l) => (l.leaveTypeId?._id || l.leaveTypeId) === id,
    );
    if (!leave) return;

    const maxAllowed = Number(leave.closingBalance);

    if (val > maxAllowed) {
      setShowPopup(true);
      setMessage(`Cannot deduct more than balance (${maxAllowed})`);
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      return;
    }

    setManualAdjustments((prev) => ({
      ...prev,
      [id]: safeVal < 0 ? 0 : safeVal,
    }));
  };

  const handleSave = () => {
    const adjustmentsArray = Object.entries(manualAdjustments)
      .filter(([_, days]) => Number(days) > 0)
      .map(([id, days]) => ({
        employeeId,
        leaveTypeId: id,
        days: Number(days),
      }));

    onSaveUpdates(adjustmentsArray);
    updatedLOPCount({ currentLOP, employeeId });
    handleClose();
  };

  return (
    <>
      <div className="LeaveAdjustment_headerName">
        <h2>UserID : {employeeId}</h2>
      </div>

      <div className="attendance-summary-scroll">
        <table className="editable-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Total Balance</th>
              <th>LOP</th>
              <th>Manually Upload</th>
              <th>Leave Applied</th>
              <th>Manual Deducted</th>
              <th>Total Leaves</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No Leave Data Available
                </td>
              </tr>
            ) : (
              tableData.map((row) => (
                <tr key={row.leaveTypeId}>
                  <td>{row.leaveType}</td>
                  <td>{row.balance}</td>

                  <td style={{ fontWeight: "bold", color: "#d32f2f" }}>
                    {currentLOP}
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      className="manual-upload-input"
                      value={row.manualUpload === 0 ? "" : row.manualUpload}
                      placeholder="0"
                      disabled={isFreeze}
                      onChange={(e) =>
                        handleManualChange(row.leaveTypeId, e.target.value)
                      }
                      style={{
                        width: "60px",
                        padding: "5px",
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: isFreeze ? "#f5f5f5" : "white",
                      }}
                    />
                  </td>

                  <td>{row.applied}</td>
                  <td>{row.manualDeducted}</td>
                  <td style={{ fontWeight: "bold" }}>{row.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="adjust_save_btn">
        <button className="adjust_save" onClick={handleSave}>
          Save
        </button>
      </div>
    </>
  );
}
