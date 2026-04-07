import React from "react";
import RequestHrForm from "../../../../Utils/RequestHRForm";
import axios from "axios";
import { usePopup } from "../../../../../context/popup-context/Popup";
import { Popup } from "../../../../Utils/Popup/Popup";

export default function RequestToHr({ onClose }) {
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const getCompanyCodeAndTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");
    const getValue = (name) =>
      cookies.find((c) => c.startsWith(`${name}=`))?.split("=")[1] || null;

    return {
      companyCode: getValue("companyCode"),
      employeeId: getValue("employee_id"),
    };
  };

  async function getData({ requestHrData }) {
    const { companyCode, employeeId } = getCompanyCodeAndTokenFromCookies();

    // Missing required cookies
    if (!companyCode || !employeeId) {
      setMessage("Missing company code or employee ID. Please try again.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/request/request_to_hr`,
        requestHrData,
        { withCredentials: true }
      );

      // Optional: You can log or use response.data.message if needed
      console.log("Request created:", response.data);

      setMessage("Request to HR submitted successfully!");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);

      if (onClose) onClose(); // Call onClose safely
    } catch (error) {
      console.error("Request to HR failed:", error);

      const errorMessage =
        error?.response?.data?.message ||
        "Failed to submit Request to HR. Please try again.";

      setMessage(errorMessage);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  }

  return (
    <div>
      <RequestHrForm getData={getData} />
      {showPopup && <Popup />}
    </div>
  );
}
