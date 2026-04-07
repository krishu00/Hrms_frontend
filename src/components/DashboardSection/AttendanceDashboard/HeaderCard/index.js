import { useEffect, useState } from "react";
import axios from "axios";
import oneImg from "../../../../Image/one.png";
import twoImg from "../../../../Image/two.png";
import threeImg from "../../../../Image/three.png";
import fourImg from "../../../../Image/four.png";

const HeaderCard = ({ year, month, onMonthYearChange }) => {
  const [MonthlyPercentageData, setMonthlyPercentageData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
  console.log("MonthlyPercentageData:", MonthlyPercentageData.birthday);
  // 🎂 Show popup when MonthlyPercentageData.birthday === true
  useEffect(() => {
    if (MonthlyPercentageData?.birthday) {
      const showTimer = setTimeout(() => setShowBirthdayPopup(true), 800); // show after 0.8s
      const hideTimer = setTimeout(() => setShowBirthdayPopup(false), 9000); // hide after 9s

      // cleanup timers when component unmounts or MonthlyPercentageData changes
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [MonthlyPercentageData]);

  const today = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthNameToDisplay = monthNames[parseInt(month, 10) - 1] || "";

  async function fetchAllMonthlyPercentageData(
    selectedMonth = month,
    selectedYear = year
  ) {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/attendance/user_attendance_performance`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
          params: {
            month: parseInt(selectedMonth),
            year: selectedYear,
          },
        }
      );

      console.log("Monthly Data:", response.data);
      setMonthlyPercentageData(response.data);
    } catch (error) {
      console.error("Error fetching monthly attendance data:", error);
      setShowPopup(true);
      setMessage("Failed to fetch monthly attendance data.");
      setTimeout(() => setShowPopup(false), 3000);
    }
  }

  useEffect(() => {
    // Fetch data when dropdown values change
    fetchAllMonthlyPercentageData(month, year);
  }, [month, year]);

  // When dropdown changes, call the parent handler
  const handleYearChange = (e) => {
    onMonthYearChange(month, e.target.value);
  };
  const handleMonthChange = (e) => {
    onMonthYearChange(e.target.value, year);
  };

  return (
    <div className="heading-cont">
      {/* 🎂 Birthday Popup */}
      {showBirthdayPopup && (
        <div className="birthday-popup animated">
          <div className="birthday-content">
            <span className="birthday-emoji">🎉🎂</span>
            <h2>Happy Birthday!</h2>
            <p>Wishing you a wonderful year ahead. Enjoy your special day!</p>
          </div>
        </div>
      )}
      <section className="Insights-section">
        <h2>Insights</h2>
        <div className="date-container">
          <select
            className="custom-select"
            value={year}
            onChange={handleYearChange}
          >
            <option value="">Year</option>
            {[2023, 2024, 2025, 2026, 2027, 2028].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <select
            className="custom-select"
            value={month}
            onChange={handleMonthChange}
          >
            <option value="">Month</option>
            {[
              "01",
              "02",
              "03",
              "04",
              "05",
              "06",
              "07",
              "08",
              "09",
              "10",
              "11",
              "12",
            ].map((m, idx) => (
              <option key={m} value={m}>
                {new Date(0, idx).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Render data safely */}
      <section className="Attnd-details-div">
        <div className="Attnd-card">
          <div className="heading1">
            <p className="sub-Heading percent">On Time Percentage</p>
            <p className="sub-Heading month">{monthNameToDisplay}</p>
            <h1 className="sub-Heading">
              {MonthlyPercentageData?.onTimePercentage || 0} %
            </h1>
          </div>
          <div>
            <img src={oneImg} alt="On Time" />
          </div>
        </div>

        <div className="Attnd-card">
          <div className="heading1">
            <p className="sub-Heading percent">Late Percentage</p>
            <p className="sub-Heading month">{monthNameToDisplay}</p>
            <h1 className="sub-Heading">
              {MonthlyPercentageData?.latePercentage || 0} %
            </h1>
          </div>
          <div>
            <img src={twoImg} alt="Late" />
          </div>
        </div>

        <div className="Attnd-card">
          <div className="heading1">
            <p className="sub-Heading percent">Total Working Days</p>
            <p className="sub-Heading month">
              {MonthlyPercentageData?.totalWorkingDays || 0} days
            </p>
            <p className="sub-Heading month">
              {MonthlyPercentageData?.totalHalfDays || 0} half days
            </p>
            <p className="sub-Heading month">
              {MonthlyPercentageData?.missPunch || 0} miss punches
            </p>
          </div>
          <div>
            <img src={threeImg} alt="Working Days" />
          </div>
        </div>

        <div className="Attnd-card">
          <div className="heading1">
            <p className="sub-Heading percent">Total Working Hours</p>
            <p className="sub-Heading month">
              {MonthlyPercentageData?.totalHours || 0} hour
            </p>
            <p className="sub-Heading month">
              {MonthlyPercentageData?.totalMinutes || 0} minutes
            </p>
            <p className="sub-Heading month">
              {MonthlyPercentageData?.totalSeconds || 0} seconds
            </p>
          </div>
          <div className="head_graph_img">
            <img src={fourImg} alt="Working Hours" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeaderCard;

// import { useEffect, useState } from "react";
// import "./BirthdayPopup.css";
// import axios from "axios";
// import oneImg from "../../../../Image/one.png";
// import twoImg from "../../../../Image/two.png";
// import threeImg from "../../../../Image/three.png";
// import fourImg from "../../../../Image/four.png";

// const HeaderCard = ({ year, month, onMonthYearChange }) => {
//   const [MonthlyPercentageData, setMonthlyPercentageData] = useState({});
//   const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);

//   const today = new Date();

//   // ✅ Show popup if today is 18th August (example)
//   useEffect(() => {
//     if (today.getDate() === 18 && today.getMonth() === 7) {
//       setTimeout(() => setShowBirthdayPopup(true), 800); // show after 0.8s
//       setTimeout(() => setShowBirthdayPopup(false), 9000); // hide after 6s
//     }
//   }, []);

//   // ✅ Handle year change
//   const handleYearChange = (e) => {
//     onMonthYearChange(e.target.value, month);
//   };

//   // ✅ Handle month change
//   const handleMonthChange = (e) => {
//     onMonthYearChange(year, e.target.value);
//   };

//   // ✅ Month names array
//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   // ✅ Show selected month name
//   const monthNameToDisplay = month ? monthNames[parseInt(month) - 1] : "";

//   return (
//     <div className="heading-cont">
//       {/* 🎂 Birthday Popup */}
//       {showBirthdayPopup && (
//         <div className="birthday-popup animated">
//           <div className="birthday-content">
//             <span className="birthday-emoji">🎉🎂</span>
//             <h2>Happy Birthday!</h2>
//             <p>Wishing you a wonderful year ahead. Enjoy your special day!</p>
//           </div>
//         </div>
//       )}

//       {/* 📊 Insights Section */}
//       <section className="Insights-section">
//         <h2>Insights</h2>
//         <div className="date-container">
//           <select
//             className="custom-select"
//             value={year}
//             onChange={handleYearChange}
//           >
//             <option value="">Year</option>
//             {[2023, 2024, 2025, 2026, 2027, 2028].map((yr) => (
//               <option key={yr} value={yr}>
//                 {yr}
//               </option>
//             ))}
//           </select>

//           <select
//             className="custom-select"
//             value={month}
//             onChange={handleMonthChange}
//           >
//             <option value="">Month</option>
//             {monthNames.map((m, idx) => (
//               <option key={idx + 1} value={String(idx + 1).padStart(2, "0")}>
//                 {m}
//               </option>
//             ))}
//           </select>
//         </div>
//       </section>

//       {/* 📌 Attendance Data Section */}
//       <section className="Attnd-details-div">
//         <div className="Attnd-card">
//           <div className="heading1">
//             <p className="sub-Heading percent">On Time Percentage</p>
//             <p className="sub-Heading month">{monthNameToDisplay}</p>
//             <h1 className="sub-Heading">
//               {MonthlyPercentageData?.onTimePercentage || 0} %
//             </h1>
//           </div>
//           <div>
//             <img src={oneImg} alt="On Time" />
//           </div>
//         </div>

//         <div className="Attnd-card">
//           <div className="heading1">
//             <p className="sub-Heading percent">Late Percentage</p>
//             <p className="sub-Heading month">{monthNameToDisplay}</p>
//             <h1 className="sub-Heading">
//               {MonthlyPercentageData?.latePercentage || 0} %
//             </h1>
//           </div>
//           <div>
//             <img src={twoImg} alt="Late" />
//           </div>
//         </div>

//         <div className="Attnd-card">
//           <div className="heading1">
//             <p className="sub-Heading percent">Total Working Days</p>
//             <p className="sub-Heading month">
//               {MonthlyPercentageData?.totalWorkingDays || 0} days
//             </p>
//             <p className="sub-Heading month">
//               {MonthlyPercentageData?.totalHalfDays || 0} half days
//             </p>
//             <p className="sub-Heading month">
//               {MonthlyPercentageData?.missPunch || 0} miss punches
//             </p>
//           </div>
//           <div>
//             <img src={threeImg} alt="Working Days" />
//           </div>
//         </div>

//         <div className="Attnd-card">
//           <div className="heading1">
//             <p className="sub-Heading percent">Total Working Hours</p>
//             <p className="sub-Heading month">
//               {MonthlyPercentageData?.totalHours || 0} hour
//             </p>
//             <p className="sub-Heading month">
//               {MonthlyPercentageData?.totalMinutes || 0} minutes
//             </p>
//             <p className="sub-Heading month">
//               {MonthlyPercentageData?.totalSeconds || 0} seconds
//             </p>
//           </div>
//           <div className="head_graph_img">
//             <img src={fourImg} alt="Working Hours" />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HeaderCard;
