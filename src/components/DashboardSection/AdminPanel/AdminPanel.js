import React, { useState } from "react";
import "../../ComponentsCss/AdminPanel/AdminPanel.css";
import LeaveBalance from "./ReportsComponent/LeaveBalance"; // Import the report components
import LeaveReport from "./ReportsComponent/LeaveReport";
import AttendanceReport from "./ReportsComponent/AttendanceReport";
import LinkUserBiometric from "./ReportsComponent/LinkUserBiometric";
import CompanyPolicies from "./ReportsComponent/CompanyPolicies";
import ViewCompOff from "./ReportsComponent/ViewCompOff";
import UploadPaySlip from "./ReportsComponent/UploadPaySlip";
import ViewRegularization from "./ReportsComponent/ViewRegularization";
import OtherReports from "./ReportsComponent/OtherReports";
import PfReport from "./ReportsComponent/PfReport";
import ESIReport from "./ReportsComponent/ESIReport";

// import Pt from "../UserPayslip/Pt"
// import AttendanceReport from "./AttendanceReport";
// import ClockReport from "./ClockReport";
// import RecordKeeping from "./RecordKeeping";
// import SummaryReport from "./SummaryReport";

export default function AdminPanel() {
  const [activeReportId, setActiveReportId] = useState(null);

  const reports = [
    { id: "leave_balance", name: "Leave Balance" },
    { id: "leave_request", name: "Leave Request" },
    { id: "attendance_report", name: "Attendance Report" },
    { id: "link_biometric", name: "Link Biometric" },
    { id: "CompanyPolicies", name: "Company Policies" },
    { id: "appliedCompoff", name: "Applied Compoff" },
    { id: "UploadPaySlip", name: "Users PaySlip" },
    { id: "ViewRegularization", name: "View Regularization" },
    { id: "PfReport", name: "Pf Report" },
    { id: "ESIReport", name: "ESI Report" },

    { id: "other_reports", name: "Other Reports" },
  ];

  const handleRowClick = (reportId) => {
    setActiveReportId(reportId);
  };

  const renderReport = () => {
    switch (activeReportId) {
      case "leave_balance":
        return <LeaveBalance />;
      case "leave_request":
        return <LeaveReport />;
      case "attendance_report":
        return <AttendanceReport />;
      case "link_biometric":
        return <LinkUserBiometric />;
      case "CompanyPolicies":
        return <CompanyPolicies />;
      case "appliedCompoff":
        return <ViewCompOff />;
      case "UploadPaySlip":
        return <UploadPaySlip />;
      case "ViewRegularization":
        return <ViewRegularization />;
      case "PfReport":
        return <PfReport />;
        case "ESIReport":
        return <ESIReport />;
      // case "other_reports":
      // return <Pt />;
      default:
        return <div>Select a report from the left.</div>;
    }
  };

  return (
    <div className="admin-panel-layout">
      {/* Left Menu */}
      <div className="admin-panel-menu">
        <h1 className="table-title">Reports Menu</h1>
        <table className="reports-table">
          <thead>
            <tr>
              <th className="table-header">REPORT NAME</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                onClick={() => handleRowClick(report.id)}
                style={{ cursor: "pointer" }}
              >
                <td className="table-cell">{report.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Display */}
      <div className="admin-panel-content">{renderReport()}</div>
    </div>
  );
}
