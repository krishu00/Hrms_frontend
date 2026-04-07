// IMPORTS
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import Punchin from "../../../../Image/PunchIn.png";
import axios from "axios";
import Cookies from "js-cookie";
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";

/** Convert decimal hours into Xh Ym format */
const formatDecimalHours = (decimalHours) => {
  if (typeof decimalHours !== "number" || isNaN(decimalHours)) return "0h 0m";
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours % 1) * 100);
  return `${hours}h ${minutes}m`;
};

const GraphSection = (props) => {
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchOut, setPunchOut] = useState(false);
  const [inTime, setInTime] = useState("00:00");
  const [outTime, setOutTime] = useState("00:00");
  const [error, setError] = useState(null);
  const { showPopup, setShowPopup, setMessage } = usePopup();
  const [chartData, setChartData] = useState([]);
  //  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hourRotation =
    (time.getHours() % 12) * 30 +
    time.getMinutes() * 0.5 +
    time.getSeconds() * (0.5 / 60);
  const minuteRotation = time.getMinutes() * 6 + time.getSeconds() * 0.1;
  const secondRotation = time.getSeconds() * 6;
  // console.log("monthlyDataFromCalender..............", props.data);

  // Clock timer
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Transform props data to chart format
  useEffect(() => {
    if (!props.data || !props.date || props.data.length !== props.date.length) {
      setChartData([]);
      return;
    }

    const transformed = props.date.map((date, idx) => ({
      name: date,
      WorkingHour: parseFloat(props.data[idx] || 0),
    }));

    setChartData(transformed);
  }, [props.data, props.date]);

  const getLocation = async () => {
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      setError("Geolocation requires HTTPS.");
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lon: longitude });

        if (punchedIn) {
          await handlePunchOut();
        } else {
          await handlePunchIn();
        }
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const getCompanyCodeAndTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");
    const companyCode = cookies.find(c => c.startsWith("companyCode="))?.split("=")[1] || null;
    const verifyLocation = cookies.find(c => c.startsWith("verifyLocation="))?.split("=")[1] || null;
      const employeeId = cookies.find(c => c.startsWith("employee_id="))?.split("=")[1] || null;

    return { companyCode, verifyLocation ,employeeId};
  };
