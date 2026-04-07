import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DisplayDetailsOfUser from "./DisplayDetailsOfUser";
import axios from "axios";
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../../Utils/Popup/Popup";

function EditUserDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const employee = state?.employee;
  const [sectionValidity, setSectionValidity] = useState({});
  const [sectionValidityArray, setSectionValidityArray] = useState({});
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const initialEmployeeData = {
    employee_type: employee?.employee_type,
    group_id: employee?.group_id,
    email: employee?.employee_details?.email,
    password: "",
    employee_id: employee?.employee_id,

    name: employee?.employee_details?.name,
    gender: employee?.employee_details?.gender,
    contact: employee?.employee_details?.contact,

    pan: employee?.personal_details?.pan,
    personal_email: employee?.personal_details?.personal_email,
    date_of_birth: employee?.personal_details?.date_of_birth,
    joining_date: employee?.personal_details?.joining_date,
    tem_state: employee?.temporary_address?.state,
    tem_city: employee?.temporary_address?.city,
    tem_pin_code: employee?.temporary_address?.pin_code,

    per_state: employee?.permanent_address?.state,
    per_city: employee?.permanent_address?.city,
    per_pin_code: employee?.permanent_address?.pin_code,

    marital_status: employee?.other_details?.marital_status,
    passport: employee?.other_details?.passport,
    father_name: employee?.other_details?.father_name,
    mother_name: employee?.other_details?.mother_name,
    blood_group: employee?.other_details?.blood_group,

    role: employee?.official_details?.role,
    designation: employee?.official_details?.designation,
    department: employee?.official_details?.department,
    reporting_manager: employee?.official_details?.reporting_manager,
    employee_status: employee?.official_details?.employee_status,
    job_roles: employee?.job_roles || [],
    // weekly_off: employee?.weekly_off || [],
    // joining_date: employee?.joining_date,

    created_at: employee?.created_at,
    _id: employee?._id,
  };

  const [data, setData] = useState(initialEmployeeData);
  const [currentSection, setCurrentSection] = useState(0);
  const [checkedSections, setCheckedSections] = useState([0]);
  console.log("data.joining_date", data.joining_date);

  const updateSectionValidity = (index, isValid) => {
    setSectionValidity((prev) => ({ ...prev, [index]: isValid }));
    setSectionValidityArray((prev) => ({ ...prev, [index]: isValid }));
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection((prev) => {
        const next = prev + 1;
        setCheckedSections((prevChecked) =>
          prevChecked.includes(next) ? prevChecked : [...prevChecked, next]
        );
        return next;
      });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCheckedSections((prev) => {
        const updated = [...prev];
        updated.pop();
        return updated;
      });
      setCurrentSection((prev) => prev - 1);
    }
  };

  useEffect(() => {
    console.log("Updated Data (after state update):", data);
  }, [data]);

  if (!employee) {
    navigate("/dashboard/users");
    return null;
  }

  const handleUpdateData = (key, value) => {
    console.log(`Updating: ${key} => ${value}`);
    setData((prevData) => {
      const updated = { ...prevData };
      if (key.startsWith("tem_") || key.startsWith("per_")) {
        updated[key] = value;
      } else {
        updated[key] = value;
      }
      return updated;
    });
  };

  const getCompanyCodeAndTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");
    const companyCode = cookies
      .find((cookie) => cookie.startsWith("companyCode="))
      ?.split("=")[1];

    return { companyCode };
  };

  const editUser = async (employee_id) => {
    try {
      const { companyCode } = getCompanyCodeAndTokenFromCookies();
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/company/${companyCode}/edit-employee/${employee_id}`,
        {
          ...data,
          joining_date: data.joining_date
            ? new Date(data.joining_date).toISOString()
            : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setMessage("Edit successful!");
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate("/dashboard/users");
        }, 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Edit request failed");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      console.error("Error updating employee data:", error);
    }
  };

  const sections = [
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          sectionIndex={currentSection}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          header="Employee Details"
          mode="edit"
          name={data?.name}
          contact={data?.contact}
          gender={data?.gender}
          email={data?.email}
          onUpdate={handleUpdateData}
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          sectionIndex={currentSection}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          header="Official Details"
          mode="edit"
          department={data?.department}
          designation={data?.designation}
          employee_status={data?.employee_status}
          role={data?.role}
          reporting_manager={data?.reporting_manager}
          employee_type={data.employee_type}
          created_at={data?.created_at}
          group_id={data?.group_id}
          onUpdate={handleUpdateData}
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          sectionIndex={currentSection}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          header="Personal Details"
          mode="edit"
          pan={data?.pan}
          personal_email={data?.personal_email}
          date_of_birth={new Date(data?.date_of_birth).toLocaleDateString(
            "en-CA"
          )}
          joining_date={new Date(data?.joining_date).toLocaleDateString(
            "en-CA"
          )}
          onUpdate={handleUpdateData}
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          sectionIndex={currentSection}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          header="Other Details"
          mode="edit"
          marital_status={data?.marital_status}
          passport={data?.passport}
          father_name={data?.father_name}
          mother_name={data?.mother_name}
          blood_group={data?.blood_group}
          onUpdate={handleUpdateData}
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          sectionIndex={currentSection}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          header="Temporary Address"
          mode="edit"
          city={data?.tem_city}
          pin_code={data?.tem_pin_code}
          state={data?.tem_state}
          onUpdate={(key, value) => handleUpdateData(`tem_${key}`, value)}
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          sectionIndex={currentSection}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          header="Permanent Address"
          mode="edit"
          city={data?.per_city}
          pin_code={data?.per_pin_code}
          state={data?.per_state}
          onUpdate={(key, value) => handleUpdateData(`per_${key}`, value)}
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
  ];

  return (
    <>
      <div className="DisplayDetailsOfUser" key={currentSection}>
        {sections[currentSection].component}
      </div>
      <button
        className="editSaveBtn"
        onClick={() => editUser(employee?.employee_id)}
      >
        Submit
      </button>
      {showPopup && <Popup />}
    </>
  );
}

export default EditUserDetails;
