// In your React component or client-side JavaScript
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import "../../../ComponentsCss/AdminPanel/ReportsComponent/AttendanceReport.css";
import AttendancePivotReport from "./AttendancePivotReport";
import { RiFileExcel2Fill } from "react-icons/ri";
import { IoMdArrowBack } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { Popup } from "../../../Utils/Popup/Popup";
import { usePopup } from "../../../../context/popup-context/Popup";
import Cookies from "js-cookie";
import Pagination from "../../../Utils/Pagination/Pagination";
import payrollRange from "../../../Utils/PayrollRange/PayrollRange.js";
import LeaveAdjustmentTable from "./LeaveAdjustmentTable.js";

function AttendanceReport() {
  const [attendanceStartDate, setAttendanceStartDate] = useState("");
  const [attendanceEndDate, setAttendanceEndDate] = useState("");
  const [selectedCompanyCode, setSelectedCompanyCode] = useState("");
  const [employeeAttendanceStatus, setEmployeeAttendanceStatus] =
    useState("all");
  const [attendanceCounts, setAttendanceCounts] = useState([]);
  const [showCalculationTable, setShowCalculationTable] = useState(false);

  const [reportData, setReportData] = useState([]);
  const [reportHeaders, setReportHeaders] = useState([]);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [selectedForFreeze, setSelectedForFreeze] = useState({});
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // YYYY-MM
  const [freezeFilter, setFreezeFilter] = useState("UnFreezed"); // default
  const [freezedEmployeeMap, setFreezedEmployeeMap] = useState({});
  const [freezedPayrollCounts, setFreezedPayrollCounts] = useState([]);
  const [reportView, setReportView] = useState("FORM");

  const [attpagination, setAttPagination] = useState(null);
  const [attcurrentPage, setAttCurrentPage] = useState(1);
  const [attsearchText, setAttSearchText] = useState("");

  const [usersBalance, setUsersBalance] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [userRequests, setUserRequests] = useState({});

  const [viewComponent, setViewComponent] = useState(false);
  const [updatedBalance, setUpdatedBalance] = useState([]);
  const [isCalcLoading, setIsCalcLoading] = useState(false);

  const employeeId = Cookies.get("employee_id");
  const companyCode = Cookies.get("companyCode");
  console.log("companyCode?", companyCode);

  const mockCompanies = [
    { code: 1, name: "Daksh" },
    { code: 2, name: "MIT Pvt Ltd" },
    { code: 3, name: "Daksh Global Pvt Ltd" },
    { code: 4, name: "Marche Ricche pri ltd" },
    { code: 5, name: "VNG Enterprises Pvt. Ltd" },
  ];
  useEffect(() => {
    if (selectedCompanyCode) {
      fetchPolicies(selectedCompanyCode);
    }
  }, [selectedCompanyCode]);

  async function fetchPolicies(companyCode) {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/getPerticularPolicy/${companyCode}`,
        { headers: { Authorization: localStorage.getItem("token") } },
      );
      setPolicies(res?.data?.data);
    } catch (err) {
      console.error("Error fetching policies:", err);
    }
  }

  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const updateAttendanceCount = (employeeId, field, value) => {
    setAttendanceCounts((prev) =>
      prev.map((item) =>
        item.employee_Id === employeeId
          ? { ...item, [field]: Number(value) || 0 }
          : item,
      ),
    );
  };

  const fetchFreezedEmployees = useCallback(async (page = 1, search = "") => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/payrole/get_all_payroleCounts_monthwise`,
        {
          params: {
            companyCode: selectedCompanyCode,
            month: selectedMonth,
            page: page,
            search: search,
          },
          headers: { Authorization: localStorage.getItem("token") },
        },
      );

      const data = res.data?.data || [];

      const freezedMap = {};
      data.forEach((item) => {
        freezedMap[item.employee_id] = true;
      });

      setFreezedEmployeeMap(freezedMap);
      setFreezedPayrollCounts(data);
    } catch (err) {
      console.error("Error fetching freezed employees", err);
    }
  });

  const formatTime = (isoString) => {
    if (!isoString || isoString === "-/-") {
      return "-/-";
    }
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string provided to formatTime:", isoString);
        return "-/-";
      }

      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

      return `${hours}:${formattedMinutes} ${ampm}`;
    } catch (e) {
      console.error("Error formatting time:", isoString, e);
      return "-/-";
    }
  };

  const fetchAttendanceReportData = async (page = 1, search = searchText) => {
    setIsAttendanceLoading(true);
    setAttendanceError(null);
    setAttendanceMessage("");
    setReportData([]);
    setReportHeaders([]);
    setShowTable(false);

    if (!selectedMonth || !policies || !selectedCompanyCode) {
      setShowPopup(true);
      setMessage("Please select Payroll Month and Company");
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      setIsAttendanceLoading(false);
      return;
    }
    const [year, month] = selectedMonth.split("-").map(Number);

    const { startDate, endDate } = payrollRange(
      year,
      month,
      policies.payroll_cycle.start_day,
      policies.payroll_cycle.end_day,
    );
    setAttendanceStartDate(startDate);
    setAttendanceEndDate(endDate);

    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      companyCode: selectedCompanyCode,
      page,
      limit: 20,
    }).toString();

    const apiUrl = `${process.env.REACT_APP_API_URL}/attendance/all_user_attendance?${queryParams}`;

    try {
      const response = await axios.get(apiUrl);

      const users = response?.data?.data?.users || [];

      setAttPagination(response?.data?.pagination);
      setAttCurrentPage(page);

      if (!response.data.success || users.length === 0) {
        setShowPopup(true);
        setMessage(
          response.data.message || "No data found for the selected criteria.",
        );
        setTimeout(() => setShowPopup(false), 3000);
        setReportData([]);
        setReportHeaders([]);
        return;
      }
      const allDates = getDatesInRange(startDate, endDate);

      const formatWorkingHours = (wh) => {
        const hrs = wh ? parseFloat(wh) : 0;
        if (!hrs) return "0:00";
        return `${Math.floor(hrs)}:${Math.round((hrs % 1) * 60)
          .toString()
          .padStart(2, "0")}`;
      };

      const getRequestLabelAndColor = (requests = []) => {
        if (!Array.isArray(requests) || requests.length === 0) {
          return { label: null, color: null };
        }

        const normalizeStatus = (s) => String(s || "").toLowerCase();
        const normalizeType = (t) => String(t || "").toLowerCase();

        const typePriority = [
          "leave",
          "regularise attendance",
          "regularization",
          "compoff",
        ];

        const buildLabel = (req) => {
          const type = normalizeType(req.request_type);

          if (type === "leave") {
            return req.leave_type ? String(req.leave_type) : "Leave";
          }

          if (type.includes("compoff")) {
            return req.dayValue ? `CompOff (${req.dayValue})` : "CompOff";
          }

          if (type.includes("regular")) {
            return "Regularization";
          }

          return req.request_type || "Request";
        };

        const pickBestFromList = (list) => {
          if (!list.length) return null;

          for (const t of typePriority) {
            const found = list.find(
              (r) =>
                normalizeType(r.request_type) === t ||
                normalizeType(r.request_type).includes(t),
            );
            if (found) return found;
          }

          return list[0];
        };

        const approvedList = requests.filter(
          (r) => normalizeStatus(r.status) === "approved",
        );
        const approvedPick = pickBestFromList(approvedList);

        if (approvedPick) {
          return {
            label: buildLabel(approvedPick),
            color: "green",
          };
        }

        const pendingList = requests.filter(
          (r) => normalizeStatus(r.status) === "pending",
        );
        const pendingPick = pickBestFromList(pendingList);

        if (pendingPick) {
          return {
            label: buildLabel(pendingPick),
            color: "red",
          };
        }

        const rejectedPick = pickBestFromList(requests);

        return {
          label: buildLabel(rejectedPick),
          color: "red",
        };
      };

      const transformedData = users.map((user) => {
        const row = {
          "Emp Code": user.employee_Id,
          "Employee Name": user.employee_Name || "N/A",
          Designation: user.designation || "N/A",
        };

        allDates.forEach((dateObj) => {
          const dateKey = dateObj.toISOString().split("T")[0];
          const dayData = user.days?.[dateKey] || null;

          const formattedDateHeader = dateObj
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, ".");

          let statusToDisplay = "A";
          let inTimeDisplay = "-/-";
          let outTimeDisplay = "-/-";
          let totalHoursDisplay = "0:00";

          let colorForStatus = "red";
          if (dayData) {
            const st = dayData.status;

            inTimeDisplay = formatTime(dayData.punch_in_time);
            outTimeDisplay = formatTime(dayData.punch_out_time);
            totalHoursDisplay = formatWorkingHours(dayData.working_hours);

            if (st === "Week-Off" || dayData.isWeekOff) {
              statusToDisplay = "W/O";
              colorForStatus = "blue";
            } else if (st === "Present") {
              statusToDisplay = "P";
              colorForStatus = "green";
            } else if (st === "Half Day") {
              statusToDisplay = "H/D";
              colorForStatus = "purple";
            } else if (String(st).toLowerCase().includes("missed")) {
              statusToDisplay = "Missed Punch";
              colorForStatus = "orange";
            } else if (st === "Leave") {
              const { label, color } = getRequestLabelAndColor(
                dayData.requests,
              );

              statusToDisplay = label || "Leave";

              colorForStatus = color || "blue";
            } else if (st === "Absent") {
              statusToDisplay = "A";
              colorForStatus = "red";
            } else {
              statusToDisplay = st || "A";
              colorForStatus = "black";
            }

            if (
              st !== "Present" &&
              Array.isArray(dayData.requests) &&
              dayData.requests.length > 0
            ) {
              const { label, color } = getRequestLabelAndColor(
                dayData.requests,
              );
              if (label) {
                statusToDisplay = label;
                colorForStatus = color || colorForStatus;
              }
            }
          }

          row[`${formattedDateHeader} Status`] = (
            <span style={{ color: colorForStatus }}>{statusToDisplay}</span>
          );

          row[`${formattedDateHeader} In`] = inTimeDisplay;
          row[`${formattedDateHeader} Out`] = outTimeDisplay;
          row[`${formattedDateHeader} Total Hours`] = totalHoursDisplay;
        });

        return row;
      });

      const baseHeaders = [
        { key: "Emp Code", label: "Emp Code" },
        { key: "Employee Name", label: "Employee Name" },
        { key: "Designation", label: "Designation" },
      ];

      const dynamicDateHeaders = allDates.flatMap((dateObj) => {
        const formattedDate = dateObj
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, ".");
        const dayName = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
        });

        return [
          {
            key: `${formattedDate} Status`,
            label: "Status",
            date: formattedDate,
            dayName,
            type: "status",
          },
          {
            key: `${formattedDate} In`,
            label: "In",
            date: formattedDate,
            dayName,
            type: "punchIn",
          },
          {
            key: `${formattedDate} Out`,
            label: "Out",
            date: formattedDate,
            dayName,
            type: "punchOut",
          },
          {
            key: `${formattedDate} Total Hours`,
            label: "Total Hours",
            date: formattedDate,
            dayName,
            type: "totalHours",
          },
        ];
      });

      setReportData(transformedData);
      setReportHeaders([...baseHeaders, ...dynamicDateHeaders]);

      setShowPopup(true);
      setMessage(response.data.message || "Attendance fetched successfully.");
      setTimeout(() => setShowPopup(false), 3000);
      setShowTable(true);
      setReportView("ATTENDANCE");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred.";
      setShowPopup(true);
      setMessage(`Error fetching attendance: ${errorMsg}`);
      setTimeout(() => setShowPopup(false), 3000);
      setReportData([]);
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  const handleSaveAttendanceUpdates = async (changes) => {
    const effectiveChanges = changes.filter((change) => {
      const currentRow = reportData.find(
        (row) => row["Emp Code"] === change.employeeId,
      );
      if (currentRow) {
        const currentStatusCell = currentRow[`${change.date} Status`];
        const currentStatus =
          typeof currentStatusCell === "object" &&
          currentStatusCell?.props?.children
            ? currentStatusCell.props.children
            : String(currentStatusCell);
        return currentStatus.toUpperCase() !== change.newStatus.toUpperCase();
      }
      return true;
    });

    if (effectiveChanges.length === 0) {
      setShowPopup(true);
      setMessage("No effective changes to save.");
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      return;
    }

    const apiPayload = effectiveChanges.map((change) => {
      const [day, month, year] = change.date.split(".");
      const backendDate = `${year}-${month}-${day}`;

      return {
        employeeId: change.employeeId,
        date: backendDate,
        companyCode: selectedCompanyCode,
        status: change.fullStatusName,
      };
    });

    console.log("Sending API payload for effective changes:", apiPayload);

    try {
      const updateApiUrl = `${process.env.REACT_APP_API_URL}/attendance/update_status_entry`;
      const response = await axios.patch(updateApiUrl, apiPayload);

      setShowPopup(true);
      setMessage(response.data.message || "Attendance updated successfully!");
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      await fetchAttendanceReportData();
    } catch (error) {
      setShowPopup(true);
      setMessage(
        `Failed to save attendance updates: ${
          error.response?.data?.message || error.message
        }`,
      );
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      await fetchAttendanceReportData();
    }
  };

  const handleGoBack = () => {
    if (reportView === "CALCULATION") {
      setShowCalculationTable(false);
      setReportView("ATTENDANCE");
      return;
    }

    if (reportView === "ATTENDANCE") {
      setShowTable(false);
      setShowCalculationTable(false);
      setReportView("FORM");
      return;
    }
  };
  const tableData = React.useMemo(() => {
    const normalizedCounts = attendanceCounts.map((item) => {
      const employeeKey = item.employee_Id || item.employee_id;

      return {
        ...item,
        employeeKey,
        isFreeze: Boolean(freezedEmployeeMap[employeeKey]),
      };
    });

    /* ✅ RULE 1 → SEARCH MODE */
    if (searchText.trim().length > 0) {
      return normalizedCounts; // ✅ BYPASS FREEZE FILTER
    }

    /* ✅ RULE 2 → NORMAL FILTER MODE */
    if (freezeFilter === "Freezed") {
      return freezedPayrollCounts;
    }

    if (freezeFilter === "UnFreezed") {
      return normalizedCounts.filter(
        (item) => !freezedEmployeeMap[item.employeeKey],
      );
    }

    return [
      ...normalizedCounts.filter(
        (item) => !freezedEmployeeMap[item.employeeKey],
      ),
      ...freezedPayrollCounts,
    ];
  }, [
    freezeFilter,
    attendanceCounts,
    freezedPayrollCounts,
    freezedEmployeeMap,
    searchText, // ✅ CRITICAL DEPENDENCY
  ]);

  const handelCalculation = useCallback(
    async (page = 1, search = searchText) => {
      setIsCalcLoading(true);
      await fetchFreezedEmployees(page, search);

      if (!isCalculated) {
        if (
          !attendanceStartDate ||
          !attendanceEndDate ||
          !selectedCompanyCode
        ) {
          setShowPopup(true);
          setMessage("Please select Start Date, End Date and Company");
          setTimeout(() => setShowPopup(false), 3000);
          return;
        }
      }

      const queryParams = new URLSearchParams({
        startDate: attendanceStartDate,
        endDate: attendanceEndDate,
        companyCode: selectedCompanyCode,
        page,
        limit: 20,
        search: search || "",
      }).toString();

      const url = `${process.env.REACT_APP_API_URL}/attendance/attendance-counts?${queryParams}`;

      try {
        const response = await axios.get(url);

        if (response.data.success) {
          setAttendanceCounts(response.data.data);
          setPagination(response.data.pagination);
          setCurrentPage(page);
          setShowTable(true);
          setShowCalculationTable(true);
          setReportView("CALCULATION");
          setIsCalculated(true);
        }
      } catch (error) {
        console.error("Error fetching attendance counts:", error);
      } finally {
        setIsCalcLoading(false);
      }
    },
    [attendanceStartDate, attendanceEndDate, selectedCompanyCode],
  );

  const downloadCountExcel = async () => {
    if (!attendanceStartDate || !attendanceEndDate || !selectedCompanyCode) {
      setShowPopup(true);
      setMessage("Please select Payroll Month and Company before downloading.");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    const queryParams = new URLSearchParams({
      startDate: attendanceStartDate,
      endDate: attendanceEndDate,
      companyCode: selectedCompanyCode,
      search: searchText || "",
      freezeFilter,
    }).toString();

    const downloadUrl = `${process.env.REACT_APP_API_URL}/attendance/download_attendance_counts_excel?${queryParams}`;

    try {
      const response = await axios.get(downloadUrl, {
        responseType: "blob",
      });

      if (
        response.data.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `Attendance_Count_Report_${attendanceStartDate}_to_${attendanceEndDate}.xlsx`;

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);

        setShowPopup(true);
        setMessage("Attendance count Excel downloaded successfully ✅");
        setTimeout(() => setShowPopup(false), 3000);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          let errorMsg = "Unexpected response from server";
          try {
            errorMsg = JSON.parse(reader.result)?.message || errorMsg;
          } catch {}
          setShowPopup(true);
          setMessage(errorMsg);
          setTimeout(() => setShowPopup(false), 3000);
        };
        reader.readAsText(response.data);
      }
    } catch (err) {
      console.error("Count Excel download failed:", err);

      let errorMsg = "Failed to download attendance count Excel";
      if (err.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            errorMsg = JSON.parse(reader.result)?.message || errorMsg;
          } catch {
            errorMsg = reader.result;
          }
          setShowPopup(true);
          setMessage(errorMsg);
          setTimeout(() => setShowPopup(false), 3000);
        };
        reader.readAsText(err.response.data);
      } else {
        setShowPopup(true);
        setMessage(errorMsg);
        setTimeout(() => setShowPopup(false), 3000);
      }
    }
  };

  const handleDownloadExcel = async () => {
    if (!attendanceStartDate || !attendanceEndDate || !selectedCompanyCode) {
      alert(
        "Please select a Start Date, End Date, and Company before downloading.",
      );
      return;
    }

    const queryParams = new URLSearchParams({
      startDate: attendanceStartDate,
      endDate: attendanceEndDate,
      companyCode: selectedCompanyCode,
    }).toString();

    const downloadUrl = `${process.env.REACT_APP_API_URL}/attendance/download_allusers_attendance_report?${queryParams}`;

    try {
      const response = await axios.get(downloadUrl, {
        responseType: "blob",
      });

      if (
        response.data.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Attendance_Report_${attendanceStartDate}_to_${attendanceEndDate}.xlsx`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setShowPopup(true);
        setMessage("Excel download initiated successfully.");
        setTimeout(() => setShowPopup(false), 3000);
        setAttendanceError(null);
        console.log("Excel download initiated successfully.");
      } else {
        const reader = new FileReader();
        reader.onload = function () {
          let errorMessage =
            "Received an unexpected response format from the server.";
          try {
            const parsedError = JSON.parse(reader.result);
            errorMessage = parsedError.message || errorMessage;
          } catch (e) {
            errorMessage = reader.result;
          }
          setShowPopup(true);
          setMessage(`Error downloading Excel: ${errorMessage}`);
          setTimeout(() => setShowPopup(false), 3000);
          setAttendanceMessage("");
        };
        reader.readAsText(response.data);
      }
    } catch (err) {
      console.error("Error downloading Excel:", err);
      let errorMsg =
        "An unexpected error occurred during Excel download (network or server error).";
      if (err.response) {
        if (err.response.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = function () {
            try {
              const errorData = JSON.parse(reader.result);
              errorMsg =
                errorData.message || `Server Error: ${err.response.status}`;
            } catch (e) {
              errorMsg = reader.result;
            }
            setShowPopup(true);
            setMessage(`Error downloading Excel: ${errorMsg}`);
            setTimeout(() => setShowPopup(false), 3000);
            setAttendanceMessage("");
          };
          reader.readAsText(err.response.data);
        } else {
          errorMsg =
            err.response.data?.message ||
            err.response.statusText ||
            `Server Error: ${err.response.status}`;
          setShowPopup(true);
          setMessage(`Error downloading Excel: ${errorMsg}`);
          setTimeout(() => setShowPopup(false), 3000);
          setAttendanceMessage("");
        }
      } else {
        errorMsg = err.message || errorMsg;
        setShowPopup(true);
        setMessage(`Error downloading Excel: ${errorMsg}`);
        setTimeout(() => setShowPopup(false), 3000);
        setAttendanceMessage("");
      }
    }
  };
  const handleFreezePayroll = async () => {
    const selectedEmployees = attendanceCounts.filter(
      (item) => selectedForFreeze[item.employee_Id],
    );

    if (!selectedEmployees.length) {
      setShowPopup(true);
      setMessage("Please select at least one employee to freeze payroll.");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    const invalidEmployees = selectedEmployees.filter((item) => {
      const totalPresents = Number(item.totalPresents);
      const weekOffs = Number(item.weekOffs);
      const missPunch = Number(item.missPunch);
      const totalLOP = Number(item.LOP);
      const totalDays = Number(item.totalDays);

      return totalPresents + totalLOP + weekOffs + missPunch !== totalDays;
    });

    if (invalidEmployees.length > 0) {
      const invalidIds = invalidEmployees
        .map((emp) => emp.employee_Id)
        .join(", ");

      setShowPopup(true);
      setMessage(`Payroll validation failed for Employee(s): ${invalidIds}`);
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      return;
    }

    const adjustmentMap = {};

    updatedBalance.forEach((adj) => {
      const { employeeId, leaveTypeId, days } = adj;

      if (!employeeId || !leaveTypeId) return;

      if (!adjustmentMap[employeeId]) {
        adjustmentMap[employeeId] = [];
      }

      adjustmentMap[employeeId].push({
        leaveTypeId,
        days: Number(days || 0),
      });
    });
    const employeesPayload = selectedEmployees.map((item) => ({
      employeeId: item.employee_Id,

      counts: {
        totalDays: item.totalDays,
        totalPresents: item.totalPresents,
        weekOffs: item.weekOffs,
        missPunch: item.missPunch,
        lop: item.LOP,
        payableDays: item.totalPresents + item.weekOffs,
      },

      adjustments: adjustmentMap[item.employee_Id] || [],
    }));

    const payload = {
      companyCode: Number(selectedCompanyCode),
      referenceDate: attendanceEndDate,
      freezedBy: employeeId,
      employees: employeesPayload,
    };

    console.log("🔥 FINAL FREEZE PAYLOAD:", payload);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/payrole/freeze-with-adjustments`,
        payload,
        { headers: { Authorization: localStorage.getItem("token") } },
      );

      setShowPopup(true);
      setMessage("Payroll frozen successfully ✅");
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      setSelectedForFreeze({});
      setUpdatedBalance([]);

      await handelCalculation(currentPage, searchText);
    } catch (err) {
      console.error("Freeze payroll failed:", err);

      setShowPopup(true);
      setMessage(err.response?.data?.message || "Freeze Failed");
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
  };
  const handleUnfreezePayroll = async () => {
    // Gather selected employees that are currently frozen
    const frozenToUnfreeze = tableData
      .map(normalizeRow)
      .filter((item) => selectedForFreeze[item.employeeId] && item.isFreeze)
      .map((item) => item.employeeId);

    if (!frozenToUnfreeze.length) {
      setShowPopup(true);
      setMessage(`"Please select at least one frozen employee to unfreeze."`);
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    const payload = {
      companyCode: Number(selectedCompanyCode),
      referenceDate: attendanceEndDate,
      employeeIds: frozenToUnfreeze,
    };

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/payrole/unfreeze`,
        payload,
        { headers: { Authorization: localStorage.getItem("token") } },
      );

      setShowPopup(true);
      setMessage(res.data.message || "Payroll unfrozen successfully ✅");
      setTimeout(() => setShowPopup(false), 3000);

      setSelectedForFreeze({}); // Clear selections
      await handelCalculation(currentPage, searchText); // Refresh table
    } catch (err) {
      console.error("Unfreeze failed:", err);
      setShowPopup(true);
      setMessage(err.response?.data?.message || "Unfreeze Failed");
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const handleAdjustmentComponent = async (user) => {
    console.log("user ", user);
    const empID = user.employeeId;
    setSelectedUser(user);
    setViewComponent(!viewComponent);

    const requestParam = new URLSearchParams({
      startDate: attendanceStartDate,
      endDate: attendanceEndDate,
      companyCode,
      employeeId: empID,
    });

    try {
      const balanceUrl = `${process.env.REACT_APP_API_URL}/leaves-balance/get-leaves-balance?employeeId=${empID}`;
      const balance = await axios.get(balanceUrl);

      setUsersBalance(balance?.data?.data);
      console.log("balance", balance);

      const requests = await axios.get(
        `${process.env.REACT_APP_API_URL}/request/get_requests_in_dateRange?${requestParam}`,
      );
      console.log("requests date range ", requests);

      setUserRequests(requests);
    } catch (error) {
      console.log(error);
    }
  };
  const handleBalanceUpdate = (adjustmentsArray) => {
    setUpdatedBalance((prev) => {
      const updated = [...prev];

      adjustmentsArray.forEach((adj) => {
        const index = updated.findIndex(
          (p) =>
            p.employeeId === adj.employeeId &&
            p.leaveTypeId === adj.leaveTypeId,
        );

        if (index === -1) {
          updated.push(adj);
        } else {
          updated[index].days += adj.days;
        }
      });

      return updated;
    });

    console.log("✅ UPDATED BALANCE →", adjustmentsArray);
  };

  const handleLOP = (data) => {
    console.log("datacomes after the update in counts of lop", data);
    setAttendanceCounts((prev) =>
      prev.map((item) => {
        if (item.employee_Id === data.employeeId) {
          const oldLOP = Number(item.LOP) || 0;
          const newLOP = Number(data.currentLOP) || 0;

          const diff = oldLOP - newLOP;

          return {
            ...item,
            LOP: newLOP,
            totalPresents: Number(item.totalPresents || 0) + diff,
          };
        }
        return item;
      }),
    );
  };

  const debounce = (fn, delay = 500) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };
  // 1. Create a Ref to hold the latest function
  const searchFuncRef = useRef(handelCalculation);

  // 2. Update the Ref whenever handelCalculation changes
  useEffect(() => {
    searchFuncRef.current = handelCalculation;
  }, [handelCalculation]);

  // 3. Create the stable Debounce function
  const debouncedSearch = useMemo(() => {
    const func = (value) => {
      // Always call the LATEST version via ref
      searchFuncRef.current(1, value);
    };
    return debounce(func, 500);
  }, []); // Empty dependency = Created once = Timer never breaks

  const handleSearch = (value) => {
    setSearchText(value);
    handelCalculation(1, value);
  };

  const handlePageChange = (page) => {
    handelCalculation(page, searchText);
  };
  const normalizeRow = (item) => ({
    employeeId: item.employeeKey || item.employee_Id || item.employee_id,
    totalPresents: item.totalPresents ?? 0,
    weekOffs: item.weekOffs ?? 0,
    lop: item.lop ?? item.LOP ?? 0,
    missPunch: item.missPunch ?? 0,
    totalDays: item.totalDays ?? 0,
    isFreeze: item.isFreeze === true,
  });
  console.log("selectedUser", selectedUser);
  return (
    <div className="attendance-report__wrapper">
      {!showTable ? (
        <>
          <h2 className="attendance-report__title"></h2>
          <p className="attendance-report__info-text">
            💡 Generate your attendance report by selecting a date range,
            company, and employee status.
          </p>
          <div className="attendance-report__form-section">
            {/* <div className="attendance-report__form-group">
              <label htmlFor="attendanceStartDate">* Start Date:</label>
              <input
                type="date"
                id="attendanceStartDate"
                name="attendanceStartDate"
                value={attendanceStartDate}
                onChange={(e) => setAttendanceStartDate(e.target.value)}
                className="attendance-report__input"
                required
              />
            </div> */}
            <div className="attendance-report__form-group">
              <label>* Payroll Month:</label>
              <input
                id="selectedMonth"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                required
              />
            </div>
            {/* <div className="attendance-report__form-group">
              <label htmlFor="attendanceEndDate">* End Date:</label>
              <input
                type="date"
                id="attendanceEndDate"
                name="attendanceEndDate"
                value={attendanceEndDate}
                onChange={(e) => setAttendanceEndDate(e.target.value)}
                className="attendance-report__input"
                required
              />
            </div> */}
            <div className="attendance-report__form-group">
              <label htmlFor="selectedCompanyCode">* Company Code:</label>
              <select
                id="selectedCompanyCode"
                name="selectedCompanyCode"
                value={selectedCompanyCode}
                onChange={(e) => setSelectedCompanyCode(e.target.value)}
                className="attendance-report__select"
                required
              >
                <option value="">-- Select Company --</option>
                {mockCompanies.map((company) => (
                  <option key={company.code} value={company.code}>
                    {company.name} (Code: {company.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="attendance-report__form-group">
              <label htmlFor="employeeAttendanceStatus">
                {" "}
                Employee Status:
              </label>
              <select
                id="employeeAttendanceStatus"
                name="employeeAttendanceStatus"
                value={employeeAttendanceStatus}
                onChange={(e) => setEmployeeAttendanceStatus(e.target.value)}
                className="attendance-report__select"
                required
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button
              onClick={fetchAttendanceReportData}
              disabled={isAttendanceLoading}
              className="attendance-report__view-button"
            >
              {isAttendanceLoading ? "Loading..." : "View Report"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="report-header">
            <button className="back-button" onClick={handleGoBack}>
              <IoMdArrowBack style={{ fontSize: "20px", marginRight: "5px" }} />
            </button>
            <div className="AttendanceSummary_header">
              <h3>Attendance Summary</h3>
              <h5 className="Attendance_Summary_dateRange">
                {attendanceStartDate} - {attendanceEndDate}
              </h5>
            </div>
            <div className="report_actionSetion">
              <button
                className="report-Calculation-btn"
                onClick={() => handelCalculation(1, "")}
              >
                Calculate
              </button>
            </div>
          </div>

          {reportView === "CALCULATION" ? (
            <div className="attendance-count-table-container">
              <div className="attendance-count_top_container">
                <div className="attendance-count_top_left_container">
                  <div className="attendance-count_filters">
                    <select
                      name="filter"
                      id="filter_user"
                      value={freezeFilter}
                      onChange={(e) => setFreezeFilter(e.target.value)}
                    >
                      <option value="UnFreezed">UnFreezed</option>
                      <option value="Freezed">Freezed</option>
                      <option value="All">All</option>
                    </select>

                    <div className="attendance-count_search">
                      <input
                        type="search"
                        value={searchText}
                        placeholder="Search by Employee ID or Name"
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchText(value);
                          debouncedSearch(value);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="attendance-count-btn-container">
                  <button className="global-btn" onClick={handleFreezePayroll}>
                    Freeze Payroll
                  </button>{" "}
                  <button
                    className="global-btn"
                    onClick={handleUnfreezePayroll}
                    style={{ backgroundColor: "#dc3545", color: "white" }}
                  >
                    Unfreeze
                  </button>
                </div>
              </div>

              <div className="attendance-summary-scroll">
                <table className="editable-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Presents</th>
                      <th>W/O</th>
                      <th>LOP</th>
                      <th>MissPunch</th>
                      <th>Total Days</th>
                      <th>Action</th>
                      <th className="Freeze_Checkbox">Freeze </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isCalcLoading ? (
                      <tr>
                        <td
                          colSpan="8"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          Loading... 🔄
                        </td>
                      </tr>
                    ) : tableData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          No Employees Found 🔍
                        </td>
                      </tr>
                    ) : (
                      tableData.map((raw, index) => {
                        const item = normalizeRow(raw);
                        const isFreezed = item.isFreeze;

                        return (
                          <tr key={index}>
                            <td>{item.employeeId}</td>

                            <td>
                              <input
                                type="number"
                                value={item.totalPresents}
                                disabled={isFreezed}
                                onChange={(e) =>
                                  !isFreezed &&
                                  updateAttendanceCount(
                                    item.employeeId,
                                    "totalPresents",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="number"
                                value={item.weekOffs}
                                disabled={isFreezed}
                                onChange={(e) =>
                                  !isFreezed &&
                                  updateAttendanceCount(
                                    item.employeeId,
                                    "weekOffs",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="number"
                                value={item.lop}
                                disabled={isFreezed}
                                onChange={(e) =>
                                  !isFreezed &&
                                  updateAttendanceCount(
                                    item.employeeId,
                                    "LOP",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="number"
                                value={item.missPunch}
                                disabled={isFreezed}
                                onChange={(e) =>
                                  !isFreezed &&
                                  updateAttendanceCount(
                                    item.employeeId,
                                    "missPunch",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="number"
                                value={item.totalDays}
                                disabled={isFreezed}
                                onChange={(e) =>
                                  !isFreezed &&
                                  updateAttendanceCount(
                                    item.employeeId,
                                    "totalDays",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                            <td>
                              {" "}
                              <button
                                onClick={(e) => {
                                  handleAdjustmentComponent(item);
                                }}
                              >
                                {viewComponent ? "Hide" : "Show"}
                              </button>
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                // checked={
                                //   isFreezed ||
                                //   !!selectedForFreeze[item.employeeId]
                                // }
                                checked={!!selectedForFreeze[item.employeeId]}
                                // disabled={isFreezed}
                                onChange={(e) =>
                                  setSelectedForFreeze((prev) => ({
                                    ...prev,
                                    [item.employeeId]: e.target.checked,
                                  }))
                                }
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="attendance_bottom_user_count">
                {pagination && (
                  <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    onExport={downloadCountExcel}
                    showSearch={true}
                    showExport={true}
                  />
                )}
              </div>
            </div>
          ) : reportData.length > 0 && reportHeaders.length > 0 ? (
            <AttendancePivotReport
              data={reportData}
              headers={reportHeaders}
              attpagination={attpagination}
              attcurrentPage={attcurrentPage}
              attsearchText={searchText}
              onPageChange={fetchAttendanceReportData}
              onSearch={(value) => {
                setSearchText(value);
                fetchAttendanceReportData(1, value);
              }}
              onSaveUpdates={handleSaveAttendanceUpdates}
              onExport={handleDownloadExcel}
            />
          ) : null}
        </>
      )}
      {viewComponent && (
        <div className="popup-overlay ">
          <div className="popup-content LeaveAdjustment-popup-overlay">
            <div className="popup-header editLeaveBalance_header_outer">
              <div className="editLeaveBalance_header">
                <h3>Add Employee Leave</h3>

                <button
                  className="LeaveAdjustment_close-btn"
                  onClick={() => setViewComponent(false)}
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="popup-body">
              <LeaveAdjustmentTable
                attendanceCounts={selectedUser}
                leaveBalance={usersBalance}
                userRequests={userRequests}
                onSaveUpdates={handleBalanceUpdate}
                updatedLOPCount={handleLOP}
                handleClose={(e) => setViewComponent(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showPopup && <Popup />}
    </div>
  );
}

export default AttendanceReport;
