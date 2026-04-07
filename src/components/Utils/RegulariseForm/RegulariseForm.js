import React, { useState, useEffect } from "react";
import "../../ComponentsCss/utils/RegulariseForm/RegulariseForm.css";
import axios from "axios";
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../Popup/Popup";
import { useSubmitting } from "../useSubmitting";
import SubmitButton from "../SubmitButton";

const RegulariseForm = ({ onClose }) => {
  const [entries, setEntries] = useState([]);
  const [workingHours, setWorkingHours] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCalendar, setShowCalendar] = useState(false); // Toggle for calendar
  const { showPopup, setShowPopup, setMessage } = usePopup();
  const { isSubmitting, run } = useSubmitting();
  const openDatePicker = () => {
    setShowCalendar(!showCalendar);
  };

  const getStartDay = async (month, year) => {
    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL
        }/attendance/daily_working_hours?month=${month + 1}&year=${year}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const mappedHours = response.data.workingHoursPerDay.reduce(
        (acc, day) => {
          acc[day.date] = parseFloat(day.decimal_hours).toFixed(1);
          return acc;
        },
        {}
      );

      setWorkingHours(mappedHours);
    } catch (err) {
      console.error("Error fetching working hours:", err);
    }
  };

  useEffect(() => {
    getStartDay(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handleDateSelect = async (selectedDate) => {
    if (!selectedDate) return;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/attendance/daily_attendance?date=${selectedDate}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Attendance API Response:", response.data);

      const attendanceData = response.data[0];

      if (!attendanceData) {
        console.warn("No attendance data found for this date.");
        return;
      }

      // Convert UTC punch-in and punch-out times to IST
      const punchInIST = attendanceData.punch_in_time
        ? new Date(attendanceData.punch_in_time).toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
        : "";

      const punchOutIST = attendanceData.punch_out_time
        ? new Date(attendanceData.punch_out_time).toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
        : "";

      const formattedWorkingHours = attendanceData.working_hours
        ? Math.round(attendanceData.working_hours * 10) / 10
        : "N/A";

      // Add a new entry to the form with fetched data
      setEntries((prevEntries) => [
        ...prevEntries,
        {
          id: prevEntries.length + 1,
          date: selectedDate,
          inTime: punchInIST,
          outTime: punchOutIST,
          totalHours: formattedWorkingHours,
          reason: "",
        },
      ]);

      setShowCalendar(false); // Close the calendar after selection
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const removeEntry = (id) => {
    setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
  };

  const handleChange = (id, field, value) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );

    // Delay execution to ensure state is updated first
    setTimeout(() => calculateWorkingHours(id), 100);
  };

  const calculateWorkingHours = (id) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id !== id) return entry;

        const { inTime, outTime } = entry;

        console.log(`ID: ${id} | In Time: ${inTime} | Out Time: ${outTime}`);

        if (!inTime || !outTime) {
          console.log("One of the times is missing. Returning 'N/A'.");
          return { ...entry, totalHours: "N/A" };
        }

        // Parse the times correctly
        let startTime = new Date(`2000-01-01T${inTime}`);
        let endTime = new Date(`2000-01-01T${outTime}`);

        console.log(
          `Parsed Start Time: ${startTime} | Parsed End Time: ${endTime}`
        );

        if (isNaN(startTime) || isNaN(endTime)) {
          console.log("Invalid date parsing. Returning 'N/A'.");
          return { ...entry, totalHours: "N/A" };
        }

        if (endTime < startTime) {
          endTime.setDate(endTime.getDate() + 1); // Handle overnight shifts
        }

        // Calculate time difference in seconds
        let diffSeconds = Math.floor((endTime - startTime) / 1000);

        let hours = Math.floor(diffSeconds / 3600);
        let minutes = Math.floor((diffSeconds % 3600) / 60);
        let seconds = diffSeconds % 60;

        // Format time as HH:mm:ss
        const formattedHours = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        console.log(`Calculated Working Hours: ${formattedHours}`);

        return { ...entry, totalHours: formattedHours };
      })
    );
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();

    const calendarDays = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="calendar-empty"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(
        <div
          key={day}
          className="calendar-day"
          onClick={() =>
            handleDateSelect(`${selectedYear}-${selectedMonth + 1}-${day}`)
          }
        >
          <span>{day}</span>
          <p>{workingHours[day] ? `${workingHours[day]}` : "--"}</p>
        </div>
      );
    }

    return calendarDays;
  };

  const handleSubmit = () => {
    run (async () => {
      try {
        if (entries.length === 0) {
          setShowPopup(true);
          setMessage("No entries to submit!");
          setTimeout(() => setShowPopup(false), 3000);
          return;
        }

        const payload = {
          regulariseData: entries.map((entry) => ({
            punch_in_time: entry.inTime,
            punch_out_time: entry.outTime,
            working_hours: entry.totalHours,
            reason: entry.reason,
            date: entry.date,
          })),
        };

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/request/regularise_attendance`,
          payload,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setShowPopup(true);
        setMessage("Attendance regularisation request submitted successfully!");
        setTimeout(() => setShowPopup(false), 3000);
        onClose();
      } catch (error) {
        const backendMessage = error.response?.data?.message;
        const fallbackMessage = "Failed to submit the request. Please try again.";

        setShowPopup(true);
        setMessage(backendMessage || fallbackMessage);

        setTimeout(() => setShowPopup(false), 3000);
      }
    });
  };

  return (
    <div className="regularise-container">
      <div className="regularise-header">
        <h2>Regularise Attendance</h2>
        <button className="add-btn" onClick={openDatePicker}>
          + Add Date
        </button>
      </div>

      {showCalendar && (
        <div className="calendar-container">
          <div className="calendar-header">
            <button
              className="calendar-header_arrow_left"
              onClick={() =>
                setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1))
              }
            >
              {"<"}
            </button>
            <h3>
              {new Date(selectedYear, selectedMonth).toLocaleString("default", {
                month: "long",
              })}{" "}
              {selectedYear}
            </h3>
            <button
              className="calendar-header_arrow_right"
              onClick={() =>
                setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1))
              }
            >
              {">"}
            </button>
          </div>
          <div className="calendar-grid">
            <div className="calendar-day-header">Sun</div>
            <div className="calendar-day-header">Mon</div>
            <div className="calendar-day-header">Tue</div>
            <div className="calendar-day-header">Wed</div>
            <div className="calendar-day-header">Thu</div>
            <div className="calendar-day-header">Fri</div>
            <div className="calendar-day-header">Sat</div>
            {renderCalendar()}
          </div>
        </div>
      )}

      <div className="regulariseContantDiv">
        <div className="regularise-table-header">
          <span>Date</span>
          <span>In Time*</span>
          <span>Out Time*</span>
          <span>Total Hours</span>
          <span>Reason*</span>
        </div>

        {entries.map((entry) => (
          <div key={entry.id} className="regularise-row">
            <input type="text" value={entry.date} readOnly />
            <input
              type="time"
              value={entry.inTime}
              onChange={(e) => handleChange(entry.id, "inTime", e.target.value)}
            />
            <input
              type="time"
              value={entry.outTime}
              onChange={(e) =>
                handleChange(entry.id, "outTime", e.target.value)
              }
            />
            <input type="text" value={entry.totalHours} readOnly />
            <input
              type="text"
              placeholder="Write a reason..."
              value={entry.reason}
              onChange={(e) => handleChange(entry.id, "reason", e.target.value)}
            />
            {entries.length > 1 && (
              <button
                className="remove-btn"
                onClick={() => removeEntry(entry.id)}
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="regulariseButtons">
        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <div className="btn_Submit">
                       <SubmitButton
                         type="button"
                         loading={isSubmitting}
                         onClick={handleSubmit}
                       >
                         Submit
                       </SubmitButton>
                       </div>
      </div>
      {showPopup && <Popup />}
    </div>
  );
};

export default RegulariseForm;
