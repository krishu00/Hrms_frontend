import React, { useEffect, useState } from "react";
import "../../../ComponentsCss/Team/MyTeam/Attendance.css";
import { IoIosClose } from "react-icons/io";
import axios from "axios";

// const toIsoDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
// const getLast7Range = () => {
//   const end = new Date();
//   const start = new Date();
//   start.setDate(end.getDate() - 6);
//   return { start: toIsoDate(start), end: toIsoDate(end) };
// };
const toIsoDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const getCurrentWeekRange = () => {
  const today = new Date();

  // JS week: Sunday = 0, Monday = 1 ... Saturday = 6
  const day = today.getDay();

  // Calculate Monday
  const monday = new Date(today);
  const diffToMonday = day === 0 ? -6 : 1 - day; // if Sunday, go back 6 days
  monday.setDate(today.getDate() + diffToMonday);

  // Calculate Sunday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: toIsoDate(monday),
    end: toIsoDate(sunday),
  };
};


export default function AttendanceFromLocalApi() {
  const defaultRange = getCurrentWeekRange();

  const [raw, setRaw] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [managerPath, setManagerPath] = useState([]);
  const [rootManagerName, setRootManagerName] = useState("");
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);

  const [daysRangeState, setDaysRangeState] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const [locationDetails, setLocationDetails] = useState({
    inAddress: null,
    outAddress: null,
  });
  const [loadingAddress, setLoadingAddress] = useState(false);

  const API_URL = `${process.env.REACT_APP_API_URL}/company/reportees_attendance`;

  const fmtTime = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "-";
    }
  };

  const isoToInputDate = (iso) => {
    try {
      return iso ? new Date(iso).toISOString().slice(0, 10) : "";
    } catch {
      return "";
    }
  };

  const extractArea = (address) => {
    if (!address) return "Unknown";
    const parts = address.split(",");
    const sector = parts.find((p) => p.toLowerCase().includes("sector"));
    return sector
      ? sector.trim()
      : parts[2]?.trim() || parts[1]?.trim() || "Unknown";
  };

  const distanceKm = (lat1, lon1, lat2, lon2) => {
    if (![lat1, lon1, lat2, lon2].every((v) => typeof v === "number"))
      return null;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const reverseGeocode = async (lat, lon) => {
    if (!lat || !lon) return "Not available";
    try {
      const key = "pk.3e670ac6e5f2c89e90420d7ae0539c28";
      const url = `https://us1.locationiq.com/v1/reverse?key=${key}&lat=${lat}&lon=${lon}&format=json`;
      const res = await axios.get(url, { withCredentials: false });
      return res?.data?.display_name || "Not available";
    } catch (err) {
      return "Failed to fetch address";
    }
  };

  const findNameById = (items, id) => {
    if (!items || !id) return null;
    for (const it of items) {
      if (it.employee_id === id || it.employee_Id === id)
        return it.name || null;
      if (it.subordinates && it.subordinates.length) {
        const found = findNameById(it.subordinates, id);
        if (found) return found;
      }
    }
    return null;
  };

  const headerLabel = (isoDate) => {
    try {
      const dt = new Date(isoDate + "T00:00:00");

      const day = String(dt.getDate()).padStart(3, "0");

      const fullDay = dt.toLocaleDateString("en-US", { weekday: "long" });

      let wk;

      
        
          wk = fullDay.slice(0,3);
    

      // return `${wk} | ${day}`;
      return `${wk} | ${day}`;
    } catch {
      return isoDate;
    }
  };
//  
const calculateTotalWorkingHours = (week) => {
  let totalMinutes = 0;

  week.forEach((day) => {
    const wh = day.attendanceEntry?.working_hours;
    if (!wh) return;

    // Case 1: String format "HH:MM"
    if (typeof wh === "string" && wh.includes(":")) {
      const [h, m] = wh.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        totalMinutes += h * 60 + m;
      }
    }

    // Case 2: Number format (hours like 8.5)
    else if (typeof wh === "number") {
      totalMinutes += Math.round(wh * 60);
    }

    // Case 3: String number "8.5"
    else if (!isNaN(wh)) {
      totalMinutes += Math.round(Number(wh) * 60);
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return totalMinutes > 0 ? `${hours}h ${minutes}m` : "--";
};



  const transformApiToNodes = (
    apiJson,
    rootNameFallback = "",
    uiStart,
    uiEnd
  ) => {
    if (!apiJson || !apiJson.reportees)
      return {
        nodes: [],
        rootManagerName: rootNameFallback || "",
        daysRange: [],
      };

    const nodes = [];

    const managerId = apiJson.manager_id || apiJson.managerId || null;
    const resolvedManagerName =
      managerId && apiJson.reportees
        ? findNameById(apiJson.reportees, managerId)
        : null;
    const rootManagerNameLocal =
      resolvedManagerName || managerId || rootNameFallback || "";

    const walk = (items, parentName) => {
      (items || []).forEach((it) => {
        const node = {
          id: it.employee_id || it.employee_Id || "-",
          name: it.name || "Unknown",
          managerName: parentName,
          department: it.department || "",
          designation: it.designation || "",
          employee_status: it.employee_status || "",
          _rawAttendance: it.attendance || [],
          inLat: null,
          inLon: null,
          outLat: null,
          outLon: null,
          week: [],
        };

        nodes.push(node);

        if (it.subordinates && it.subordinates.length) {
          walk(it.subordinates, it.name || node.name);
        }
      });
    };

    walk(apiJson.reportees, rootManagerNameLocal);

    let daysRange = [];
    if (apiJson.startDate && apiJson.endDate) {
      const start = new Date(apiJson.startDate);
      const end = new Date(apiJson.endDate);

      const startUtc = Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate()
      );
      const endUtc = Date.UTC(
        end.getUTCFullYear(),
        end.getUTCMonth(),
        end.getUTCDate()
      );

      for (let t = startUtc; t <= endUtc; t += 24 * 60 * 60 * 1000) {
        daysRange.push(new Date(t).toISOString().slice(0, 10));
      }
    } else {
      const start = uiStart ? new Date(uiStart) : new Date();
      const end = uiEnd ? new Date(uiEnd) : new Date();

      const cur = new Date(start);
      let daysRangeLocal = [];

      while (cur <= end) {
        const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(cur.getDate()).padStart(2, "0")}`;

        daysRangeLocal.push(key);
        cur.setDate(cur.getDate());
      }

      daysRange = daysRangeLocal;
    }

    // build attendance map for quick lookup
    const attMap = {};
    const buildMap = (items) => {
      (items || []).forEach((it) => {
        const map = {};
        (it.attendance || []).forEach((a) => {
          const key = a.date ? a.date.slice(0, 10) : null;

          if (key) map[key] = a;
        });
        attMap[it.employee_id] = map;
        if (it.subordinates && it.subordinates.length)
          buildMap(it.subordinates);
      });
    };
    buildMap(apiJson.reportees);

    nodes.forEach((n) => {
      n.week = daysRange.map((d) => {
        const key = d;

        const a = attMap[n.id]?.[key];
        if (!a) return { in: "-", out: "-", date: key, attendanceEntry: null };
        return {
          in: a.punch_in_time ? fmtTime(a.punch_in_time) : "-",
          out: a.punch_out_time ? fmtTime(a.punch_out_time) : "-",
          date: key,
          attendanceEntry: a,
        };
      });
    });

    return { nodes, rootManagerName: rootManagerNameLocal, daysRange };
  };

  const hasSubordinates = (name) => {
    if (!name) return false;
    return attendanceData.some((e) => e.managerName === name);
  };

  const getAllUnderManager = (manager, visited = new Set()) => {
    if (!manager || visited.has(manager)) return [];

    visited.add(manager);
    let result = [];

    // direct reports
    const direct = attendanceData.filter((e) => e.managerName === manager);

    for (const emp of direct) {
      result.push(emp);

      const subs = getAllUnderManager(emp.name, visited);
      if (subs && subs.length) result = result.concat(subs);
    }

    return result;
  };

  // --------- Load API (moved to reusable fn) ---------
  const loadData = async (
    startDateParam = "",
    endDateParam = "",
    searchParam = ""
  ) => {
    try {
      // construct url with optional query params
      let url = API_URL;
      const params = new URLSearchParams();
      if (startDateParam) params.append("startDate", startDateParam);
      if (endDateParam) params.append("endDate", endDateParam);
      if (searchParam) params.append("searchTerm", searchParam);
      if ([...params].length) url = `${API_URL}?${params.toString()}`;

      const res = await axios.get(url);
      setRaw(res.data);

      const {
        nodes,
        rootManagerName: resolvedRoot,
        daysRange,
      } = transformApiToNodes(res.data, "", startDateParam, endDateParam);

      setAttendanceData(nodes);

      setRootManagerName(resolvedRoot || "");
      setFilteredEmployees(
        nodes.filter((n) => n.managerName === (resolvedRoot || ""))
      );

      // set daysRange state used for headers
      setDaysRangeState(daysRange || []);

      setManagerPath(resolvedRoot ? [resolvedRoot] : []);
      setHistory([]);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
      setRaw(null);
      setAttendanceData([]);
      setFilteredEmployees([]);
      setManagerPath([]);
      setRootManagerName("");
      setHistory([]);
      setDaysRangeState([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await loadData(startDate, endDate, searchTerm);
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEmployeeClick = (name) => {
    if (!hasSubordinates(name)) return;

    const directReports = attendanceData.filter((e) => e.managerName === name);

    setHistory((p) => [...p, filteredEmployees]);
    setManagerPath((p) => [...p, name]);
    setFilteredEmployees(directReports);
  };

  const handleBack = () => {
    if (managerPath.length <= 1) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setManagerPath((m) => m.slice(0, -1));
    setFilteredEmployees(last);
  };

  const jumpToLevel = (index) => {
    const targetManager = managerPath[index];
    setManagerPath(managerPath.slice(0, index + 1));
    setHistory(history.slice(0, index));
    setFilteredEmployees(getAllUnderManager(targetManager));
  };

  const displayedEmployees = filteredEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.id || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCellAddressClick = async (employee, dayIndex) => {
    const day = employee.week[dayIndex];
    setPopupInfo({
      employee,
      dayIndex,
      attendanceEntry: day.attendanceEntry,
      date: day.date,
    });
    setShowPopup(true);

    const inLat =
      day.attendanceEntry?.punch_in_time_latitude_coordinates ?? employee.inLat;
    const inLon =
      day.attendanceEntry?.punch_in_time_longitude_coordinates ??
      employee.inLon;
    const outLat =
      day.attendanceEntry?.punch_out_time_latitude_coordinates ??
      employee.outLat;
    const outLon =
      day.attendanceEntry?.punch_out_time_longitude_coordinates ??
      employee.outLon;

    setLoadingAddress(true);
    const [inAddr, outAddr] = await Promise.all([
      reverseGeocode(inLat, inLon),
      reverseGeocode(outLat, outLon),
    ]);
    setLocationDetails({
      inAddress: inAddr,
      outAddress: outAddr,
      inLat,
      inLon,
      outLat,
      outLon,
    });
    setLoadingAddress(false);
  };

  const handleSearchByDate = async () => {
    if (startDate && endDate && startDate > endDate) {
      alert("Start date cannot be after End date");
      return;
    }

    await loadData(startDate || "", endDate || "", searchTerm || "");
  };

  return (
    <div className="attx-container">
      <div className="attx-header">
        <span
          onClick={handleBack}
          style={{
            cursor: managerPath.length > 1 ? "pointer" : "default",
            position: "absolute",
            left: "0",
            marginLeft: "10px",
            fontSize: "20px",
            opacity: managerPath.length > 1 ? 1 : 0.3,
            fontWeight: "bold",
          }}
        >
          ←
        </span>
        <h2 style={{ width: "100%", textAlign: "center" }}>Attendance</h2>
      </div>

      <div className="attx-subheader">
        <div
          style={{
            display: "flex",
            gap: "6px",
            fontSize: "12px",
            marginLeft: "10px",
          }}
        >
          <span>Manager:</span>

          {managerPath.length > 0 ? (
            managerPath.map((name, index) => (
              <span
                key={index}
                onClick={() => jumpToLevel(index)}
                style={{
                  cursor:
                    index === managerPath.length - 1 ? "default" : "pointer",
                }}
              >
                {name.split(" ")[0]}
                {index < managerPath.length - 1 && " > "}
              </span>
            ))
          ) : (
            <span>{rootManagerName || "—"}</span>
          )}
        </div>

        {/* Date Range + Search */}
        <div className="attx-search-row" style={{ alignItems: "center" }}>
          <input
            className="attx-search-input"
            type="text"
            placeholder="Search by name / employee id"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <input
            className="attx-date-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            className="attx-date-input"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button className="attx-search-button" onClick={handleSearchByDate}>
            Search
          </button>
        </div>
      </div>

      <div className="attx-main">
        <div className="attx-table-wrap">
          <table className="attx-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Employee</th>
                <th>Department</th>

                {daysRangeState.map((iso, i) => (
                  <th key={i} title={iso}>
                    {headerLabel(iso)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {displayedEmployees.map((emp, idx) => (
                <tr key={emp.id + idx}>
                  <td>{idx + 1}</td>
                  <td
                    onClick={() => handleEmployeeClick(emp.name)}
                    style={{
                      cursor: hasSubordinates(emp.name) ? "pointer" : "default",
                      color: "#000",
                      display: "flex",
                      justifyContent: "space-between",
                      flexDirection: "column",
                    }}
                  >
                    <div className="line1">
                    <div>
                      <div>{emp.name}</div>
                      <div
                        style={{
                          fontSize: "10px",
                          opacity: 0.6,
                          marginLeft: 10,
                        }}
                      >
                        {emp.id}
                      </div>
                    </div>
                    {hasSubordinates(emp.name) && (
                      <span style={{ fontWeight: "bold" }}>+</span>
                    )}
                    </div>
                    <div className="totalhrs">
                      Total: {calculateTotalWorkingHours(emp.week)}
                    </div>
                    
                  </td>

                  <td>
                    {emp.department.split(" ").map((w, i) => (
                      <div key={i}>{w}</div>
                    ))}
                  </td>

                  {emp.week.map((day, di) => (
                    <td key={di}>
                     
                      <div className="attx-day">
                        {/* <div className="attx-inout">
                          <span className="attx-in">{day.in}</span>
                          <span className="attx-divider">|</span>
                          <span className="attx-out">{day.out}</span>
                        </div> */}
                         <div className= "attx-day-cell">
                        <div className="attx-inout" >
  <div>
    <span className="attx-in">{day.in}</span>
    <span className="attx-divider"> | </span>
    <span className="attx-out">{day.out}</span>
  </div>

  {/* <div
    style={{
      fontSize: "11px",
      fontWeight: "bold",
      color: "#333",
      marginLeft: "6px",
      whiteSpace: "nowrap",
    }}
  >
   
  </div> */}
  </div>
  <div className="attx-working-hours">
   {day.attendanceEntry?.working_hours
      ? `${day.attendanceEntry.working_hours}`
      : "--|--"}
      </div>
      </div>



                        <div className="attx-address-block">
                          <div
                            className="attx-scroll-text attx-address attx-hover-address"
                            title={locationDetails.inAddress}
                            onClick={() => handleCellAddressClick(emp, di)}
                            style={{
                              fontSize: "11px",
                              color: "#000",
                              cursor: "pointer",
                              marginTop: "4px",
                            }}
                          >
                            In:{" "}
                            {popupInfo?.employee?.id === emp.id &&
                            popupInfo?.dayIndex === di &&
                            locationDetails.inAddress
                              ? extractArea(locationDetails.inAddress)
                              : "Tap to view"}
                          </div>

                          <div
                            className="attx-scroll-text attx-address attx-hover-address"
                            title={locationDetails.outAddress}
                            onClick={() => handleCellAddressClick(emp, di)}
                            style={{
                              fontSize: "10px",
                              color: "#000",
                              cursor: "pointer",
                              marginTop: "2px",
                            }}
                          >
                            Out:{" "}
                            {popupInfo?.employee?.id === emp.id &&
                            popupInfo?.dayIndex === di &&
                            locationDetails.outAddress
                              ? extractArea(locationDetails.outAddress)
                              : "Tap to view"}
                          </div>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Popup */}
        {showPopup && popupInfo && (
          <>
            <div
              className="attx-overlay"
              onClick={() => setShowPopup(false)}
            ></div>
            <div className="attx-popup">
              <div className="attx-popup-header">
                <h3>Attendance Details</h3>
                <IoIosClose
                  className="attx-popup-close"
                  onClick={() => setShowPopup(false)}
                />
              </div>

              <div className="attx-popup-content">
                {loadingAddress ? (
                  <p>Fetching live location address... ⏳</p>
                ) : (
                  <ul className="attx-popup-list">
                    <li>
                      <strong>Date:</strong> {popupInfo.date}
                    </li>
                    <li>
                      <strong>In Time:</strong>{" "}
                      {popupInfo.attendanceEntry?.punch_in_time
                        ? fmtTime(popupInfo.attendanceEntry.punch_in_time)
                        : "-"}
                    </li>
                    <li className="attx-inline">
                      <strong>In Location:</strong>{" "}
                      <span
                        className="attx-scroll-text"
                        title={locationDetails.inAddress}
                      >
                        {locationDetails.inAddress || "-"}
                      </span>
                    </li>
                    <li>
                      <strong>Out Time:</strong>{" "}
                      {popupInfo.attendanceEntry?.punch_out_time
                        ? fmtTime(popupInfo.attendanceEntry.punch_out_time)
                        : "-"}
                    </li>
                    <li className="attx-inline">
                      <strong>Out Location:</strong>{" "}
                      <span
                        className="attx-scroll-text"
                        title={locationDetails.outAddress}
                      >
                        {locationDetails.outAddress || "-"}
                      </span>
                    </li>
                    <li>
                      <strong>Total Working Hour:</strong>{" "}
                      {popupInfo.attendanceEntry?.working_hours ?? "-"}
                    </li>
                    <li>
                      <strong>Status:</strong>{" "}
                      {popupInfo.attendanceEntry?.status ?? "-"}
                    </li>
                    <li>
                      <strong>Distance:</strong>{" "}
                      {locationDetails.inLat && locationDetails.outLat
                        ? `${distanceKm(
                            locationDetails.inLat,
                            locationDetails.inLon,
                            locationDetails.outLat,
                            locationDetails.outLon
                          )} km`
                        : "-"}
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
