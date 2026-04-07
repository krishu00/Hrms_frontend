import React, { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import "../../../../ComponentsCss/GenerateSalaryComponent/PayRole/ConfirmPayroll/ConfirmPayroll.css";
import { GlobalContext } from "../../../../../context/GlobalContext/GlobalContext";
import { usePopup } from "../../../../../context/popup-context/Popup";
import { Popup } from "../../../../Utils/Popup/Popup";

export default function ConfirmPayroll() {
  const { globalData } = useContext(GlobalContext);
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const currentMonth = globalData?.month;
  const currentYear = globalData?.year;
  const companyCode = globalData?.userInfo?.companyCode;
  const { periodKey } = globalData?.payCycle || {};

  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // NEW STATE: For the Bank Statement button loading status
  const [isDownloadingBank, setIsDownloadingBank] = useState(false);

  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [showHeaderSelector, setShowHeaderSelector] = useState(false);
  const [headerLoading, setHeaderLoading] = useState(false);
  const [isSavingHeaders, setIsSavingHeaders] = useState(false);
  const [allHeaders, setAllHeaders] = useState([]);
  const [selectedHeaders, setSelectedHeaders] = useState([]);

  const [summaryData, setSummaryData] = useState({
    current: { employees: 0, earnings: 0, deductions: 0, netPay: 0 },
    previous: { employees: 0, earnings: 0, deductions: 0, netPay: 0 },
  });

  const formatMonthYear = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  const formatCurrency = (val) => `Rs ${Number(val || 0).toLocaleString("en-IN")}`;

  const currentMonthLabel = formatMonthYear(currentMonth, currentYear);
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const prevMonthLabel = formatMonthYear(prevMonth, prevYear);

  const getCookieValue = (name) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

  const token = useMemo(() => getCookieValue("authToken"), []);

  useEffect(() => {
    const fetchComparison = async () => {
      if (!companyCode) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/payslip/compare_payroll`,
          {
            params: { companyCode, month: currentMonth, year: currentYear },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setSummaryData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load payroll comparison", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [companyCode, currentMonth, currentYear, token]);

  const tableRows = [
    {
      key: "employees",
      label: "Total Employees",
      current: summaryData.current.employees,
      previous: summaryData.previous.employees,
      isCurrency: false,
    },
    {
      key: "earnings",
      label: "Total Earnings",
      current: summaryData.current.earnings,
      previous: summaryData.previous.earnings,
      isCurrency: true,
    },
    {
      key: "deductions",
      label: "Total Deductions",
      current: summaryData.current.deductions,
      previous: summaryData.previous.deductions,
      isCurrency: true,
    },
    {
      key: "netPay",
      label: "Total Net Pay",
      current: summaryData.current.netPay,
      previous: summaryData.previous.netPay,
      isCurrency: true,
    },
  ];

  const availableHeadersToAdd = allHeaders.filter(
    (header) => !selectedHeaders.includes(header)
  );

  const closeHeaderModal = () => {
    setShowHeaderModal(false);
    setShowHeaderSelector(false);
  };

  const fetchPayrollHeaders = async () => {
    if (!companyCode) {
      setShowPopup(true);
      setMessage("Company code is missing.");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setHeaderLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/payslip/list_headers`,
        {
          params: { companyCode },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const headers = response.data?.headers || [];
      const savedHeaders = response.data?.payrollHeaders || [];

      setAllHeaders(headers);
      setSelectedHeaders(savedHeaders.length ? savedHeaders : headers);
      setShowHeaderModal(true);
      setShowHeaderSelector(false);
    } catch (error) {
      console.error("Failed to fetch payroll headers", error);
      setShowPopup(true);
      setMessage("Failed to load Excel headers.");
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setHeaderLoading(false);
    }
  };

  const handleOpenHeaderModal = () => {
    fetchPayrollHeaders();
  };

  const handleAddHeader = (header) => {
    setSelectedHeaders((prev) =>
      prev.includes(header) ? prev : [...prev, header]
    );
  };

  const handleRemoveHeader = (header) => {
    setSelectedHeaders((prev) => prev.filter((item) => item !== header));
  };

  const handleSaveHeaders = async () => {
    if (!companyCode) {
      setShowPopup(true);
      setMessage("Company code is missing.");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setIsSavingHeaders(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/payslip/save_payroll_headers`,
        {
          companyCode,
          headers: selectedHeaders,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedHeaders(response.data?.payrollHeaders || selectedHeaders);
      setShowPopup(true);
      setMessage(response.data?.message || "Excel headers saved successfully.");
      setTimeout(() => setShowPopup(false), 3000);
      closeHeaderModal();
    } catch (error) {
      console.error("Failed to save payroll headers", error);
      setShowPopup(true);
      setMessage(
        error.response?.data?.message || "Failed to save Excel headers."
      );
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setIsSavingHeaders(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!companyCode) {
      setShowPopup(true);
      setMessage("Company code is missing.");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setIsDownloading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/payslip/export_excel`,
        {
          params: { companyCode, month: currentMonth, year: currentYear, periodKey },
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `Salary_Report_${currentMonthLabel.replace(" ", "_")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading Excel report:", error);
      setShowPopup(true);
      setMessage("Failed to download the Excel report. Please try again.");
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  // NEW FUNCTION: Handle Bank Statement Download
  const handleDownloadBankStatement = async () => {
    if (!companyCode) {
      setShowPopup(true);
      setMessage("Company code is missing.");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setIsDownloadingBank(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/payslip/download-bank-statement`,
        {
          params: { companyCode, month: currentMonth, year: currentYear },
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `Bank_Statement_${currentMonthLabel.replace(" ", "_")}.xlsx`
      );
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading Bank Statement:", error);
      setShowPopup(true);
      setMessage("Failed to download Bank Statement. Please try again.");
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setIsDownloadingBank(false);
    }
  };

  if (loading) {
    return (
      <div className="confirm-payroll-container">Loading comparison data...</div>
    );
  }

  return (
    <div className="confirm-payroll-container">
      <div className="confirm-header">
        <p>
          Compare this month&apos;s payroll with the previous month before final
          approval.
        </p>
      </div>

      <div className="comparison-card">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Particular</th>
              <th className="text-right">{currentMonthLabel} (Current)</th>
              <th className="text-right">{prevMonthLabel} (Previous)</th>
              <th className="text-right">Difference</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => {
              const diff = row.current - row.previous;
              const isPositive = diff > 0;
              const isNegative = diff < 0;

              return (
                <tr key={row.key}>
                  <td className="font-medium">{row.label}</td>

                  <td className="text-right">
                    {row.isCurrency ? formatCurrency(row.current) : row.current}
                  </td>

                  <td className="text-right text-muted">
                    {row.isCurrency ? formatCurrency(row.previous) : row.previous}
                  </td>

                  <td
                    className={`text-right font-bold ${
                      isPositive ? "text-green" : isNegative ? "text-red" : "text-gray"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {row.isCurrency ? formatCurrency(diff) : diff}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="action-footer" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          className="download-btn"
          onClick={handleDownloadExcel}
          disabled={isDownloading}
          style={{
            opacity: isDownloading ? 0.7 : 1,
            cursor: isDownloading ? "not-allowed" : "pointer",
          }}
        >
          {isDownloading ? (
            "Generating Excel..."
          ) : (
            <>
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                style={{ marginRight: "8px" }}
              >
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
              </svg>
              Salary Report
            </>
          )}
        </button>

        {/* NEW BUTTON: Download Bank Statement */}
        <button
          className="download-btn"
          onClick={handleDownloadBankStatement}
          disabled={isDownloadingBank}
          style={{
            opacity: isDownloadingBank ? 0.7 : 1,
            cursor: isDownloadingBank ? "not-allowed" : "pointer",
          }}
        >
          {isDownloadingBank ? (
            "Generating Statement..."
          ) : (
            <>
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                style={{ marginRight: "8px" }}
              >
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
              </svg>
              Bank Statement
            </>
          )}
        </button>

        <button
          className="download-btn excel-adjust-btn"
          onClick={handleOpenHeaderModal}
          disabled={headerLoading}
        >
          {headerLoading ? "Loading Headers..." : "Excel Adjust"}
        </button>
      </div>

      {showHeaderModal && (
        <div className="excel-adjust-overlay">
          <div className="excel-adjust-modal">
            <div className="excel-adjust-topbar">
              {showHeaderSelector ? (
                <button
                  type="button"
                  className="excel-adjust-back-btn"
                  onClick={() => setShowHeaderSelector(false)}
                >
                  <IoArrowBack style={{ fontSize: 20 }} />
                </button>
              ) : (
                <div />
              )}

              <h3>Excel Adjust</h3>

              <button
                type="button"
                className="excel-adjust-close-btn"
                onClick={closeHeaderModal}
              >
                &times;
              </button>
            </div>

            {!showHeaderSelector ? (
              <div className="excel-adjust-saved-view">
                <div className="excel-adjust-table single-table">
                  <table>
                    <thead>
                      <tr>
                        <th className="excel-adjust-header-cell">
                          <span>Saved Headers</span>
                          <button
                            type="button"
                            className="excel-adjust-add-text-btn"
                            onClick={() => setShowHeaderSelector(true)}
                          >
                            Add+
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHeaders.length === 0 ? (
                        <tr>
                          <td>No headers selected yet.</td>
                        </tr>
                      ) : (
                        selectedHeaders.map((header) => (
                          <tr key={header}>
                            <td>{header}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="excel-adjust-selector-view">
                <div className="excel-adjust-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Select Headers +</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableHeadersToAdd.length === 0 ? (
                        <tr>
                          <td>All headers are already selected.</td>
                        </tr>
                      ) : (
                        availableHeadersToAdd.map((header) => (
                          <tr key={header}>
                            <td onClick={() => handleAddHeader(header)}>{header}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="excel-adjust-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Selected Headers</th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHeaders.length === 0 ? (
                        <tr>
                          <td colSpan="2">No headers selected yet.</td>
                        </tr>
                      ) : (
                        selectedHeaders.map((header) => (
                          <tr key={header}>
                            <td>{header}</td>
                            <td>
                              <button
                                type="button"
                                className="excel-adjust-remove-btn"
                                title="Remove"
                                onClick={() => handleRemoveHeader(header)}
                              >
                                <MdDelete />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="excel-adjust-footer">
              <button
                type="button"
                className="submit-template-btn"
                onClick={handleSaveHeaders}
                disabled={isSavingHeaders}
              >
                {isSavingHeaders ? "Saving..." : "Submit List"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && <Popup />}
    </div>
  );
}