import React, { useState, useEffect } from "react";
import "../../../ComponentsCss/AdminPanel/ReportsComponent/LeaveReport.css";
import { IoMdArrowBack } from "react-icons/io";
import { RiFileExcel2Fill } from "react-icons/ri";
import axios from "axios";
import SummaryReport from "../../SummaryReport/SummaryReport";
import Button from "../../../../context/GlobalButton/globalButton";

function LeaveReport() {
    const [formData, setFormData] = useState({
        fromDate: "",
        toDate: "",
        leaveType: "ALL",
        status: "ALL",
        branch: "ALL",
        costCenter: "",
        designation: "ALL",
        department: "ALL",
        codeName: "",
        reportingManager: "ALL",
    });

    const [reportHeaders, setReportHeaders] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [showTable, setShowTable] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Helper to format keys for display
    const formatHeaderName = (key) => {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .replace(/_id/g, " ID")
            .replace(/_date/g, " Date");
    };

    const handleView = async () => {
        setErrorMessage("");
        setReportData([]);

        if (
            formData.fromDate &&
            formData.toDate &&
            new Date(formData.fromDate) > new Date(formData.toDate)
        ) {
            setErrorMessage("From Date cannot be after To Date.");
            return;
        }

        try {
            const apiUrl = `${process.env.REACT_APP_API_URL}/leave_accepted_report/get_all_approve`;
            const params = {};

            for (const key in formData) {
                if (formData[key] !== "ALL" && formData[key] !== "") {
                    params[key] = formData[key];
                }
            }

            const queryString = new URLSearchParams(params).toString();
            const response = await axios.get(`${apiUrl}?${queryString}`);
            const fetchedData = response.data.data;

            if (fetchedData && fetchedData.length > 0) {
                // Use a defined order and filter keys for the final report
                const desiredKeys = [
                    "requestor_id", "requestor_name", "leaveType", "leaveStatus",
                    "leave_applied_date", "leaveStartDate", "leaveEndDate", 
                    "number_of_days", "reason", "approver_name", "action_date", "remarks"
                ];

                const dynamicHeaders = desiredKeys
                    .filter(key => fetchedData[0].hasOwnProperty(key))
                    .map((key) => ({
                        name: formatHeaderName(key),
                        key: key,
                        options: [],
                    }));

                setReportHeaders(dynamicHeaders);
                setReportData(fetchedData);
                setShowTable(true);
            } else {
                setErrorMessage("No approved leave requests found for the selected criteria.");
                setReportHeaders([]);
                setReportData([]);
                setShowTable(false);
            }
        } catch (error) {
            console.error("Error fetching leave report:", error);
            setErrorMessage(
                "Error fetching report: " +
                (error.response?.data?.message || error.message)
            );
            setReportData([]);
            setReportHeaders([]);
            setShowTable(false);
        }
    };

    const handleGoBack = () => {
        setShowTable(false);
        setReportHeaders([]);
        setReportData([]);
    };

    const handleDownloadExcel = async () => {
        setErrorMessage(""); 

        const downloadParams = {};
        for (const key in formData) {
            if (formData[key] !== "ALL" && formData[key] !== "") {
                downloadParams[key] = formData[key];
            }
        }

        try {
            const downloadUrl = `${process.env.REACT_APP_API_URL}/leave_accepted_report/download_approved_requests_excel`;

            const response = await axios.get(downloadUrl, {
                params: downloadParams,
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;

            const contentDisposition = response.headers["content-disposition"];
            let filename = "leave_report.xlsx";
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+)"?/);
                if (match && match[1]) {
                    filename = match[1];
                }
            }

            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading Excel report:", error);
            // Handle error response blob if necessary (logic kept simple here)
            setErrorMessage("Error downloading report. Please check the network.");
        }
    };

    return (
        <div className="leave-report-container">
            {!showTable ? (
                <>
                    <div className="report-header">
                        <h2>Leave Details Report</h2>
                    </div>

                    <div className="form-grid">
                        {/* Text/Date Inputs */}
                        {[
                            { label: "From Date", name: "fromDate", type: "date" },
                            { label: "To Date", name: "toDate", type: "date" },
                            { label: "Cost Center", name: "costCenter", type: "text" },
                            { label: "Code / Name", name: "codeName", type: "text" },
                        ].map(({ label, name, type }) => (
                            <div className="form-group" key={name}>
                                <label htmlFor={name}>{label}:</label>
                                <input
                                    type={type}
                                    id={name}
                                    name={name}
                                    value={formData[name]}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}

                        {/* Select Inputs */}
                        {[
                            {
                                label: "Leave Type",
                                name: "leaveType",
                                // 🚀 ADD COMP-OFF TO THE OPTIONS
                                options: ["ALL", "Annual Leave", "Sick Leave", "Maternity Leave", "CompOff"], 
                            },
                            {
                                label: "Status",
                                name: "status",
                                options: ["ALL", "Approved", "Pending", "Rejected"],
                            },
                            {
                                label: "Branch",
                                name: "branch",
                                options: ["ALL", "Main Branch", "Sales Office"],
                            },
                            {
                                label: "Designation",
                                name: "designation",
                                options: ["ALL", "Software Engineer", "Project Manager"],
                            },
                            {
                                label: "Department",
                                name: "department",
                                options: ["ALL", "IT", "HR"],
                            },
                            {
                                label: "Reporting Manager",
                                name: "reportingManager",
                                options: ["ALL", "Manager A", "Manager B"],
                            },
                        ].map(({ label, name, options }) => (
                            <div className="form-group" key={name}>
                                <label htmlFor={name}>{label}:</label>
                                <select
                                    id={name}
                                    name={name}
                                    value={formData[name]}
                                    onChange={handleChange}
                                >
                                    {options.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {errorMessage && <p className="error-message">❌ {errorMessage}</p>}

                    <div className="report-actions">
                        <Button
                            text="View"
                            className="view_button"
                            onClick={handleView}
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="report-header">
                        <button className="back-button" onClick={handleGoBack}>
                            <IoMdArrowBack style={{ fontSize: "20px", marginRight: "5px" }} />
                            Go Back to Form
                        </button>
                        <button
                            className="Download-button"
                            title="Download the Excel Report"
                            onClick={handleDownloadExcel}
                        >
                            <RiFileExcel2Fill style={{ fontSize: "24px" }} />
                        </button>
                    </div>
                    {/* SummaryReport component will display data using dynamic headers */}
                    {reportData.length > 0 && reportHeaders.length > 0 && (
                        <SummaryReport data={reportData} headers={reportHeaders} />
                    )}
                </>
            )}
        </div>
    );
}

export default LeaveReport;