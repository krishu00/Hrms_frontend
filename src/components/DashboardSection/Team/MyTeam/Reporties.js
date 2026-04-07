import React, { useEffect, useState } from "react";
import "../../../ComponentsCss/Team/MyTeam/Reporties.css";
import axios from "axios";

export default function Reporties() {
  const [managerPath, setManagerPath] = useState([]);
  const [initialTeam, setInitialTeam] = useState([]);
  const [currentEmployees, setCurrentEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReportingTeam = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/company/reporting-team`
        );

        if (res.data?.success) {
          const { manager, team } = res.data;
        

          setManagerPath([manager]);

          setInitialTeam(team || []);
          setCurrentEmployees(team || []);
        } else {
          setError("Unable to fetch reporting team data.");
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportingTeam();
  }, []);
  const hasSubordinates = (emp) => {
    return emp?.subordinates && emp.subordinates.length > 0;
  };

  const handleEmployeeClick = (emp) => {
    if (!hasSubordinates(emp)) return;

    setManagerPath((prev) => [...prev, emp]);
    setCurrentEmployees(emp.subordinates || []);
  };

  const handleBack = () => {
    if (managerPath.length <= 1) return;

    setManagerPath((prevPath) => {
      const newPath = prevPath.slice(0, -1);

      if (newPath.length === 1) {
        setCurrentEmployees(initialTeam);
      } else {
        const lastManager = newPath[newPath.length - 1];
        setCurrentEmployees(lastManager.subordinates || []);
      }
      return newPath;
    });
  };
  const jumpToLevel = (index) => {
    setManagerPath((prevPath) => {
      const newPath = prevPath.slice(0, index + 1);

      const lastManager = newPath[newPath.length - 1];

      if (index === 0) {
        setCurrentEmployees(initialTeam);
      } else {
        setCurrentEmployees(lastManager.subordinates || []);
      }

      return newPath;
    });
  };
  const displayedEmployees = currentEmployees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(term) ||
      emp.employee_id?.toLowerCase().includes(term)
    );
  });
  if (loading) {
    return (
      <div className="reporties-container">
        <div className="upper-heading-reporties">
          <h2 className="reporties-heading">Reporties</h2>
        </div>
        <p>Loading reporting team...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="reporties-container">
        <div className="upper-heading-reporties">
          <h2 className="reporties-heading">Reporties</h2>
        </div>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }
  return (
    <div className="reporties-container">
      <div className="upper-heading-reporties">
        <span
          className={`back-arrow ${managerPath.length <= 1 ? "disabled" : ""}`}
          onClick={handleBack}
        >
          ←
        </span>
        <h2 className="reporties-heading">Reporties</h2>
      </div>

      <div className="manager-search-row">
        <div className="manager-breadcrumb">
          <span className="manager-label">Manager:</span>

          {managerPath.map((mgr, index) => (
            <span
              key={mgr.employee_id || index}
              className="breadcrumb-item"
              onClick={() => jumpToLevel(index)}
            >
              {mgr.name} {index < managerPath.length - 1 && " > "}
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name / employee id"
          className="reporties-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="reporties-table-container">
        <table className="reporties-table">
          <thead>
            <tr>
              <th className="sno-cloumn">S.No</th>
              <th>Employee Name</th>
              <th>Designation</th>
            </tr>
          </thead>
          <tbody>
            {displayedEmployees.map((emp, index) => (
              <tr key={emp.employee_id || index}>
                <td>{index + 1}</td>

                <td
                  className={`emp-name-cell ${
                    hasSubordinates(emp) ? "has-children" : ""
                  }`}
                  onClick={() => handleEmployeeClick(emp)}
                >
                  <div className="main-name">{emp.name}</div>
                  <div className="sub-id">{emp.employee_id}</div>

                  {hasSubordinates(emp) && (
                    <span className="right-icon">+</span>
                  )}
                </td>

                <td>{emp.designation}</td>
              </tr>
            ))}

            {!displayedEmployees.length && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
