import React, { useRef, useState } from "react";
import "../../ComponentsCss/UserPayslip/UserPayslip.css";
import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";
import companyLogo from "../../../Company Logos/1.png";
import { FaEye, FaDownload } from "react-icons/fa";
import { ToWords } from "to-words";

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

const PayslipTemplate = ({ payslipResponse }) => {
  const payslipRef = useRef();
  const [loading, setLoading] = useState(false);

  if (!payslipResponse) return null;

  const { companyDetails, employeeDetails, payslips } = payslipResponse;
  const payslip = payslips?.[0];

  if (!payslip) return null;

  // 🔥 FILTER OUT Statutory Component
  const earnings = payslip.salaryDetails
    .filter((item) => item.type === "Earning")
    .map((item) => [item.name, item.calculatedAmount]);

  const deductions = payslip.salaryDetails
    .filter((item) => item.type === "Deduction")
    .map((item) => [item.name, item.calculatedAmount]);

  const maxLength = Math.max(earnings.length, deductions.length);

  // 🔥 PDF DOWNLOAD
  const handleDownloadPdf = async () => {
    if (!payslipRef.current) return;

    setLoading(true);

    try {
      const canvas = await html2canvas(payslipRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdfDoc = await PDFDocument.create();
      const pngImage = await pdfDoc.embedPng(
        imgData.split(",")[1]
      );

      const pageWidth = 595.28;
      const pageHeight = 841.89;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const scale = Math.min(
        pageWidth / pngImage.width,
        pageHeight / pngImage.height
      );

      const scaledWidth = pngImage.width * scale;
      const scaledHeight = pngImage.height * scale;

      const x = (pageWidth - scaledWidth) / 2;
      const y = pageHeight - scaledHeight;

      page.drawImage(pngImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Payslip_${payslip.employeeId}_${payslip.month}_${payslip.year}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setLoading(false);
    }
  };
  const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
  },
});
const netPayWords = toWords.convert(payslip.netPay);

  return (
    <div className="overlay">
      <div className="modal-box payslip-template" ref={payslipRef}>
        
        {/* HEADER */}
        <div className="payslip-header">
          <div className="header-left">
            <img
              src={companyLogo}
              alt="Company Logo"
              className="company-logo"
            />
          </div>

          <div className="company-details">
            <h2>{companyDetails?.name}</h2>
          </div>
        </div>

        <h3 className="payslip-title2">
          Pay Slip - {MONTH_MAP[payslip.month]} {payslip.year}
        </h3>

        {/* EMPLOYEE INFO */}
        <div className="employee-info">
  <div className="employee-data-co">

    <div className="employee-row">
      <span className="employee-label">Employee Name</span>
      <span className="employee-value">
        {employeeDetails.employee_details.name}
      </span>
    </div>

    <div className="employee-row">
      <span className="employee-label">Employee ID</span>
      <span className="employee-value">
        {employeeDetails.employee_id}
      </span>
    </div>

    <div className="employee-row">
      <span className="employee-label">Designation</span>
      <span className="employee-value">
        {employeeDetails.official_details.designation}
      </span>
    </div>

    <div className="employee-row">
      <span className="employee-label">Date of Joining</span>
      <span className="employee-value">
        {new Date(employeeDetails.joining_date).toLocaleDateString()}
      </span>
    </div>

  </div>

  <div className="employee-data">

    <div className="employee-row">
      <span className="employee-label">PF No</span>
      <span className="employee-value">
        {employeeDetails.account_details.pf_number}
      </span>
    </div>

    <div className="employee-row">
      <span className="employee-label">ESI No</span>
      <span className="employee-value">
        {employeeDetails.account_details.esi_number}
      </span>
    </div>

    <div className="employee-row">
      <span className="employee-label">Account No</span>
      <span className="employee-value">
        {employeeDetails.account_details.bank_details.account_number}
      </span>
    </div>

    <div className="employee-row">
      <span className="employee-label">Worked Days</span>
      <span className="employee-value">
        {payslip.payrollSummary.payableDays}
      </span>
    </div>

  </div>
</div>

        {/* SALARY TABLE */}
        <div className="salary-table">
          <div className="table-header-cat-ps">
            <div className="col-cat-ps">Earnings</div>
            <div className="col-cat-ps">Deductions</div>
          </div>

          <div className="table-header-ps">
            <div className="col-ps">Particulars</div>
            <div className="col amount">Amount (₹)</div>
            <div className="col-ps">Particulars</div>
            <div className="col amount">Amount (₹)</div>
          </div>

          {Array.from({ length: maxLength }).map((_, index) => {
            const earning = earnings[index];
            const deduction = deductions[index];

            return (
              <div className="table-row-ps" key={index}>
                <div className="col-ps">
                  {earning ? earning[0] : ""}
                </div>
                <div className="col amount">
                  {earning ? earning[1].toFixed(2) : ""}
                </div>

                <div className="col-ps">
                  {deduction ? deduction[0] : ""}
                </div>
                <div className="col amount">
                  {deduction ? deduction[1].toFixed(2) : ""}
                </div>
              </div>
            );
          })}

          {/* TOTALS */}
          <div className="table-row-ps-last">
            <div className="col-ps"><b>Total Earnings</b></div>
            <div className="amount"><b>{payslip.grossEarnings.toFixed(2)}</b></div>
            <div className="col-ps"><b>Total Deductions</b></div>
            <div className="amount"><b>{payslip.grossDeductions.toFixed(2)}</b></div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer-section">
          <p>Net Pay:<b> ₹{payslip.netPay.toFixed(2)}</b></p>
          <p>
  Amount in Words:<b>{netPayWords}</b>
</p>
          <p className="note">
            Note: This payslip is computer generated and does not require a signature.
          </p>
        </div>
      </div>

      {/* DOWNLOAD BUTTON */}
       <div>
                         {/* <button
                            className="icon-btn icon view"
                            onClick={() => handleViewClick}
                            title="View Payslip"
                          >
                            <FaEye />
                          </button>
         */}
                          <button
                            className="icon-btn icon download"
                             onClick={() => handleDownloadPdf()}
                            title="Download PDF"
                            disabled={loading}
                          >
                            <FaDownload />
                          </button>
                        </div>
                        </div>
  );
};

export default PayslipTemplate;