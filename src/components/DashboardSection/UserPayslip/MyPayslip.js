import React, { useState, useEffect } from "react";
import axios from "axios";
import PayslipTemplate from "./PayslipTemplate";
import "../../ComponentsCss/UserPayslip/MyPayslip.css";
import { Popup } from "../../Utils/Popup/Popup";
import { usePopup } from "../../../context/popup-context/Popup";

const Payslip = () => {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [payslipResponse, setPayslipResponse] = useState(null);
  const [payslipKey, setPayslipKey] = useState(0);
  const { showPopup, setShowPopup, setMessage } = usePopup();
  const monthList = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];
const currentYear = new Date().getFullYear();

const yearList = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
useEffect(() => {
  const now = new Date();
  setYear(now.getFullYear());
  setMonth(now.getMonth() + 1);
}, []);
  const fetchPayslip = async () => {
    if (!year || !month) {
      setShowPopup(true);
      setMessage("Please enter Year and Month");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    try {
      setPayslipResponse(null);
      setPayslipKey((prev) => prev + 1);
      setLoading(true);
      const API_URL = `${process.env.REACT_APP_API_URL}/payslip/my_payslips`;
      const res = await axios.get(API_URL, {
          params: { year, month },
        });

      if (res.data?.success && res.data?.count > 0) {
        setPayslipResponse(res.data.data);
      } else {
        setShowPopup(true);
        setMessage(res.data?.message || "No payslip found");
        setTimeout(() => setShowPopup(false), 3000);
        setPayslipResponse(null);
      }
    } catch (err) {
      console.error(err);
      setShowPopup(true);
      setMessage(err.response?.data?.message || "No payslip found");
      setTimeout(() => setShowPopup(false), 3000);
      setPayslipResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payslip-container">
      
      {/* LEFT INPUT SECTION */}
      <div className="payslip-left">
  <h3>Search Payslip</h3>

  {/* Year Dropdown */}
  <select
    value={year}
    onChange={(e) => setYear(e.target.value)}
    className="mypayslip-input"
  >
    <option value="">Select Year</option>
    {yearList.map((yr) => (
      <option key={yr} value={yr}>
        {yr}
      </option>
    ))}
  </select>

  {/* Month Dropdown */}
  <select
    value={month}
    onChange={(e) => setMonth(e.target.value)}
    className="mypayslip-input"
  >
    <option value="">Select Month</option>
    {monthList.map((m) => (
      <option key={m.value} value={m.value}>
        {m.label}
      </option>
    ))}
  </select>

  <button
    onClick={fetchPayslip}
    disabled={loading}
    className="mypayslip-btn"
  >
    {loading ? "Loading..." : "Fetch Payslip"}
  </button>

         <div style={{ flex: 1 }}>
        {payslipResponse && (
          <PayslipTemplate
            key={`${year}-${month}-${payslipKey}`}
            payslipResponse={payslipResponse}
          />
        )}
      </div>
      </div>

      {/* RIGHT PAYSLIP DISPLAY */}
     
      {showPopup && <Popup />}
    </div>
  );
};

export default Payslip;