const { employeeId } = getCompanyCodeAndTokenFromCookies();

  const handlePunchIn = async () => {
    const { verifyLocation ,employeeId} = getCompanyCodeAndTokenFromCookies();
    if (!location.lat || !location.lon) return;

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/attendance/punch_in`, {
        data: {
          latitude: location.lat,
          longitude: location.lon,
          verifyLocation,
        },
      }, { withCredentials: true });

      const inTimeStr = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
      setInTime(inTimeStr);
      setPunchedIn(true);

      const cachedData = {
        ...JSON.parse(localStorage.getItem(`attendance-${employeeId}`)) || {},
        date: new Date().toISOString().split("T")[0],
        inTime: inTimeStr,
      };
      localStorage.setItem(`attendance-${employeeId}`, JSON.stringify(cachedData));

      setShowPopup(true);
      setMessage(res.data.message);
    } catch (err) {
      setShowPopup(true);
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const handlePunchOut = async () => {
    const { verifyLocation ,employeeId } = getCompanyCodeAndTokenFromCookies();
    if (!location.lat || !location.lon) return;

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/attendance/punch_out`, {
        data: {
          latitude: location.lat,
          longitude: location.lon,
          verifyLocation,
        },
      }, { withCredentials: true });

      const outTimeStr = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
      setOutTime(outTimeStr);
      setPunchOut(true);

      const cachedData = {
        ...JSON.parse(localStorage.getItem(`attendance-${employeeId}`)) || {},
        date: new Date().toISOString().split("T")[0],
        outTime: outTimeStr,
      };
      localStorage.setItem(`attendance-${employeeId}`, JSON.stringify(cachedData));

      setShowPopup(true);
      setMessage(punchOut ? "Punch out time updated!" : "You are punched out!");
    } catch (err) {
      setShowPopup(true);
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/attendance/daily_attendance/`, {
        params: { date: today },
        withCredentials: true,
      });

      if (res.data.length > 0) {
        const attendance = res.data[0];
        if (attendance.punch_in_time) {
          setInTime(new Date(attendance.punch_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          setPunchedIn(true);
        }
        if (attendance.punch_out_time) {
          setOutTime(new Date(attendance.punch_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          setPunchOut(true);
        }
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  useEffect(() => {
    if (!employeeId) return;
    const cached = JSON.parse(localStorage.getItem(`attendance-${employeeId}`)) || {};
    const today = new Date().toISOString().split("T")[0];

    if (cached.date === today) {
      if (cached.inTime) setInTime(cached.inTime);
      if (cached.outTime) {
        setOutTime(cached.outTime);
        setPunchOut(true);
      }
      if (cached.inTime) setPunchedIn(true);
    } else {
      localStorage.setItem(`attendance-${employeeId}`, JSON.stringify({ date: today }));
    }
  }, [employeeId]);

  return (
    <div className="clock-graph-container">
      {/* Clock + Time Display */}
      <div className="clock-container">
        {/* <div className="small-clock">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="diallines"
              style={{
                transform: `rotate(${i * 30}deg)`, // Rotate each line by 6 degrees
              }}
            ></div>
          ))}

          <div
            className="hour-hand"
            style={{
              transform: `rotate(${
                (time.getHours() % 12) * 30 +
                time.getMinutes() * 0.5 +
                time.getSeconds() * (0.5 / 60)
              }deg)`,
            }}
          />
          <div
            className="minute-hand"
            style={{
              transform: `rotate(${
                time.getMinutes() * 6 + time.getSeconds() * 0.1
              }deg)`,
            }}
          />
          <div
            className="second-hand"
            style={{
              transform: `rotate(${time.getSeconds() * 6}deg)`,
            }}
          />

          <div className="center-circle" />
        </div> */}
        <div className="small-clock">
          {/* Dial lines */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="dial-line"
              style={{ transform: `rotate(${i * 30}deg)` }}
            ></div>
          ))}

          {/* Hour hand */}
          <div
            className="hour-hand"
            style={{ transform: `rotate(${hourRotation}deg)` }}
          ></div>

          {/* Minute hand */}
          <div
            className="minute-hand"
            style={{ transform: `rotate(${minuteRotation}deg)` }}
          ></div>

          {/* Second hand */}
          <div
            className="second-hand"
            style={{ transform: `rotate(${secondRotation}deg)` }}
          ></div>

          {/* Center circle */}
          <div className="center-circle"></div>
        </div>

        <div className="time-details">
          <div className="in-time"><span>In Time -</span> <span>{inTime}</span></div>
          <div className="out-time"><span>Out Time -</span> <span>{outTime}</span></div>
        </div>

        {/* Button */}
        <div className="bottomContainer">
          <div className="icon-container"><img src={Punchin} alt="Punch" /></div>
          {punchedIn ? (
            <button className="ctaBtn punch-out" onClick={getLocation}>
              {punchOut ? "Punch Out Again" : "Punch Out"}
            </button>
          ) : (
            <button className="ctaBtn punch-in" onClick={getLocation}>Punch In</button>
          )}
        </div>
      </div>

      {/* Attendance Chart */}
      <div className="graph-section">
        <div className="upperContainer">
          <h3>Attendance Chart</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 1, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name">
                <Label value="Date --->" offset={0} position="insideBottom" />
              </XAxis>
              <YAxis domain={[1, 12]} tickCount={12}>
                <Label value="Working Hours --->" angle={-90} position="insideMiddle" style={{ textAnchor: "middle" }} />
              </YAxis>
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value) => [formatDecimalHours(value), "Working Hours"]}
              />
              <Line type="monotone" dataKey="WorkingHour" stroke="#00bfae" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showPopup && <Popup />}
    </div>
  );
};

export default GraphSection;
