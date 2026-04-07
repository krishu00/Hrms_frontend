import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "../../ComponentsCss/AttendanceDashboard/UserAttendance/UserAttendance.css";

// Helper for status colors to avoid hardcoding in render logic
const getStatusColor = (status, defaultColor = "white") => {
  const colors = {
    Absent: "rgb(247, 181, 150)",
    "Week-Off": "lightgray",
    "Week Off": "lightgray",
    Holiday: "#ffebcd",
    "Full Day": "rgb(233, 244, 237)",
    "Half Day": "rgba(221, 232, 68, 0.61)",
    "Missed Punch": "rgba(252, 192, 73, 0.69)",
  };
  return colors[status] || defaultColor;
};

// Helper to get cookie value
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : "";
};

export default function UserAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDateData, setSelectedDateData] = useState(null);
  const [companyCode, setCompanyCode] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  // 1. Initial Setup: Get Cookies
  useEffect(() => {
    const code = getCookie("companyCode");
    const id = getCookie("employee_id");
    if (code) setCompanyCode(code);
    if (id) setEmployeeId(id);
  }, []);

  // 2. Fetch Data when dependencies change
  useEffect(() => {
    if (companyCode && employeeId) {
      fetchAttendanceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, companyCode, employeeId]);

  const fetchAttendanceData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/attendance/monthly_attendance?date=${year}-${month}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const calendar = response.data?.calendar || {};
      const formattedData = {};

      Object.entries(calendar).forEach(([dateKey, value]) => {
        const d = new Date(dateKey);
        const dayNumber = d.getDate();

        // Format Hours
        const totalHours = value?.working_hours ? parseFloat(value.working_hours) : 0;
        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);
        const formattedTime = `${hours} : ${minutes < 10 ? "0" + minutes : minutes}`;

        // Format Times
        const formatTimeStr = (ts) =>
          ts
            ? new Date(ts).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A";

        const inTime = formatTimeStr(value?.punch_in_time || value?.inTime);
        const outTime = formatTimeStr(value?.punch_out_time || value?.outTime);

        // Determine Status & Color
        const status = value?.label || value?.status || "Absent";
        const color = value?.color || getStatusColor(status);

        formattedData[dayNumber] = {
          date: d.toLocaleDateString("en-GB"),
          status,
          color,
          inTime,
          outTime,
          totalHours: formattedTime,
          punchInLatitude: value?.punchInLatitude,
          punchInLongitude: value?.punchInLongitude,
          punchOutLatitude: value?.punchOutLatitude,
          punchOutLongitude: value?.punchOutLongitude,
        };
      });

      setAttendanceData(formattedData);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDateData(null); // Reset selection on month change
  };

  const handleClickDay = (day) => {
    const today = new Date();
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    // Prevent clicking future dates
    if (selectedDate > today) {
      setSelectedDateData(null);
      return;
    }

    if (attendanceData[day]) {
      setSelectedDateData(attendanceData[day]);
    } else {
      // Default absent data for past dates with no record
      setSelectedDateData({
        date: selectedDate.toLocaleDateString("en-GB"),
        status: "Absent",
        inTime: "N/A",
        outTime: "N/A",
        totalHours: "0.00",
      });
    }
  };

  // 3. Calendar Grid Logic (Memoized to prevent recalc on every render)
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
    
    // Previous month filler days
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    const prevMonthDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevMonthDays.push({ day: prevMonthDaysCount - i, type: "prev" });
    }

    // Current month days
    const currentMonthDays = [];
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === month && today.getFullYear() === year;

    for (let day = 1; day <= daysInMonth; day++) {
      const isFuture =
        year > today.getFullYear() ||
        (year === today.getFullYear() && month > today.getMonth()) ||
        (isCurrentMonth && day > today.getDate());

      const data = attendanceData[day] || {};
      
      currentMonthDays.push({
        day,
        type: "current",
        isFuture,
        status: isFuture ? "" : data.status || "Absent",
        color: isFuture ? "white" : data.color || "rgb(250, 205, 185)", // Default absent color
        inTime: data.inTime || "N/A",
        outTime: data.outTime || "N/A",
      });
    }

    return [...prevMonthDays, ...currentMonthDays];
  }, [currentDate, attendanceData]);

  return (
    <div className="attendance-outer">
      <div className="header-section">
        <div className="month-display">
          <button className="btn-calander" onClick={() => handleMonthChange(-1)}>
            {"<"}
          </button>
          <h4 className="slect_Attendance_month">
            {currentDate.toLocaleString("default", { month: "long" })}
          </h4>
          <h4>{currentDate.getFullYear()}</h4>
          <button className="btn-calander" onClick={() => handleMonthChange(1)}>
            {">"}
          </button>
        </div>
      </div>

      <div className="calender-data-section">
        <div className="calender-section">
          <div className="calender-weekday">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          
          <div className="cal-day">
            {calendarGrid.map((item, index) => {
              if (item.type === "prev") {
                return (
                  <div key={`prev-${index}`} className="calenderDay" style={{ color: "#A9A9A9" }}>
                    <button className="day-Btn" disabled>{item.day}</button>
                  </div>
                );
              }

              return (
                <div
                  key={`curr-${item.day}`}
                  className={`calenderDay ${item.status === "Week-Off" ? "week-off" : ""} ${
                    item.isFuture ? "future-date" : ""
                  }`}
                  onClick={() => !item.isFuture && handleClickDay(item.day)}
                  style={{
                    backgroundColor: item.color,
                    cursor: item.isFuture ? "default" : "pointer",
                  }}
                >
                  <button className="day-Btn">{item.day}</button>
                  <div className="working-hour-div">
                    <div className="day-Status">{item.status}</div>
                    <span className="hours-text">
                      {item.inTime} - {item.outTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="data-section__container">
          <div className="detail">
            <h3>Details</h3>
          </div>
          <div
            className="data-contenet"
            style={{
              backgroundColor:
                selectedDateData && parseFloat(selectedDateData.totalHours) < 8.5
                  ? "#FFE3E3"
                  : "transparent",
            }}
          >
            {selectedDateData ? (
              <ul>
                <li>Date: <span>{selectedDateData.date}</span></li>
                <li>In Time: <span>{selectedDateData.inTime}</span></li>
                <li>Out Time: <span>{selectedDateData.outTime}</span></li>
                <li>Total Hours: <span>{selectedDateData.totalHours} Hours</span></li>
                <li>Status: <span>{selectedDateData.status}</span></li>
                
                {selectedDateData.punchInLatitude && selectedDateData.punchInLongitude && (
                  <li>
                    In-Coordinates:{" "}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedDateData.punchInLatitude},${selectedDateData.punchInLongitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View location
                    </a>
                  </li>
                )}
                {selectedDateData.punchOutLatitude && selectedDateData.punchOutLongitude && (
                  <li>
                    Out-Coordinates:{" "}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedDateData.punchOutLatitude},${selectedDateData.punchOutLongitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View location
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p>Select a date to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}   