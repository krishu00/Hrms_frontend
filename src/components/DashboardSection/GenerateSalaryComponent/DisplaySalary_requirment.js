import React, { useState } from "react";
import "./ReportsDashboard.css";
import ListOfSalaryComponent from "../GenerateSalaryComponent/SalaryComponent/ListOfSalaryComponent";
import UpdateLeaveBalance from "./SalaryComponent/UpdateLeaveBalance";
import ListaOfSalaryTempalte from "./SalaryTemplate/ListaOfSalaryTempalte";
import SalaryStructure from "./SalaryStructure/SalaryStructure";

import PayRoll from "./PayRoll/PayRoll";

const ReportsDashboard = () => {
  const [activeReport, setActiveReport] = useState(null);

  const reportList = [
    { id: "salary", name: "Salary Component" },
    { id: "Update Leave Balance", name: "Update Leave Balance" },
    { id: "salary_tamplate", name: "Salary Template" },
    { id: "Salary_Structure", name: "Salary Structure" },
    { id: "PayRoll", name: "Payroll" },
  ];

  const sampleTableData = {
    attendance: [
      ["01-May", "Present", "9:00 AM - 6:00 PM"],
      ["02-May", "Absent", "-"],
    ],
    salary_tamplate: [
      ["01-May", "9:01 AM", "5:59 PM"],
      ["02-May", "—", "—"],
    ],
    keeping: [
      ["Document A", "Submitted", "05-May"],
      ["Document B", "Pending", "—"],
    ],
    PayRole: [
      ["Total Days", "30"],
      ["Days Present", "26"],
    ],
  };

  const renderContent = (id) => {
    if (id === "salary") {
      return <ListOfSalaryComponent />;
    }
    if (id === "Update Leave Balance") {
      return <UpdateLeaveBalance />;
    }
    if (id === "salary_tamplate") {
      return <ListaOfSalaryTempalte />;
    }
    if(id === "Salary_Structure"){
      return <SalaryStructure/>
    }

    if (id === "PayRoll") {
      return <PayRoll />;
    }

    const data = sampleTableData[id];
    if (!data) return null;

    return (
      <table className="custom-table">
        <thead>
          <tr>
            {data[0].map((_, i) => (
              <th key={i}>Column {i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar-panel">
        <h2 className="sidebar-title">Reports Menu</h2>
        <ul className="report-list">
          {reportList.map((report) => (
            <li
              key={report.id}
              className={`report-item ${
                activeReport === report.id ? "selected" : ""
              }`}
              onClick={() => setActiveReport(report.id)}
            >
              {report.name}
            </li>
          ))}
        </ul>
      </aside>

      <section className="content-panel">
        {activeReport ? (
          <>
            {/* <h2 className="content-title">
              {reportList.find((r) => r.id === activeReport)?.name}
            </h2> */}
            {renderContent(activeReport)}
          </>
        ) : (
          <div className="placeholder-text">Click a report to view details</div>
        )}
      </section>
    </div>
  );
};

export default ReportsDashboard;
