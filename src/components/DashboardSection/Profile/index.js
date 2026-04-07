import React, { useEffect, useState } from "react";
import "../../ComponentsCss/Profile/Profile.css";
import ProfileComponent from "../ProfileComponent/ProfileComponent";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { useMode } from "../../../context/mode-context/mode-context";
import NewUserSection from "../NewUserSection/NewUserSection";

export default function Profile() {
  const [employeeData, setEmployeeData] = useState({});
  const [error, setError] = useState("");
  const { setMode ,mode} = useMode(); // Add this line

  // const { , setMode } = useMode();
  console.log("eeeeeeeeeeeeeeeeeeee", employeeData);

  useEffect(() => {
    setMode("readonly");
  }, [setMode]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/company/employee-details`,

          {
            withCredentials: true, // Ensure cookies are sent
          }
        );
        console.log("Employee Data:.................", response.data.data);
        setEmployeeData(response.data.data); // Correctly set 'data' from the API response
      } catch (err) {
        setError("Failed to fetch employee data.");
        console.error("API Error:", err);
      }
    };

    fetchEmployeeData();
  }, []);

  useEffect(() => {
    setMode("readonly"); // or "edit" if you want to allow editing
  }, [setMode]);

  const employeeDetails = employeeData?.employee_details || {};
  const personalDetails = employeeData?.personal_details || {};
  const officialDetails = employeeData?.official_details || {};

  const DOB = personalDetails?.date_of_birth;
  const age = DOB ? calculateAge(DOB) : "N/A";

  console.log("Employee Data0000000:", DOB);
  console.log("Employee Age:", age);
  function calculateAge(DOB) {
    const birthDate = new Date(DOB);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if the birthday hasn't occurred yet this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  return (
    <>
      <div className="outer-section-profile">
        <div className="profile-main-section">
          <div className="circle-img-section">
            <FaUserCircle className="profile-icon_img" />
          </div>
          <div className="user-profile-data">
            <div className="profile-user-name">
              <h3>{employeeDetails.name || "N/A"}</h3>
            </div>
            <span className="span designation-key">Designation</span>
            <span className="span  designation-value">
              {officialDetails.designation || "N/A"}
            </span>
            <span className="span phone-key">Phone Number</span>
            <span className="span phone-value">
              {employeeDetails.contact || "N/A"}
            </span>
            <span className="span email-key">Email Address</span>
            <span className="span email-value">
              {employeeDetails.email || "N/A"}
            </span>

            <span className="span department-key">Department</span>
            <span className="span department-value">
              {officialDetails.department || "N/A"}
            </span>
            <span className="span age-key">Age</span>
            <span className="span age-value">{DOB ? age : "N/A"}</span>
            <span className="span manager-key">Reporting Manager</span>
            <span className="span manager-value">
              {officialDetails.reporting_manager || "N/A"}
            </span>
          </div>
        </div>

        <div className="user-data-sections">
          {/* <ProfileComponent mode={mode} employeeData={employeeData} /> */}
          <NewUserSection mode={mode} employeeData={employeeData} />
        </div>
      </div>
    </>
  );
}
