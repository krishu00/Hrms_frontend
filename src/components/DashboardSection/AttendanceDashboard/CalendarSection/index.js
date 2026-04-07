import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const CalendarClock = (props) => {
  const selectedMonths = props.selectedMonth;
  const selectedYears = props.selectedYear;
  console.log(
    "Selected Month:",
    selectedMonths,
    "Selected Year:",
    selectedYears
  );
  const [currentDate, setCurrentDate] = useState(new Date());

  const [workingHours, setWorkingHours] = useState([]);

  const [myPunchIn, setMyPunchIn] = useState();
  const [myPunchOut, setMyPunchOut] = useState();
  const [myDate, setMyDate] = useState();
  const [myStatus, setMyStatus] = useState();
  const [isVisible, setIsVisible] = useState(false);
  const [empWorkingHours, setEmpWorkingHours] = useState();

  const [punchInLongitude, setPunchInLongitude] = useState();
  const [punchInLatitude, setPunchInLatitude] = useState();

  const [punchOutLatitude, setPunchOutLatitude] = useState();
  const [punchOutLongitude, setPunchOutLongitude] = useState();

  // ...rest of your code...
  const handleCloseBtn = () => {
    setIsVisible(false);
  };

  const [startDay, setStartDay] = useState(0);

  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const res = Cookies.get("myEmployeeId");
  console.log("This is cookie ", res);
  useEffect(() => {
    if (
      typeof selectedMonths === "number" &&
      typeof selectedYears === "number"
    ) {
      const newDate = new Date(currentDate);
      newDate.setFullYear(selectedYears);
      newDate.setMonth(selectedMonths);
      setCurrentDate(newDate);
    }
    // eslint-disable-next-line
  }, [selectedMonths, selectedYears]);

  // ...rest of your code...
  const handleClickBtn = async (day) => {
    setIsVisible(true);

    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
      12
    );

    console.log(selectedDate, "This is selected Date");

    const FormattedDate = selectedDate.toISOString().split("T")[0];
    setMyDate(FormattedDate);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/attendance/daily_attendance?date=${FormattedDate}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.length === 0 || !response.data[0].punch_in_time) {
        setMyPunchIn("-");
        setMyPunchOut("-");
        setMyStatus("No data");
        setEmpWorkingHours("-");
        setPunchInLongitude(null);
        setPunchInLatitude(null);
        setPunchOutLongitude(null);
        setPunchOutLatitude(null);
        return;
      }

      const data = response.data[0];

      setMyStatus(data.status || "Unknown");

      // Convert UTC time to IST
      const convertUTCtoIST = (utcString) => {
        if (!utcString) return "-";
        const date = new Date(utcString);
        return date.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false, // 24-hour format
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      };

      setMyPunchIn(convertUTCtoIST(data.punch_in_time));
      setMyPunchOut(convertUTCtoIST(data.punch_out_time));

      const empWorkingHour = data.working_hours;
      // setEmpWorkingHours(
      //   empWorkingHour ? Math.round(empWorkingHour * 10) / 10 : "-"
      // );
      console.log("empWorkingHour", empWorkingHour);
      if (empWorkingHour) {
       const totalHours=parseFloat(empWorkingHour)
        const hours = Math.floor(totalHours);
        const minutes = Math.round((empWorkingHour - hours) * 60);
        const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

        setEmpWorkingHours(`${hours} : ${formattedMinutes} Hr`);
      } else {
        setEmpWorkingHours("-/-");
      }
      setPunchInLongitude(data.punch_in_time_longitude_coordinates || null);
      setPunchInLatitude(data.punch_in_time_latitude_coordinates || null);
      setPunchOutLongitude(data.punch_out_time_longitude_coordinates || null);
      setPunchOutLatitude(data.punch_out_time_latitude_coordinates || null);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setMyPunchIn("-");
      setMyPunchOut("-");
      setMyStatus("Error fetching data");
      setEmpWorkingHours("-");
    }
  };

  const getStartDay = async (month, year) => {
    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL
        }/attendance/daily_working_hours?month=${month + 1}&year=${year}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("getstartdays response", response.data.workingHoursPerDay);
      if (props.getDataFromCalender) {
        props.getDataFromCalender(response.data.workingHoursPerDay);
      }
      const mydate = response.data.workingHoursPerDay;
      console.log("mydate", mydate);

      setWorkingHours(mydate);
    } catch (err) {
      console.log(err);
    }

    return new Date(year, month, 1).getDay();
  };

  useEffect(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const startDayValue = getStartDay(month, year);
    startDayValue.then(setStartDay);
  }, [currentDate]);

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(month, year);
    const today = new Date().getDate();

    const calendarDays = [];

    for (let i = 0; i < startDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="empty-day"></div>);
    }

    for (let day = 1; day <= days; day++) {
      const isToday =
        day === today &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();
      const workingDay = workingHours.find((hour) => hour.date === day);
      const hours = workingDay ? workingDay.decimal_hours : " ";
      const fixedHours = hours;
      const myColor = fixedHours > 7.5 ? "green" : "red";

      calendarDays.push(
        <div key={day} className={`day ${isToday ? "active-day" : ""}`}>
          <button className="dayBtn" onClick={() => handleClickBtn(day)}>
            {day}
          </button>

          {fixedHours > 0 && (
            <span style={{ color: myColor }}>{fixedHours}</span>
          )}
        </div>
      );
    }
    return calendarDays;
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleOutsideClick = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isVisible]);

  // ...rest of your code...

  return (
    <div className="calendar-clock-container">
      <div className="calendar">
        {isVisible && (
          <div className="pop-up">
            <br />
            <div className="pop-up-msg" ref={popupRef}>
              <span className="date">Date : {myDate}</span>
              <br />
              <span className="PunchInTime">
                Punch-In time :{" "}
                <span className="mypunchindata">{myPunchIn}</span>
              </span>
              <br />
              <span className="PunchInLocation">
                Punch-In location:
                <a
                  className="mypunchinlocationdata"
                  href={`https://maps.google.com/?q=${punchInLatitude},${punchInLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View location
                </a>
              </span>
              <br />
              <span className="PunchOutTime">
                Punch-out time :{" "}
                <span className="mypunchoutdata">{myPunchOut}</span>
              </span>
              <br />
              <span className="PunchOutLocation">
                Punch-out location :
                <span className="mypunchoutlocation">
                  <a
                    className="mypunchoutlocation"
                    href={`https://maps.google.com/?q=${punchOutLatitude},${punchOutLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View location
                  </a>
                </span>
              </span>
              <br />
              <span className="myStatus">
                Status : <span className="mystatusdata">{myStatus}</span>
              </span>
              <br />
              <span className="workingHours">
                Working hours :{" "}
                <span className="myworkingHours">{empWorkingHours}</span>
              </span>
              <button onClick={handleCloseBtn} className="closeBtn">
                close
              </button>
            </div>
          </div>
        )}

        <div className="month-year">
          <button className="calanderBtn" onClick={() => handleMonthChange(-1)}>
            {"<"}
          </button>

          <h3>
            {currentDate.toLocaleString("default", { month: "long" })}{" "}
            {currentDate.getFullYear()}
          </h3>
          <button className="calanderBtn" onClick={() => handleMonthChange(1)}>
            {">"}
          </button>
        </div>
        <div className="weekdays">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>
        <div className="days">{renderCalendarDays()}</div>
      </div>
    </div>
  );
};

export default CalendarClock;
