import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import "../../../ComponentsCss/AdminPanel/PfReport.css"; // Assuming you are reusing the same CSS
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";

const ESIReport = () => {
  const { globalData } = useContext(GlobalContext);

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false); // Simplified to a single loading state
  const [message, setMessage] = useState("");
  const [companyCode, setCompanyCode] = useState(
    globalData?.userInfo?.companyCode || "",
  );

  const { showPopup, setShowPopup, setMessage: setPopupMessage } = usePopup();

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(() => {
      setMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [message]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const months = [
    { name: "January", value: "1" },
    { name: "February", value: "2" },
    { name: "March", value: "3" },
    { name: "April", value: "4" },
    { name: "May", value: "5" },
    { name: "June", value: "6" },
    { name: "July", value: "7" },
    { name: "August", value: "8" },
    { name: "September", value: "9" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" },
  ];

  const mockCompanies = [
    { code: 1, name: "Daksh" },
    { code: 2, name: "MIT Pvt Ltd" },
    { code: 3, name: "Daksh Global Pvt Ltd" },
    { code: 4, name: "Marche Ricche pri ltd" },
    { code: 5, name: "VNG Enterprises Pvt. Ltd" },
  ];

  const handleDownload = async () => {
    if (!companyCode || !month || !year) {
      const msg = "Please select Company, Month, and Year.";
      setMessage(msg);
      setPopupMessage(msg);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setMessage("");
    setLoading(true);

    const selectedMonthName =
      months.find((m) => m.value === month)?.name || month;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/payslip/download-esic-report`,
        {
          params: { companyCode, month, year },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Fixed filename to say ESIC_Report instead of ECR_Report
      link.setAttribute(
        "download",
        `ESIC_Report_${selectedMonthName}_${year}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      const successMsg = "ESIC Report downloaded successfully!";
      setMessage(successMsg);
      setPopupMessage(successMsg);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      console.error("Error downloading report:", error);
      let errorMsg = "Failed to download the report. Please try again.";

      if (
        error.response &&
        error.response.data &&
        error.response.data instanceof Blob
      ) {
        const text = await error.response.data.text();
        try {
          const jsonError = JSON.parse(text);
          if (jsonError.message) errorMsg = jsonError.message;
        } catch (e) {
          console.error("Failed to parse error blob", e);
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      setMessage(errorMsg);
      setPopupMessage(errorMsg);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="pf-report-wrapper">
        <div className="pf-report-container">
          <div className="pf-report-header">
            <h2>Download ESIC Report</h2>
            <p>
              Select the parameters below to generate and download the ESIC
              monthly contribution report.
            </p>
          </div>

          <div className="pf-report-form">
            <div className="pf-form-group">
              <label htmlFor="esiCompanyCode" className="inline-label">
                Select Company <span className="required">*</span>
              </label>
              <select
                id="esiCompanyCode"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
              >
                <option value="">-- Select Company --</option>
                {mockCompanies.map((company) => (
                  <option key={company.code} value={company.code}>
                    {company.name} (Code: {company.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="pf-form-group">
              <label htmlFor="esiMonth" className="inline-label">
                Select Month <span className="required">*</span>
              </label>
              <select
                id="esiMonth"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">-- Select Month --</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pf-form-group">
              <label htmlFor="esiYear" className="inline-label">
                Select Year <span className="required">*</span>
              </label>
              <select
                id="esiYear"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">-- Select Year --</option>
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {message && (
            <div
              className={`pf-report-message ${
                message.includes("success") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          <div className="pf-report-actions" style={{ gap: "10px" }}>
            <button
              className="global-btn download-btn"
              onClick={handleDownload}
              disabled={loading}
            >
              {loading ? "Generating..." : "Download ESIC Excel"}
            </button>
          </div>
        </div>
      </div>
      {showPopup && <Popup />}
    </>
  );
};

export default ESIReport;
