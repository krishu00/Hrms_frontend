import React, { useState } from "react";
import HeaderCard from "./HeaderCard";
import GraphSection from "./GraphSection";
import CalendarSection from "./CalendarSection";
import "../../ComponentsCss/AttendanceDashboard/index.css";

const AttendanceDashboard = () => {
  const [monthlyDataFromCalender, setMonthlyDataFromCalender] = useState(null);
  const [last7Daysdate, setMonthlyDate] = useState(null);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(
    String(today.getMonth() + 1).padStart(2, "0")
  ); // "01".."12"

  // Handler to update month/year from HeaderCard
  const handleMonthYearChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const getDataFromCalender = (data) => {
    console.log("Received data from Calendar:", data);

    if (!Array.isArray(data)) {
      setMonthlyDataFromCalender([]);
      return;
    }

    // Slice the last 7 items and map to their decimal_hours.
    const last7DaysHours = data.slice(-7).map((entry) => entry.decimal_hours);
    const last7Daysdate = data.slice(-7).map((entry) => entry.date);

    console.log("Last 7 days hours:", last7DaysHours);
    setMonthlyDataFromCalender(last7DaysHours);
    setMonthlyDate(last7Daysdate);
  };
  return (
    <div className="Attendance-container">
      <HeaderCard
        year={year}
        month={month}
        onMonthYearChange={handleMonthYearChange}
      />
      <div className="clock-graph-section">
        <CalendarSection
          getDataFromCalender={getDataFromCalender}
          selectedMonth={parseInt(month, 10) - 1}
          selectedYear={parseInt(year, 10)}
        />
        <GraphSection data={monthlyDataFromCalender} date={last7Daysdate} />
      </div>
    </div>
  );
};

export default AttendanceDashboard;
