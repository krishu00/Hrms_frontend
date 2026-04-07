import React, { useState, useEffect } from "react";
import "../../../ComponentsCss/AdminPanel/ReportsComponent/AttendancePivotReport.css";
import Pagination from "../../../Utils/Pagination/Pagination";

const AttendancePivotReport = ({
  data,
  headers,
  onSaveUpdates,
  attpagination,
  attcurrentPage,
  onExport,
  onPageChange,
  onSearch,
}) => {
  const paginate = attpagination;

  const [pagination, setPagination] = useState(null);
  // Changed prop name back to onSaveUpdates
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, columnKey }
  const [editedValue, setEditedValue] = useState(""); // Holds the value of the currently edited cell

  // NEW STATE: To store the locally modified data for rendering
  const [reportTableData, setReportTableData] = useState([]);

  // NEW STATE: To store changes made locally, before saving to DB
  // Format: [{ employeeId: "EMP001", date: "DD.MM.YYYY", newStatus: "P" }, ...]
  const [pendingLocalChanges, setPendingLocalChanges] = useState([]);

  // Use useEffect to initialize reportTableData and reset pendingLocalChanges
  // whenever the 'data' prop from the parent changes (e.g., after a new report fetch)
  useEffect(() => {
    // Deep copy the incoming data to allow local modifications
    const initialReportData = data.map((row) => ({ ...row }));
    setReportTableData(initialReportData);
    setPendingLocalChanges([]); // Clear pending changes when new data comes in
    setPagination(paginate);
  }, [data]); // Depend on 'data' prop

  if (!data || data.length === 0 || !headers || headers.length === 0) {
    console.log("AttendancePivotReport: No data or headers received.");
    return <p>No attendance data to display in pivot format.</p>;
  }

  const uniqueDates = Array.from(
    new Set(headers.filter((h) => h.date).map((h) => h.date)),
  ).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split(".").map(Number);
    const [dayB, monthB, yearB] = b.split(".").map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA - dateB;
  });

  // const baseHeaders = headers.filter((h) => !h.date);
  console.log("Base Headers:", headers);
  const baseHeaders = headers.filter((h) => !h.date && h.key !== "Designation");

  // Define getColorForStatus here, accessible by all functions in this component
  const getColorForStatus = (status) => {
    switch (status.toUpperCase()) {
      case "P":
        return "green";
      case "A":
        return "red";
      default:
        return "black";
    }
  };

  const handleCellClick = (rowIndex, columnKey, initialValue) => {
    // Removed 'value' from params, it's redundant here
    console.log("rowIndex", rowIndex);
    console.log("columnKey", columnKey);

    if (columnKey.endsWith("Status")) {
      // Use reportTableData for clickedRowData
      const clickedRowData = reportTableData[rowIndex];

      const [datePart] = columnKey.split(" ");

      // Get the actual string value for comparison and setting editedValue
      const valueToEdit =
        typeof initialValue === "object" &&
        initialValue !== null &&
        initialValue.props &&
        initialValue.props.children
          ? initialValue.props.children
          : String(initialValue);

      const currentAttendanceState = {
        employee_Id: clickedRowData["Emp Code"],
        date: datePart,
        status: valueToEdit, // Use the extracted string value
        punch_in_time: clickedRowData[`${datePart} In`] || null,
        punch_out_time: clickedRowData[`${datePart} Out`] || null,
        working_hours: clickedRowData[`${datePart} Total Hours`] || 0,
      };

      console.log("User clicked to edit status for:", currentAttendanceState);
      // Here, you can also log the original data's status for this cell if needed
      // console.log("Original status from data prop:", data[rowIndex][columnKey].props?.children || String(data[rowIndex][columnKey]));

      if (valueToEdit === "P" || valueToEdit === "A") {
        setEditingCell({ rowIndex, columnKey });
        setEditedValue(valueToEdit);
      } else {
        console.log(
          `Cannot edit status: ${valueToEdit}. Only 'P' and 'A' are editable.`,
        );
      }
    }
  };
  const handleInputChange = (e) => {
    setEditedValue(e.target.value);
    console.log("Input changed, new editedValue:", e.target.value); // Add this
  };
  const handleInputBlur = () => {
    if (editingCell) {
      const { rowIndex, columnKey } = editingCell;
      const empCode = reportTableData[rowIndex]["Emp Code"];
      const [datePart] = columnKey.split(" ");
      const newStatus = editedValue; // This will be 'P' or 'A'

      // This is where you convert 'P'/'A' to 'Present'/'Absent'
      const fullStatusName =
        newStatus.toUpperCase() === "P" ? "Present" : "Absent";

      const changeToRecord = {
        employeeId: empCode,
        date: datePart, // DD.MM.YYYY
        newStatus: newStatus, // Store short form for local display
        fullStatusName: fullStatusName, // Store full name for API call
      };

      // Update pendingLocalChanges
      setPendingLocalChanges((prevChanges) => {
        const existingChangeIndex = prevChanges.findIndex(
          (change) => change.employeeId === empCode && change.date === datePart,
        );

        if (existingChangeIndex > -1) {
          const updatedChanges = [...prevChanges];
          updatedChanges[existingChangeIndex] = changeToRecord;
          return updatedChanges;
        } else {
          return [...prevChanges, changeToRecord];
        }
      });

      // Update local UI (reportTableData) with the short form
      setReportTableData((prevData) => {
        const updatedData = prevData.map((row, idx) => {
          if (idx === rowIndex) {
            const newRow = { ...row };
            newRow[`${datePart} Status`] = (
              <span style={{ color: getColorForStatus(newStatus) }}>
                {newStatus} {/* Displaying the short form 'P' or 'A' */}
              </span>
            );
            // If changing to Absent, also clear local punch times for visual consistency
            if (fullStatusName === "Absent") {
              // Check against fullStatusName here too
              newRow[`${datePart} In`] = "-/-";
              newRow[`${datePart} Out`] = "-/-";
              newRow[`${datePart} Total Hours`] = "0:00";
            }
            return newRow;
          }
          return row;
        });
        return updatedData;
      });

      setEditingCell(null);
      setEditedValue("");
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.target.blur(); // Trigger onBlur to save changes to pendingLocalChanges
    }
  };

  // Function to be called by the "Update" button
  const handleUpdateBtnClick = () => {
    if (pendingLocalChanges.length > 0) {
      onSaveUpdates(pendingLocalChanges); // Pass all pending changes to the parent
      setPendingLocalChanges([]); // Clear local pending changes after passing them
    } else {
      console.log("No pending changes to save.");
      alert("No attendance changes to save.");
    }
  };
  const calculatePA = (row) => {
    let present = 0;
    let absent = 0;

    uniqueDates.forEach((date) => {
      const statusKey = `${date} Status`;
      const statusValue = row[statusKey];

      const status =
        typeof statusValue === "object" &&
        statusValue !== null &&
        statusValue.props &&
        statusValue.props.children
          ? statusValue.props.children
          : statusValue;

      if (status === "P") present++;
      if (status === "A") absent++;
      if (status === "H/D") present += 0.5;
    });

    return { present, absent };
  };

  const renderCellContent = (rowIndex, columnKey, value) => {
    const isEditing =
      editingCell?.rowIndex === rowIndex &&
      editingCell?.columnKey === columnKey;

    // In your renderCellContent function, where the <select> is returned:
    if (isEditing && columnKey.endsWith("Status")) {
      const statusOptions = ["P", "A"];
      return (
        <select
          value={editedValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyPress}
          autoFocus
          className="editable-status-select"
          // ADD THIS LINE: Stop propagation of click events from the select
          onClick={(e) => e.stopPropagation()}
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    } else {
      // For non-editing cells, check if there's a pending local change
      // Use reportTableData for employee code
      const empCode = reportTableData[rowIndex]["Emp Code"];
      const [datePart] = columnKey.split(" "); // e.g., "01.04.2025 Status" -> "01.04.2025"
      const fieldType = columnKey.includes("Status") ? "Status" : "";

      if (fieldType === "Status") {
        const pendingChange = pendingLocalChanges.find(
          (change) => change.employeeId === empCode && change.date === datePart,
        );
        if (pendingChange) {
          // If there's a pending change, display the new status with a highlight
          return (
            <span
              style={{
                color: getColorForStatus(pendingChange.newStatus),
                fontWeight: "bold", // Highlight changed cells
                backgroundColor: "yellow", // Visual cue for pending save
              }}
            >
              {pendingChange.newStatus}
            </span>
          );
        }
      }
      return value; // Default display if no pending change or not a status cell
    }
  };

  return (
    <>
      <div className="attendance-pivot-report-container">
        <table className="attendance-pivot-table">
          <thead>
            <tr>
              {baseHeaders.map((header) => (
                <th
                  key={header.key}
                  rowSpan="1"
                  className="fixed-column-header"
                >
                  {header.label}
                </th>
              ))}
              {/* <th rowSpan="1" className="fixed-column-header">
             <p className="pa-count">Present|Absent</p>
            </th>
            <th rowSpan="1" className="fixed-column-header">
              Freeze
            </th> */}

              {uniqueDates.map((date) => {
                const dateHeader = headers.find((h) => h.date === date);
                const dayName = dateHeader ? dateHeader.dayName : "";
                return (
                  <th key={date} colSpan="1" className="date-group-header">
                    <div className="date-header-content">
                      <span>{date.replace(/\./g, "/")}</span>
                      <span className="day-name">
                        {dayName.substring(0, 3)}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
            <tr>
              {uniqueDates.map((date) => (
                <React.Fragment key={`sub-headers-${date}`}>
                  {/* <th className="punch-header editable-header ">Status</th> */}
                  {/* <th className="punch-header">In/Out</th> */}
                  {/* <th className="punch-header">Out</th>
                <th className="punch-header">Total Hours</th> */}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Use reportTableData for rendering */}
            {reportTableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {baseHeaders.map((header) => (
                  <td
                    key={`${rowIndex}-${header.key}`}
                    className="fixed-column-cell"
                  >
                    {row[header.key]}
                    {}
                  </td>
                ))}
                {/* <td className="fixed-column-cell">
              {(() => {
    const { present, absent } = calculatePA(row);
    return (
      <div className="present-absent-cell" >
        <div className="pa-cell">
        <span className="present-cell" >{present}</span>
        {" | "}
        <span className="absent-cell" >{absent}</span>
      </div>
      <hr></hr>
      <div>
        {uniqueDates.length > 0 && (
          <span className="total-days-cell" >
          {uniqueDates.length}
          </span>
        )}
      </div>
      </div>
    );
  })()}
              </td>
               <td className="fixed-column-cell">
                <input type="checkbox"/>
              </td> */}
                {/* {uniqueDates.map((date) => {
                const formattedDateKey = date;
                const statusColumnKey = `${formattedDateKey} Status`;
                const punchInColumnKey = `${formattedDateKey} In`;
                const punchOutColumnKey = `${formattedDateKey} Out`;
                const totalHoursColumnKey = `${formattedDateKey} Total Hours`;
                
                console.log("punchInColumnKey" ,punchInColumnKey);
                console.log("punchOutColumnKey" ,punchOutColumnKey);
                
                const statusValue = row[statusColumnKey] || "-"; // Value from local state

                const stringStatusValue =
                  typeof statusValue === "object" &&
                  statusValue !== null &&
                  statusValue.props &&
                  statusValue.props.children
                    ? statusValue.props.children
                    : String(statusValue);

                return (
                  <React.Fragment key={`${rowIndex}-${formattedDateKey}-data`}>
                    <td
                      onClick={(e) => {
                        // Modify to accept event object
                        // Add a check to prevent re-triggering if already in editing mode
                        // or if the click came from an element that shouldn't initiate edit (like the select itself, though stopPropagation on select is better)
                        if (editingCell) {
                          // Already editing, don't re-trigger handleCellClick
                          return;
                        }
                        handleCellClick(rowIndex, statusColumnKey, statusValue);
                      }}
                      className={
                        stringStatusValue === "P" || stringStatusValue === "A"
                          ? "editable-status-cell"
                          : ""
                      }
                    >
                      {renderCellContent(
                        rowIndex,
                        statusColumnKey,
                        statusValue
                      )}
                    </td>
                    {/* <td>{row[punchInColumnKey] || "-/-"}{row[punchOutColumnKey] || "-/-"}{row[totalHoursColumnKey] || "0:00"}</td> */}
                {/* <td>{row[punchOutColumnKey] || "-/-"}</td>
                    <td>{row[totalHoursColumnKey] || "0:00"}</td> 
                    <td>
                      <div className="attx-day-cell">
                        <div className="attx-inout">
                        <span className="attx-in">{row[punchInColumnKey] || "-/-"}</span>
                        <span className="attx-divider"> | </span>
                        <span className="attx-out">{row[punchOutColumnKey] || "-/-"}</span>
                        </div>
                        <span className="attx-working-hours">{row[totalHoursColumnKey] || "0:00"}</span>
                      </div>
                    </td>
                  </React.Fragment>
                );
              })} */}
                {uniqueDates.map((date) => {
                  const statusKey = `${date} Status`;
                  const inKey = `${date} In`;
                  const outKey = `${date} Out`;
                  const hoursKey = `${date} Total Hours`;

                  const statusValue = row[statusKey] || "-";

                  const stringStatusValue =
                    typeof statusValue === "object" &&
                    statusValue !== null &&
                    statusValue.props &&
                    statusValue.props.children
                      ? statusValue.props.children
                      : String(statusValue);

                  return (
                    <React.Fragment key={`${rowIndex}-${date}`}>
                      {/* STATUS COLUMN */}
                      {/* <td
        className={
          stringStatusValue === "P" || stringStatusValue === "A"
            ? "editable-status-cell"
            : ""
        }
        onClick={() => {
          if (!editingCell) {
            handleCellClick(rowIndex, statusKey, statusValue);
          }
        }}
      >
        {renderCellContent(rowIndex, statusKey, statusValue)}
      </td> */}

                      {/* COMBINED IN / OUT / TOTAL COLUMN */}
                      <td className="combined-punch-cell">
                        <div className="attx-full-cell">
                          <div
                            className={
                              stringStatusValue === "P" ||
                              stringStatusValue === "A" ||
                              stringStatusValue === "H/D"
                                ? "editable-status-cell"
                                : ""
                            }
                            onClick={() => {
                              if (!editingCell) {
                                handleCellClick(
                                  rowIndex,
                                  statusKey,
                                  statusValue,
                                );
                              }
                            }}
                          >
                            {renderCellContent(
                              rowIndex,
                              statusKey,
                              statusValue,
                            )}
                          </div>
                          <hr></hr>
                          <div className="att-inout">
                            <span className="attx-in">
                              {row[inKey].replace(/AM|PM/g, "") || "-/-"}
                            </span>
                            <span className="attx-divider"> | </span>
                            <span className="attx-out">
                              {row[outKey].replace(/AM|PM/g, "") || "-/-"}
                            </span>
                          </div>
                          {/* <span className="attx-working-hours">{row[hoursKey] || "0:00"}</span> */}
                          <div className="attx-tooltip">
                            Total Hours: {row[hoursKey] || "0:00"}
                          </div>
                        </div>
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* NEW: Update Button */}
        {pendingLocalChanges.length > 0 && (
          <div className="update-button-container">
            <button
              onClick={handleUpdateBtnClick}
              className="update-attendance-btn"
            >
              Update Attendance ({pendingLocalChanges.length} pending)
            </button>
          </div>
        )}
      </div>
      <div className="attendance_bottom_user_pagin">
        {paginate && (
          <Pagination
            pagination={pagination}
            onPageChange={onPageChange}
            onSearch={onSearch}
            onExport={onExport}
            showSearch={true}
            showExport={true}
          />
        )}
      </div>
    </>
  );
};

export default AttendancePivotReport;
