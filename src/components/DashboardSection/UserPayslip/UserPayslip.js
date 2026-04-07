import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas"; // 🚨 Re-introducing HTML capture
import { PDFDocument } from "pdf-lib"; // 🚨 Re-introducing PDF creation
import PayslipTemplate from "./PayslipTemplate";
import "../../ComponentsCss/UserPayslip/UserPayslip.css";
import { FaEye, FaDownload } from "react-icons/fa";

// 🚨 Helper to get user context (Assumed correct for fetching)
const getContext = () => {
  // These IDs should come from your cookies/auth context
  const employeeId = "DE-0002";
  const companyCode = "DKE100";
  return { employeeId, companyCode };
};

// Helper to map month number to name for display
const MONTH_MAP = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

// Generates financial year array in YYYY-YYYY format
const generateFinancialYears = () => {
  const currentYear = new Date().getFullYear();
  const years = ["-- Select Year --"];

  for (let i = -2; i <= 1; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    years.push(`${startYear}-${endYear}`);
  }
  return years;
};

const UserPayslip = () => {
  const { employeeId } = getContext();

  const financialYears = generateFinancialYears();

  // --- State Management ---
  const [selectedYear, setSelectedYear] = useState("");
  const [eyeModalVisible, setEyeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false); // 🚨 NEW State
  const payslipRef = useRef();

  // Data states
  const [availablePayslips, setAvailablePayslips] = useState([]);
  const [currentPayslipData, setCurrentPayslipData] = useState(null);
  const [companyHeader, setCompanyHeader] = useState({
    name: "Loading...",
    address: "",
  });

  // -----------------------------------------------------------
  // FETCH AVAILABLE PAYSLIPS (on year change)
  // -----------------------------------------------------------
  useEffect(() => {
    const fetchAvailablePayslips = async () => {
      if (!selectedYear || !employeeId) {
        setAvailablePayslips([]);
        return;
      }

      setLoading(true);
      try {
        // Calls the backend API: GET /api/payslips/my-payslips?financialYear=YYYY-YYYY
        const API_URL = `${process.env.REACT_APP_API_URL}/payslip/Single_users_payslips`;

        const response = await axios.get(API_URL, {
          params: { financialYear: selectedYear },
        });

        // Store company header details and the list of payslips
        setCompanyHeader(response.data.data.company || companyHeader);
        setAvailablePayslips(response.data.data.payslips || []);
      } catch (err) {
        console.error("Error fetching available payslips:", err);
        setAvailablePayslips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailablePayslips();
  }, [selectedYear, employeeId]);

  // --- Handlers ---

  const handleViewClick = (payslipRecord) => {
    setCurrentPayslipData(payslipRecord);
    setEyeModalVisible(true);
  };

  const handleDownloadPdf = async (payslipRecord) => {
    // 1. Set data, open modal, and initiate loading
    setCurrentPayslipData(payslipRecord);
    setEyeModalVisible(true);
    setLoading(true);

    // 2. WAIT for the modal to mount, then START CAPTURE process
    // We wait 50ms for React to commit the new state (isViewModalOpen=true) to the DOM.
    setTimeout(() => setIsCapturing(true), 150);

    // 3. Trigger the capture logic (the useEffect will now fire)
    setIsCapturing(true);
  };

  // 🚨 NEW useEffect to manage the capture pipeline
  useEffect(() => {
    const runCapture = async () => {
      if (!isCapturing || !currentPayslipData) return;

      // Step 1 — wait for modal + data to finish rendering
      await new Promise((resolve) => setTimeout(resolve, 350));

      const element = payslipRef.current;
      if (!element) {
        console.error("Payslip element not found");
        setIsCapturing(false);
        return;
      }

      try {
        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdfDoc = await PDFDocument.create();
        const pngImage = await pdfDoc.embedPng(imgData.split(",")[1]);

        const page = pdfDoc.addPage([595.28, 841.89]);
//    const page = pdfDoc.addPage([595.28, 841.89]);
            
            // Define page/image dimensions
            const pageWidth = 595.28;
            const pageHeight = 841.89;
            
            const scale = Math.min(pageWidth / pngImage.width, pageHeight / pngImage.height);

            const scaledWidth = pngImage.width * scale * 0.95;
            const scaledHeight = pngImage.height * scale * 0.95;

            // 🚨 CRITICAL FIX: Set Y-coordinate for top alignment
            // In pdf-lib, the Y-axis origin (0) is the bottom-left corner.
            // To start 20 points from the top, we must calculate the distance from the bottom.
            const TOP_MARGIN = 20; 
            
            const x = (pageWidth - scaledWidth) / 2; // Center horizontally
            
            const y = pageHeight - scaledHeight ; // <-- CORRECTED CALCULATION - TOP_MARGIN

            page.drawImage(pngImage, {
                x,
                y,
                width: scaledWidth,
                height: scaledHeight,
            });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `Payslip_${currentPayslipData.employeeId}_${currentPayslipData.financialYear}.pdf`;
        link.click();

        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("ERROR GENERATING PDF:", err);
      } finally {
        setEyeModalVisible(false);
        setLoading(false);
        setIsCapturing(false);
      }
    };

    runCapture();
  }, [isCapturing, currentPayslipData]);

  return (
    <div className="payslip-container">
      <h2 className="payslip-title"> Employee Payslip </h2>

      <div className="payslip-label-select">
        <label className="payslip-label">Select Financial Year:</label>
        <select
          className="payslip-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {financialYears.map((y) => (
            <option key={y} value={y === "-- Select Year --" ? "" : y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {selectedYear && (
        <div className="month-list">
          {loading ? (
            <p>Loading payslip history...</p>
          ) : availablePayslips.length > 0 ? (
            availablePayslips.map((item) => (
              <div key={item._id} className="month-row">
                <div>
                  <div className="month-name">
                    {MONTH_MAP[item.payPeriod]} {item.financialYear}
                  </div>
                  <div className="salary-amount">
                    ₹{item.netPay ? item.netPay.toFixed(2) : "N/A"}
                  </div>
                </div>
                <div>
                  <button
                    className="icon-btn icon view"
                    onClick={() => handleViewClick(item)}
                    title="View Payslip"
                  >
                    <FaEye />
                  </button>

                  <button
                    className="icon-btn icon download"
                    onClick={() => handleDownloadPdf(item)}
                    title="Download PDF"
                    disabled={loading}
                  >
                    <FaDownload />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No payslips found for {selectedYear}.</p>
          )}
        </div>
      )}

      {/* 🚨 VIEW MODAL (Uses Reusable Template) */}
      {eyeModalVisible && currentPayslipData && (
        <div className="overlay">
          <PayslipTemplate
            ref={payslipRef}
            payslipData={currentPayslipData}
            period={{
              month: MONTH_MAP[currentPayslipData.payPeriod],
              year: currentPayslipData.financialYear,
            }}
            companyHeader={companyHeader}
            isPdfCapture={isCapturing}
            onClose={() => setEyeModalVisible(false)}
          />
        </div>
      )}
    </div>
  );
};

export default UserPayslip;
