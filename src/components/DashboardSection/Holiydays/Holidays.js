import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../ComponentsCss/HolidaysComponent/holidays.css";
import { MdDelete } from "react-icons/md";
import { Alert } from "@mui/material";
import { useNavigate, NavLink } from "react-router-dom";
import HolidayGroupForm from "./HolidayGroupForm";
import { AiOutlineClose } from "react-icons/ai";
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../../Utils/Popup/Popup";
import Button from "../../../context/GlobalButton/globalButton";

export default function Holidays() {
  const [employeeId, setEmployeeId] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [activeSection, setActiveSection] = useState("weekly");
  const [generalHolidaysList, setGeneralHolidaysList] = useState([]);
  const [weeklyHolidaysList, setWeeklyHolidaysList] = useState([]);
  const [selectedGroupLeaves, setSelectedGroupLeaves] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [openGroup, setOpenGroup] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const navigate = useNavigate();
  const [individualHolidays, setIndividualHolidays] = useState([]); // State to store table rows
  const [isDaysVisible, setIsDaysVisible] = useState(false);
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const [formData, setFormData] = useState({
    company_code: "",
    leaveYear: {
      startDate: getYearStartDate(),
      endDate: getYearEndDate(),
    },
    isOptionalHoliday: false,
    holiday_date: "",
    holiday_name: "",
    leaveType: "general",
  });

  // const [WeekOffData, setWeekOffData] = useState({
  //   company_code: "",
  //   weekDay_name: "",
  //   leaveYear: {
  //     startDate: getYearStartDate(),
  //     endDate: getYearEndDate(),
  //   },
  //   weekDays: [],
  //   weekNumbers: [],
  //   leaveType: "weekly",
  // });

  const [WeekOffData, setWeekOffData] = useState({
    company_code: "",
    weekDay_name: "",
    leaveYear: {
      startDate: getYearStartDate(),
      endDate: getYearEndDate(),
    },

    // ✅ OLD (keep it so nothing breaks)
    weekDays: [],
    weekNumbers: [],

    // ✅ NEW (for table structure)
    weeklyTable: {},
    // example:
    // {
    //   Sunday: [1,2,3],
    //   Saturday: [2,4]
    // }

    leaveType: "weekly",
  });

  const [newGroupData, setNewGroupData] = useState({
    groupName: "",
    description: "",
    leaveYear: {
      startDate: getYearStartDate(),
      endDate: getYearEndDate(),
    },
    leaveType: "general",
  });
  console.log("weekof data", WeekOffData);

  const getInitialWeekOffData = () => ({
    company_code: "",
    leaveYear: {
      startDate: getYearStartDate(),
      endDate: getYearEndDate(),
    },
    weekDays: [],
    weekNumbers: [],
    leaveType: "weekly",
  });

  function daysWeeksShow() {
    setIsDaysVisible(true);
  }

  function closePopup() {
    setIsDaysVisible(false);
  }
  // Function to get the start date of the current year
  function getYearStartDate() {
    const now = new Date();
    const year = now.getFullYear();
    return `${year}-01-01`;
  }

  // Function to get the end date of the current year
  function getYearEndDate() {
    const now = new Date();
    const year = now.getFullYear();
    return `${year}-12-31`;
  }

  console.log("formData>>>", formData);

  // Function to retrieve company code and employee ID from cookies
  const getCompanyCodeAndEmployeeIdFromCookies = () => {
    const cookies = Object.fromEntries(
      document.cookie.split("; ").map((cookie) => cookie.split("="))
    );
    const companyCode = cookies["companyCode"] || null;
    setCompanyCode(companyCode);
    const employeeId = cookies["employee_id"] || null;
    setEmployeeId(employeeId);
    return { companyCode, employeeId };
  };

  // Set company_code when component mounts
  useEffect(() => {
    fetchAllGroupGeneralHolidays();
    fetchAllWeeklyHolidays();

    // Get as a number
    if (companyCode) {
      setFormData((prevData) => ({
        ...prevData,
        company_code: companyCode,
      }));
      setWeekOffData((prevData) => ({
        ...prevData,
        company_code: companyCode,
      }));
    }
  }, []);

  function inputData(event) {
    const { name, value, type, checked } = event.target;

    console.log(event.target, "event.target");
    console.log(name, "name");
    console.log(value, "value");

    setFormData((prevData) => {
      if (name === "startDate" || name === "endDate") {
        return {
          ...prevData,
          leaveYear: {
            ...prevData.leaveYear,
            [name]: value,
          },
        };
      }

      return {
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  }
  useEffect(() => {
    // Update formData when selectedRule changes (for initial edit values)
    if (selectedRule) {
      setFormData({
        company_code: selectedRule.company_code || "",
        leaveYear: {
          startDate: selectedRule.leaveYear?.startDate?.split("T")[0] || "",
          endDate: selectedRule.leaveYear?.endDate?.split("T")[0] || "",
          _id: selectedRule.leaveYear?._id || "",
        },
        isOptionalHoliday: false, // Reset or set based on selectedRule if needed
        holiday_date: "", // Reset or set based on selectedRule if needed
        holiday_name: "", // Reset or set based on selectedRule if needed
        leaveType: selectedRule.leaveType || "",
      });
      setNewGroupData({
        groupName: selectedRule.groupName || "",
        description: selectedRule.description || "",
        leaveYear: selectedRule.leaveYear || {},
        leaveType: selectedRule.leaveType || "",
      });
      setIndividualHolidays(
        selectedRule.leaves.map((leave) => ({
          holiday_date: leave.holiday_date
            ? leave.holiday_date.split("T")[0]
            : "",
          holiday_name: leave.holiday_name,
          isOptionalHoliday: leave.isOptionalHoliday,
        })) || []
      );
    }
  }, [selectedRule]);
  async function fetchAllGroupGeneralHolidays() {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/general-holidays/get-holiday-groups`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("General Holidays Data:", response.data);
      setGeneralHolidaysList(response.data);
    } catch (error) {
      console.error("Error fetching general holidays:", error);
      setShowPopup(true);
      setMessage("Failed to fetch general holidays.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Failed to fetch general holidays.");
    }
  }

  console.log("generalHolidaysList", generalHolidaysList);

  // const weeklyInputData = (event) => {
  //   const { name, value, checked } = event.target;
  //   console.log("nameeee", name);
  //   console.log("valueeeee", value);

  //   setWeekOffData((prevData) => {
  //     if (name === "weekDays") {
  //       if (checked) {
  //         return {
  //           ...prevData,
  //           weekDays: [...prevData.weekDays, value],
  //         };
  //       } else {
  //         return {
  //           ...prevData,
  //           weekDays: prevData.weekDays.filter((day) => day !== value),
  //         };
  //       }
  //     } else if (name === "weekNumbers") {
  //       if (checked) {
  //         return {
  //           ...prevData,
  //           weekNumbers: [...prevData.weekNumbers, parseInt(value)],
  //         };
  //       } else {
  //         return {
  //           ...prevData,
  //           weekNumbers: prevData.weekNumbers.filter(
  //             (num) => num !== parseInt(value)
  //           ),
  //         };
  //       }
  //     } else if (name === "startDate" || name === "endDate") {
  //       return {
  //         ...prevData,
  //         leaveYear: {
  //           ...prevData.leaveYear,
  //           [name]: value,
  //         },
  //       };
  //     } else if (name === "weekDay_name") {
  //       return {
  //         ...prevData,
  //         [name]: value,
  //       };
  //     }
  //     return prevData;
  //   });
  // };
  const weeklyInputData = (event) => {
    const { name, value, checked, id } = event.target;

    setWeekOffData((prevData) => {
      // ✅ TABLE CHECKBOXES (weekDays in table)
      if (name === "weekDays" && id?.includes("_w")) {
        const weekNumber = Number(id.split("_w")[1]); // extract 1..5
        const dayName = value; // Sunday/Monday...

        const existingWeeks = prevData.weeklyTable?.[dayName] || [];

        let updatedWeeks = [];
        if (checked) {
          updatedWeeks = [...new Set([...existingWeeks, weekNumber])];
        } else {
          updatedWeeks = existingWeeks.filter((w) => w !== weekNumber);
        }

        const updatedTable = {
          ...(prevData.weeklyTable || {}),
          [dayName]: updatedWeeks,
        };

        // clean empty arrays
        if (updatedTable[dayName].length === 0) {
          delete updatedTable[dayName];
        }

        return {
          ...prevData,
          weeklyTable: updatedTable,
        };
      }

      // ✅ OLD Week numbers section (keep)
      if (name === "weekNumbers") {
        const numVal = parseInt(value);

        if (checked) {
          return {
            ...prevData,
            weekNumbers: [...prevData.weekNumbers, numVal],
          };
        }

        return {
          ...prevData,
          weekNumbers: prevData.weekNumbers.filter((n) => n !== numVal),
        };
      }

      // ✅ Leave Year fields
      if (name === "startDate" || name === "endDate") {
        return {
          ...prevData,
          leaveYear: {
            ...prevData.leaveYear,
            [name]: value,
          },
        };
      }

      // ✅ Week Day Name
      if (name === "weekDay_name") {
        return {
          ...prevData,
          [name]: value,
        };
      }

      return prevData;
    });
  };

  // async function weelklySendData(e) {
  //   e.preventDefault();
  //   setWeekOffData(getInitialWeekOffData());
  //   console.log("Final Selected Data:", WeekOffData);

  //   const { companyCode, employeeId } =
  //     getCompanyCodeAndEmployeeIdFromCookies();

  //   if (!companyCode || !employeeId) {
  //     setShowPopup(true);
  //     setMessage("Missing company code or employee ID. Please try again.");
  //     setTimeout(() => setShowPopup(false), 3000);
  //     //alert("Missing company code or employee ID. Please try again.");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_API_URL}/weekly-holidays/add-rule`,
  //       WeekOffData,
  //       {
  //         withCredentials: true, // keep if your API needs cookie-based sessions
  //         headers: {
  //           "Content-Type": "application/json",
  //           companyCode,
  //           employeeId,
  //         },
  //       }
  //     );
  //     console.log("Response from API:", response.data);
  //     setIsDaysVisible(false);
  //     fetchAllWeeklyHolidays();
  //   } catch (error) {
  //     console.log("eeeee", error);

  //     const errorMessage =
  //       error.response?.data?.message || "Failed to add WEEK off.";
  //     setShowPopup(true);
  //     setMessage(errorMessage);
  //     setTimeout(() => setShowPopup(false), 3000);
  //     //alert(errorMessage);
  //     console.error("API error:", error.response || error.message);
  //   }
  // }
  async function weelklySendData(e) {
    e.preventDefault();

    const { companyCode, employeeId } =
      getCompanyCodeAndEmployeeIdFromCookies();

    if (!companyCode || !employeeId) {
      setShowPopup(true);
      setMessage("Missing company code or employee ID. Please try again.");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    // ✅ Convert weeklyTable -> effectiveRules
    const effectiveRules = Object.entries(WeekOffData.weeklyTable || {}).map(
      ([day, weekNumbers]) => ({
        day,
        weekNumbers,
        offType: "Full Day",
      })
    );

    const payload = {
      companyCode: String(companyCode),
      ruleName: WeekOffData.weekDay_name, // mapping UI "Week Day Name" -> schema "ruleName"
      validFrom: WeekOffData.leaveYear.startDate,
      validTo: WeekOffData.leaveYear.endDate,
      effectiveRules,
      isActive: true,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/weekly-holidays/add-rule`,
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            companyCode,
            employeeId,
          },
        }
      );

      console.log("Response from API:", response.data);

      setIsDaysVisible(false);
      fetchAllWeeklyHolidays();

      // ✅ reset
      setWeekOffData({
        company_code: "",
        weekDay_name: "",
        leaveYear: {
          startDate: getYearStartDate(),
          endDate: getYearEndDate(),
        },
        weekDays: [],
        weekNumbers: [],
        weeklyTable: {},
        leaveType: "weekly",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add WEEK off.";

      setShowPopup(true);
      setMessage(errorMessage);
      setTimeout(() => setShowPopup(false), 3000);

      console.error("API error:", error.response || error.message);
    }
  }

  async function fetchAllWeeklyHolidays() {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/weekly-holidays/get-rules`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Weekly Holidays Data:", response.data);
      setWeeklyHolidaysList(response.data);
    } catch (error) {
      console.error("Error fetching weekly holidays:", error);
      setShowPopup(true);
      setMessage("Failed to fetch weekly holidays.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Failed to fetch weekly holidays.");
    }
  }
  console.log("weeklyHolidaysList ====", weeklyHolidaysList);

  async function WeekOffDelete(holidayId) {
    console.log("holidayId", holidayId);

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/weekly-holidays/delete-rule/${holidayId}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Delete Response:", response.data);
      setShowPopup(true);
      setMessage("Holiday deleted successfully!");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Holiday deleted successfully!");
      fetchAllWeeklyHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      setShowPopup(true);
      setMessage("Failed to delete holiday.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Failed to delete holiday.");
    }
  }
  // Function to format the date
  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const handleOptionChange = (option) => {
    // Navigate based on selected option
    if (option === "general") {
      console.log("general");

      navigate("/dashboard/Holidays/general-import");
    } else if (option === "weekly") {
      console.log("weekly");

      navigate("/dashboard/Holidays/weekly-import");
    }
  };
  const deleteGroupHolidays = async (holidayId) => {
    console.log("holidayId", holidayId);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/general-holidays/holiday-groups/${holidayId}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Delete Response:", response.data);
      setShowPopup(true);
      setMessage("Holiday group deleted successfully!");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Holiday group deleted successfully!");
      fetchAllGroupGeneralHolidays();
    } catch (error) {
      console.error("Error deleting holiday group:", error);
      setShowPopup(true);
      setMessage("Failed to delete holiday group.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Failed to delete holiday group.");
    }
  };
  const handleUpdateHolidays = async (e) => {
    e.preventDefault();
    const updatedHolidayGroup = {
      company_code: 1, // Adjust as needed
      groupName: newGroupData.groupName,
      description: newGroupData.description,
      leaves: individualHolidays.map((holiday) => ({
        isOptionalHoliday: holiday.isOptionalHoliday,
        holiday_date: holiday.holiday_date + "T00:00:00.000Z", // Format as ISO string
        holiday_name: holiday.holiday_name,
      })),
      leaveYear: {
        startDate: getYearStartDate(), // Ensure ISO format
        endDate: getYearEndDate(), // Ensure ISO format
      },
      leaveType: "general",
    };
    console.log("Data to send:", updatedHolidayGroup);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/general-holidays/edit-holiday-group/${selectedRule._id}`,
        updatedHolidayGroup,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Response:", response.data);
      setShowPopup(true);
      setMessage("Holiday rule updated successfully!");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Holiday rule updated successfully!");
      // Optionally reset state
      setNewGroupData({ groupName: "", description: "" });
      setIndividualHolidays([]); // Reset individual holidays
      fetchAllGroupGeneralHolidays(); // Fetch updated list
      setActiveSection("general"); // Navigate back to general holidays
    } catch (error) {
      console.error("Error updating holiday rule:", error);
      setShowPopup(true);
      setMessage("Failed to update holiday rule.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Failed to update holiday rule.");
    }
  };

  const handleSaveHolidays = async (e) => {
    e.preventDefault();
    const newHolidayGroup = {
      company_code: 1, // Adjust as needed
      groupName: newGroupData.groupName,
      description: newGroupData.description,
      leaves: individualHolidays.map((holiday) => ({
        isOptionalHoliday: holiday.isOptionalHoliday,
        holiday_date: holiday.holiday_date + "T00:00:00.000Z", // Format as ISO string
        holiday_name: holiday.holiday_name,
      })),
      leaveYear: {
        startDate: getYearStartDate(), // Ensure ISO format
        endDate: getYearEndDate(), // Ensure ISO format
      },
      leaveType: "general",
    };

    console.log("Data to send:", newHolidayGroup);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/general-holidays/add-holiday-group`,
        newHolidayGroup,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Response:", response.data);
      setShowPopup(true);
      setMessage("Holiday rule saved successfully!");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Holiday rule saved successfully!");
      // Optionally reset state
      setNewGroupData({ groupName: "", description: "" });
      setIndividualHolidays([]);
      fetchAllGroupGeneralHolidays();
      setActiveSection("general");
    } catch (error) {
      console.error("Error saving holiday rule:", error);
      setShowPopup(true);
      setMessage("Failed to save holiday rule.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Failed to save holiday rule.");
    }
  };
  // const handleAddRuleToTable = (e) => {
  //   if (formData.holiday_date && formData.holiday_name) {
  //     setIndividualHolidays((prevHolidays) => [
  //       ...prevHolidays,
  //       {
  //         holiday_date: formData.holiday_date,
  //         holiday_name: formData.holiday_name,
  //         isOptionalHoliday: formData.isOptionalHoliday,
  //       },
  //     ]);
  //     // Clear the holiday input fields
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       holiday_date: "",
  //       holiday_name: "",
  //       isOptionalHoliday: false,
  //     }));
  //   } else {
  //     alert("Please fill in Date and Holiday Name");
  //   }
  // };

  const handleAddRuleToTable = (newHoliday) => {
    if (newHoliday.holiday_date && newHoliday.holiday_name) {
      setIndividualHolidays((prevHolidays) => [
        ...prevHolidays,
        {
          holiday_date: newHoliday.holiday_date,
          holiday_name: newHoliday.holiday_name,
          isOptionalHoliday: newHoliday.isOptionalHoliday === "true",
        },
      ]);
    } else {
      setShowPopup(true);
      setMessage("Please fill in Date and Holiday Name");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Please fill in Date and Holiday Name");
    }
  };

  const handleDeleteHoliday = (index) => {
    setIndividualHolidays((prevHolidays) =>
      prevHolidays.filter((_, i) => i !== index)
    );
  };

  const handleNewGroupInputChange = (e) => {
    const { name, value } = e.target;
    console.log("name", name);
    console.log("value", value);
    console.log("newGroupData", newGroupData);

    setNewGroupData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  return (
    <>
      <div className="holidaiy-outer-section">
        <div className="weekly-general-button-section">
          {/* <button onClick={() => setActiveSection("weekly")}>
            Weekly Holidays
          </button>
          <button onClick={() => setActiveSection("general")}>
            General Holidays
          </button> */}

          <button
            className={
              [
                "weekly",
                "add_new_weekly",
                "edit_weekly",
                "view_weekly",
              ].includes(activeSection)
                ? "active-button"
                : ""
            }
            onClick={() => setActiveSection("weekly")}
          >
            Weekly Holidays
          </button>
          <button
            className={
              [
                "general",
                "add_new_general",
                "edit_general",
                "view_general",
              ].includes(activeSection)
                ? "active-button"
                : ""
            }
            onClick={() => setActiveSection("general")}
          >
            General Holidays
          </button>
        </div>
        {activeSection === "weekly" && (
          <form onSubmit={weelklySendData}>
            <div className="select-day-section">
              {isDaysVisible === true && (
                <div className="popup-overlay">
                  <div className="days-weeks-popup-section">
                    <span className="crossIconOfHolidays" onClick={closePopup}>
                      <AiOutlineClose onClick={closePopup} />
                    </span>

                    <div className="leave-year-section">
                      <div className="input-button">
                        <label>Leave Year*</label>
                        <input
                          name="startDate"
                          type="text"
                          placeholder="start date"
                          value={WeekOffData.leaveYear.startDate}
                          onChange={weeklyInputData}
                          onFocus={(e) => (e.target.type = "date")}
                          onBlur={(e) => (e.target.type = "text")}
                        />
                        <input
                          name="endDate"
                          type="text"
                          placeholder="end date"
                          value={WeekOffData.leaveYear.endDate}
                          onChange={weeklyInputData}
                          onFocus={(e) => (e.target.type = "date")}
                          onBlur={(e) => (e.target.type = "text")}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="input-button">
                        <label>Week Day Name*</label>
                        <input
                          type="text"
                          name="weekDay_name"
                          placeholder="week day name"
                          value={WeekOffData.weekDay_name}
                          onChange={weeklyInputData}
                        />
                      </div>
                    </div>
                    <div className="week-days-sections">
                      {/* Table UI like screenshot */}
                      <div className="weekoff-table-wrapper">
                        {/* <label className="weekoff-table-title">
                          Select Weekly Off*
                        </label> */}

                        <table className="weekoff-table">
                          <thead>
                            {/* Header Row 1 */}
                            <tr>
                              <th rowSpan="2">Days</th>
                              <th colSpan="5">Weeks</th>
                            </tr>

                            {/* Header Row 2 */}
                            <tr>
                              <th>1</th>
                              <th>2</th>
                              <th>3</th>
                              <th>4</th>
                              <th>5</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { short: "Sun", day: "Sunday", id: "week1" },
                              { short: "Mon", day: "Monday", id: "week2" },
                              { short: "Tue", day: "Tuesday", id: "week3" },
                              { short: "Wed", day: "Wednesday", id: "week4" },
                              { short: "Thu", day: "Thursday", id: "week5" },
                              { short: "Fri", day: "Friday", id: "week6" },
                              { short: "Sat", day: "Saturday", id: "week7" },
                            ].map((d, rowIndex) => (
                              <tr key={d.day}>
                                {/* Days column */}
                                <td className="weekoff-day-cell">{d.short}</td>

                                {/* Week 1-5 checkbox columns */}
                                {[1, 2, 3, 4, 5].map((week) => (
                                  <td key={week} className="weekoff-check-cell">
                                    {/* <input
                                      name="weekDays"
                                      type="checkbox"
                                      id={`${d.id}_w${week}`}
                                      value={d.day}
                                      onChange={weeklyInputData}
                                    /> */}

                                    <input
                                      name="weekDays"
                                      type="checkbox"
                                      id={`${d.id}_w${week}`}
                                      value={d.day}
                                      onChange={weeklyInputData}
                                      checked={
                                        WeekOffData.weeklyTable?.[
                                          d.day
                                        ]?.includes(week) || false
                                      }
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  
                    <div className="save-button">
                      <Button text="Save" type="submit"></Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="add-weeks-button">
                <Button
                  text="Import Holidays"
                  className="import_btn"
                  onClick={() => handleOptionChange("weekly")}
                ></Button>

                <Button
                  text="Add"
                  className="day-week-show-button"
                  onClick={daysWeeksShow}
                ></Button>
              </div>
              <div className="table-user-details">
                <table className="table-weeek-days">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>DAY</th>
                      <th>WEEK</th>
                      <th>DELETE</th>
                    </tr>
                  </thead>

                  {weeklyHolidaysList.map((holiday) => {
                    // const formattedDate = formatDate(holiday.holiday_date);

                    return (
                      <tbody key={holiday._id}>
                        <tr>
                          <td>{holiday.ruleName}</td>
                          {/* <td>{holiday.weekDays.join(" ,  ")}</td>
                          <td>{holiday.weekNumbers.join(" ,  ")} </td> */}

                          <td>
                            {holiday.effectiveRules
                              ?.map((r) => r.day)
                              .join(", ")}
                          </td>

                          <td>
                            {holiday.effectiveRules
                              ?.map(
                                (r) => `${r.day}: [${r.weekNumbers.join(", ")}]`
                              )
                              .join(" | ")}
                          </td>
                          <td className="delete-icon">
                            <MdDelete
                              onClick={() => WeekOffDelete(holiday._id)}
                            />
                          </td>
                        </tr>
                      </tbody>
                    );
                  })}
                </table>
              </div>
            </div>
          </form>
        )}
        {activeSection === "general" && (
          <form>
            <div className="select-day-section">
              <div className="AddGroup-section">
                <Button
                  text="Add Rule"
                  className="addGgroup-btn "
                  onClick={() => setActiveSection("add_new_general")}
                  type="button"
                ></Button>
                <Button
                  text="Export Holiday"
                  className="import-button"
                  onClick={() => handleOptionChange("general")}
                ></Button>
              </div>

              <div className="table-user-details">
                <table className="table-weeek-days">
                  <thead>
                    <tr>
                      <th>Rule Name</th>
                      <th>Description</th>
                      <th>Leaves Count</th>
                      <th>TYPE</th>
                      <th></th>
                    </tr>
                  </thead>
                  {generalHolidaysList.map((holiday) => {
                    const leaveLength = holiday.leaves.length;
                    return (
                      <tbody key={holiday.holiday_id}>
                        <tr>
                          <td>{holiday.groupName} </td>
                          <td>{holiday.description}</td>
                          <td>{leaveLength}</td>
                          <td>General</td>
                          <td className="delete-icon">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRule(holiday);
                                setFormData({
                                  company_code: holiday.company_code,
                                  leaveYear: holiday.leaveYear,
                                  isOptionalHoliday: false,
                                  holiday_date: "",
                                  holiday_name: "",
                                  leaveType: holiday.leaveType,
                                });
                                setNewGroupData({
                                  groupName: holiday.groupName,
                                  description: holiday.description,
                                  leaveYear: holiday.leaveYear,
                                  leaveType: holiday.leaveType,
                                });
                                setIndividualHolidays(
                                  holiday.leaves.map((leave) => ({
                                    holiday_date: leave.holiday_date
                                      ? leave.holiday_date.split("T")[0]
                                      : "",
                                    holiday_name: leave.holiday_name,
                                    isOptionalHoliday: leave.isOptionalHoliday,
                                  })) || []
                                );
                                setActiveSection("view_general");
                              }}
                            >
                              View{"/"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRule(holiday);
                                setFormData({
                                  company_code: holiday.company_code,
                                  leaveYear: holiday.leaveYear,
                                  isOptionalHoliday: false,
                                  holiday_date: "",
                                  holiday_name: "",
                                  leaveType: holiday.leaveType,
                                });
                                setNewGroupData({
                                  groupName: holiday.groupName,
                                  description: holiday.description,
                                  leaveYear: holiday.leaveYear,
                                  leaveType: holiday.leaveType,
                                });
                                setIndividualHolidays(
                                  holiday.leaves.map((leave) => ({
                                    holiday_date: leave.holiday_date
                                      ? leave.holiday_date.split("T")[0]
                                      : "",
                                    holiday_name: leave.holiday_name,
                                    isOptionalHoliday: leave.isOptionalHoliday,
                                  })) || []
                                );
                                setActiveSection("edit_general");
                              }}
                            >
                              Edit
                            </button>
                            {" / "}
                            <button
                              type="button"
                              onClick={() => {
                                console.log("holiday._id", holiday._id);

                                deleteGroupHolidays(holiday._id);
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    );
                  })}
                </table>
              </div>
            </div>
          </form>
        )}
        {activeSection === "add_new_general" && (
          <HolidayGroupForm
            mode="add"
            formData={formData}
            newGroupData={newGroupData}
            individualHolidays={individualHolidays}
            handleChange={inputData}
            handleGroupChange={handleNewGroupInputChange}
            handleAddRuleToTable={handleAddRuleToTable}
            onSubmit={handleSaveHolidays}
            setActiveSection={setActiveSection}
          />
        )}
        {activeSection === "edit_general" && selectedRule && (
          <HolidayGroupForm
            mode="edit"
            formData={formData}
            newGroupData={newGroupData}
            individualHolidays={individualHolidays}
            handleDeleteHoliday={handleDeleteHoliday}
            // individualHolidays={
            //   selectedRule.leaves.map((leave) => ({
            //     holiday_date: leave.holiday_date
            //       ? leave.holiday_date.split("T")[0]
            //       : "",
            //     holiday_name: leave.holiday_name,
            //     isOptionalHoliday: leave.isOptionalHoliday,
            //   })) || []
            // }
            handleChange={inputData}
            handleGroupChange={handleNewGroupInputChange}
            handleAddRuleToTable={handleAddRuleToTable}
            onSubmit={handleUpdateHolidays}
            setActiveSection={setActiveSection}
          />
        )}

        {/* {activeSection === "edit_general" && selectedRule && (
          <HolidayGroupForm
            mode="edit"
            formData={{
              company_code: selectedRule.company_code,
              leaveYear: {
                startDate: selectedRule.leaveYear?.startDate
                  ? selectedRule.leaveYear.startDate.split("T")[0]
                  : "",
                endDate: selectedRule.leaveYear?.endDate
                  ? selectedRule.leaveYear.endDate.split("T")[0]
                  : "",
              },
              isOptionalHoliday: false,
              holiday_date: "",
              holiday_name: "",
              leaveType: selectedRule.leaveType,
            }}
            newGroupData={{
              groupName: selectedRule.groupName,
              description: selectedRule.description,
              leaveYear: selectedRule.leaveYear,
              leaveType: selectedRule.leaveType,
            }}
            individualHolidays={
              selectedRule.leaves.map((leave) => ({
                holiday_date: leave.holiday_date
                  ? leave.holiday_date.split("T")[0]
                  : "",
                holiday_name: leave.holiday_name,
                isOptionalHoliday: leave.isOptionalHoliday,
              })) || []
            }
            handleChange={inputData}
            handleGroupChange={handleNewGroupInputChange}
            handleAddRuleToTable={handleAddRuleToTable}
            // onSubmit={handleUpdateHolidays}
          />
        )} */}

        {activeSection === "view_general" && selectedRule && (
          <HolidayGroupForm
            mode="view"
            formData={{
              company_code: selectedRule.company_code,
              // leaveYear: selectedRule.leaveYear,
              leaveYear: {
                startDate: selectedRule.leaveYear?.startDate
                  ? selectedRule.leaveYear.startDate.split("T")[0]
                  : "",
                endDate: selectedRule.leaveYear?.endDate
                  ? selectedRule.leaveYear.endDate.split("T")[0]
                  : "",
              },
              isOptionalHoliday: false,
              holiday_date: "",
              holiday_name: "",
              leaveType: selectedRule.leaveType,
            }}
            newGroupData={{
              groupName: selectedRule.groupName,
              description: selectedRule.description,
              leaveYear: selectedRule.leaveYear,
              leaveType: selectedRule.leaveType,
            }}
            individualHolidays={
              selectedRule.leaves.map((leave) => ({
                holiday_date: leave.holiday_date
                  ? leave.holiday_date.split("T")[0]
                  : "",
                holiday_name: leave.holiday_name,
                isOptionalHoliday: leave.isOptionalHoliday,
              })) || []
            }
            handleChange={() => {}}
            handleGroupChange={() => {}}
            handleAddRuleToTable={() => {}}
            readOnly={true}
            onSubmit={() => {}}
            setActiveSection={setActiveSection}
          />
        )}

        {/* {activeSection === "general" && (
          <form>
            <div className="select-day-section">
              <div className="AddGroup-section">
                <button
                  className="addGgroup-btn "
                  onClick={() => setActiveSection("add_new_general")}
                  type="button"
                >
                  Add Rule
                </button>
              </div>

              <div className="table-user-details">
                <table className="table-weeek-days">
                  <thead>
                    <tr>
                      <th>Rule Name</th>
                      <th>Description</th>
                      <th>Leaves Count</th>
                      <th>TYPE</th>
                      <th></th>
                    </tr>
                  </thead>
                  {generalHolidaysList.map((holiday) => {
                    const leaveLength = holiday.leaves.length;
                    return (
                      <tbody key={holiday.holiday_id}>
                        <tr>
                          <td>{holiday.groupName} </td>
                          <td>{holiday.description}</td>
                          <td>{leaveLength}</td>
                          <td className="delete-icon">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRule(holiday);
                                console.log(
                                  "selected rule",
                                  selectedRule,
                                  "view "
                                );

                                setActiveSection("view_general");
                              }}
                            >
                              View
                            </button>
                            {" / "}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRule(holiday);
                                console.log(
                                  "selected rule",
                                  selectedRule,
                                  "edit "
                                );

                                setActiveSection("edit_general");
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    );
                  })}
                </table>
              </div>
            </div>
          </form>
        )} */}
        {/* {activeSection === "add_new_general" && (
          <HolidayGroupForm
            mode="add"
            formData={formData}
            newGroupData={newGroupData}
            individualHolidays={individualHolidays}
            handleChange={inputData}
            handleGroupChange={handleNewGroupInputChange}
            handleAddRuleToTable={handleAddRuleToTable}
            onSubmit={handleSaveHolidays}
          />
        )}
        {activeSection === "edit_general" && (
          <HolidayGroupForm
            mode="edit"
            formData={formData}
            newGroupData={newGroupData}
            individualHolidays={individualHolidays}
            handleChange={inputData}
            handleGroupChange={handleNewGroupInputChange}
            handleAddRuleToTable={handleAddRuleToTable}
            // onSubmit={handleUpdateHolidays}
          />
        )}
        {activeSection === "view_general" && (
          <HolidayGroupForm
            mode="view"
            formData={formData}
            newGroupData={newGroupData}
            individualHolidays={individualHolidays}
            handleChange={() => {}} // disabled
            handleGroupChange={() => {}} // disabled
            handleAddRuleToTable={() => {}} // disabled
            readOnly={true}
            onSubmit={() => {}} // no submit
          />
        )} */}
      </div>
      {showPopup && <Popup />}
    </>
  );
}
