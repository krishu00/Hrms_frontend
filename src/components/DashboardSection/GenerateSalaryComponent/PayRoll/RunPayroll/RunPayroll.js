import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import "../../../../ComponentsCss/GenerateSalaryComponent/PayRole/RunPayroll/RunPayroll.css";
import { usePopup } from "../../../../../context/popup-context/Popup";
import { Popup } from "../../../../Utils/Popup/Popup";
import { GlobalContext } from "../../../../../context/GlobalContext/GlobalContext";

export default function RunPayroll() {
  const [loading, setLoading] = useState(false);
  const [payrollData, setPayrollData] = useState([]);

  // Breakdown Modal State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { showPopup, setShowPopup, setMessage } = usePopup();

  // 🚨 Grab EVERYTHING from the Global Context!
  const { globalData } = useContext(GlobalContext);
  const companyCode = globalData?.userInfo?.companyCode;
  const month = globalData?.month;
  const year = globalData?.year;
  const { periodKey } = globalData?.payCycle || {};

  // Helper to get cookie for Auth Token
  const getCookieValue = (name) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

  const token = useMemo(() => getCookieValue("authToken"), []);

  const fetchPayrollData = useCallback(async () => {
    if (!companyCode || !periodKey) {
      setShowPopup(true);
      setMessage(
        "Please ensure Company and Payroll Period are selected first.",
      );
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setLoading(true);

    try {
      const formattedMonth = `${year}-${month.toString().padStart(2, "0")}`;

      const [attendanceRes, ctcRes, adjustmentRes] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL}/payrole/get_all_payroleCounts_monthwise`,
          {
            params: { companyCode, month: formattedMonth, limit: 1000 },
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL}/ctc-structure/get_all_employee_salaries`,
          {
            params: { companyCode },
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL}/pay_adjustment/get_adjustments`,
          {
            params: { companyCode, periodKey },
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      ]);

      const adjustmentsMap = {};
      if (adjustmentRes.data.success) {
        adjustmentRes.data.data.forEach((doc) => {
          adjustmentsMap[doc.employee_id] = doc.adjustments || [];
        });
      }

      // 🚀 Send ALL the raw data to the new Backend "Brain"
      const payload = {
        attendanceList: attendanceRes.data.data || [],
        ctcList: ctcRes.data.data || [],
        adjustmentsMap: adjustmentsMap,
      };

      const dynamicRes = await axios.post(
        `${process.env.REACT_APP_API_URL}/ctc-structure/calculate_dynamic_payroll`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (dynamicRes.data.success) {
        setPayrollData(dynamicRes.data.data);
      }
    } catch (error) {
      console.error("Payroll Calculation Error:", error);
      setShowPopup(true);
      setMessage("Failed to fetch payroll data. Check console.");
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setLoading(false);
    }
  }, [companyCode, month, year, periodKey, token, setShowPopup, setMessage]);
  useEffect(() => {
    setPayrollData([]);
  }, [companyCode, periodKey]);

  const handleViewBreakdown = (employee) => {
    setSelectedEmployee(employee);
    setShowBreakdown(true);
  };

  const closeBreakdown = () => {
    setShowBreakdown(false);
    setSelectedEmployee(null);
  };

  const handleSavePayroll = async () => {
    if (payrollData.length === 0) {
      setShowPopup(true);
      setMessage("No payroll data to save. Please process payroll first.");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        companyCode,
        month,
        year,
        periodKey, // Included so backend DB indexes perfectly
        payrollData,
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/payslip/save_processed_payroll`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setShowPopup(true);
        setMessage(
          `✅ Payroll Saved! Inserted: ${res.data.inserted}, Updated: ${res.data.updated}`,
        );
        setTimeout(() => setShowPopup(false), 4000);
      }
    } catch (error) {
      console.error("Save Payroll Error:", error);
      setShowPopup(true);
      // setMessage(error.message);
      const backendMessage =
        error.response?.data?.message || "❌ Failed to save payroll.";

      setMessage(backendMessage);
      setTimeout(() => setShowPopup(false), 8000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="run-payroll-container">
      {/* HEADER & FILTERS */}
      <div className="payroll-header">
        <div className="payroll-filters">
          <button
            className="primary-btn-payroll"
            onClick={fetchPayrollData} // 🚨 User MUST click this to fetch data
            disabled={loading}
          >
            {loading ? "Processing..." : "Process Payroll"}
          </button>
          <button
            className="success-btn-payroll"
            onClick={handleSavePayroll}
            disabled={loading || payrollData.length === 0}
          >
            Save Payroll
          </button>
        </div>
      </div>

      {/* SUMMARY TABLE */}
      <div className="table-container__pay_adjustment">
        <table className="attendance-table__pay_adjustment">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Days (Payable/Total)</th>
              <th className="text-right">Gross Earnings</th>
              <th className="text-right">Gross Deductions</th>
              <th className="text-right">Net Pay</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center">
                  Calculating Salaries...
                </td>
              </tr>
            ) : payrollData.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No Data Processed. Click "Process Payroll".
                </td>
              </tr>
            ) : (
              payrollData.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>{emp.employee_id}</td>
                  <td>{emp.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        emp.payableDays < emp.totalDays ? "warning" : "success"
                      }`}
                    >
                      {emp.payableDays} / {emp.totalDays}
                    </span>
                  </td>
                  <td className="text-right">
                    ₹{emp.grossEarnings.toFixed(2)}
                  </td>
                  <td className="text-right text-red">
                    ₹{emp.grossDeductions.toFixed(2)}
                  </td>
                  <td className="text-right font-bold">
                    ₹{emp.netPay.toFixed(2)}
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => handleViewBreakdown(emp)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* BREAKDOWN MODAL */}
      {showBreakdown && selectedEmployee && (
        <div className="popup-overlay">
          <div className="popup-content large-popup">
            <div className="popup-header">
              <h3>Salary Breakdown: {selectedEmployee.name}</h3>
              <button onClick={closeBreakdown} className="close-btn">
                &times;
              </button>
            </div>

            <div className="popup-body-scrollable">
              <div className="summary-cards">
                <div className="card">
                  <span>Payable Days</span>
                  <strong>{selectedEmployee.payableDays}</strong>
                </div>
                <div className="card">
                  <span>Net Pay</span>
                  <strong>₹{selectedEmployee.netPay.toFixed(2)}</strong>
                </div>
              </div>

              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Type</th>
                    <th>Monthly Rate</th>
                    <th>Calculated Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEmployee.details.map((item, idx) => {
                    // ⭐ FIX: Extract correct properties from Backend JSON
                    // Backend provides: component, amount, pay_type, isAdjustment
                    const componentName =
                      item.component || item.name || "Unknown";
                    const monthlyRate = item.monthlyAmount ?? item.amount ?? 0;
                    const calculatedAmt =
                      item.calculatedAmount ?? item.amount ?? 0;
                    const payType = item.type || item.pay_type || "N/A";

                    return (
                      <tr
                        key={idx}
                        className={item.isAdjustment ? "adjustment-row" : ""}
                      >
                        <td>
                          {componentName}
                          {item.isAdjustment && (
                            <span className="tag-adj">Adjustment</span>
                          )}
                        </td>
                        <td>{payType}</td>
                        <td>
                          {/* ⭐ Added Optional Chaining and Fallbacks */}₹
                          {(Number(monthlyRate) || 0).toLocaleString()}
                        </td>
                        <td className="font-bold">
                          ₹{(Number(calculatedAmt) || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showPopup && <Popup />}
    </div>
  );
}
