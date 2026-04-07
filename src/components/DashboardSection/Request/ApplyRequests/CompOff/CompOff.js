import React, { useState } from "react";
import "../../../../ComponentsCss/Request/ApplyRequests/CompOff/CompOff.css";
import axios from "axios";
import { usePopup } from "../../../../../context/popup-context/Popup";
import { Popup } from "../../../../Utils/Popup/Popup";
import { useEffect } from "react";
import { useSubmitting } from "../../../../Utils/useSubmitting.js";
import SubmitButton from "../../../../Utils/SubmitButton.js";
const CompOffForm = ({ onClose }) => {
  const [entries, setEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCalendar, setShowCalendar] = useState(false);
  const [workingHours, setWorkingHours] = useState({});
  const { isSubmitting, run } = useSubmitting();
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const openDatePicker = () => {
    setShowCalendar(!showCalendar);
  };

  useEffect(() => {
    getStartDay(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;

    // extract the day number (for mapping)
    const dayKey = String(new Date(selectedDate).getDate());
    const hours = workingHours[dayKey] || "0";

    // prevent duplicate date entries
    if (entries.some((e) => e.date === selectedDate)) {
      setShowPopup(true);
      setMessage("This date is already added!");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    setEntries((prevEntries) => [
      ...prevEntries,
      {
        id: prevEntries.length + 1,
        date: selectedDate,
        workingHours: hours,
        dayType: "Full Day",
      },
    ]);

    setShowCalendar(false);
  };

  console.log("entries", entries);

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
      const data = response.data.workingHoursPerDay || [];

      const mappedHours = data.reduce((acc, item) => {
        const day = String(item.date); // e.g., "6"
        const hours = parseFloat(item.decimal_hours) || 0;
        acc[day] = hours.toFixed(2); // store as "8.36"
        return acc;
      }, {});

      setWorkingHours(mappedHours);
    } catch (err) {
      console.error("Error fetching working hours:", err);
    }
  };
  console.log("working hours ", workingHours);

  const handleChange = (id, field, value) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeEntry = (id) => {
    setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
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
      const dayKey = String(day);
      const hours = workingHours[dayKey] || "--";
      console.log("hours", hours);

      calendarDays.push(
        <div
          key={day}
          className={`calendar-day ${hours !== "--" ? "has-hours" : ""}`}
          //   onClick={() => handleDateSelect(dayKey)}
          onClick={() =>
            handleDateSelect(
              `${selectedYear}-${String(selectedMonth + 1).padStart(
                2,
                "0"
              )}-${String(day).padStart(2, "0")}`
            )
          }
        >
          <span className="calendar-date">{day}</span>
          <span className="calendar-hours">{hours}</span>
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
        setMessage("Please select at least one date!");
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }

      const payload = {
        compOffData: entries.map((entry) => ({
          date: entry.date,
          // 🚀 FIX 1: Convert string dayType to numeric value
          dayValue: entry.dayType === "Full Day" ? 1 : "Half Day" ?0.5 : 0,
          reason: entry.reason || "CompOff Request", // Placeholder reason, can be enhanced to take user input
        })),
        // We will add the reason in the backend loop
       // reason: entries[0].reason, // Assuming a reason field is added to state/entries later
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/request/apply-compOff`,
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    

      setShowPopup(true);
      setMessage("CompOff request submitted successfully!");
      setTimeout(() => setShowPopup(false), 3000);

      onClose();
    } catch (error) {
      console.error("Error submitting CompOff:", error);
      setShowPopup(true);
      setMessage("Failed to submit CompOff request. Please try again.");
      setTimeout(() => setShowPopup(false), 3000);
    }
     });
  };
 


  return (
    <div className="compoff-container">
      <div className="compoff-header">
        <h2>Apply CompOff</h2>
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

      <div className="compoff-entries">
        <div className="compoff-table-header">
          <span>Date</span>
          <span>Work Hrs.</span>
          <span>Type</span>
          <span>Reason</span>
        </div>

        {entries.map((entry) => (
          <div key={entry.id} className="compoff-row">
            <input type="text" value={entry.date} onClick={openDatePicker} />
            <input type="text" value={entry.workingHours}  />
            <select
              value={entry.dayType}
              onChange={(e) =>
                handleChange(entry.id, "dayType", e.target.value)
              }
            >
              <option value="Full Day">Full Day</option>
              <option value="Half Day">Half Day</option>
            </select>
            <input type="text" placeholder="Reason" value={entry.reason} onChange={(e) => handleChange(entry.id, "reason", e.target.value)} />
            {entries.length > 0 && (
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

      <div className="compoff-buttons">
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

export default CompOffForm;
